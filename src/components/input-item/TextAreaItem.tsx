import React, { CSSProperties } from 'react'
import { Input } from 'wanke-gui'

import InputItem, { wrapper } from './InputItem'

import { FormComponentProps } from '../../interfaces/CommonInterface'
import { BasicProps } from './types'
import utils from '../../public/js/utils'

/**
 * 受控的输入框组件
 */
interface PropsOuter extends BasicProps {
  placeholder?: string
  value: string
  onChange: (v: string) => void
  rows?: number
  style?: CSSProperties
  className?: string
  maxLength?: number;
}

interface Props extends PropsOuter, FormComponentProps {

}

let uid = 1

class TextAreaItem extends React.Component<Props> {
  name: string

  constructor(props: Props) {
    super(props)
    this.name = props.name || 'textarea_' + uid++
  }

  componentDidMount() {
    this.props.form.setFieldsValue({ [this.name]: this.props.value })
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    this.props.form.setFieldsValue({ [this.name]: this.props.value })
  }

  render() {
    if (this.props.rules && this.props.rules.length > 0) {
      let rule = this.props.rules[0]
      if ('required' in rule && rule.message == null) {
        rule.message = `${utils.intl('请输入')}${this.props.label}`
      }
    }
    return (
      <InputItem name={this.name} label={this.props.label} rules={this.props.rules} style={this.props.style} className={this.props.className}>
        <Input.TextArea
          placeholder={this.props.placeholder}
          onChange={e => this.props.onChange(e.target.value)}
          rows={this.props.rows}
          maxLength={this.props.maxLength} />
      </InputItem>
    )
  }
}

export default wrapper<PropsOuter>(TextAreaItem)
