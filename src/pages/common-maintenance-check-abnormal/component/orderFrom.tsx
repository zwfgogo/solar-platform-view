/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React from 'react'
import { Input, Row, Col, Form, Select, Modal } from 'wanke-gui'
import { makeConnect } from "../../umi.helper"
import { createFlexableFormItem } from "../../../components/FlexFormItem"
import { FormContainer } from "../../../components/input-item/InputItem"
import utils from "../../../public/js/utils";

const FormItem = createFlexableFormItem(Form.Item)

const _Form = props => {
  const { dispatch, orderModal, record, workOrderTypesArr, type, usersArr, devicesArr } = props
  const language = localStorage.getItem("language")
  const cancel = () => {
    dispatch({
      type: 'abnormalQuery/updateState',
      payload: {
        orderModal: false
      }
    })
  }
  const formItemLayout = {
    wrapperCol: { span: 21 }
  }
  async function handleSubmit(e) {
    e.preventDefault()
    props.form.validateFields().then((values) => {
      if (type === 'query') {
        dispatch({
          type: 'abnormalQuery/updateState',
          payload: {
            orderModal: false
          }
        })
      } else {
        dispatch({
          type: 'abnormalQuery/addList',
          payload: {
            values
          }
        })
      }

      // dispatch({
      //   type: 'updateState',
      //   payload: {
      //     data: { ...data, ...values },
      //   },
      // });
    })
  }

  return (
    <Modal centered
      confirmLoading={props.loading}
      maskClosable={false}
      bodyStyle={{ color: 'white' }}
      width={'700px'} visible={orderModal}
      title={type === 'new' ? utils.intl('派发工单') : utils.intl('查看工单')}
      onOk={handleSubmit}
      onCancel={cancel} wrapClassName={'customerModal'}
    >
      <div style={{/* paddingLeft: '40px' */ }}>
        <Form
          initialValues={{
            devTitle: record.devTitle,
            typeId: record.typeId || (workOrderTypesArr && workOrderTypesArr.length ? workOrderTypesArr[0].value : ''),
            userNameProcess: record.userNameProcess || (usersArr && usersArr.length ? usersArr[0].value : ''),
            orderName: record.orderName || '',
            description: record.description || ''
          }}
          form={props.form}
          layout={language === 'zh' ? "horizontal" : 'vertical'}
          autoComplete="off">
          <Row gutter={10}>
            <Col span={12}>
              {type === 'query' ?
                <FormItem flexAble label={utils.intl('设备对象')}>
                  <span>{record.devTitle}</span>
                </FormItem>
                :
                <FormItem
                  name="devTitle"
                  rules={[
                    {
                      required: true,
                      message: utils.intl('请选择设备对象')
                    }
                  ]}
                  {...formItemLayout}
                  label={utils.intl('设备对象')}><Select
                    className={'select100'}
                    disabled
                  /></FormItem>
              }
            </Col>
            <Col span={12}>
              {type === 'query' ?
                <FormItem flexAble label={utils.intl('工单类型')}>
                  <span>{record.typeTitle}</span>
                </FormItem>
                :
                <FormItem
                  name="typeId"
                  rules={[
                    {
                      required: true,
                      message: utils.intl('请选择工单类型')
                    }
                  ]}
                  {...formItemLayout}
                  label={utils.intl('工单类型')}><Select
                    dataSource={workOrderTypesArr}
                    className={'select100'}
                  /></FormItem>
              }
            </Col>
          </Row>
          <Row gutter={10}>
            <Col span={12}>
              {type === 'query' ?
                <FormItem flexAble label={utils.intl('处理人员')}>
                  <span>{record.userTitleProcess}</span>
                </FormItem>
                :
                <FormItem
                  name="userNameProcess"
                  rules={[
                    {
                      required: true,
                      message: utils.intl('请选择处理人员')
                    }
                  ]}
                  {...formItemLayout}
                  label={utils.intl('处理人员')}><Select
                    dataSource={usersArr}
                    className={'select100'}
                  /></FormItem>
              }
            </Col>
            <Col span={12}>
              {type === 'query' ?
                <FormItem flexAble label={utils.intl('工单名称')}>
                  <span>{record.orderName}</span>
                </FormItem>
                :
                <FormItem
                  name="orderName"
                  rules={[
                    {
                      required: true,
                      message: utils.intl('请输入工单名称')
                    },
                    {
                      max: 32,
                      message: utils.intl('不能超过32位字符')
                    }
                  ]}
                  {...formItemLayout}
                  label={utils.intl('工单名称')}><Input autoComplete="off" /></FormItem>
              }
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              {type === 'query' ?
                <FormItem label={utils.intl('工单描述')}>
                  <span>{record.description}</span>
                </FormItem>
                :
                <FormItem
                  name="description"
                  flexAble
                  rules={[
                    {
                      max: 500,
                      min: 4,
                      required: true,
                      message: utils.intl('请输入4~500位字符')
                    }
                  ]}
                  
                  label={utils.intl('工单描述')}><Input.TextArea style={{ resize: 'none', height: '120px', width: language === 'zh' ? 571 : '614px' }} placeholder={utils.intl('请输入4~500位字符')}
                    autoComplete="off" /></FormItem>
              }
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
}

function mapStateToProps(model, getLoading) {
  return {
    ...model,
    loading: getLoading('addList')
  }
}

const _FormRes = FormContainer.create()(_Form)
export default makeConnect('abnormalQuery', mapStateToProps)(_FormRes)