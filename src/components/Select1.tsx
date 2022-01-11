import React from 'react'
import { Select } from 'wanke-gui'
import { ValueName } from '../interfaces/CommonInterface'
import { SelectProps } from 'antd/lib/select'

interface Props extends SelectProps<number> {
  dataSource: ValueName[]
}

const Select1: React.FC<Props> = function (this: null, props) {
  const {dataSource, ...otherProps} = props
  let match = dataSource.find(item => item.value == props.value)

  let value = props.value
  if (!match) {
    value = null
  }
  return (
    <Select {...otherProps} value={value}>
      {props.children}
    </Select>
  )
}

export default Select1
