import React from 'react'
import TextItem from '../../../../components/input-item/TextItem'
import { inputLengthRule, letterAndNumberRule } from '../../../../util/ruleUtil'

interface Props {
  label: string
  required: boolean
  maxLength: number
  disabled: boolean
  value: string
  onChange: (v: string) => void
  placeholder?: string
  letterAndNumberRule?: boolean
}

const TextType: React.FC<Props> = function (this: null, props) {
  let rules = []
  if (props.required) {
    rules.push({ required: true })
  }
  if (props.maxLength) {
    rules.push(inputLengthRule(props.maxLength))
  }

  if (props.letterAndNumberRule) {
    rules.push(letterAndNumberRule())
  }

  return (
    <TextItem
      label={props.label}
      rules={rules}
      disabled={props.disabled}
      value={props.value}
      onChange={props.onChange}
      placeholder={props.placeholder}
    />
  )
}

export default TextType
