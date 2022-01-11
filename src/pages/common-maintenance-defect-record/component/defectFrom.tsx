/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React from 'react'
import { Row, Col, Form, Modal } from 'wanke-gui'
import { connect } from 'dva'
import moment, { Moment } from 'moment'

import styles from './index.less'
import { createFlexableFormItem } from "../../../components/FlexFormItem"
import { FormContainer } from "../../../components/input-item/InputItem"
import utils from "../../../public/js/utils";

const FormItem = createFlexableFormItem(Form.Item)

function getTimeString(time: any) {
  if (time instanceof moment) {
    return (time as Moment).format('YYYY-MM-DD')
  } else if (typeof time === 'string') {
    return time ? moment(time).format("YYYY-MM-DD") : time
  } else {
    return ''
  }
}

const _Form = props => {
  const { dispatch, defectModal, record } = props

  const cancel = () => {
    dispatch({
      type: 'defectRecord/updateState',
      payload: {
        defectModal: false
      }
    })
  }

  const formItemLayout = {
    // wrapperCol: {span: 21}
  }

  let match = props.stationOptions.find(item => item.value == record.stationId)

  return (
    <Modal centered maskClosable={false} bodyStyle={{ color: 'white' }} width={500} visible={defectModal}
      title={utils.intl('查看记录')} onCancel={cancel} wrapClassName={'customerModal'}
      footer={null}
    >
      <div style={{ paddingLeft: '40px' }} className={styles.defectModal}>
        <Form layout={'vertical'} autoComplete="off">
          <Row>
            <Col span={24}>

              <FormItem label={utils.intl('电站名称')} flexAble>
                <span>{(match && match.name) || ""}</span>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={24}>

              <FormItem label={utils.intl('缺陷发现日期')} flexAble>
                <span>{record.startTime ? moment(record.startTime).format("YYYY-MM-DD") : record.startTime}</span>
              </FormItem>
            </Col>
            <Col span={24}>

              <FormItem label={utils.intl('发现人')} flexAble>
                <span>{record.discoverer}</span>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={24}>

              <FormItem label={utils.intl('消除日期')} flexAble>
                <span>{getTimeString(record.endTime)}</span>
              </FormItem>
            </Col>
            <Col span={24}>

              <FormItem label={utils.intl('消除人')} flexAble>
                <span>{record.processer}</span>
              </FormItem>

            </Col>
          </Row>
          <Row>
            <Col span={24}>

              <FormItem label={utils.intl('验收人')} flexAble>
                <span>{record.acceptor}</span>
              </FormItem>

            </Col>
            <Col span={24}>
              <FormItem label={utils.intl('负责人')} flexAble>
                <span>{record.director}</span>
              </FormItem>

            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <FormItem label={utils.intl('缺陷内容')} flexAble>
                <span>{record.bugContent}
                </span>
              </FormItem>

            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  )
}

function mapStateToProps(state) {
  return {
    ...state.defectRecord
  }
}

const _FormRes = FormContainer.create()(_Form)
export default connect(mapStateToProps)(_FormRes)
