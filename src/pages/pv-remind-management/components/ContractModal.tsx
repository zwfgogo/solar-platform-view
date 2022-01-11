import moment from 'moment';
import React, { useState } from 'react';
import { Checkbox, DatePicker, Form, FormContainer, Input, message, Modal, Select } from 'wanke-gui'
import { isZh } from '../../../core/env';
import MakeConnectProps from '../../../interfaces/MakeConnectProps';
import utils from '../../../public/js/utils';
import { disabledDateBeforeTomorrow, getSystemTime } from '../../../util/dateUtil';
import { remind_management } from '../../constants';
import { makeConnect } from '../../umi.helper';
import { AdvanceTimeCycle, RemindType } from '../contants';
import { Mode, RemindManagementModal } from '../model';
import { advanceTimeCycleMap } from './ContractRemind';

const FormItem = Form.Item
const Option = Select.Option

const layout = isZh() ? {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
} : {};

interface Props extends MakeConnectProps<RemindManagementModal>, RemindManagementModal {
  onClose: () => void
  // modal
  loading?: boolean
}

const ContractModal: React.FC<Props> = (props) => {
  const { mode, record } = props
  const [showRemindTime, setShowRemindTime] = useState(record.breakerStatus ?? true)
  const [form] = Form.useForm()
  const isNew = mode === Mode.new

  const handleRemindChange = (val) => {
    setShowRemindTime(val)
  }

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (!checkEndTime(values)) {
        message.error(utils.intl('remind.合同到期时间必须大于提醒时间'))
        return
      }
      const data = formatValues(values)
      const modalName = isNew ? 'newRemindInto' : 'editRemindInto'
      const type = RemindType.Contract
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
        advanceTimeCycle: AdvanceTimeCycle.Month
      }
    }
    const { ...other } = record
    return {
      ...other,
      advanceTimeCycle: other.advanceTimeCycle || AdvanceTimeCycle.Month,
      startTime: moment(record.startTime),
      endTime: moment(record.endTime),
    }
  }

  const getValidatorTime = (targetKey, isEndTime) => {
    return (rule, value) => {
      const targetValue = form.getFieldValue(targetKey)
      if (!value || !targetValue) {
        return Promise.resolve();
      }

      const formater = "YYYY-MM-DD"
      let valueStr = value.format(formater)
      let targetStr = targetValue.format(formater)

      if ((valueStr >= targetStr && isEndTime) || (valueStr <= targetStr && !isEndTime)) {
        return Promise.resolve();
      }
      return Promise.reject(utils.intl('remind.开始时间不能晚于结束时间'));
    }
  }

  return (
    <Modal
      visible
      width={520}
      title={isNew ? utils.intl('remind.新增合同提醒') : utils.intl('remind.编辑合同提醒')}
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
          label={utils.intl('remind.电价提醒名称')}
          name="title"
          rules={[
            {required: true, message: utils.intl('remind.请输入电价提醒名称')}
          ]}
        >
          <Input />
        </FormItem>
        <FormItem
          label={utils.intl('remind.开始时间')}
          name="startTime"
          rules={[
            {required: true, message: utils.intl('remind.请选择开始时间')},
            { validator: getValidatorTime('endTime', false) },
          ]}
        >
          <DatePicker style={{ width: '100%' }} />
        </FormItem>
        <FormItem
          label={utils.intl('remind.结束时间')}
          name="endTime"
          rules={[
            {required: true, message: utils.intl('remind.请选择结束时间')},
            { validator: getValidatorTime('startTime', true) },
          ]}
        >
          <DatePicker style={{ width: '100%' }} disabledDate={(current) => disabledDateBeforeTomorrow(current)} />
        </FormItem>
        <FormItem label={utils.intl('remind.是否提醒')} name="breakerStatus" required>
          <Select onChange={handleRemindChange}>
            <Option key="true" value={true}>{utils.intl('remind.开启')}</Option>
            <Option key="false" value={false}>{utils.intl('remind.关闭')}</Option>
          </Select>
        </FormItem>
        {showRemindTime && (
          <FormItem
            label={utils.intl('remind.提醒时间')}
            name="advanceTimeCycle"
            required
          >
            <Select>
              <Option key={AdvanceTimeCycle.Day} value={AdvanceTimeCycle.Day}>
                {advanceTimeCycleMap[AdvanceTimeCycle.Day]}
              </Option>
              <Option key={AdvanceTimeCycle.Week} value={AdvanceTimeCycle.Week}>
                {advanceTimeCycleMap[AdvanceTimeCycle.Week]}
              </Option>
              <Option key={AdvanceTimeCycle.Month} value={AdvanceTimeCycle.Month}>
                {advanceTimeCycleMap[AdvanceTimeCycle.Month]}
              </Option>
            </Select>
          </FormItem>
        )}
      </Form>
    </Modal>
  );
};

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    loading: getLoading('newRemindInto') || getLoading('editRemindInto')
  }
}

export default makeConnect(remind_management, mapStateToProps)(ContractModal)

function formatValues(values) {
  const { startTime, endTime, ...other } = values
  return {
    ...other,
    startTime: startTime.format('YYYY-MM-DD'),
    endTime: endTime.format('YYYY-MM-DD'),
  }
}

function checkEndTime(values) {
  const { endTime, advanceTimeCycle } = values
  const currentDate = moment(getSystemTime()).startOf('day')
  const endDate = moment(endTime).startOf('day')
  const diffDay = endDate.diff(currentDate, 'day')

  switch(advanceTimeCycle) {
    case AdvanceTimeCycle.Day:
      if (diffDay <= 1) {
        return false
      }
      break;
    case AdvanceTimeCycle.Week:
      if (diffDay <= 7) {
        return false
      }
      break;
    case AdvanceTimeCycle.Month:
      if (diffDay <= 30) {
        return false
      }
      break;
  }

  return true
}
