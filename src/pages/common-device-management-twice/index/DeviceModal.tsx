import React from 'react'
import { Form, Input, Modal, Radio } from 'wanke-gui';
import { isZh } from '../../../core/env';
import MakeConnectProps from '../../../interfaces/MakeConnectProps';
import utils from '../../../public/js/utils';
import { letterAndNumberRule, maxLengthRule } from '../../../util/ruleUtil';
import { device_management_twice } from '../../constants';
import { makeConnect } from '../../umi.helper';
import { DeviceManagementTwiceModal, ModalMode } from '../models';

const FormItem = Form.Item

interface Props extends DeviceManagementTwiceModal, MakeConnectProps<DeviceManagementTwiceModal> {
  addOrEditDeviceLoading: boolean
}

const DeviceModal: React.FC<Props> = (props) => {
  const [form] = Form.useForm()
  const isAdd = props.mode === ModalMode.add
  const handleOk = () => {
    form.validateFields().then(values => {
      const params = {
        ...values,
        mode: props.mode,
      }
      if (isAdd) {
        params.stationId = Number(props.selectedKey)
      } else {
        params.id = props.record.id
      }
      props.action('addOrEditDevice', params).then(() => {
        props.updateState({ modalVisible: false })
      })
    })
  }

  const formItemLayout = isZh() ? {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
  } : {}

  return (
    <Modal
      visible={props.modalVisible}
      title={isAdd ? utils.intl('新增二次设备') : utils.intl('编辑二次设备')}
      width={640}
      maskClosable={false}
      onCancel={() => { props.updateState({ modalVisible: false }) }}
      onOk={handleOk}
      confirmLoading={props.addOrEditDeviceLoading}
    >
      <Form
        layout={isZh() ? 'horizontal' : 'vertical'}
        form={form}
        autoComplete="off"
        initialValues={isAdd ? { useHeartbeat: false } : props.record}
        {...formItemLayout}
      >
        <FormItem
          label={utils.intl('twiceDevice.设备名称')}
          name="title"
          rules={[
            { required: true, message: utils.intl('请输入设备名称') },
            maxLengthRule(16)
          ]}
        >
          <Input style={{ width: 260 }} />
        </FormItem>
        <FormItem
          label={utils.intl('设备编号(SN)')}
          name="name"
          rules={[maxLengthRule(16), letterAndNumberRule()]}
        >
          <Input style={{ width: 260 }} />
        </FormItem>
        <FormItem
          label={utils.intl('是否启用心跳')}
          name="useHeartbeat"
          rules={[]}
        >
          <Radio.Group>
            <Radio value={true}>
              <span style={{ marginLeft: 8 }}>{utils.intl('是')}</span>
            </Radio>
            <Radio value={false}>
              <span style={{ marginLeft: 8 }}>{utils.intl('否')}</span>
            </Radio>
          </Radio.Group>
        </FormItem>
        <FormItem
          label={utils.intl('描述')}
          name="notes"
          rules={[maxLengthRule(64)]}
        >
          <Input.TextArea rows={4} maxLength={64} />
        </FormItem>
      </Form>
    </Modal>
  )
}

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    addOrEditDeviceLoading: getLoading('addOrEditDevice'),
  };
};

export default makeConnect(device_management_twice, mapStateToProps)(DeviceModal);
