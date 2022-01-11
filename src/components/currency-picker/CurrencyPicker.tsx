import React, { Component } from 'react';
import { Select } from 'antd';
import CountryMap from './locale/country-map.json';
import { ValueName } from '../../interfaces/CommonInterface'
import { FormComponentProps } from '../../interfaces/CommonInterface'
import { BasicProps } from './types'
import InputItem, { wrapper } from '../input-item/InputItem'
import utils from '../../public/js/utils'
import { configConsumerProps } from 'antd/lib/config-provider';

interface PropsOuter extends BasicProps {
  className?: string
  required?: boolean
  dataSource: ValueName[]
  value: string | number
  onChange?: (v) => void
}
const Option = Select.Option;


interface Props extends PropsOuter, FormComponentProps {

}

const getOptions = () => {
  let options = [];
  for (let item in CountryMap) {
    options.push({
      name: item,
      value: item,
      country: CountryMap[item],
      currency: item
    })
  }
  return options;
}
class CurrencyPicker extends Component<Props> {
  static Option = Option;
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
    const { style } = this.props;
    let items: any = {};
    items = getOptions().map(function (o) {
      // 增加其他数据
      const { name, value, ...otherItem } = o;
      let temp = {};
      for (let i in otherItem) {
        if (typeof otherItem[i] !== 'undefined') {
          // @ts-ignore
          temp[i.toLowerCase()] = otherItem[i].toString();
        }
      }
      return (
        <Option {...temp} value={o.value} key={o.value}>
          <div className='currency-item'>
            <img src={require(`./img/${o.name}.png`)} style={{ width: 20, marginRight: 5 }} />
            <span>{o.country}</span><div style={{ float: 'right' }}><span>{o.value}</span></div>
          </div>
        </Option>
      );
    });
    let { dataSource: dataSource1, ...restProps } = this.props;
    if (this.props.rules && this.props.rules.length > 0) {
      let rule = this.props.rules[0]
      if ('required' in rule && rule.message == null) {
        rule.message = utils.intl(`请选择`) + `${this.props.label}`
      }
    }
    return (
      <InputItem name={this.props.name} label={this.props.label} rules={this.props.rules}>
        <Select
          style={style}
          className={'select'}
          optionLabelProp='currency'
          {...restProps}
        >
          {items}
        </Select>
      </InputItem>
    );
  }
}

export default wrapper<PropsOuter>(CurrencyPicker);
