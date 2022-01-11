import React, { useEffect } from 'react'
import { Form, Input, InputNumber } from 'wanke-gui'
import { FormProps } from 'antd/lib/form'
import FormItemUnit from '../../../../components/FormItemUnit'
import Peak from './Peak'
import Hour from './Hour'
import { timeper } from './Hour'
import Month from './Month'
import { makeConnect } from '../../../umi.helper'
import { FormContainer } from '../../../../components/input-item/InputItem'
import utils from '../../../../public/js/utils'

export interface seasonPer {
  seasonPriceDetails?: Array<timeper>;
  id: any;
  title?: string;
  runMonth?: Array<any>;
  priceRates?: Array<number>;
}

export interface SeasonProps extends FormProps {
  index: number;
  dispatch: any;
  priceType?: Array<any>;
  seasonPer: seasonPer;
  currency: any;
}

const FormItem = Form.Item

class Season extends React.Component<SeasonProps> {
  componentDidMount() {
    const { dispatch, form, seasonPer } = this.props
    const { id } = seasonPer
    dispatch({
      type: 'priceEdit/addForm',
      payload: {
        [id]: form
      }
    })
  }

  render() {
    const { index, dispatch, priceType, seasonPer, currency } = this.props
    const { title, runMonth, priceRates } = seasonPer
    
    let init = {}
    priceType.forEach(item => {
      init['price' + item.value] = seasonPer['price' + item.value] || []
      init['seasonPriceDetails' + item.value] = seasonPer['seasonPriceDetails' + item.value] || [{ id: 0, startTime: '00:00', endTime: '24:00' }]
    })
    return (
      <Form
        initialValues={{
          ...init,
          title: title || '',
          runMonth: runMonth || [],
          priceRates: priceRates || []
        }}
        form={this.props.form}
        layout={'vertical'}
        autoComplete={'off'}>
        <FormItemUnit>
          <FormItem
            name="title"
            rules={[
              {
                required: true,
                message: utils.intl('必填')
              },
              {
                whitespace: true,
                message: utils.intl('必填')
              },
              {
                max: 16,
                message: utils.intl('16个字符以内')
              }
            ]}
            label={utils.intl('季节名称')}><Input /></FormItem>
        </FormItemUnit>
        <FormItemUnit>
          <FormItem
            name="runMonth"
            rules={[
              {
                required: true,
                message: utils.intl('必填')
              }
            ]}
            label={utils.intl('适用月份')}><Month /></FormItem>
        </FormItemUnit>
        <div>
          <FormItem
            name="priceRates"
            rules={[
              {
                required: true,
                message: utils.intl('请选择电价费率')
              }
            ]}
            label={utils.intl('电价费率')}
            className="row"><Peak
              onSelect={val => {
                dispatch({ type: 'priceEdit/editSeasonact', payload: { type: 'priceRates', val, index } })
              }}
            /></FormItem>
        </div>
        {priceType.map((item, key) => {
          const show = priceRates.indexOf(item.value) > -1
          return (
            <div className={show ? '' : 'f-dn'} key={item.value}>
              <FormItemUnit>
                <FormItem name={'price' + item.value} label={item.name + ` (${utils.intl(currency)}/kWh)`} rules={show
                  ? [
                    {
                      required: true,
                      message: utils.intl('必填')
                    }
                  ] : []}>
                  <InputNumber precision={4} min={0} max={5} />
                </FormItem>
              </FormItemUnit>
              <FormItemUnit>
                <FormItem name={'seasonPriceDetails' + item.value} label={utils.intl('时段')} className="houritem"
                  rules={show
                    ? [
                      {
                        required: true,
                        message: utils.intl('必填')
                      },
                      {
                        validator: function (rule, value, callback) {
                          // 校验时间有没有填写反了
                          for (const item of value) {
                            let { startTime, endTime } = item
                            if (endTime === '00:00') {
                              endTime = '24:00'
                            }
                            if (startTime >= endTime && show) {
                              callback(utils.intl('电价库结束时间') + endTime + utils.intl('不能小于等于开始时间') + startTime)
                              break
                            }
                          }
                          callback()
                        }
                      }
                    ]
                    : []}
                >
                  <Hour />
                </FormItem>
              </FormItemUnit>
            </div>
          )
        })}
      </Form>
    );
  }
}

const SeasonForm = FormContainer.create()(Season)

function mapStateToProps(model) {
  return {
    ...model
  }
}

export default makeConnect('priceEdit', mapStateToProps)(SeasonForm)
