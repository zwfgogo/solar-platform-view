import React from 'react'
import TextAreaItem from '../../../../components/input-item/TextAreaItem'
import Label from '../../../../components/Label'
import { inputLengthRule } from '../../../../util/ruleUtil'

interface Props {
  label: string
  required: boolean
  maxLength: number
  disabled: boolean
  value: string
  onChange: (v: string) => void
}

const TextAreaType: React.FC<Props> = function (this: null, props) {
  let rules = []
  if (props.required) {
    rules.push({required: true})
  }
  if (props.maxLength) {
    rules.push(inputLengthRule(props.maxLength))
  }
  return (
    <div style={{width: '100%'}}>
      <TextAreaItem
        label={props.label}
        style={{width: 425}}
        rows={3}
        disabled={props.disabled}
        rules={rules}
        value={props.value}
        onChange={props.onChange}
      />
    </div>
  )
}

export default TextAreaType
