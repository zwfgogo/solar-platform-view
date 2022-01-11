/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React, { Component, useState } from 'react'
import { Input, Row, Col, Form, Select, Modal } from 'wanke-gui'
import DatePicker from "../../../components/date-picker"
import { connect } from 'dva'
import moment from 'moment'

import styles from './index.less'
import { createFlexableFormItem } from "../../../components/FlexFormItem"
import { FormContainer } from "../../../components/input-item/InputItem"
import { disabledDateAfterToday } from '../../../util/dateUtil'
import utils from '../../../public/js/utils'

const FormItem = createFlexableFormItem(Form.Item)

const queryFormStyle = { marginBottom: 16 }

const _Form = props => {
  const { dispatch, runModal, record, type, fromLoading } = props
  const language = localStorage.getItem("language")
  let orderTitle = ''
  switch (type) {
    case 'new':
      orderTitle = utils.intl('新增记录')
      break
    case 'edit':
      orderTitle = utils.intl('编辑记录')
      break
    case 'query':
      orderTitle = utils.intl('查看记录')
      break
    default:
      orderTitle = ''
      break
  }
  const cancel = () => {
    dispatch({
      type: 'runRecord/updateState',
      payload: {
        runModal: false
      }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    props.form.validateFields().then((fieldsValue) => {
      const values = {
        ...fieldsValue,
        'date': fieldsValue['date'].format('YYYY-MM-DD 00:00:00')
      }
      dispatch({
        type: 'runRecord/save',
        payload: {
          values
        }
      })
      // dispatch({
      //   type: 'updateState',
      //   payload: {
      //     data: { ...data, ...values },
      //   },
      // });
    })
  }

  const modalRestProps: any = {}
  if (type === 'query') {
    modalRestProps.footer = null
  }

  return (
    <Modal centered maskClosable={false} bodyStyle={{ color: 'white' }} width={'700px'} visible={runModal} confirmLoading={fromLoading}
      title={orderTitle} onOk={handleSubmit} onCancel={cancel} wrapClassName={'customerModal'} {...modalRestProps}>
      <div className={styles.runModal}>
        <Form
          initialValues={{
            presenter: record.presenter || '',
            date: record.date ? moment(record.date, 'YYYY-MM-DD') : moment(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD'),
            parter: record.parter || '',
            analysisTopic: record.analysisTopic || '',
            existProblem: record.existProblem || '',
            measure: record.measure || '',
            writer: record.writer || '',
            reviewer: record.reviewer || ''
          }}
          className={`new-style-form-${language}`}
          form={props.form}
          layout={language === 'zh' ? 'horizontal' : 'vertical'}
          autoComplete="off">
          <div>
            <div className="h-space">
              <div style={{ width: 290 }}>
                {type === 'query' ?
                  <FormItem label={utils.intl('主持人')} style={queryFormStyle}>
                    <span>{record.presenter}</span>
                  </FormItem>
                  :
                  <FormItem
                    name="presenter"
                    rules={[
                      {
                        required: true,
                        message: utils.intl('必填')
                      },
                      {
                        max: 16,
                        message: utils.intl('不能超过N位字符', 16)
                      }
                    ]}
                    label={utils.intl('主持人')}><Input autoComplete="off" /></FormItem>
                }
              </div>
              <div style={{ width: 290 }}>
                {type === 'query' ?
                  <FormItem label={utils.intl('日期')} style={queryFormStyle}>
                    <span>{record.date}</span>
                  </FormItem>
                  :
                  <FormItem
                    name="date"
                    rules={[
                      {
                        required: true,
                        message: utils.intl('必填')
                      }
                    ]}
                    label={utils.intl('日期')}><DatePicker disabledDate={disabledDateAfterToday}
                      allowClear={false}
                      className={'select100'}
                    /></FormItem>
                }
              </div>
            </div>

            <div>
              {type === 'query' ?
                <FormItem label={utils.intl('参加人')} style={queryFormStyle}>
                  <span>{record.parter}</span>
                </FormItem>
                :
                <FormItem
                  name="parter"
                  rules={[
                    {
                      required: true,
                      message: utils.intl('必填')
                    },
                    {
                      max: 100,
                      message: utils.intl('不能超过N位字符', 100)
                    }
                  ]}
                  label={utils.intl('参加人')}><Input.TextArea style={{ resize: 'none', height: '80px' }}
                    placeholder={utils.intl('不能超过N位字符', 100)}
                    autoComplete="off" /></FormItem>
              }
            </div>
            <div>
              {type === 'query' ?
                <FormItem label={utils.intl('运行分析译文')} style={queryFormStyle}>
                  <span>{record.analysisTopic}</span>
                </FormItem>
                :
                <FormItem
                  name="analysisTopic"
                  rules={[
                    {
                      required: true,
                      message: utils.intl('必填')
                    },
                    {
                      max: 500,
                      message: utils.intl('不能超过N位字符', 500)
                    }
                  ]}
                  label={utils.intl('运行分析译文')}><Input.TextArea style={{ resize: 'none', height: '80px' }}
                    placeholder={utils.intl('不能超过N位字符', 500)}
                    autoComplete="off" /></FormItem>
              }
            </div>
            <div>
              {type === 'query' ?
                <FormItem label={utils.intl('存在的问题')} style={queryFormStyle}>
                  <span>{record.existProblem}</span>
                </FormItem>
                :
                <FormItem
                  name="existProblem"
                  rules={[
                    {
                      required: true,
                      message: utils.intl('必填')
                    },
                    {
                      max: 500,
                      message: utils.intl('不能超过N位字符', 500)
                    }
                  ]}
                  label={utils.intl('存在的问题')}><Input.TextArea style={{ resize: 'none', height: '80px' }}
                    placeholder={utils.intl('不能超过N位字符', 500)}
                    autoComplete="off" /></FormItem>
              }
            </div>
            <div>
              {type === 'query' ?
                <FormItem label={utils.intl('防范改进措施')} style={queryFormStyle}>
                  <span>{record.measure}
                  </span>
                </FormItem>
                :
                <FormItem
                  name="measure"
                  rules={[
                    {
                      required: true,
                      message: utils.intl('必填')
                    },
                    {
                      max: 500,
                      message: utils.intl('不能超过N位字符', 500)
                    }
                  ]}
                  label={utils.intl('防范改进措施')}><Input.TextArea style={{ resize: 'none', height: '80px' }}
                    placeholder={utils.intl('不能超过N位字符', 500)}
                    autoComplete="off" /></FormItem>
              }
            </div>
            <div className="h-space">
              <div style={{ width: 290 }}>
                {type === 'query' ?
                  <FormItem label={utils.intl('填写人')} style={queryFormStyle}>
                    <span>{record.writer}</span>
                  </FormItem>
                  :
                  <FormItem
                    name="writer"
                    rules={[
                      {
                        required: true,
                        message: utils.intl('必填')
                      },
                      {
                        max: 16,
                        message: '不能超过16位字符'
                      }
                    ]}
                    label={utils.intl('填写人')}><Input autoComplete="off" /></FormItem>
                }
              </div>
              <div style={{ width: 290 }}>
                {type === 'query' ?
                  <FormItem label={utils.intl('审核人')} style={queryFormStyle}>
                    <span>{record.reviewer}</span>
                  </FormItem>
                  :
                  <FormItem
                    name="reviewer"
                    rules={[
                      {
                        required: true,
                        message: utils.intl('必填')
                      },
                      {
                        max: 16,
                        message: utils.intl('不能超过N位字符', 16)
                      }
                    ]}
                    label={utils.intl('审核人')}><Input autoComplete="off" /></FormItem>
                }
              </div>
            </div>
          </div>
        </Form>
      </div>
    </Modal>
  );
}

//绑定layout model ，获取title
function mapStateToProps(state) {
  return {
    ...state.runRecord, fromLoading: state.loading.effects['runRecord/save']
  }
}

const _FormRes = FormContainer.create()(_Form)
export default connect(mapStateToProps)(_FormRes)