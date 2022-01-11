import React from 'react'
import { Select } from 'wanke-gui'

import InputItem, { wrapper } from './InputItem'
import { ValueName } from '../../interfaces/CommonInterface'
import { FormComponentProps } from '../../interfaces/CommonInterface'
import { BasicProps } from './types'
import utils from '../../public/js/utils'

/**
 * 受控的下拉框组件
 */
interface PropsOuter extends BasicProps {
  dataSource: ValueName[]
  value: string | number
  mode?: "multiple" | "tags"
  placeholder?: string
  onChange?: (v) => void
  notFoundContent?: React.ReactNode
  loading?: boolean
  showSearch?: boolean
  optionFilterProp?: any
  filterOption?: any
  checkAllText?: any
}

interface Props extends PropsOuter, FormComponentProps {

}

let uid = 1

class SelectItem extends React.Component<Props> {
  name: string

  constructor(props: Props) {
    super(props)
    this.name = props.name || 'select_' + uid++
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
        rule.message = utils.intl(`请选择`) + `${this.props.label}`
      }
    }

    return (
      <InputItem style={this.props.style} name={this.name} label={this.props.label} rules={this.props.rules}>
        <Select
          onChange={this.props.onChange}
          disabled={this.props.disabled}
          notFoundContent={this.props.notFoundContent}
          loading={this.props.loading}
          mode={this.props.mode}
          dataSource={this.props.dataSource}
          placeholder={this.props.placeholder}
          checkAllText={this.props.checkAllText}
          >
          {/* {
            this.props.dataSource.map(option => {
              return (
                <Select.Option key={option.value} value={option.value}>{option.name}</Select.Option>
              )
            })
          } */}
        </Select>
      </InputItem>
    )
  }
}

export default wrapper<PropsOuter>(SelectItem)
