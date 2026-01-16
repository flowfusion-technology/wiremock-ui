import { Epic, combineEpics } from 'redux-observable'
import { from } from 'rxjs'
import { mergeMap, switchMap } from 'rxjs/operators'
import { initSettings } from '../../settings'
import { initServers } from '../../servers'
import { IAction } from '../../../store'
import { loadState, loadStateFinished } from './actions'
import { CoreActionTypes } from './types'

export const loadStateEpic: Epic<IAction, any> = action$ =>
    action$.ofType(CoreActionTypes.LOAD_STATE)
        .pipe(
            mergeMap((action: typeof loadState) => {
                const theme = localStorage.getItem('theme') || 'solarized dark'
                const actions: IAction[] = [initSettings({
                    theme
                })]

                let servers: any = localStorage.getItem('servers')
                if (servers) {
                    servers = JSON.parse(servers)
                } else {
                    servers = []
                }

                // Load default server from config file or environment variables
                const loadDefaultServerPromise = async () => {
                    let defaultServer: any = null

                    // Try to load from config.json first
                    try {
                        const configResponse = await fetch(`${process.env.PUBLIC_URL || ''}/config.json`)
                        if (configResponse.ok) {
                            const config = await configResponse.json()
                            if (config.defaultServer && config.defaultServer.name) {
                                defaultServer = config.defaultServer
                            }
                        }
                    } catch (e) {
                        // Config file not found or invalid, fallback to environment variables
                    }

                    if (!defaultServer) {
                        const defaultName = process.env.REACT_APP_WIREMOCK_NAME
                        const defaultUrl = process.env.REACT_APP_WIREMOCK_URL
                        const defaultPort = process.env.REACT_APP_WIREMOCK_PORT 
                            ? parseInt(process.env.REACT_APP_WIREMOCK_PORT, 10) 
                            : undefined

                        if (defaultName) {
                            // Construct URL if not provided
                            let url = defaultUrl
                            if (!url) {
                                const protocol = window.location.protocol
                                const hostname = window.location.hostname
                                if (defaultPort) {
                                    url = `${protocol}//${hostname}:${defaultPort}`
                                } else {
                                    // Use same origin (for proxied setup)
                                    url = `${protocol}//${hostname}`
                                }
                            }

                            defaultServer = {
                                name: defaultName,
                                url,
                                port: defaultPort
                            }
                        }
                    }

                    // If we have a default server, add it if it doesn't exist
                    if (defaultServer && defaultServer.name) {
                        // Construct URL if not provided in config (empty string means use same origin)
                        if (!defaultServer.url || defaultServer.url === '') {
                            const protocol = window.location.protocol
                            const hostname = window.location.hostname
                            // For proxied setup, use same origin (no port)
                            // WireMock API is accessible via ingress at the same domain
                            defaultServer.url = `${protocol}//${hostname}`
                            // Don't set port when using same origin (proxied)
                            defaultServer.port = undefined
                        } else if (defaultServer.port) {
                            // If URL is provided but has port, ensure it's included
                            const urlObj = new URL(defaultServer.url)
                            if (!urlObj.port && defaultServer.port) {
                                defaultServer.url = `${urlObj.protocol}//${urlObj.hostname}:${defaultServer.port}`
                            }
                        }

                        const exists = servers.find((s: any) => s.name === defaultServer.name)
                        if (!exists) {
                            servers.push({
                                name: defaultServer.name,
                                url: defaultServer.url,
                                port: defaultServer.port || undefined,
                                mappingsHaveBeenLoaded: false,
                                isLoadingMappings: false,
                                mappings: [],
                            })
                        }
                    }

                    if (servers.length > 0) {
                        actions.push(initServers(servers))
                    }

                    return [
                        ...actions,
                        loadStateFinished()
                    ]
                }

                return from(loadDefaultServerPromise())
            })
        )

export const coreEpic = combineEpics(
    loadStateEpic
)
