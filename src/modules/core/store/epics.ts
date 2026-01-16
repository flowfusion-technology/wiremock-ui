import { Epic, combineEpics } from 'redux-observable'
import { from } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
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

                // Auto-discover from environment variables
                const defaultName = process.env.REACT_APP_WIREMOCK_NAME
                const defaultPort = process.env.REACT_APP_WIREMOCK_PORT 
                    ? parseInt(process.env.REACT_APP_WIREMOCK_PORT, 10) 
                    : undefined
                
                // Construct URL - determine protocol and host
                const protocol = window.location.protocol
                const hostname = window.location.hostname
                // If running in same pod/cluster context, we might want relative URL or specific port
                // For UI -> API connection in browser, it must be accessible from browser.
                // If we use Nginx proxy at /api, the url might be just /api or relative.
                // Based on ingress, API is at /api or root port 8080. 
                // But wiremock-ui connects from BROWSER.
                
                // Lets assume direct connection or proxied.
                // If defaultPort is provided, use it.
                // If we are served from the same domain, we can try to guess the URL.
                
                let defaultUrl = ''
                if (defaultPort) {
                     defaultUrl = `${protocol}//${hostname}:${defaultPort}`
                } else {
                     // Fallback or assume proxy
                     defaultUrl = `${protocol}//${hostname}` // or /api
                }

                if (defaultName) {
                    const exists = servers.find((s: any) => s.name === defaultName)
                    if (!exists) {
                        servers.push({
                            name: defaultName,
                            url: defaultUrl,
                            port: defaultPort,
                            mappingsHaveBeenLoaded: false,
                            isLoadingMappings: false,
                            mappings: [],
                        })
                    }
                }

                if (servers.length > 0) {
                    actions.push(initServers(servers))
                }

                return from([
                    ...actions,
                    loadStateFinished()
                ])
            })
        )

export const coreEpic = combineEpics(
    loadStateEpic
)
