import moment from 'moment';
import React, { useState } from 'react';
import { Checkbox, DatePicker, Form, FormContainer, Input, InputNumber, Modal, Radio, Select, TimePicker } from 'wanke-gui'
import { isZh } from '../../../core/env';
import MakeConnectProps from '../../../interfaces/MakeConnectProps';
import utils from '../../../public/js/utils';
import { remind_management } from '../../constants';
import { makeConnect } from '../../umi.helper';
import { PushCycleList, RemindType } from '../contants';
import { Mode, RemindManagementModal } from '../model';

const FormItem = Form.Item
const Option = Select.Option

const layout = isZh() ? {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
} : {};

interface Props extends MakeConnectProps<RemindManagementModal>, RemindManagementModal {
  onClose: () => void
  // modal
  loading?: boolean
}

const ReportModal: React.FC<Props> = (props) => {
  const { mode, record } = props
  const [showRemindTime, setShowRemindTime] = useState(record.breakerStatus ?? true)
  const [form] = Form.useForm()
  const isNew = mode === Mode.new

  const handleRemindChange = (val) => {
    setShowRemindTime(val)
  }

  const handleOk = () => {
    form.validateFields().then((values) => {
      const data = formatValues(values)
      const modalName = isNew ? 'newRemindInto' : 'editRemindInto'
      const type = RemindType.ReportForms
      const params = isNew ? { values: data, type } : { values: data, type, id: record.id }
      props.action(modalName, params)
        .then(() => {
          props.onClose()
        })
    }).catch(() => {
    })
  }

  const getInitialValues = () => {
    if (isNew) {
      return {
        breakerStatus: true,
      }
    }
    const { pushTime, ...other } = record
    return {
      ...other,
      pushTime: pushTime ? moment(pushTime, 'HH:mm') : pushTime
    }
  }

  return (
    <Modal
      visible
      width={560}
      title={isNew ? utils.intl('remind.新增报表推送') : utils.intl('remind.编辑报表推送')}
      onOk={handleOk}
      onCancel={props.onClose}
      confirmLoading={props.loading}
      className="form-label-inline-block"
    >
      <Form
        form={form}
        {...layout}
        layout={isZh() ? "horizontal" : "vertical"}
        initialValues={getInitialValues()}
      >
        <FormItem
          label={utils.intl('remind.报表推送名称')}
          name="title"
          rules={[
            {required: true, message: utils.intl('remind.请输入报表推送名称')}
          ]}
        >
          <Input />
        </FormItem>
        <FormItem
          label={utils.intl('remind.是否提醒')}
          name="breakerStatus"
          required
        >
          <Select onChange={handleRemindChange}>
            <Option key="true" value={true}>{utils.intl('remind.开启')}</Option>
            <Option key="false" value={false}>{utils.intl('remind.关闭')}</Option>
          </Select>
        </FormItem>
        {showRemindTime && (
          <>
            <FormItem
              label={utils.intl('remind.提醒内容')}
              name="timeCycle"
              rules={[
                {required: true, message: utils.intl('remind.请选择提醒内容')}
              ]}
            >
              <Radio.Group>
                {PushCycleList.map(item => (
                  <Radio value={item.value}>{item.title}</Radio>
                ))}
              </Radio.Group>
            </FormItem>
            <FormItem
              label={utils.intl('remind.推送时间')}
              name="pushTime"
              rules={[
                {required: true, message: utils.intl('remind.请选择推送时间')}
              ]}
            >
              <TimePicker format="HH:00" style={{ width: '100%' }} showNow={false} />
            </FormItem>
          </>
        )}
      </Form>
    </Modal>
  )
};

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    loading: getLoading('newRemindInto') || getLoading('editRemindInto'),
  }
}

export default makeConnect(remind_management, mapStateToProps)(ReportModal)

function formatValues(values) {
  const { pushTime, ...others } = values
  const item = {
    ...others,
    pushTime: pushTime?.format('HH:mm:00')
  }
  if (!values.breakerStatus) {
    delete item.pushTime
    delete item.timeCycle
  }
  
  return item
}