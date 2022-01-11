import React, { useState } from 'react'
import { Checkbox, Form, Input, PhoneInput, Popconfirm, Select } from 'wanke-gui'
import classnames from 'classnames'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import { remind_management } from '../../constants'
import { makeConnect } from '../../umi.helper'
import { RemindManagementModal } from '../model'
import styles from './styles/contacts-form.less'
import { LanguageTypeList, RemindTypeList, RemindWayList } from '../contants'
import useFormError from '../../../hooks/useFormError'
import { checkEmail, checkMobile, checkPhone } from '../../../util/ruleUtil'
import { withErrorTip } from '../../../hoc/withErrorTip'
import { InputProps } from 'antd/lib/input'
import utils from '../../../public/js/utils'
import { WKPhoneInputProps } from 'wanke-gui/lib/phone-input'
import { isZh } from '../../../core/env'

const InputWithErrorTip = withErrorTip<InputProps>(Input)
const PhoneInputWithErrorTip = withErrorTip<WKPhoneInputProps>(PhoneInput)
const FormItem = Form.Item

interface Props extends MakeConnectProps<RemindManagementModal>, RemindManagementModal {}

const ContactsForm: React.FC<Props> = (props) => {
  return (
    <section className={styles['contacts-form']}>
      <header style={{ display: 'flex', paddingRight: props.remindSettingList.length > 3 ? 8 : 0 }}>
        <span style={{ flexShrink: 0, width: 150 }}>{utils.intl('remind.姓名')}:</span>
        <span style={{ flexGrow: 1, flexBasis: 10 }}>{utils.intl('remind.联系电话')}:</span>
        <span style={{ flexGrow: 1, flexBasis: 10 }}>{utils.intl('remind.邮箱')}:</span>
        <span style={{ flexShrink: 0, marginRight: 20, width: isZh() ? 196 : 236 }}>{utils.intl('remind.提醒内容')}:</span>
        <span style={{ flexShrink: 0, width: isZh() ? 192 : 203 }}>{utils.intl('remind.提醒方式')}:</span>
        <span style={{ flexShrink: 0, width: 120 }}>{utils.intl('remind.提醒语言')}:</span>
        <span style={{ flexShrink: 0, width: isZh() ? 65 : 80, }} />
      </header>
      <footer>
        {props.remindSettingList.map((item, index) => (
          <ContactsFormItem
            key={item.id}
            userList={props.userList}
            data={item}
            action={props.action}
          />
        ))}
      </footer>
    </section>
  );
};

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
  }
}

export default makeConnect(remind_management, mapStateToProps)(ContactsForm)

interface ContactsFormItemProps {
  userList: any[]
  data: any
  action: any
  showTitle?: boolean
}

const ContactsFormItem: React.FC<ContactsFormItemProps> = (props) => {
  const [form] = Form.useForm()
  const { showTitle, userList, data } = props
  const [isEdit, setIsEdit] = useState(false)
  const { onFieldsChange, errors, resetErrors } = useFormError({})

  const getInitialValues = () => {
    const { phone, internationalCode = '+86', ...other } = data

    return {
      ...other,
      phone: { code: internationalCode, phone }
    }
  }

  const handleConfirm = () => {
    form.validateFields().then((values) => {
      props.action('editRemindSettings', { values: formatValue(values), id: data.id })
        .then(() => {
          setIsEdit(false)
        })
    }).catch(() => {
    })
  }

  const handleCancel = () => {
    form.resetFields()
    resetErrors()
    setIsEdit(false)
  }

  const handleDelete = () => {
    props.action('deleteRemindSettings', { id: data.id })
  }

  const renderMenu = () => {
    if (isEdit) {
      return (
        <>
          <a className={classnames(styles['btn'], styles['color-grey'])} onClick={handleCancel}>{utils.intl('remind.取消')}</a>
          <a className={classnames(styles['btn'], styles['color-blue'])} onClick={handleConfirm}>{utils.intl('remind.完成')}</a>
        </>
      )
    }

    return (
      <>
        <a className={classnames(styles['btn'], styles['color-blue'])} onClick={() => setIsEdit(true)}>{utils.intl('remind.编辑')}</a>
        <Popconfirm
          title={utils.intl('确定删除吗')}
          placement="topRight"
          onConfirm={handleDelete}
        >
          <a className={classnames(styles['btn'], styles['color-grey'])}>{utils.intl('remind.删除')}</a>
        </Popconfirm>
      </>
    )
  }

  const getTitle = (title) => {
    if (!showTitle) return undefined
    return utils.intl(`remind.${title}`)
  }

  const handleUserChange = (id) => {
    const user = userList.find(item => item.value === id)
    if (user) {
      form.setFieldsValue ({
        phone: { code: user.internationalCode || '+86', phone: user.phone },
        email: user.email
      })
    }
  }

  return (
    <Form layout="vertical" onFieldsChange={onFieldsChange} initialValues={getInitialValues()} form={form}>
      <section className={styles['contacts-form-item']}>
          <FormItem
            name="userId"
            label={getTitle('姓名')} style={{ flexShrink: 0, width: 150 }}
          >
            <Select
              size="small"
              disabled={!isEdit}
              dataSource={userList}
              onChange={handleUserChange}
            />
          </FormItem>
          <FormItem
            name="phone"
            label={getTitle('联系电话')} style={{ flexGrow: 1, flexBasis: 10 }}
            rules={[checkPhone()]}
          >
            <PhoneInputWithErrorTip
              size="small"
              disabled={!isEdit}
              errors={errors['phone']}
              iconStyle={{ fontSize: 14 }}
            />
          </FormItem>
          <FormItem
            name="email"
            label={getTitle('邮箱')} style={{ flexGrow: 1, flexBasis: 10 }}
            rules={[checkEmail()]}
          >
            <InputWithErrorTip size="small" disabled={!isEdit} errors={errors['email']} iconStyle={{ fontSize: 14 }} />
          </FormItem>
          <FormItem
            name="enableSettings"
            label={getTitle('提醒内容')} style={{ flexShrink: 0, marginRight: 20 }}
          >
            <Checkbox.Group disabled={!isEdit}>
              {RemindTypeList.map(item => (
                <Checkbox value={item.value}>{item.title}</Checkbox>
              ))}
            </Checkbox.Group>
          </FormItem>
          <FormItem
            name="pushChannel"
            label={getTitle('提醒方式')} style={{ flexShrink: 0 }}
          >
            <Checkbox.Group disabled={!isEdit}>
              {RemindWayList.map(item => (
                <Checkbox value={item.value}>{item.title}</Checkbox>
              ))}
            </Checkbox.Group>
          </FormItem>
          <FormItem
            name="language"
            label={getTitle('提醒语言')} style={{ flexShrink: 0, width: 120 }}
          >
            <Select
              size="small"
              disabled={!isEdit}
              dataSource={LanguageTypeList.map(item => ({ name: item.title, value: item.value }))}
            />
          </FormItem>
        <div
          style={{
            flexShrink: 0,
            paddingTop: showTitle ? 30 : 0,
            width: isZh() ? 65 : 80,
            textAlign: 'right'
          }}
          className={styles['menu-list']}
        >
          {renderMenu()}
        </div>
      </section>
    </Form>
  )
}

const formatValue = (values) => {
  const { phone, ...other } = values
  
  return {
    ...other,
    phone: phone.phone,
    internationalCode: phone.code
  }
}
