import * as React from 'react'
import { Trash2, PlusCircle } from 'react-feather'
import { FieldArray, FormikErrors, FormikTouched, getIn } from 'formik'
import { Button, Input } from 'edikit'
import { IMappingFormValues } from '../../types'
import styled from 'styled-components'

const Textarea = styled.textarea`
    width: 100%;
    display: inline-block;
    padding: 8px 12px;
    min-height: 120px;
    font-size: 13px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
    border: none;
    cursor: pointer;
    transition: all 200ms ease-in;
    background: ${props => props.theme.form.input.background};
    color: ${props => props.theme.form.input.color};
    border: ${props => props.theme.form.input.border};
    ${props => props.theme.form.input.css}
    resize: vertical;
    
    &::-webkit-input-placeholder {
        font-size: 13px;
        color: ${props => props.theme.form.input.placeholder.color};
    }
    
    &:hover {
        background: ${props => props.theme.form.input.hover.background};
        color: ${props => props.theme.form.input.hover.color};
        border: ${props => props.theme.form.input.hover.border};
        ${props => props.theme.form.input.hover.css}
    }
    
    &:focus {
        cursor: auto;
        outline: transparent;
        background: ${props => props.theme.form.input.focus.background};
        color: ${props => props.theme.form.input.focus.color};
        border: ${props => props.theme.form.input.focus.border};
        ${props => props.theme.form.input.focus.css}
    }
`

interface IResponseBaseProps {
    values: IMappingFormValues
    errors: FormikErrors<IMappingFormValues>
    touched: FormikTouched<IMappingFormValues>
    onChange(e: React.ChangeEvent<any>): void
    onBlur(e: any): void
    sync(): void
}

export default class ResponseBase extends React.Component<IResponseBaseProps> {
    render() {
        const {
            values,
            errors,
            touched,
            onChange,
            onBlur,
            sync,
        } = this.props

        return (
            <FieldArray
                name="responseHeaders"
                render={helpers => {
                    return (
                        <React.Fragment>
                            <Button
                                variant="default"
                                icon={<PlusCircle size={14}/>}
                                iconPlacement="append"
                                style={{
                                    height: '30px',
                                    gridColumnStart: 1,
                                    gridColumnEnd: 3,
                                }}
                                onClick={() => {
                                    helpers.push({ key: '', value: '' })
                                    sync()
                                }}
                            >
                                Header
                            </Button>
                            <label
                                htmlFor="responseStatus"
                                style={{
                                    gridColumnStart: 4
                                }}
                            >
                                Status
                            </label>
                            <Input
                                id="responseStatus"
                                value={values.responseStatus}
                                onChange={onChange}
                                onBlur={onBlur}
                            />
                            {errors.responseStatus && touched.responseStatus && (
                                <div style={{ color: 'red', gridColumnStart: 6, gridColumnEnd: 9 }}>
                                    {errors.responseStatus}
                                </div>
                            )}
                            {values.responseHeaders && values.responseHeaders.length > 0 && values.responseHeaders.map((header, index) => (
                                <React.Fragment key={index}>
                                    <Input
                                        name={`responseHeaders.${index}.key`}
                                        value={header.key}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        placeholder="header name"
                                        style={{
                                            gridColumnStart: 1,
                                            gridColumnEnd: 4,
                                        }}
                                    />
                                    <Input
                                        name={`responseHeaders.${index}.value`}
                                        value={header.value}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        placeholder="header value"
                                        style={{
                                            gridColumnStart: 4,
                                            gridColumnEnd: 8,
                                        }}
                                    />
                                    <div>
                                        <Button
                                            onClick={() => {
                                                helpers.remove(index)
                                                sync()
                                            }}
                                            variant="danger"
                                            icon={<Trash2 size={16}/>}
                                            style={{
                                                height: '30px',
                                            }}
                                        />
                                    </div>
                                    {getIn(errors, `responseHeaders.${index}.key`) && getIn(touched, `responseHeaders.${index}.key`) && (
                                        <div style={{ color: 'red', gridColumnStart: 1, gridColumnEnd: 4 }}>
                                            {getIn(errors, `responseHeaders.${index}.key`)}
                                        </div>
                                    )}
                                    {getIn(errors, `responseHeaders.${index}.value`) && getIn(touched, `responseHeaders.${index}.value`) && (
                                        <div style={{ color: 'red', gridColumnStart: 4, gridColumnEnd: 8 }}>
                                            {getIn(errors, `responseHeaders.${index}.value`)}
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                            <label
                                htmlFor="responseBody"
                                style={{
                                    gridColumnStart: 1,
                                    gridColumnEnd: 9,
                                    marginTop: '10px',
                                }}
                            >
                                Response Body (JSON or text)
                            </label>
                            <Textarea
                                id="responseBody"
                                name="responseBody"
                                value={values.responseBody || ''}
                                onChange={onChange}
                                onBlur={onBlur}
                                placeholder='{"message": "success", "data": {}}'
                                style={{
                                    gridColumnStart: 1,
                                    gridColumnEnd: 9,
                                }}
                            />
                            {errors.responseBody && touched.responseBody && (
                                <div style={{ color: 'red', gridColumnStart: 1, gridColumnEnd: 9 }}>
                                    {errors.responseBody}
                                </div>
                            )}
                            <label
                                htmlFor="responseBodyFileName"
                                style={{
                                    gridColumnStart: 1,
                                    gridColumnEnd: 9,
                                    marginTop: '10px',
                                }}
                            >
                                Response Body File Name (optional - use this instead of Response Body)
                            </label>
                            <Input
                                id="responseBodyFileName"
                                name="responseBodyFileName"
                                value={values.responseBodyFileName || ''}
                                onChange={onChange}
                                onBlur={onBlur}
                                placeholder="responses/shop-info.json"
                                style={{
                                    gridColumnStart: 1,
                                    gridColumnEnd: 9,
                                }}
                            />
                            {errors.responseBodyFileName && touched.responseBodyFileName && (
                                <div style={{ color: 'red', gridColumnStart: 1, gridColumnEnd: 9 }}>
                                    {errors.responseBodyFileName}
                                </div>
                            )}
                        </React.Fragment>
                    )
                }}
            />
        )
    }
}
