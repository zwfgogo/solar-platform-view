import React, { useState } from 'react';
import { Col, Form, FormContainer, Input, Modal, Row, Select, InputNumber, message } from 'wanke-gui';
import { LoadManagementModal } from '../../models/load-management';
import TimeRangeInput from './TimeRangeInput';
import { InputNumberProps } from 'antd/lib/input-number';
import styles from './styles/load-form-modal.less'
import { withUnit } from '../../../../../hoc/withUnit';
import PageProps from '../../../../../interfaces/PageProps';
import MakeConnectProps from '../../../../../interfaces/MakeConnectProps';
import { makeConnect } from '../../../../umi.helper';
import { load_management } from '../../../../constants';
import utils from '../../../../../public/js/utils';

const InputNumberWithUnit = withUnit<InputNumberProps>(InputNumber)

const { Item: FormItem } = Form

const RowProps = {
  gutter: 32,
}

interface Props extends PageProps, LoadManagementModal, MakeConnectProps<LoadManagementModal> {
  loading: boolean
  stationId: any
}

const LoadFormModal: React.FC<Props> = (props) => {
  const { switchMap, switchList, record } = props
  const [form] =Form.useForm()
  
  const deviceList = switchList.filter(item => {
    return !switchMap[item.value] || switchMap[item.value] === record.id
  })

  const isNew = props.modalMode === 'new'

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

  const isTimeListOverlapped = (timeList) => {
    return timeList.some((item, index) => timeList.some(
      (target, targetIndex) => index !== targetIndex && isOverlapped(item, target)
    ))
  }

  const onSubmit = () => {
    form.validateFields().then((values) => {
      if (isTimeListOverlapped(values.timeList)) {
        message.error(utils.intl('???????????????????????????'))
        return;
      }
      const data = {
        ...values,
        device: {
          id: values.deviceId
        }
      }
      delete data.deviceId
      if (!isNew) data.id = props.record.id
      props.action(isNew ? 'new' : 'edit', { values: data, stationId: props.stationId })
        .then(() => {
          props.updateState({ modalVisible: false })
        })
    })
  }

  return (
    <Modal
      title={utils.intl(`${isNew ? '??????' : '??????'}??????`)}
      className={styles["load-form-modal"]}
      width={680}
      visible={props.modalVisible}
      onOk={onSubmit}
      onCancel={() => props.updateState({ modalVisible: false })}
      confirmLoading={props.loading}
    >
      <FormContainer form={form} initialValues={{
        ...props.record,
        deviceId: props.record?.device?.id
      }}>
        <Row {...RowProps}>
          <Col span={12}>
            <FormItem
              label={utils.intl('????????????')}
              name="title"
              rules={[
                { required: true, message: utils.intl('form.?????????') },
                { max: 16, message: utils.intl('16???????????????') },
              ]}
            >
              <Input placeholder={utils.intl('form.?????????')} />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label={utils.intl('????????????')}
              name="deviceId"
              rules={[
                { required: true, message: utils.intl('form.?????????') }
              ]}
            >
              <Select dataSource={deviceList} placeholder={utils.intl('form.?????????')} />
            </FormItem>
          </Col>
        </Row>
        <Row {...RowProps}>
          <Col span={12}>
            <FormItem
              label={utils.intl('????????????')}
              name="alias"
              rules={[
                { required: true, message: utils.intl('form.?????????') },
                { max: 8, message: utils.intl('8???????????????') },
              ]}
            >
              <Input placeholder={utils.intl('form.?????????')} disabled />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label={utils.intl('????????????')}
              name="powerRating"
              rules={[{
                required: true,
                message: utils.intl('form.?????????'),
              }, {
                message: utils.intl('??????????????????????????????'),
                pattern: /^(\-|\+)?\d+(\.\d+)?$/
              }]}
            >
              <InputNumberWithUnit
                placeholder={utils.intl('form.?????????')}
                min={0}
                max={99999}
                precision={0}
                unit="kW"
              />
            </FormItem>
          </Col>
        </Row>
        <Row {...RowProps} className={styles['time-container']}>
          <Col span={12}>
            <FormItem
              label={utils.intl('????????????')}
              required
            >
              <TimeRangeInput name="timeList" form={form} />
            </FormItem>
          </Col>
        </Row>
      </FormContainer>
    </Modal>
  );
};

function mapStateToProps(model, getLoading, state) {
  return {
    ...model,
    stationId: state.global.selectedStationId,
    loading: getLoading('new') || getLoading('edit')
  }
}

export default makeConnect(load_management, mapStateToProps)(LoadFormModal)
