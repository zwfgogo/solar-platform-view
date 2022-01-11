import React from 'react'
import { Col, Form, Row, TimePicker } from 'wanke-gui'
import { MinusCircleOutlined, PlusOutlined } from 'wanke-icon'
import classnames from 'classnames'
import styles from './style/time-range-input.less'
import moment from 'moment'
import utils from '../util/utils'

const { Item: FormItem } = Form

interface Props {
  name: string | string[];
  disabled: boolean;
  validateFieldsTime: (validateFields) => void;
  priceKey: string;
  indexs: number[];
  superName: string;
}

const TimeRangeInput: React.FC<Props> = ({ name, disabled, validateFieldsTime, priceKey, indexs, superName }) => {

  const getValueByName = (Obj, name = '') => {
    if (Array.isArray(name)) {
      return (name as string[]).reduce((pre, item) => pre[item] || {}, Obj || {})
    }
    return (name as string).split('.').reduce((pre, item) => pre[item] || {}, Obj || {})
  }

  return (
    <Form.List name={name}>
      {(fields, { add, remove }) => {
        return (
          <section className={styles['time-range-input']}>
            <header>
              {
                fields.map((field, index) => (
                  <div className={styles['range-line']} >
                    <FormItem noStyle shouldUpdate={(prevValue, curValue) => true}>
                      {
                        ({ getFieldsValue }) => (
                          <FormItem
                            className={styles['picker']}
                            name={[field.name, 'startTime']}
                            validateFirst
                            rules={[
                              { required: true, message: utils.intl('请选择开始时间') },
                              {
                                validateTrigger: "onSubmit",
                                validator: (rule, value) => {
                                  const endTime = getValueByName(getFieldsValue(), rule.field.replace('.startTime', '.endTime'))
                                  return value && endTime && endTime.format &&  endTime.format('HH:mm') !== '00:00' && moment(value, 'HH:mm').isAfter(moment(endTime, 'HH:mm'), 'm') ? Promise.reject(utils.intl('开始时间小于结束时间')) : Promise.resolve()
                                }
                              },
                              {
                                validateTrigger: "onSubmit",
                                validator: (rule, value) => {
                                  const endTime = getValueByName(getFieldsValue(), rule.field.replace('.startTime', '.endTime'))
                                  const Objs = getFieldsValue()?.[superName]?.electricityPriceDetails?.[indexs[0]]?.dealers?.[indexs[1]]?.monthsList?.[indexs[2]]?.priceDetails
                                  const priceType = getFieldsValue()?.[superName]?.electricityPriceDetails?.[indexs[0]]?.dealers?.[indexs[1]]?.monthsList?.[indexs[2]]?.priceType
                                  // console.log('Objs',Objs)
                                  const times = Object.keys(Objs).filter(key => (priceType || []).indexOf(parseInt(key)) > -1).reduce((pre, key) => {
                                    if (parseInt(key) === parseInt(priceKey)) {
                                      return [
                                        ...pre,
                                        ...((Objs[key].timeRange) || []).filter((item, index) => index !== field.name)
                                      ]
                                    }
                                    return [
                                      ...pre,
                                      ...(Objs[key].timeRange) || []
                                    ]
                                  }, [])
                                  const isTrue = checkDateInList(times.filter(item => item.startTime && item.endTime), { startTime: value, endTime })
                                  if (isTrue) return Promise.reject(utils.intl('当前存在重复的时间段，请重新选择'))


                                  return isTrue ?
                                    Promise.reject(utils.intl('当前存在重复的时间段，请重新选择'))
                                    : Promise.resolve()
                                }
                              }
                            ]}
                          >
                            <TimePicker format='HH:mm' style={{ width: 109 }} placeholder={utils.intl("开始时间")} showNow={false} disabled={disabled} minuteStep={15} />
                          </FormItem>
                        )
                      }
                    </FormItem>
                    <span className={styles['split']}>~</span>
                    <FormItem noStyle shouldUpdate={(prevValue, curValue) => true}>
                      {
                        ({ getFieldsValue }) => (
                          <FormItem
                            className={styles['picker']}
                            name={[field.name, 'endTime']}
                            validateFirst
                            rules={[
                              { required: true, message: utils.intl('请选择结束时间') },
                              {
                                validateTrigger: "onSubmit",
                                validator: (rule, value) => {
                                  const startTime = getValueByName(getFieldsValue(), rule.field.replace('.endTime', '.startTime'))
                                  return value && startTime && value.format('HH:mm') !== '00:00' && moment(value, 'HH:mm').isBefore(moment(startTime, 'HH:mm'), 'm') ? Promise.reject(utils.intl('开始时间小于结束时间')) : Promise.resolve()
                                }
                              }]}
                          >
                            <TimePicker format='HH:mm' style={{ width: 109 }} placeholder={utils.intl("结束时间")} showNow={false} disabled={disabled} minuteStep={15} />
                          </FormItem>
                        )
                      }
                    </FormItem>
                    {fields.length > 1 && !disabled ? (
                      <MinusCircleOutlined
                        className={classnames(styles["icon-delete"])}
                        onClick={() => { remove(field.name) }}
                      />
                    ) : null}
                  </div>
                ))
              }
            </header>
            {
              !disabled && (
                <FormItem noStyle shouldUpdate={(prevValue, curValue) => true}>
                  {
                    ({ validateFields }) => (
                      <footer className={styles['add-btn']} onClick={() => { add(); validateFieldsTime(validateFields); }}>
                        <PlusOutlined />
                      </footer>
                    )
                  }
                </FormItem>
              )
            }

          </section>
        )
      }}
    </Form.List>
  )
}

// 判断一个时间段在之前的表格数据中是否重叠


export const checkDateInList = (tableList, { startTime, endTime }): boolean => {
  if (startTime && endTime && startTime.format && endTime.format && endTime.format('HH:mm') === '00:00') {
    const snTime = startTime.hour() * 60 + startTime.minute();
    return tableList.some(item => {
      if (item.endTime.format('HH:mm') === '00:00') return true
      const sTime = item.startTime.hour() * 60 + item.startTime.minute();
      const eTime = item.endTime.hour() * 60 + item.endTime.minute();
      return snTime < eTime
    })
  } else if (startTime && endTime && startTime.format && endTime.format) {
    const eTime = endTime.hour() * 60 + endTime.minute();
    return tableList.some(item => {
      if (item.endTime && item.endTime?.format('HH:mm') === '00:00') {
        const snTime = item.startTime.hour() * 60 + item.startTime.minute();
        return snTime < eTime
      }
      return moment(startTime, 'HH:mm').isBefore(moment().format(`YYYY-MM-DD ${item.endTime.format('HH:mm')}`), 'm') && moment(startTime, 'HH:mm').isAfter(moment().format(`YYYY-MM-DD ${item.startTime.format('HH:mm')}`), 'm')
        || moment(endTime, 'HH:mm').isBefore(moment().format(`YYYY-MM-DD ${item.endTime.format('HH:mm')}`), 'm') && moment(endTime, 'HH:mm').isAfter(moment().format(`YYYY-MM-DD ${item.startTime.format('HH:mm')}`), 'm')
        || moment(startTime, 'HH:mm').isSame(moment().format(`YYYY-MM-DD ${item.startTime.format('HH:mm')}`), 'm') && moment(endTime, 'HH:mm').isSame(moment().format(`YYYY-MM-DD ${item.endTime.format('HH:mm')}`), 'm')

        || moment(item.startTime, 'HH:mm').isBefore(moment().format(`YYYY-MM-DD ${endTime.format('HH:mm')}`), 'm') && moment(item.startTime, 'HH:mm').isAfter(moment().format(`YYYY-MM-DD ${startTime.format('HH:mm')}`), 'm')
        || moment(item.endTime, 'HH:mm').isBefore(moment().format(`YYYY-MM-DD ${endTime.format('HH:mm')}`), 'm') && moment(item.endTime, 'HH:mm').isAfter(moment().format(`YYYY-MM-DD ${startTime.format('HH:mm')}`), 'm')
        || moment(item.startTime, 'HH:mm').isSame(moment().format(`YYYY-MM-DD ${startTime.format('HH:mm')}`), 'm') && moment(item.endTime, 'HH:mm').isSame(moment().format(`YYYY-MM-DD ${endTime.format('HH:mm')}`), 'm')
    }
    )
  } else if (startTime && startTime.format) {
    return tableList.some(item => moment(startTime, 'HH:mm').isSame(moment().format(`YYYY-MM-DD ${item.startTime.format('HH:mm')}`), 'm') || moment(startTime, 'HH:mm').isBefore(moment().format(`YYYY-MM-DD ${item.endTime}`)) && moment(startTime, 'HH:mm').isAfter(moment().format(`YYYY-MM-DD ${item.startTime.format('HH:mm')}`), 'm'))
  }
  const isTrue = tableList.some(item => moment(endTime, 'HH:mm').isSame(moment().format(`YYYY-MM-DD ${item.endTime?.format('HH:mm')}`), 'm') || moment(endTime?.format('HH:mm'), 'HH:mm').isBefore(moment().format(`YYYY-MM-DD ${item.endTime}`), 'm') && moment(endTime, 'HH:mm').isAfter(moment().format(`YYYY-MM-DD ${item.startTime.format('HH:mm')}`), 'm'))
  return isTrue || false
}



export default TimeRangeInput