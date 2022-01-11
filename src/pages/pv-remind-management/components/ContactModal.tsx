import React from 'react'
import { Checkbox, Form, FormContainer, Input, Modal, PhoneInput, Select } from 'wanke-gui'
import { isZh } from '../../../core/env'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import utils from '../../../public/js/utils'
import { checkEmail, checkMobile, checkPhone } from '../../../util/ruleUtil'
import { remind_management } from '../../constants'
import { makeConnect } from '../../umi.helper'
import { LanguageType, LanguageTypeList, RemindTypeList, RemindWayList } from '../contants'
import { RemindManagementModal } from '../model'
import styles from './styles/contact-modal.less'

const FormItem = Form.Item

const layout = isZh() ? {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
} : {};

interface Props extends MakeConnectProps<RemindManagementModal>, RemindManagementModal {
  onClose: () => void
  // model
  loading?: boolean
}

const ContactModal: React.FC<Props> = (props) => {
  const [form] = Form.useForm()

  const handleOk = () => {
    form.validateFields().then((values) => {
      props.action('newRemindSettings', { values: formatValue(values) })
        .then(() => {
          props.onClose()
        })
    }).catch(() => {
    })
  }

  const handleUserChange = (id) => {
    const user = props.userList.find(item => item.value === id)
    if (user) {
      form.setFieldsValue ({
        phone: { code: user.internationalCode || '+86', phone: user.phone },
        email: user.email
      })
    }
  }
  
  return (
    <Modal
      visible
      width={520}
      title={utils.intl('remind.新建联系人')}
      onOk={handleOk}
      onCancel={props.onClose}
      confirmLoading={props.loading}
      className={styles['contact-modal']}
    >
      <Form
        form={form}
        {...layout}
        layout={isZh() ? "horizontal" : "vertical"}
        initialValues={{ language: LanguageType.CN }}
        labelAlign="right"
      >
        <FormItem
          label={utils.intl('remind.联系人姓名')}
          name="userId"
          rules={[{ required: true, message: utils.intl('remind.请选择联系人') }]}
        >
          <Select dataSource={props.userList} onChange={handleUserChange} />
        </FormItem>
        <FormItem label={utils.intl('remind.联系电话')} name="phone" rules={[checkPhone()]}>
          <PhoneInput />
        </FormItem>
        <FormItem label={utils.intl('remind.邮箱')} name="email" rules={[checkEmail()]}>
          <Input />
        </FormItem>
        <FormItem label={utils.intl('remind.提醒内容')} name="enableSettings">
          <Checkbox.Group>
            {RemindTypeList.map(item => (
              <Checkbox value={item.value}>{item.title}</Checkbox>
            ))}
          </Checkbox.Group>
        </FormItem>
        <FormItem label={utils.intl('remind.提醒方式')} name="pushChannel">
          <Checkbox.Group>
            {RemindWayList.map(item => (
              <Checkbox value={item.value}>{item.title}</Checkbox>
            ))}
          </Checkbox.Group>
        </FormItem>
        <FormItem label={utils.intl('remind.提醒语言')} name="language">
          <Select
            dataSource={LanguageTypeList.map(item => ({ name: item.title, value: item.value }))}
          />
        </FormItem>
      </Form>
    </Modal>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    loading: getLoading('newRemindSettings')
  }
}

export default makeConnect(remind_management, mapStateToProps)(ContactModal)

const formatValue = (values) => {
  const { phone, ...other } = values
  
  return {
    ...other,
    phone: phone.phone,
    internationalCode: phone.code
  }
}

