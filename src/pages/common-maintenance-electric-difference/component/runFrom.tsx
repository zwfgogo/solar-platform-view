/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React, { Component, useState } from 'react'
import { Input, message, Row, Col, Form, Modal } from 'wanke-gui'
import classnames from 'classnames'
import DatePicker from "../../../components/date-picker"
import { connect } from 'dva'
import styles from './index.less'
import moment from 'moment'
import { Select } from 'antd'
import { inputLengthRule } from "../../../util/ruleUtil"
import { FormContainer } from "../../../components/input-item/InputItem"
import utils from '../../../public/js/utils'
import { isZh } from '../../../core/env'

const gutter = 16

const FormItem = Form.Item

const _Form = props => {
  const { dispatch, runModal, record, type, reasonTitle, compareResDate, rangeDate } = props
  console.log(rangeDate)
  const cancel = () => {
    dispatch({
      type: 'electricDifference/updateState',
      payload: {
        runModal: false
      }
    })
  }

  const disabledDate = (current) => {
    return current < moment(rangeDate, 'YYYY-MM-DD')
  }

  const disabledDateAfter = (current) => {
    return (current < moment(compareResDate, 'YYYY-MM-DD') || current > moment(compareResDate, 'YYYY-MM-DD'))
  }
  const rangeDateChange = (date, dateString) => {
    const { dispatch } = this.props
    dispatch({
      type: 'electricDifference/updateState',
      payload: { rangeDate: dateString }
    })
  }

  const formItemLayout = {
    wrapperCol: { span: 21 }
  }
  const formItemLayout1 = {
    wrapperCol: { span: 11 }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    props.form.validateFields().then((fieldsValue) => {
      const values = {
        ...fieldsValue,
        'dtime': fieldsValue['dtime'].format('YYYY-MM-DD 00:00:00'),
        'planCompleteTime': fieldsValue['planCompleteTime'].format('YYYY-MM-DD 00:00:00')
      }
      dispatch({
        type: 'electricDifference/save',
        payload: {
          values
        }
      })
    })
  }

  let option = reasonTitle.map(v => {
    return <Select.Option value={v.title}>{v.title}</Select.Option>
  })
  return (
    <Modal centered maskClosable={false} bodyStyle={{ color: 'white' }} width={'700px'} visible={runModal}
      title={utils.intl('原因配置')} onOk={handleSubmit} onCancel={cancel} wrapClassName={'customerModal'}>
      <div className={classnames(styles.runModal, "fixed-label-width-form")}>
        <Form
          initialValues={{
            dtime: moment(compareResDate, 'YYYY-MM-DD'),
            dutyDept: record.dutyDept || '',
            dutyUserTitle: record.dutyUserTitle || '',
            causeTitle: record.causeTitle || '',
            planCompleteTime: moment(compareResDate, 'YYYY-MM-DD'),
            detail: record.detail || '',
            solution: record.solution || ''
          }}
          form={props.form}
          layout={isZh() ? 'horizontal' : 'vertical'}
          autoComplete="off">
          <Row gutter={gutter}>
            <Col span={12}>
              <FormItem
                name="dtime"
                rules={[
                  {
                    required: true,
                    message: utils.intl('请选择日期')
                  }
                ]}
                {...formItemLayout}
                label={utils.intl('选择日期')}><DatePicker disabledDate={disabledDateAfter}
                  allowClear={false}
                  className={'select100'}
                  onChange={rangeDateChange}
                /></FormItem>
            </Col>
            <Col span={12}>
              <FormItem name="dutyDept" rules={[inputLengthRule(8)]} {...formItemLayout} label={utils.intl('责任部门')}><Input placeholder={utils.intl('请输入责任部门')} autoComplete="off" /></FormItem>
            </Col>
          </Row>
          <Row gutter={gutter}>
            <Col span={12}>
              <FormItem name="dutyUserTitle" rules={[inputLengthRule(8)]} {...formItemLayout} label={utils.intl('责任人')}><Input placeholder={utils.intl('请输入责任人')} autoComplete="off" /></FormItem>
            </Col>
            <Col span={12}>
              <FormItem name="causeTitle" {...formItemLayout} label={utils.intl('原因标题')}><Select>
                {option}
              </Select></FormItem>
            </Col>
            <Col span={12}>
              <FormItem name="planCompleteTime" {...formItemLayout} label={utils.intl('计划完成时间')}><DatePicker disabledDate={disabledDate}
                allowClear={false}
                className={'select100'}
              /></FormItem>
            </Col>
          </Row>
          <Row gutter={gutter}>
            <Col span={24}>
              <FormItem
                name="detail"
                rules={[
                  {
                    max: 64,
                    message: utils.intl('不能超过{$}位字符', 64)
                  }
                ]}
                {...formItemLayout}
                label={utils.intl('原因详情')}><Input.TextArea style={{ resize: 'none', height: '80px' }}
                  placeholder={utils.intl('请输入原因详情')}
                  autoComplete="off" /></FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                name="solution"
                rules={[
                  {
                    max: 64,
                    message: utils.intl('不能超过{$}位字符', 64)
                  }
                ]}
                {...formItemLayout}
                label={utils.intl('解决方案')}><Input.TextArea style={{ resize: 'none', height: '80px' }}
                  placeholder={utils.intl('请输入解决方案')}
                  autoComplete="off" /></FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
}

function mapStateToProps(state) {
  return {
    ...state.electricDifference
  }
}

const _FormRes = FormContainer.create()(_Form)
export default connect(mapStateToProps)(_FormRes)
