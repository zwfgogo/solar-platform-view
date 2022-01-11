import { Moment } from 'moment'
import React, { useEffect, useState } from 'react'
import { Form, FullLoading, InputNumber, Modal, Table, Table1 } from 'wanke-gui'
import AbsoluteFullDiv from '../../../components/AbsoluteFullDiv'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import utils from '../../../public/js/utils'
import { battery_operation } from '../../constants'
import { formatValue } from '../../page.helper'
import { makeConnect } from '../../umi.helper'
import { BatteryOperationModel } from '../models'

const FormItem = Form.Item

interface Props extends MakeConnectProps<BatteryOperationModel>, BatteryOperationModel {
  stationId: number
  energyUnitId: number
  capacityNum: number
  batteryNum: number
  closeModal: () => void
  onViewPlan: () => void
  fetchOperationPlanLoading?: boolean
}

const OperationConfirm: React.FC<Props> = (props) => {
  const { capacityNum, batteryNum, stationId, energyUnitId } = props
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then((values) => {
      props.action('fetchOperationPlan', {
        stationId,
        energyUnitId,
        replacePackNum: values.battery,
        capacitySortNum: values.capacity,
      }).then(() => {
        props.onViewPlan()
      })
    })
  }

  const handleCancel = () => {
    props.closeModal()
  }

  let language = localStorage.getItem('language');

  return (
    <Modal
      title={utils.intl('电池运维方案')}
      width={480}
      visible={true}
      onOk={handleOk}
      onCancel={handleCancel}
      destroyOnClose={true}
      confirmLoading={props.fetchOperationPlanLoading}
    >
      <Form
        form={form}
        layout={language === 'zh' ? 'horizontal' : 'vertical'}
        initialValues={{ battery: batteryNum, capacity: capacityNum }}
      >
        <FormItem
          labelCol={{ span: 6 }}
          label={utils.intl('更换电池包数')}
          name="battery"
          rules={[
            { required: true, message: utils.intl('请输入更换电池包数') }
          ]}
        >
          <InputNumber
            style={{ width: '100%', marginRight: 20 }}
            max={20}
            min={1}
            precision={0}
          />
        </FormItem>
        <FormItem
          labelCol={{ span: 6 }}
          label={utils.intl('分容次数')}
          name="capacity"
          rules={[
            { required: true, message: utils.intl('请输入分容次数') }
          ]}
        >
          <InputNumber
            style={{ width: '100%', marginRight: 20 }}
            max={100}
            min={1}
            precision={0}
          />
        </FormItem>
      </Form>
    </Modal>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }) => {
  return {
    ...model,
    fetchOperationPlanLoading: getLoading('fetchOperationPlan'),
  }
}

export default makeConnect(battery_operation, mapStateToProps)(OperationConfirm)
