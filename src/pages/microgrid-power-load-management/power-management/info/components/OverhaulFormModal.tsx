import React, { useEffect, useState } from 'react';
import { Col, DatePicker, Form, Input, Modal, Row, InputNumber, FormContainer, message } from 'wanke-gui';
import classnames from 'classnames';
import { PowerManagementInfoModal } from '../../models/power-management-info';
import { disabledDateBeforeToday, getDisabledTimeFn, getTargetSystemTime } from '../../../../../util/dateUtil';
import moment from 'moment';
import { withUnit } from '../../../../../hoc/withUnit';
import MakeConnectProps from '../../../../../interfaces/MakeConnectProps';
import { makeConnect } from '../../../../umi.helper';
import { power_management_info } from '../../../../constants';
import utils from '../../../../../public/js/utils';

const { Item: FormItem } = Form
const InputNumberWithUnit = withUnit(InputNumber)

function isTimeRangeVaild(data, overhaulPlanList) {
  const startTimePlan = data.startTimePlan?.format('YYYY-MM-DD HH:mm:ss')
  const endTimePlan = data.endTimePlan?.format('YYYY-MM-DD HH:mm:ss')
  return overhaulPlanList
    .filter(record => !data.id || record.id !== data.id)
    .every(record => {
      // 如果摘牌了，取摘牌时间作为结束时间
      const recordEndTime = record.endTimeReal || record.endTimePlan
      return record.startTimePlan >= endTimePlan || recordEndTime <= startTimePlan
    })
}

interface Props extends PowerManagementInfoModal, MakeConnectProps<PowerManagementInfoModal> {
  id: number
  loading: boolean
  timeZone: string
  showCapacity?: boolean
  isSolar?: boolean
  maxPower?: number
  maxCapacity?: number
}

const OverhaulFormModal: React.FC<Props> = (props) => {
  const { overhaulPlanRecord = {}, overhaulPlanList, timeZone } = props
  const [form] = Form.useForm()

  const isNew = props.overhaulModalMode === 'new'

  const handleOk = () => {
    form.validateFields().then((values) => {
      console.log('values', values, overhaulPlanRecord)
      const data = { ...overhaulPlanRecord, ...values, ...values.influence }
      delete data.influence
      if (isTimeRangeVaild(data, overhaulPlanList)) {
        props.action('saveOverhaul', { powerDeviceId: props.id, values: data, isNew, id: overhaulPlanRecord.id })
          .then(() => {
            props.updateState({ overhaulModalVisible: false })
          })
      } else {
        message.error(utils.intl('计划时间不能与其他计划时间重叠'))
      }
    })
  }

  const getValidatorTime = (targetKey, isEndTime) => {
    return (rule, value) => {
      const targetValue = form.getFieldValue(targetKey)
      if (!value || !targetValue) {
        return Promise.resolve();
      }
      if ((value.isAfter(targetValue) && isEndTime) || (value.isBefore(targetValue) && !isEndTime)) {
        return Promise.resolve();
      }
      return Promise.reject(utils.intl('计划开始时间不能晚于计划结束时间'));
    }
  }

  // 同时校验开始和结束时间
  const handleCheckTime = () => {
    const startTimePlan = form.getFieldValue('startTimePlan')
    const endTimePlan = form.getFieldValue('endTimePlan')
    if (startTimePlan && endTimePlan) {
      form.validateFields(['startTimePlan', 'endTimePlan'])
    }
  }

  const validatorInfluence = (rule, value) => {
    if (!value) return Promise.reject(utils.intl('请输入影响功率/容量'));
    if (value.power) {
      if (value.power > props.maxPower) return Promise.reject(utils.intl('影响功率不能大于额定功率'));
      if (value.power < 0) return Promise.reject(utils.intl('影响功率不能小于0'));
    }
    if (props.showCapacity && value.capacity) {
      if (value.capacity > props.maxPower) return Promise.reject(utils.intl('影响容量不能大于额定功率'));
      if (value.capacity < 0) return Promise.reject(utils.intl('影响容量不能小于0'));
    }

    return Promise.resolve();
  }

  return (
    <Modal
      title={utils.intl(`${isNew ? '新增' : '编辑'}检修计划`)}
      visible={props.overhaulModalVisible}
      onOk={handleOk}
      onCancel={() => props.updateState({ overhaulModalVisible: false })}
      confirmLoading={props.loading}
    >
      <FormContainer
        form={form}
        initialValues={overhaulPlanRecord}
        className={classnames("fixed-label-width-form-115")}
        style={{ marginRight: 7 }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <FormItem
              label={utils.intl('计划开始时间')}
              name="startTimePlan"
              rules={[
                { required: true, message: utils.intl('请选择时间') },
                { validator: getValidatorTime('endTimePlan', false), message: utils.intl('计划开始时间不能晚于计划结束时间') },
              ]}
            >
              <DatePicker
                format="YYYY-MM-DD HH:mm"
                onChange={handleCheckTime}
                placeholder={utils.intl('请选择时间')}
                showTime
                style={{ width: '100%' }}
                allowClear={false}
                disabled={overhaulPlanRecord.startTimeReal}
                disabledTime={getDisabledTimeFn(getTargetSystemTime(timeZone), ['second'])}
                disabledDate={current => disabledDateBeforeToday(current)}
              />
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem
              label={utils.intl('计划结束时间')}
              name="endTimePlan"
              rules={[
                { required: true, message: utils.intl('请选择时间') },
                { validator: getValidatorTime('startTimePlan', true), message: utils.intl('计划开始时间不能晚于计划结束时间') },
              ]}
            >
              <DatePicker
                format="YYYY-MM-DD HH:mm"
                onChange={handleCheckTime}
                placeholder={utils.intl('请选择时间')}
                showTime
                style={{ width: '100%' }}
                allowClear={false}
                disabledTime={getDisabledTimeFn(getTargetSystemTime(timeZone), ['second'])}
                disabledDate={current => disabledDateBeforeToday(current)}
              />
            </FormItem>
          </Col>
        </Row>
        <Row gutter={30}>
          <Col span={24}>
            <FormItem
              label={utils.intl('影响功率/容量')}
              name="influence"
              rules={[
                { validator: validatorInfluence },
              ]}
            >
              <InfluenceInput
                showCapacity={props.showCapacity}
                isSolar={props.isSolar}
                maxPower={props.maxPower}
                maxCapacity={props.maxCapacity}
              />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              label={utils.intl('检修内容')}
              name="desc"
              rules={[
                { max: 128, message: utils.intl('128个字以内') },
              ]}
            >
              <Input.TextArea placeholder={utils.intl('请输入检修内容')} row={3} />
            </FormItem>
          </Col>
        </Row>
      </FormContainer>
    </Modal>
  );
};

function mapStateToProps(model, getLoading) {
  return {
    ...model,
    loading: getLoading('saveOverhaul')
  }
}

export default makeConnect(power_management_info, mapStateToProps)(OverhaulFormModal)

interface InfluenceInputProps {
  value?: any
  isSolar?: boolean
  showCapacity?: boolean
  onChange?: (value) => void
  maxPower?: number
  maxCapacity?: number
}

const InfluenceInput: React.FC<InfluenceInputProps> = ({
  onChange,
  value: originValue,
  isSolar,
  showCapacity,
  maxPower,
  maxCapacity,
}) => {
  const [value, setValue] = useState(originValue)
  
  const triggerChange = (newValue) => {
    onChange?.(newValue)
  }

  const handleChange = (attr, val) => {
    const newValue = {
      ...value,
      [attr]: val
    }
    setValue(newValue)
    triggerChange(newValue)
  }

  useEffect(() => {
    setValue(originValue)
  }, [originValue])

  return (
    <div style={{ display: 'flex' }}>
      <div style={showCapacity ? { width: 'calc(50% - 8px)', marginRight: 16 } : { width: '100%' }}>
        <InputNumberWithUnit
          placeholder={utils.intl('请输入影响功率')}
          precision={3}
          unit='kW'
          value={value.power}
          onChange={value => handleChange('power', value)}
        />
      </div>
      {showCapacity && (
        <div style={{ width: 'calc(50% - 8px)' }}>
          <InputNumberWithUnit
            placeholder={utils.intl('请输入影响容量')}
            precision={3}
            unit={isSolar ? 'kWp' : 'kWh'}
            value={value.capacity}
            onChange={value => handleChange('capacity', value)}
          />
        </div>
      )}
    </div>
  )
}
