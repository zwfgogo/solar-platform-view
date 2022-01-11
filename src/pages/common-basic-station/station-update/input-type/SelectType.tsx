import React from 'react'
import SelectItem from '../../../../components/input-item/SelectItem'
import { ValueName } from '../../../../interfaces/CommonInterface'

interface Props {
  dataSource: ValueName[]
  label: string
  required: boolean
  disabled: boolean
  value: string
  onChange: (v: boolean) => void
}

const SelectType: React.FC<Props> = function (this: null, props) {
  return (
    <SelectItem
      label={props.label}
      rules={[{required: props.required}]}
      disabled={props.disabled}
      value={props.value}
      onChange={props.onChange}
      dataSource={props.dataSource}
    />
  )
}

export default SelectType
