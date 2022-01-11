import React from 'react'
import { Select } from 'wanke-gui'

import InputItem, { wrapper } from './InputItem'

import { ValueName } from '../../interfaces/CommonInterface'
import { FormComponentProps } from '../../interfaces/CommonInterface'
import { BasicProps } from './types'
import utils from '../../public/js/utils'

/**
 * 受控的多选下拉框组件
 */
interface Props extends BasicProps, FormComponentProps {
  dataSource: ValueName[]
  value: string[] | number[]
  onChange?: (v: string[] | number[]) => void
}

let uid = 1

class MultiSelectItem extends React.Component<Props> {
  name: string

  constructor(props: Props) {
    super(props)
    this.name = props.name || 'multi_select_' + uid++
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
      if ('required' in rule && rule.message == null) {
        rule.message = `${utils.intl('请选择')}${this.props.label}`
      }
    }
    return (
      <InputItem name={this.name} label={this.props.label} rules={this.props.rules}>
        <Select mode="multiple" checkAllText={utils.intl("全选")} selectText={val => <span className="select-text">({utils.intl(`已选 {0} 个`, val?.length ?? 0)})</span>} dataSource={this.props.dataSource} onChange={this.props.onChange} disabled={this.props.disabled}/>
      </InputItem>
    )
  }
}

export default wrapper<Props>(MultiSelectItem)
