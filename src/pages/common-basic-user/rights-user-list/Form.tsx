import React from 'react'
import { Input, Row, Col, Form, Select, Modal, PhoneInput } from 'wanke-gui'
import './index.less'
import { globalNS, r_u_user_list } from '../../constants'
import { makeConnect } from '../../umi.helper'
import { RightsUserListState } from '../models/rights-user-list'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import { FormComponentProps } from '../../../interfaces/CommonInterface'
import { FormContainer } from '../../../components/input-item/InputItem'
import { getFirmType } from '../../page.helper'
import utils from '../../../public/js/utils'
import { intl } from 'src/core18/utils18'
import { checkPhone } from '../../../util/ruleUtil'
import { local } from 'd3-selection'
import { isZh } from '../../../core/env'


const FormItem = Form.Item

interface Props extends RightsUserListState, MakeConnectProps<RightsUserListState>, FormComponentProps {
  parentPageNeedUpdate: (type) => void
  isOperator: boolean
  isSaving: boolean
}

const _Form: React.FC<Props> = function (this: null, props) {
  const { firmId, record, modalTitle, modal, firmsIdAndType, firmType, roles, roleSelected, isSaving } = props
  let [roleChange, setRoleChange] = React.useState(false)
  const cancel = () => {
    setRoleChange(false)
    props.action('updateState', {
      modal: false
    })
  }
  const formItemLayout = isZh() ? {
    labelCol: { span: 6 },
    wrapperCol: { span: 17 }
  } : {
    wrapperCol: { span: 22 }
  }

  function handleSubmit(e) {
    e.preventDefault()
    props.form.validateFields().then((values) => {
      setRoleChange(false)
      props.parentPageNeedUpdate('updateUser')
      props.action('$save', {
        values: formatValue({
          ...values,
        })
      })
    })
  }

  const getFirm = e => {
    props.action('getSelection', { firmId: e })
    props.form.setFieldsValue({ roleId: '' })
    for (let i = 0; i < firmsIdAndType.length; i++) {
      if (firmsIdAndType[i].value === e) {
        props.form.setFieldsValue({ firmType: getFirmType(firmsIdAndType[i].type.title) })
      }
    }
    setRoleChange(true)
  }

  const roleId = modalTitle === '????????????' ? roleSelected : roleChange ? roleSelected : record.roleId
  const language = localStorage.getItem("language")

  const isAdmin = record.roleTitle === utils.intl('?????????') || record.roleTitle === 'Administrator'

  return (
    <Modal
      confirmLoading={isSaving}
      centered
      bodyStyle={{ color: 'white' }}
      width={400}
      title={utils.intl(modalTitle)}
      visible={modal}
      onOk={handleSubmit}
      onCancel={cancel}
      wrapClassName={'userModal'}
      destroyOnClose={true}
    >
      <div>
        <Form
          initialValues={{
            name: record.name || '',
            title: record.title || '',
            firmId: modalTitle === '????????????' ? record.firmId : firmId,
            firmType: getFirmType(firmType),
            roleId: modalTitle === '????????????' ? roleSelected : roleChange ? roleSelected : record.roleId,
            phone: { code: record.internationalCode || '+86', phone: record.phone || '' }
          }}
          form={props.form}
          layout={language === 'zh' ? "horizontal" : 'vertical'}
          autoComplete="off">
          <Row>
            <Col span={24}>
              <FormItem
                name="name"
                validateFirst
                {...formItemLayout}
                rules={[
                  {
                    max: 32,
                    required: true,
                    message: utils.intl(`{32}????????????(??????????????????????????????????????????@)`),
                  }, {
                    message: utils.intl(`{32}????????????(??????????????????????????????????????????@)`),
                    pattern: /^[0-9a-zA-Z_@\.]+$/
                  }
                ]}
                {...formItemLayout}
                label={utils.intl('??????')}><Input disabled={modalTitle === utils.intl('????????????')} /></FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                name="title"
                rules={[
                  {
                    max: 16,
                    required: true,
                    message: utils.intl(`?????????{16}??????????????????`)
                  }
                ]}
                {...formItemLayout}
                label={utils.intl('??????')}><Input type="text" autoComplete="off" /></FormItem>
            </Col>
            <Col span={24}>
              <FormItem name="firmId" {...formItemLayout} label={utils.intl('??????')}>
                <Select
                  disabled={props.isOperator || isAdmin}
                  dataSource={firmsIdAndType.map(item => ({ value: item.value, name: item.name }))}
                  onSelect={getFirm} className={'select100'}
                />
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem name="firmType" {...formItemLayout} label={utils.intl('????????????')}><Input type="text" autoComplete="off" disabled /></FormItem>
            </Col>
            <Col span={24}>
              <FormItem name="roleId" rules={[{ required: true, message: utils.intl('???????????????') }]} {...formItemLayout} label={utils.intl('??????')}><Select
                disabled={modalTitle === '????????????' && (isAdmin)}
                dataSource={roles.filter(role => !(
                  modalTitle === '????????????' &&
                  role.name === utils.intl('?????????') &&
                  role.value !== roleId
                ))}
                style={{ width: '100%' }}
                className={'select100'} /></FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                name="phone"
                rules={[checkPhone(() => ({ maxLength: 16 }))]}
                {...formItemLayout}
                label={utils.intl('?????????')}><PhoneInput type="text" autoComplete="off" /></FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
}

const _FormRes = FormContainer.create()(_Form)

const mapStateToProps = (model, getLoading, state) => {
  const { record, modalTitle, modal, firmsIdAndType, firmId, firmType, roles, roleSelected } = model
  return {
    record,
    modalTitle,
    modal,
    firmsIdAndType,
    firmId,
    firmType,
    roles,
    roleSelected,
    isSaving: getLoading('$save'),
    isOperator: state[globalNS].firmType == 'Operator'
  }
}

export default makeConnect(r_u_user_list, mapStateToProps)(_FormRes)

const formatValue = (values) => {
  const { phone, ...other } = values

  return {
    ...other,
    phone: phone.phone,
    internationalCode: phone.phone ? phone.code : ''
  }
}
