import React from 'react'
import CheckGroupItem from '../../../../components/input-item/CheckGroupItem'
import { Checkbox } from 'wanke-gui'

interface Props {
  label: string
  required: boolean
  disabled: boolean
  value: any[]
  onChange?: (v: any[]) => void
  dataSource: string[]
}

const CheckboxType: React.FC<Props> = function (this: null, props) {
  return (
    <CheckGroupItem
      label={props.label}
      rules={[{required: props.required}]}
      disabled={props.disabled}
      value={props.value}
      onChange={(v) => props.onChange(v)}
      style={{width: 400}}
    >
      {
        props.dataSource.map(item=> {
          return (
            <Checkbox value={item}>{item}</Checkbox>
          )
        })
      }
    </CheckGroupItem>
  )
}

export default CheckboxType
