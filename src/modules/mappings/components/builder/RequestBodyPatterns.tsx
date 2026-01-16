import * as React from 'react'
import { Trash2 } from 'react-feather'
import {FormikErrors, FormikTouched, FieldArray, getIn} from 'formik'
import { Button, Input, Select } from 'edikit'
import { IMappingFormValues, mappingRequestBodyPatternMatchTypes } from '../../types'

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
                                    }}
                                >
                                    {mappingRequestBodyPatternMatchTypes.map(matchType => (
                                        <option key={matchType} value={matchType}>{matchType}</option>
                                    ))}
                                </Select>
                                <Input
                                    name={`requestBodyPatterns.${index}.value`}
                                    placeholder="expected value"
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
