/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React from 'react'
import { Input, Row, Col, Form, Select, Modal } from 'wanke-gui'
import { r_o_role_list } from '../../constants'
import { makeConnect } from '../../umi.helper'
import { FormContainer } from '../../../components/input-item/InputItem'
import utils from '../../../public/js/utils'

const FormItem = Form.Item
const _Form = props => {
  const {record, modalTitle, availability, modal, isSaving} = props
  const language = localStorage.getItem("language")
  const cancel = () => {
    props.action('updateState', {
      modal: false
    })
  }
  const formItemLayout = {
    wrapperCol: {span: 16}
  }

  function handleSubmit(e) {
    e.preventDefault()
    props.form.validateFields().then((values) => {
        props.action('$save', {
          values
        })
    })
  }

  return (
    <Modal
      confirmLoading={isSaving}
      centered
      bodyStyle={{color: 'white'}}
      width={'700px'}
      title={utils.intl(modalTitle)}
      visible={modal}
      onOk={handleSubmit}
      onCancel={cancel}
      wrapClassName={'roleModal'}
      destroyOnClose={true}
    >
      <div>
        <Form
          initialValues={{
            title: record.title,
            activity: modalTitle === '新增角色' ? availability[0].value : record.activity ? 1 : -1
          }}
          form={props.form}
          layout={language === "zh" ? "horizontal" : 'vertical'}
          autoComplete="off">
          <Row>
            <Col span={12}>
              <FormItem
                name="title"
                rules={[
                  {
                    max: 16,
                    required: true,
                    message: utils.intl('请输入{16}字符以内角色名称')
                  }
                ]}
                {...formItemLayout}
                label={utils.intl('角色名称')}><Input autoComplete="off"/></FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="activity"
                rules={[
                  {
                    required: true,
                    message: utils.intl('请选择有效性')
                  }
                ]}
                {...formItemLayout}
                label={utils.intl('有效性')}><Select dataSource={availability.map(item => ({ ...item, name: utils.intl(item.name) }))} className={'select100'}/></FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
}

const _FormRes = FormContainer.create()(_Form)

const mapStateToProps = (model, getLoading) => {
  const {record, modalTitle, availability, modal} = model
  return {
    record,
    modalTitle,
    availability,
    modal,
    isSaving: getLoading('$save')
  }
}

export default makeConnect(r_o_role_list, mapStateToProps)(_FormRes)
