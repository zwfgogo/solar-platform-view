import React, { Component } from 'react';
import { Select } from 'wanke-gui'
import TimeZoneMap from './locale/time-zone-map.json';
import { ValueName } from '../../interfaces/CommonInterface'
import { FormComponentProps } from '../../interfaces/CommonInterface'
import { BasicProps } from './types'
import InputItem, { wrapper } from '../input-item/InputItem'
import utils from '../../public/js/utils'

interface PropsOuter extends BasicProps {
  className?: string
  required?: boolean
  dataSource: ValueName[]
  value: string | number
  onChange?: (v) => void
}


interface Props extends PropsOuter, FormComponentProps {

}
const getOptions = () => {
  let options = [];
  let language = localStorage.getItem('language')
  for (let item in TimeZoneMap[language]) {
    options.push({
      name: item,
      value: TimeZoneMap[language][item]
    })
  }
  return options;
}
class TimeZonePicker extends Component<Props> {
  constructor(props: Props) {
    super(props)
  }
  componentDidMount() {
    this.props.form.setFieldsValue({[this.props.name]: this.props.value})
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    this.props.form.setFieldsValue({[this.props.name]: this.props.value})
  }
  render() {
    const {label, ...restProps} = this.props;
    if (this.props.rules && this.props.rules.length > 0) {
      let rule = this.props.rules[0]
      if ('required' in rule && rule.message == null) {
        rule.message = utils.intl(`请选择`) + `${label}`
      }
    }
    return (
      <InputItem name={this.props.name} label={label} rules={this.props.rules}>
        <Select
          {...restProps}
          dataSource={getOptions()}
        />
      </InputItem>

    )
  }
}

export default wrapper<PropsOuter>(TimeZonePicker)