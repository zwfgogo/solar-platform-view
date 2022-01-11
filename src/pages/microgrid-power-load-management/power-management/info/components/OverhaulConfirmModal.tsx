import React from 'react';
import { Form, FormContainer, Modal, DatePicker } from 'wanke-gui';
import { PowerManagementInfoModal } from '../../models/power-management-info';
import { makeConnect } from '../../../../umi.helper';
import { globalNS, power_management_info } from '../../../../constants';
import moment, { Moment } from 'moment';
import { range0 } from '../../../../page.helper';
import { getDisabledTimeFn, getTargetSystemTime } from '../../../../../util/dateUtil';
import MakeConnectProps from '../../../../../interfaces/MakeConnectProps';
import utils from '../../../../../public/js/utils';

const { Item: FormItem } = Form

interface Props extends PowerManagementInfoModal, MakeConnectProps<PowerManagementInfoModal> {
  id: number
  loading: boolean
  serviceTime: string
  timeZone: string
}

const OverhaulConfirmModal: React.FC<Props> = (props) => {
  const { overhaulConfirmType, overhaulPlanStatus, timeZone } = props
  const [form] = Form.useForm()
  const isHangUp = overhaulConfirmType === 'hangUp'
  
  const handleOk = () => {
    form.validateFields().then((values) => {
      console.log('values', values)
      props.action('changeMaintenance', {
        isStart: isHangUp,
        id: props.id,
        dtime: values.time?.format("YYYY-MM-DD HH:mm:00")
      })
        .then(() => {
          props.updateState({ overhaulConfirmModalVisible: false })
        })
    })
  }

  const disabledDate = (current) => {
    if (isHangUp) return current.isAfter(getTargetSystemTime(timeZone), 'days')

    return (overhaulPlanStatus.startTimeReal && current.isBefore(overhaulPlanStatus.startTimeReal, 'days'))
      || current.isAfter(getTargetSystemTime(timeZone), 'days')
  }

  return (
    <Modal
      visible={props.overhaulConfirmModalVisible}
      title={utils.intl(`检修${isHangUp ? '挂牌' : '摘牌'}`)}
      width={350}
      onOk={handleOk}
      onCancel={() => props.updateState({ overhaulConfirmModalVisible: false })}
      confirmLoading={props.loading}
    >
      <FormContainer form={form} initialValues={{ time: getTargetSystemTime(timeZone) }}>
        <div>
          <FormItem
            label={utils.intl(`${isHangUp ? '挂牌' : '摘牌'}时间`)}
            name="time"
            rules={[
              { required: true, message: utils.intl('请选择时间') },
            ]}
          >
            <DatePicker
              disabled
              format="YYYY-MM-DD HH:mm"
              placeholder={utils.intl('请选择时间')}
              showTime
              style={{ width: '100%' }}
              disabledDate={disabledDate}
              disabledTime={getDisabledTimeFn(overhaulPlanStatus.startTimeReal)}
            />
          </FormItem>
        </div>
      </FormContainer>
    </Modal>
  );
};

function mapStateToProps(model, getLoading, state) {
  return {
    ...model,
    loading: getLoading('changeMaintenance'),
    serviceTime: state[globalNS]
  }
}

export default makeConnect(power_management_info, mapStateToProps)(OverhaulConfirmModal)
