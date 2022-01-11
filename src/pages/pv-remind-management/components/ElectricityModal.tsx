import { InputNumberProps } from 'antd/lib/input-number'
import React, { useState } from 'react'
import { Checkbox, DatePicker, Form, FormContainer, Input, InputNumber, message, Modal, Select } from 'wanke-gui'
import classnames from 'classnames'
import { withUnit } from '../../../hoc/withUnit'
import TimeRangeInput from './TimeRangeInput'
import styles from './styles/electricity-modal.less'
import { Mode, RemindManagementModal } from '../model'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import { remind_management } from '../../constants'
import { makeConnect } from '../../umi.helper'
import moment from 'moment'
import { RemindType } from '../contants'
import utils from '../../../public/js/utils'
import { isZh } from '../../../core/env'

const InputNumberWithUnit = withUnit<InputNumberProps>(InputNumber)

const FormItem = Form.Item
const Option = Select.Option

function isEmpty(value) {
  return !value && value !== 0
}

const layout = isZh() ? {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
} : {};

interface Props extends MakeConnectProps<RemindManagementModal>, RemindManagementModal {
  onClose: () => void
  // modal
  loading?: boolean
}

const ElectricityModal: React.FC<Props> = (props) => {
  const { mode, record } = props
  const [showRemindTime, setShowRemindTime] = useState(record.breakerStatus ?? true)
  const [form] = Form.useForm()
  const isNew = mode === Mode.new

  const handleRemindChange = (val) => {
    setShowRemindTime(val)
  }

  const isOverlapped = (time, targetTime) => {
    const formater = "HH"
    const timeStart = time.startTime.format(formater)
    let timeEnd = time.endTime.format(formater)
    if (timeEnd === '00') timeEnd = '24'
    const targetStart = targetTime.startTime.format(formater)
    let targetEnd = targetTime.endTime.format(formater)
    if (targetEnd === '00') targetEnd = '24'
    return !(targetStart >= timeEnd || targetEnd <= timeStart)
  }

  const isTimeRangeOverlapped = (timeRange) => {
    return timeRange.some((item, index) => timeRange.some(
      (target, targetIndex) => index !== targetIndex && isOverlapped(item, target)
    ))
  }

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (isEmpty(values.upLimit) && isEmpty(values.downLimit)) {
        message.error(utils.intl('remind.上限阈值和下限阈值至少填写一项'))
        return
      }
      if (values.breakerStatus && isTimeRangeOverlapped(values.timeRange)) {
        message.error(utils.intl('remind.提醒时间不允许重叠'))
        return;
      }
      const data = formatValues(values)
      const modalName = isNew ? 'newRemindInto' : 'editRemindInto'
      const type = RemindType.ElectricityPrice
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
        timeRange: [{}]
      }
    }
    const { timeRange, ...other } = record
    return {
      ...other,
      timeRange: timeRange ? (
        timeRange.split(',').map(item => {
          const [startTime, endTime] = item.split('-')
          return {
            startTime: moment(startTime, 'HH:mm'),
            endTime: moment(endTime, 'HH:mm'),
          }
        })
      ) : [{}]
    }
  }
  
  return (
    <Modal
      visible
      title={isNew ? utils.intl('remind.新增电价提醒') : utils.intl('remind.编辑电价提醒')}
      width={520}
      onOk={handleOk}
      onCancel={props.onClose}
      className={classnames("form-label-inline-block", styles['electricity-modal'])}
      confirmLoading={props.loading}
    >
      <Form
        form={form}
        {...layout}
        layout={isZh() ? "horizontal" : "vertical"}
        initialValues={getInitialValues()}
      >
        <FormItem
          label={utils.intl('remind.电价提醒名称')}
          name="title"
          rules={[
            {required: true, message: utils.intl('remind.请输入电价提醒名称')}
          ]}
        >
          <Input />
        </FormItem>
        <FormItem
          label={utils.intl('remind.上限阈值')}
          name="upLimit"
          rules={[
          ]}
        >
          <InputNumberWithUnit style={{ width: '100%' }} unit={utils.intl('AUD')} />
        </FormItem>
        <FormItem
          label={utils.intl('remind.下限阈值')}
          name="downLimit"
          rules={[
          ]}
        >
          <InputNumberWithUnit style={{ width: '100%' }} unit={utils.intl('AUD')} />
        </FormItem>
        <FormItem
          label={utils.intl('remind.是否提醒')}
          name="breakerStatus"
          required
        >
          <Select style={{ width: '100%' }} onChange={handleRemindChange}>
            <Option key="true" value={true}>{utils.intl('remind.开启')}</Option>
            <Option key="false" value={false}>{utils.intl('remind.关闭')}</Option>
          </Select>
        </FormItem>
        {showRemindTime && (
          <FormItem
            label={utils.intl('remind.提醒时间')}
            required
          >
            <TimeRangeInput name="timeRange" form={form} />
          </FormItem>
        )}
      </Form>
    </Modal>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    loading: getLoading('newRemindInto') || getLoading('editRemindInto'),
  }
}

export default makeConnect(remind_management, mapStateToProps)(ElectricityModal)

function formatValues(values) {
  const { timeRange = [], ...others } = values
  const item = {
    ...others,
    timeRange: timeRange
      .map(item => `${moment(item.startTime).format('HH:mm:00')}-${item.endTime.format('HH:mm:00')}`)
      .join(',')
  }
  if (!values.breakerStatus) {
    delete item.timeRange
  }
  
  return item
}
