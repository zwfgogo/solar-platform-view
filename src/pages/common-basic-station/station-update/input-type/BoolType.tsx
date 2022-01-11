import React from 'react'
import SelectItem from '../../../../components/input-item/SelectItem'
import { ValueName } from '../../../../interfaces/CommonInterface'

interface Props {
  label: string
  required: boolean
  disabled: boolean
  value: number
  onChange: (v: boolean) => void
  dataSource: ValueName[]
}

const BoolType: React.FC<Props> = function (this: null, props) {
  return (
    <SelectItem
      label={props.label}
      rules={[{required: props.required}]}
      disabled={props.disabled}
      value={props.value}
      onChange={(v) => props.onChange(v)}
      dataSource={props.dataSource}
    />
  )
}

export default BoolType
