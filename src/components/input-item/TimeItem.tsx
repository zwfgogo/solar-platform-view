import React from 'react'
import { TimePicker } from 'wanke-gui'

import InputItem from './InputItem'

import { FormComponentProps, ValidationRule } from '../../interfaces/CommonInterface'
import wrapper1, { CommonProp1 } from './wrapper1'
import { TimePickerProps } from 'antd/lib/time-picker'

/**
 * 受控的输入框组件
 */
interface Props extends CommonProp1, TimePickerProps, FormComponentProps {
  label?: string
  rules?: ValidationRule[]
  disabled?: boolean;
}

let uid = 1

class TimeItem extends React.Component<Props> {
  render() {
    return (
      <InputItem name={this.props.name} label={this.props.label} rules={this.props.rules}>
        <TimePicker
          value={this.props.value}
          disabled={this.props.disabled}
          placeholder={this.props.placeholder}
          onChange={(time, dateString) => this.props.onChange(time, dateString)}
          format={this.props.format}
        />
      </InputItem>
    )
  }
}

export default wrapper1<Props>(TimeItem)
