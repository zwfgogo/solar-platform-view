import React from 'react'
import { Input } from 'antd'

import InputItem, { wrapper } from './InputItem'

import { FormComponentProps } from '../../interfaces/CommonInterface'
import { BasicProps } from './types'
import { SizeType } from 'antd/lib/config-provider/SizeContext'
import utils from '../../public/js/utils'
import { PhoneInput } from 'wanke-gui'

/**
 * 受控的输入框组件
 * 默认处理 rule 内的 message和whitespace
 */
export interface Props extends BasicProps, FormComponentProps {
  placeholder?: string
  value: any
  onChange?: (v: any) => void
  type?: string
  size?: SizeType;
  required?: boolean
}

let uid = 1

class PhoneInputItem extends React.Component<Props> {
  static defaultProps = {
    type: 'text'
  }

  name: string

  constructor(props: Props) {
    super(props)
    this.name = props.name || 'phone_input_' + uid++
  }

  componentDidMount() {
    this.props.form.setFieldsValue({ [this.name]: this.props.value })
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    this.props.form.setFieldsValue({ [this.name]: this.props.value })
  }

  render() {
    let placeholder = this.props.placeholder != undefined ? this.props.placeholder : (this.props.label && utils.intl(`请输入`) + `${this.props.label}`)

    return (
      <InputItem name={this.name} label={this.props.label} rules={this.props.rules} style={this.props.style} required={this.props.required}>
        <PhoneInput
          placeholder={placeholder}
          onChange={val => this.props.onChange(val)}
          size={this.props.size}
          disabled={this.props.disabled}
          type={this.props.type}
        />
      </InputItem>
    )
  }
}

export default wrapper<Props>(PhoneInputItem)
