/** 遍历数据 */

import React, { Component } from "react";
import { Col, InputNumber, Row, Select } from "wanke-gui";
import { Form } from 'antd'
import classNames from 'classnames'
import EditTag from "../../../../components/EditTag";
import Divider from "../../../../components/Divider";
import { monthList, priceRate } from "./dataCfg";
import "./index.less"
import Price from "src/pages/common-basic-price/price";
import TimeRangeInput from "../../../../components/TimeRangeInput";
import { Button } from "antd";
import { DeleteOutlined, GfDeleteOutlined, PlusOutlined } from "wanke-icon";
import { Moment } from "moment";
import _ from 'lodash'
import { NamePath } from "antd/lib/form/interface";
import utils from "../../../../public/js/utils";

const FormItem = Form.Item

interface Props {
  name: NamePath,
  price: any
  isEdit: boolean
  energyUnitList: any[],
  prefixTitle: string // 前缀标题
  realTimePriceList: any[]; // 实时电价枚举
  multipleTypeList: any[]; // 复费率枚举
  isNow: boolean;
  priceObjMap: any[]; // 用电对象枚举
  objTitle: string;
  initValue: any; // 表单数据
  isGridPrice?: boolean;
  clickRealInfo: (obj: any) => void; // 点击详情
}
interface State { }

export default class FormList extends Component<Props, State> {
  state = {};

  getValueByName = (Obj) => {
    const { name } = this.props
    if (Array.isArray(name)) {
      const obj = (name as string[]).reduce((pre, item) => pre[item] || {}, Obj || {})
      return JSON.stringify(obj) === '{}' ? undefined : obj
    }
    return Obj[name as string]
  }

  // 验证时段是否满足24小时
  checkTime = (timeRanges: { startTime: Moment, endTime: Moment }[]): boolean => {
    const timeCount = timeRanges.reduce((pre, item) => {
      const { startTime, endTime } = item
      const sTime = startTime ? startTime.hour() * 60 + startTime.minute() : 0
      const eTime = endTime && endTime.format('HH:mm') === '00:00' ? 24 * 60 : endTime ? endTime.hour() * 60 + endTime.minute() : 0
      return pre + (eTime - sTime)
    }, 0)
    return timeCount === 1440
  }

  render() {
    const { name, price, energyUnitList, isEdit, prefixTitle, realTimePriceList, multipleTypeList, priceObjMap, clickRealInfo, objTitle, initValue, isGridPrice } = this.props
    return (
      <Form.List name={name}>
        {(fields, { add, remove, move }) => (
          <>
            {
              fields.map((field, index) => (
                <>
                  <div
                    className={classNames("tab-price-body", {
                      "tab-price-body-last":
                        index ===
                        price?.[name[0]]?.electricityPriceDetails?.length - 1,
                      "tab-price-body-first": index === 0,
                    })}
                  >
                    <FormItem
                      noStyle
                      shouldUpdate={(prevValue, curValue) => {
                        return (
                          prevValue?.[name[0]]?.rangeType !==
                          curValue?.[name[0]]?.rangeType || !_.isEqual(this.getValueByName(prevValue), this.getValueByName(curValue))
                        )
                      }}
                    >
                      {({ getFieldValue, getFieldsValue, setFieldsValue }) => {
                        const notSItemEids = this.getValueByName(getFieldsValue())?.filter((item, ind) => ind !== index)?.reduce((pre, item) => [...pre, ...(item?.energyUnits || [])], []) || []
                        const sItemEids = this.getValueByName(getFieldsValue())?.[index]?.energyUnits || []
                        const newEnergyUnitList = energyUnitList.filter(item => sItemEids.indexOf(item.id) > -1 || notSItemEids.indexOf(item.id) < 0)
                        return getFieldValue(name[0])?.rangeType === 1 ? ( // 上网电价不需要“电网|非电网”
                          <FormItem
                            name={[field.name, "energyUnits"]}
                            className="first-form-item"
                            label={objTitle}
                            validateFirst
                            initialValue={[energyUnitList[0]?.id]}
                            style={{ display: 'none' }}
                            rules={[
                              { required: true, message: utils.intl(`请选择${objTitle}`) },
                              {
                                validator: (_, value) => {
                                  const formValue = JSON.stringify(getFieldsValue()) === '{}' ? initValue : getFieldsValue()
                                  const dealers = this.getValueByName(formValue)?.[index]?.dealers
                                  return !dealers || !dealers.length ? Promise.reject(utils.intl(`请添加${prefixTitle}对象`)) : Promise.resolve()
                                }
                              }
                            ]}
                          >
                            <EditTag
                              dataSource={newEnergyUnitList}
                              readonly={!isEdit}
                            />
                          </FormItem>
                        ) : null;
                      }}
                    </FormItem>
                    <Form.List name={[field.name, "dealers"]}>
                      {
                        (dealersFields, { add: objAdd, remove: objRemove }) => (
                          <>
                            {
                              dealersFields.map((dealersField, dIndex) => (
                                <Row className="dealers-row">
                                  <FormItem noStyle shouldUpdate={(prevValue, curValue) => {
                                    return dIndex && !_.isEqual(this.getValueByName(prevValue), this.getValueByName(curValue))
                                  }}>
                                    {
                                      ({ getFieldsValue, setFieldsValue }) => {
                                        return !isGridPrice ? (<FormItem
                                          label={utils.intl(`${prefixTitle}对象`)}
                                          name={[dealersField.name, "id"]}
                                          rules={[
                                            { required: true, message: utils.intl(`请选择${prefixTitle}对象`) },
                                            {
                                              validator: (_, value) => {
                                                const formValue = JSON.stringify(formValue) === '{}' ? initValue : getFieldsValue()
                                                const dealers = this.getValueByName(getFieldsValue())?.[index]?.dealers

                                                const isRepeat = dealers && dealers.length === 2 && dealers[0].id && !!dealers[0].id.find(id => dealers[1].id && dealers[1].id.indexOf(id) > -1)
                                                return isRepeat ?
                                                  Promise.reject(utils.intl(`${prefixTitle}对象相同,请重新选择`))
                                                  :
                                                  Promise.resolve()
                                              }
                                            }
                                          ]}>
                                          <Select mode="multiple" style={{ width: 180 }} checkAllText={utils.intl("全选")} selectText={val => <span className="select-text">({utils.intl(`已选 {0} 个`, val?.length ?? 0)})</span>} placeholder={utils.intl(`请选择${prefixTitle}对象`)} dataSource={priceObjMap.map(item => ({ value: item.value, name: item.label }))} disabled={!isEdit} getPopupContainer={trigger => trigger.parentNode} />
                                        </FormItem>) : null
                                      }
                                    }
                                  </FormItem>
                                  {
                                    isEdit ? (
                                      <FormItem noStyle shouldUpdate={(prevValue, curValue) => {
                                        return true
                                      }}>
                                        {
                                          ({ validateFields, getFieldsValue }) => (
                                            <Col style={{ marginLeft: 3, position: "absolute", right: 18, top: -35 }}>
                                              {
                                                this.getValueByName(JSON.stringify(getFieldsValue()) === '{}' ? initValue : getFieldsValue())?.[index]?.dealers?.length > 1 ? (
                                                  <div className="remove-btn-href" onClick={() => {
                                                    objRemove(dIndex);
                                                    validateFields([[...name, field.name, "energyUnits"]]);
                                                  }}>{utils.intl(`删除${prefixTitle}对象`)}</div>
                                                ) : null
                                              }
                                            </Col>
                                          )
                                        }
                                      </FormItem>
                                    ) : null
                                  }
                                  <Form.List name={[dealersField.name, "monthsList"]}>
                                    {
                                      (detFields, { add: detAdd, remove: detRemove }) => (
                                        <>
                                          {
                                            detFields.map((detField, detIndex) => (
                                              <Row className="dealers-month-row" style={{ marginTop: detIndex === 0 ? 0 : 8 }}>
                                                <FormItem noStyle shouldUpdate={(prevValue, curValue) => true}>
                                                  {
                                                    ({ getFieldsValue }) => (
                                                      <FormItem
                                                        label={utils.intl("适用月份")}
                                                        name={[detField.name, "months"]}
                                                        validateFirst
                                                        rules={[
                                                          { required: true, message: utils.intl(`请选择月份`) },
                                                          {
                                                            validator: (rule, value) => {
                                                              const formValue = JSON.stringify(getFieldsValue()) === '{}' ? initValue : getFieldsValue()
                                                              const monthsList = this.getValueByName(formValue)?.[index]?.dealers?.[dIndex]?.monthsList
                                                              const obj = monthsList.find((m, index) => {
                                                                const sList = [...(m?.months || []), ...value];
                                                                return Array.from(new Set(sList)).length !== sList.length && index !== detIndex
                                                              })
                                                              return obj ? Promise.reject(utils.intl(`存在重复的月份`)) : Promise.resolve()
                                                            }
                                                          },
                                                          {
                                                            validateTrigger: "onSubmit",
                                                            validator: (rule, value) => {
                                                              const formValue = JSON.stringify(getFieldsValue()) === '{}' ? initValue : getFieldsValue()
                                                              const monthsList = this.getValueByName(formValue)?.[index]?.dealers?.[dIndex]?.monthsList
                                                              const monthLength = monthsList.reduce((pre, item) => pre + (item.months?.length || 0), 0)
                                                              return monthLength !== 12 ? Promise.reject(utils.intl(`需要选满12个月`)) : Promise.resolve()
                                                            }
                                                          },
                                                        ]}>
                                                        <Select style={{ height: 'auto' }} dataSource={monthList.map(item => ({ value: item.value, name: item.label }))} mode="multiple" style={{ width: 240 }} checkAllText={utils.intl("全选")} selectText={val => <span className="select-text">({utils.intl(`已选 {0} 个`, val?.length ?? 0)})</span>} disabled={!isEdit} allowClear />
                                                      </FormItem>
                                                    )
                                                  }
                                                </FormItem>
                                                <FormItem label={utils.intl("电价模式")} name={[detField.name, "type"]} rules={[{ required: true, message: utils.intl(`请选择电价模式`) }]}>
                                                  <Select dataSource={priceRate.map(item => ({ value: item.value, name: item.label }))} style={{ width: 240 }} disabled={!isEdit} getPopupContainer={trigger => trigger.parentNode} allowClear />
                                                </FormItem>
                                                <FormItem noStyle shouldUpdate={(prevValue, curValue) => {
                                                  return this.getValueByName(prevValue)?.[index]?.dealers?.[dIndex]?.monthsList?.[detIndex]?.type !== this.getValueByName(curValue)?.[index]?.dealers?.[dIndex]?.monthsList?.[detIndex]?.type
                                                    || this.getValueByName(prevValue)?.[index]?.dealers?.[dIndex]?.monthsList?.[detIndex]?.realTimePrice !== this.getValueByName(curValue)?.[index]?.dealers?.[dIndex]?.monthsList?.[detIndex]?.realTimePrice
                                                }}>
                                                  {
                                                    ({ getFieldsValue }) => {
                                                      const formValue = JSON.stringify(getFieldsValue()) === '{}' ? initValue : getFieldsValue()
                                                      const type = this.getValueByName(formValue)?.[index]?.dealers?.[dIndex]?.monthsList?.[detIndex]?.type
                                                      // console.log('type', getFieldsValue())
                                                      const realTimePrice = this.getValueByName(formValue)?.[index]?.dealers?.[dIndex]?.monthsList?.[detIndex]?.realTimePrice
                                                      return type === "RealTime" ? // 实时电价
                                                        <FormItem className="form-item-width" style={{ width: 240 }} label={utils.intl(`${prefixTitle}价格`)} rules={[{ required: true, message: utils.intl(`请选择${prefixTitle}价格`) }]} name={[detField.name, "realTimePrice"]} extra={realTimePrice ? <div className="edit-form-extra-info" onClick={() => clickRealInfo(realTimePriceList.find(item => item.value === realTimePrice) || {})}>{utils.intl("详情")}</div> : null}>
                                                          <Select dataSource={realTimePriceList.map(item => ({ value: item.value, name: item.label }))} style={{ width: 240 }} dropdownClassName="my-realtime-select" disabled={!isEdit} />
                                                        </FormItem>
                                                        : type === "Single" ? // 单费率
                                                          <FormItem
                                                            label={utils.intl(`${prefixTitle}价格`)}
                                                            name={[detField.name, "price"]}
                                                            className="form-item-width"
                                                            extra={<div className="edit-form-extra">{utils.intl("元")}/kWh</div>}
                                                            rules={[{ required: true, message: utils.intl(`请输入${prefixTitle}价格`) }]}
                                                          >
                                                            <InputNumber style={{ width: 176 }} disabled={!isEdit} />
                                                          </FormItem>
                                                          : type === "Multiple" ? // 复费率
                                                            (
                                                              <>
                                                                <FormItem
                                                                  label={utils.intl("费率分段")}
                                                                  name={[detField.name, "priceType"]}
                                                                  validateFirst
                                                                  rules={[
                                                                    { required: true, message: utils.intl(`请选择费率分段`) },
                                                                    {
                                                                      validator: (rule, value) => {
                                                                        return !value || value.length < 2 ? Promise.reject(utils.intl(`请选择2个及以上的${prefixTitle}价格`)) : Promise.resolve()
                                                                      }
                                                                    },
                                                                    {
                                                                      validateTrigger: "onSubmit",
                                                                      validator: (rule, value) => {
                                                                        const formValue = JSON.stringify(getFieldsValue()) === '{}' ? initValue : getFieldsValue()
                                                                        const priceDetails = this.getValueByName(formValue)?.[index]?.dealers?.[dIndex]?.monthsList?.[detIndex]?.priceDetails
                                                                        const timeRange = Object.values(_.pickBy(priceDetails, (val, key) => value.indexOf(parseInt(key)) > -1)).reduce((pre, item) => ([...pre, ...(item?.timeRange || [])]), [])
                                                                        return this.checkTime(timeRange) ? Promise.resolve() : Promise.reject(utils.intl(`时段需要满24小时`))
                                                                      }
                                                                    },
                                                                  ]}>
                                                                  <Select placeholder={utils.intl("选择复费率类型")} dataSource={multipleTypeList.map(item => ({ value: item.value, name: item.label }))} style={{ width: 240 }} getPopupContainer={trigger => trigger.parentNode} mode="multiple" checkAllText={utils.intl("全选")} disabled={!isEdit} />
                                                                </FormItem>
                                                                <FormItem noStyle shouldUpdate={(prevValue, curValue) => {
                                                                  return !_.isEqual(this.getValueByName(prevValue)?.[index]?.dealers?.[dIndex]?.monthsList?.[detIndex]?.priceType, this.getValueByName(curValue)?.[index]?.dealers?.[dIndex]?.monthsList?.[detIndex]?.priceType)
                                                                }}>
                                                                  {
                                                                    ({ getFieldsValue }) => {
                                                                      const formValue = JSON.stringify(getFieldsValue()) === '{}' ? initValue : getFieldsValue()
                                                                      const priceType = this.getValueByName(formValue)?.[index]?.dealers?.[dIndex]?.monthsList?.[detIndex]?.priceType
                                                                      return priceType && priceType.length ?
                                                                        <Row className="multiple-price">
                                                                          {
                                                                            priceType.map(priceKey => (
                                                                              <Col>
                                                                                <FormItem
                                                                                  className="multiple-price-value"
                                                                                  label={`${multipleTypeList.find(i => i.value === priceKey)?.label || '--'}${utils.intl('价格1')}`}
                                                                                  name={[detField.name, "priceDetails", `${priceKey}`, "price"]}
                                                                                  extra={<div className="edit-form-extra-m">{utils.intl("元")}/kWh</div>}
                                                                                  validateFirst
                                                                                  rules={[
                                                                                    { required: true, message: utils.intl(`请输入电价`) },
                                                                                    {
                                                                                      validator: (_, value) => {
                                                                                        const formValue = JSON.stringify(getFieldsValue()) === '{}' ? initValue : getFieldsValue()
                                                                                        const timeRange = this.getValueByName(formValue)?.[index]?.dealers?.[dIndex]?.monthsList?.[detIndex]?.priceDetails?.[`${priceKey}`]?.timeRange
                                                                                        return !timeRange || !timeRange.length ? Promise.reject(utils.intl(`请添加时段`)) : Promise.resolve()
                                                                                      }
                                                                                    },
                                                                                  ]}
                                                                                >
                                                                                  <InputNumber style={{ width: 100 }} disabled={!isEdit} />
                                                                                </FormItem>
                                                                                <FormItem label={utils.intl("时段")} className="multiple-price-time">
                                                                                  <TimeRangeInput
                                                                                    name={[detField.name, "priceDetails", `${priceKey}`, "timeRange"]}
                                                                                    disabled={!isEdit}
                                                                                    priceKey={priceKey}
                                                                                    indexs={[index, dIndex, detIndex]}
                                                                                    superName={name[0]}
                                                                                    validateFieldsTime={validateFields => validateFields([[...name, field.name, "dealers", dealersField.name, "monthsList", detField.name, "priceDetails", `${priceKey}`, "price"]])}
                                                                                  />
                                                                                </FormItem>
                                                                              </Col>
                                                                            ))
                                                                          }
                                                                        </Row>
                                                                        : null
                                                                    }
                                                                  }
                                                                </FormItem>
                                                              </>
                                                            )
                                                            : null
                                                    }
                                                  }
                                                </FormItem>
                                                {
                                                  isEdit ? (
                                                    <FormItem noStyle shouldUpdate={(prevValue, curValue) => {
                                                      return true
                                                    }}>
                                                      <Col style={{ marginLeft: 3, marginRight: 8, flex: 1, justifyContent: "flex-end", display: 'flex', position: "absolute", top: 8, right: 8 }}>
                                                        <div className="remove-btn-href" style={{ top: 0 }} onClick={() => {
                                                          detRemove(detIndex);
                                                          // validateFields([[...name, field.name, "energyUnits"]]);
                                                        }}>
                                                          <GfDeleteOutlined />
                                                          {/* {utils.intl(`删除月份`)}   */}
                                                        </div>
                                                      </Col>
                                                    </FormItem>
                                                  ) : null
                                                }
                                              </Row>
                                            ))
                                          }
                                          <FormItem noStyle shouldUpdate={(prevValue, curValue) => {
                                            return true
                                          }}>
                                            {
                                              ({ getFieldsValue, validateFields }) => {
                                                const formValue = JSON.stringify(getFieldsValue()) === '{}' ? initValue : getFieldsValue()
                                                const months = this.getValueByName(formValue)?.[index]?.dealers?.[dIndex]?.monthsList
                                                // console.log('months', this.getValueByName(formValue)?.[index]?.dealers?.[dIndex])
                                                const isFull = months && months.length && months.reduce((pre, item) => pre + (item?.months?.length || 0), 0) === 12
                                                return isEdit ? (<Col span={24}>
                                                  <div
                                                    className={classNames("add-btn-href", { "add-btn-href-disabled": isFull })}
                                                    style={{ marginBottom: 8, display: "inline-block" }}
                                                    onClick={() => {
                                                      !isFull && detAdd();
                                                      // if (months && months.length) {
                                                      //   validateFields(months.map((item, index) => ([...name, field.name, "dealers", dealersField.name, "monthsList", index, "months"]))).then(val => {
                                                      //     !isFull && detAdd();
                                                      //   }).catch(err => {

                                                      //     console.log('err',  )
                                                      //   })
                                                      // } else {
                                                      //   !isFull && detAdd();
                                                      // }

                                                    }}
                                                  ><PlusOutlined style={{ marginRight: 8 }}/>{utils.intl(`添加月份`)}</div>
                                                </Col>
                                                ) : <div style={{ width: '100%', height: 18 }}></div>
                                              }
                                            }
                                          </FormItem>
                                        </>
                                      )
                                    }
                                  </Form.List>
                                </Row>
                              ))
                            }
                            {/* <FormItem noStyle shouldUpdate={(prevValue, curValue) => {
                              return true
                            }}>
                              {
                                ({ getFieldsValue, validateFields }) => {
                                  const formValue = JSON.stringify(getFieldsValue()) === '{}' ? initValue : getFieldsValue()
                                  const num = isGridPrice ? 1 : 2
                                  const isFull = this.getValueByName(formValue)?.[index]?.dealers?.[0]?.id?.length === num || this.getValueByName(formValue)?.[index]?.dealers?.length === num// 是否将售电（购电）对象选满
                                  return isEdit ? (
                                    <Col span={24}>
                                      <div
                                        className={classNames("add-btn-href", { "add-btn-href-disabled": isFull })}
                                        onClick={() => {
                                          !isFull && objAdd();
                                          validateFields([[...name, field.name, "energyUnits"]]);
                                        }}
                                      >{utils.intl(`添加${prefixTitle}对象`)}</div>
                                    </Col>
                                  ) : <div style={{ width: '100%', height: 28 }}></div>
                                }
                              }
                            </FormItem> */}
                          </>
                        )

                      }
                    </Form.List>
                    {/* {
                      isEdit ? <div className="remove-btn-href" style={{ position: "absolute", top: 0, left: 'auto', right: 3 }} onClick={() => {
                        remove(index);
                      }}><DeleteOutlined style={{ marginRight: 8 }} />{utils.intl("删除")}</div> : null
                    } */}
                  </div>
                  {index < fields.length - 1 ? (
                    <Divider type={isEdit ? "edit" : "view"} />
                  ) :
                    null
                  }
                </>
              ))
            }
            {isEdit ?
              <FormItem noStyle shouldUpdate={(prevValue, curValue) => {
                return true
                // return prevValue?.[name[0]]?.rangeType !== curValue?.[name[0]]?.rangeType || !_.isEqual(this.getValueByName(prevValue), this.getValueByName(curValue))
              }}>
                {
                  ({ getFieldsValue, validateFields }) => {
                    const formValue = JSON.stringify(getFieldsValue()) === '{}' ? initValue : getFieldsValue()
                    const sItemEids = this.getValueByName(formValue)?.reduce((pre, item) => [...pre, ...(item?.energyUnits || [])], []) || []
                    const electricityPriceDetails = this.getValueByName(formValue)
                    const namePaths = (electricityPriceDetails || []).map((item, index) => [...(name as string[]), index, "energyUnits"])
                    const len = this.getValueByName(formValue)?.length || 0
                    // console.log('formValue?.[name[0]]?.rangeType', formValue?.[name[0]]?.rangeType, len, energyUnitList.length)
                    return formValue?.[name[0]]?.rangeType === 1 && len < energyUnitList.length || formValue?.[name[0]]?.rangeType === 0 && len === 0 ? ( // 能量单元
                      <div className="add-btn-box" style={{ border: !len && 'none' }}>
                        {
                          len ? (
                            <Divider type={isEdit ? "edit" : "view"} style={{
                              marginLeft: -13,
                              width: 'calc(100% + 26px)'
                            }} />
                          ) : null
                        }
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => { validateFields(namePaths).then(value => add()); }}>{utils.intl("新增")}</Button>
                      </div>
                    ) : null
                  }
                }
              </FormItem> : null}
          </>
        )
        }
      </Form.List>
    );
  }
}
