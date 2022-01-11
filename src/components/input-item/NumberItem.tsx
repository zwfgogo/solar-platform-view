import React, { CSSProperties } from 'react'
import { InputNumber } from 'wanke-gui'

import InputItem, { wrapper } from './InputItem'

import { FormComponentProps } from '../../interfaces/CommonInterface'
import { InputNumberProps } from 'antd/lib/input-number'
import { BasicProps } from './types'
import classNames from 'classnames'
import utils from '../../public/js/utils'

/**
 * 受控的数字框组件
 */
interface Props extends BasicProps, FormComponentProps {
  className?: string
  style?: CSSProperties
  placeholder?: string
  value: number
  onChange?: (v) => void
  prefix?: string
  suffix?: string
  precision?: number
  min?: number
  max?: number
  onBlur?: any
}

let uid = 1

class NumberItem extends React.Component<Props> {
  name: string

  constructor(props: Props) {
    super(props)
    this.name = props.name || 'number_' + uid++
  }

  componentDidMount() {
    this.props.form.setFieldsValue({[this.name]: this.props.value})
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    this.props.form.setFieldsValue({[this.name]: this.props.value})
  }

  render() {
    if (this.props.rules && this.props.rules.length > 0) {
      let rule = this.props.rules[0]
      if ('required' in rule && rule.message == null && this.props.label) {
        rule.message = `${utils.intl('请输入')}${this.props.label}`
      }
    }
    return (
      <InputItem name={this.name} label={this.props.label} rules={this.props.rules} className={this.props.className}
                 style={this.props.style}>
        <Layout
          placeholder={this.props.placeholder}
          onChange={v => this.props.onChange(v)}
          precision={this.props.precision}
          min={this.props.min}
          max={this.props.max}
          disabled={this.props.disabled}
          prefix={this.props.prefix}
          suffix={this.props.suffix}
          onBlur={this.props.onBlur}
        />
      </InputItem>
    )
  }
}

export default wrapper<Props>(NumberItem)

/**
 * InputNumber添加单位支持
 */
interface LayoutProps extends InputNumberProps {
  prefix?: string
  suffix?: string
}

class Layout extends React.Component<LayoutProps> {
  render(): React.ReactNode {
    return (
      <div className="d-flex v-center input-number-box">
        {
          this.props.prefix && (
            <div style={{marginRight: 5}}>{this.props.prefix}</div>
          )
        }
        <InputNumber
          maxLength={20}
          style={{width: '100%'}}
          value={this.props.value}
          placeholder={this.props.placeholder}
          onChange={v => this.props.onChange(v)}
          precision={this.props.precision}
          min={this.props.min}
          max={this.props.max}
          disabled={this.props.disabled}
          onBlur={this.props.onBlur}
          className={classNames({ "input-has-suffix": this.props.suffix})}
        />
        {
          this.props.suffix && (
            <div className="input-suffix">{this.props.suffix}</div>
          )
        }
      </div>
    )
  }
}
