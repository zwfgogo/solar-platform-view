/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React, { Component, useState } from 'react'
import { Input, message, Row, Col, Form, Select, Modal } from 'wanke-gui'
import { DispatchState } from './model'
import MakeConnectProps from "../../interfaces/MakeConnectProps"
import { makeConnect } from "../umi.helper"
import { FormContainer } from "../../components/input-item/InputItem"
import { createFlexableFormItem } from "../../components/FlexFormItem"
import utils from "../../public/js/utils";
import "./index.less"

// const FormItem = Form.Item
const FormItem = createFlexableFormItem(Form.Item)

interface Props extends MakeConnectProps<DispatchState> {
  record: any
  showDetailDialog: boolean
}

const DispatchDetail: React.FC<Props> = function (this: null, props) {

  const formItemLayout = {
    wrapperCol: { span: 24 }
  }
  const record = props.record

  return (
    <Modal centered maskClosable={false} bodyStyle={{ color: 'white' }} width={480} visible={props.showDetailDialog}
      title={utils.intl('查看工单')}
      onCancel={() => props.updateState({ showDetailDialog: false })}
      wrapClassName={'customerModal'}
      footer={null}
    >
      <div className="dispatch-view" style={{ paddingLeft: '16px' }}>
        <Form autoComplete="off">
          <Row>
            <Col span={24}>

              <FormItem flexAble label={utils.intl('电站名称')}>
                <span>{record.stationTitle}</span>
              </FormItem>

            </Col>
            <Col span={24}>

              <FormItem flexAble label={utils.intl('设备对象')}>
                <span>{record.devTitle}</span>
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem flexAble label={utils.intl('工单类型')}>
                <span>{record.typeTitle}</span>
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem flexAble label={utils.intl('处理人')}>
                <span>{record.userTitleProcess}</span>
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem flexAble label={utils.intl('工单名称')}>
                <span>{record.orderName}</span>
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem flexAble label={utils.intl('工单描述')}>
                <span>{record.description}
                </span>
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem flexAble label={utils.intl('处理日志')}>
                <span>{record.resultDesc}
                </span>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  )
}

function mapStateToProps(model) {
  return {
    ...model
  }
}

const _FormRes = FormContainer.create()(DispatchDetail)
export default makeConnect('dispatch', mapStateToProps)(_FormRes)
