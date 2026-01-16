import * as React from 'react'
import styled from 'styled-components'
import { Trash2 } from 'react-feather'
import {FormikErrors, FormikTouched, FieldArray, getIn} from 'formik'
import { Button, Select } from 'edikit'
import { IMappingFormValues, mappingRequestBodyPatternMatchTypes } from '../../types'

const TextArea = styled.textarea`
    width: 100%;
    display: inline-block;
    padding: 8px 12px;
    min-height: 100px;
    font-size: 13px;
    font-family: monospace;
    border: none;
    cursor: auto;
    transition: all 200ms ease-in;
    background: ${props => props.theme.form.input.background};
    color: ${props => props.theme.form.input.color};
    border: ${props => props.theme.form.input.border};
    resize: vertical;
    
    &::-webkit-input-placeholder {
        font-size: 13px;
        color: ${props => props.theme.form.input.placeholder.color};
    }
    
    &:hover {
        background: ${props => props.theme.form.input.hover.background};
        color: ${props => props.theme.form.input.hover.color};
        border: ${props => props.theme.form.input.hover.border};
    }
    
    &:focus {
        outline: transparent;
        background: ${props => props.theme.form.input.focus.background};
        color: ${props => props.theme.form.input.focus.color};
        border: ${props => props.theme.form.input.focus.border};
    }
`

const HelpText = styled.div`
    grid-column-start: 1;
    grid-column-end: 9;
    font-size: 12px;
    color: #888;
    margin-bottom: 15px;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 4px;
    line-height: 1.5;

    code {
        background: #e9ecef;
        padding: 2px 4px;
        border-radius: 3px;
        font-family: monospace;
    }
`

interface IRequestBodyPatternsProps {
    values: IMappingFormValues
    errors: FormikErrors<IMappingFormValues>
    touched: FormikTouched<IMappingFormValues>
    onChange(e: React.ChangeEvent<any>): void
    onBlur(e: any): void
}

export default class RequestBodyPatterns extends React.Component<IRequestBodyPatternsProps> {
    render() {
        const {
            values,
            errors,
            touched,
            onChange,
            onBlur,
        } = this.props

        return (
            <FieldArray
                name="requestBodyPatterns"
                render={arrayHelpers => (
                    <React.Fragment>
                        <HelpText>
                            <strong>Tips for dynamic matching:</strong><br/>
                            - Use <code>equalToJson</code> with placeholders: <code>{`{"id": "\${json-unit.any-string}", "age": "\${json-unit.any-number}"}`}</code><br/>
                            - Use <code>matchesJsonPath</code> to check field existence: <code>$.message</code> or <code>$.users[?(@.age &gt; 20)]</code><br/>
                            - Use <code>matches</code> with regex for text patterns
                        </HelpText>
                        {values.requestBodyPatterns.map((pattern, index) => (
                            <React.Fragment key={index}>
                                <Select
                                    name={`requestBodyPatterns.${index}.matchType`}
                                    value={pattern.matchType}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    style={{
                                        gridColumnStart: 1,
                                        gridColumnEnd: 3,
                                        alignSelf: 'start',
                                    }}
                                >
                                    {mappingRequestBodyPatternMatchTypes.map(matchType => (
                                        <option key={matchType} value={matchType}>{matchType}</option>
                                    ))}
                                </Select>
                                <TextArea
                                    name={`requestBodyPatterns.${index}.value`}
                                    placeholder="expected value (JSON, XML, or text)"
                                    value={pattern.value}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    style={{
                                        gridColumnStart: 3,
                                        gridColumnEnd: 8,
                                    }}
                                />
                                <div>
                                    <Button
                                        onClick={() => { arrayHelpers.remove(index) }}
                                        variant="danger"
                                        icon={<Trash2 size={14}/>}
                                        style={{
                                            height: '30px',
                                            alignSelf: 'start',
                                        }}
                                    />
                                </div>
                                {getIn(errors, `requestBodyPatterns.${index}.value`) && getIn(touched, `requestBodyPatterns.${index}.value`) && (
                                    <div style={{ color: 'red', gridColumnStart: 3, gridColumnEnd: 7 }}>
                                        {getIn(errors, `requestBodyPatterns.${index}.value`)}
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                        <Button
                            variant="primary"
                            onClick={() => {
                                arrayHelpers.push({
                                    matchType: 'equalToJson',
                                    value: '',
                                })
                            }}
                            style={{
                                gridColumnStart: 1,
                                gridColumnEnd: 3,
                                height: '30px',
                            }}
                        >
                            Add body pattern
                        </Button>
                    </React.Fragment>
                )}
            />
        )
    }
}
