/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React from 'react'
import { Input, Row, Col, Form, Select, Modal } from 'wanke-gui'
import { makeConnect } from '../../../umi.helper'
import { FormContainer } from '../../../../components/input-item/InputItem'

const FormItem = Form.Item

const _Form = props => {
  const {dispatch, orderModal, record, workOrderTypesArr, type, usersArr, devicesArr} = props
  const language = localStorage.getItem('language')
  const cancel = () => {
    props.action("updateState", {
      orderModal: false
    })
  }
  const {getFieldDecorator} = props.form
  const formItemLayout = {
    wrapperCol: {span: 21}
  }

  async function handleSubmit(e) {
    props.form.validateFields().then(values => {
        if (type === 'query') {
          props.action("updateState", {
            orderModal: false
          })
        } else {
          props.action("addList", {
            values
          })
        }
    })
  }

  return (
    <Modal centered
           confirmLoading={props.loading}
           maskClosable={false}
           bodyStyle={{color: 'white'}}
           width={'700px'} visible={orderModal}
           footer={type === 'new' ? undefined : null}
           title={type === 'new' ? '派发工单' : '查看工单'}
           onOk={handleSubmit}
           onCancel={cancel} wrapClassName={'customerModal'}
    >
      <div style={{paddingLeft: '40px'}}>
        <Form
          initialValues={{
            devId: parseInt(record.devId) || (devicesArr && devicesArr.length ? devicesArr[0].value : ''),
            typeId: record.typeId || (workOrderTypesArr && workOrderTypesArr.length ? workOrderTypesArr[0].value : ''),
            userId: record.userId || (usersArr && usersArr.length ? usersArr[0].value : ''),
            orderName: record.orderName || '',
            description: record.description || ''
          }}
          form={props.form}
          layout={language === 'zh' ? 'horizontal' : 'vertical'}
          autoComplete="off">
          <Row>
            <Col span={12}>
              {type === 'query' ?
                <FormItem {...formItemLayout} label={'设备对象：'} className="g-h85">
                  <span>{record.devTitle}</span>
                </FormItem>
                :
                <FormItem
                  name="devId"
                  rules={[
                    {
                      required: true,
                      message: '请选择设备对象'
                    }
                  ]}
                  {...formItemLayout}
                  label={'设备对象：'}><Select
                    dataSource={devicesArr}
                    className={'select100'}
                    disabled
                  /></FormItem>
              }
            </Col>
            <Col span={12}>
              {type === 'query' ?
                <FormItem {...formItemLayout} label={'工单类型：'} className="g-h85">
                  <span>{record.typeTitle}</span>
                </FormItem>
                :
                <FormItem
                  name="typeId"
                  rules={[
                    {
                      required: true,
                      message: '请选择工单类型'
                    }
                  ]}
                  {...formItemLayout}
                  label={'工单类型：'}><Select
                    dataSource={workOrderTypesArr}
                    className={'select100'}
                  /></FormItem>
              }
            </Col>
            <Col span={12}>
              {type === 'query' ?
                <FormItem {...formItemLayout} label={'处理人员：'} className="g-h85">
                  <span>{record.userTitleProcess}</span>
                </FormItem>
                :
                <FormItem
                  name="userId"
                  rules={[
                    {
                      required: true,
                      message: '请选择处理人员'
                    }
                  ]}
                  {...formItemLayout}
                  label={'处理人员：'}><Select
                    dataSource={usersArr}
                    className={'select100'}
                  /></FormItem>
              }
            </Col>
            <Col span={12}>
              {type === 'query' ?
                <FormItem {...formItemLayout} label={'工单名称：'} className="g-h85">
                  <span>{record.orderName}</span>
                </FormItem>
                :
                <FormItem
                  name="orderName"
                  rules={[
                    {
                      required: true,
                      message: '请输入工单名称'
                    },
                    {
                      max: 32,
                      message: '不能超过32位字符'
                    }
                  ]}
                  {...formItemLayout}
                  label={'工单名称：'}><Input autoComplete="off"/></FormItem>
              }
            </Col>
            <Col span={24}>
              {type === 'query' ?
                <FormItem {...formItemLayout} label={'工单描述：'} className="g-h85">
                  <span>{record.description}</span>
                </FormItem>
                :
                <FormItem
                  name="description"
                  rules={[
                    {
                      max: 500,
                      min: 4,
                      required: true,
                      message: '请输入4~500位字符工单描述'
                    }
                  ]}
                  {...formItemLayout}
                  label={'工单描述：'}><Input.TextArea style={{resize: 'none', height: '120px'}} placeholder={'请输入4~500位字符'}
                                     autoComplete="off"/></FormItem>
              }
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  )
}

function mapStateToProps(model, getLoading) {
  return {
    ...model,
    loading: getLoading('addList')
  }
}

const _FormRes = FormContainer.create()(_Form)
export default makeConnect('abnormalQuery', mapStateToProps)(_FormRes)