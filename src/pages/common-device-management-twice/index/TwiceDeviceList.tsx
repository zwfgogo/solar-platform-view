import React from 'react'
import { DeleteConfirmPopover, Modal, Table } from 'wanke-gui'
import { InfoCircleFilled } from 'wanke-icon';
import AbsoluteBubble from '../../../components/AbsoluteBubble';
import { isZh } from '../../../core/env';
import MakeConnectProps from '../../../interfaces/MakeConnectProps';
import Forward from '../../../public/components/Forward';
import utils from '../../../public/js/utils';
import { device_management_twice } from '../../constants';
import { makeConnect } from '../../umi.helper';
import { DeviceManagementTwiceModal, ModalMode } from '../models';

interface Props extends DeviceManagementTwiceModal, MakeConnectProps<DeviceManagementTwiceModal> {
  fetchDeviceListLoading: boolean
}

const TwiceDeviceList: React.FC<Props> = (props) => {
  const handleEdit = (record) => {
    props.updateState({
      mode: ModalMode.edit,
      modalVisible: true,
      record,
    })
  }

  const handleDelete = (id) => {
    Modal.confirm({
      icon: <InfoCircleFilled color="rgba(250,173,20,0.85)" />,
      title: utils.intl('是否删除{0}', '设备'),
      content: (
        <span className="wanke-color-grey">
          {utils.intl('删除后将不可恢复，请谨慎操作，你还要继续吗')}
        </span>
      ),
      onOk: () => props.action('deleteDevice', { id })
    })
  }

  const columns: any = [
    {
      title: utils.intl('序号'),
      width: 65,
      dataIndex: 'num',
    },
    {
      title: utils.intl('twiceDevice.设备名称'),
      dataIndex: 'title',
      width: 250,
      render: text => <AbsoluteBubble>{text}</AbsoluteBubble>
    },
    {
      title: utils.intl('设备编号(SN)'),
      dataIndex: 'name',
      width: 170,
      render: text => <AbsoluteBubble>{text}</AbsoluteBubble>
    },
    {
      title: utils.intl('采集信号数'),
      dataIndex: 'analogsCount',
      width: isZh() ? 110 : 160,
      render: (text, record) => (
        <Forward
          to="SignalList"
          data={{ deviceName: record.title, deviceId: record.id }}
        >{text}</Forward>
      )
    },
    {
      title: utils.intl('启用心跳'),
      dataIndex: 'useHeartbeat',
      width: isZh() ? 90 : 160,
      render: (text) => text === true ? utils.intl('是') : (text === false ? utils.intl('否') : '')
    },
    {
      title: utils.intl('描述'),
      dataIndex: 'notes',
      render: text => <AbsoluteBubble>{text}</AbsoluteBubble>
    },
    {
      title: utils.intl('操作'),
      width: 100,
      dataIndex: 'action',
      align: 'right',
      render: (text, record, index) => {
        return (
          <span>
            <a onClick={() => handleEdit(record)}>
              {utils.intl("编辑")}
            </a>
            <a style={{ marginLeft: 8 }} onClick={() => handleDelete(record.id)}>{utils.intl("删除")}</a>
          </span>
        );
      }
    }
  ]

  return (
    <>
      <Table
        loading={props.fetchDeviceListLoading}
        pagination={false}
        dataSource={props.deviceList}
        columns={columns}
      />
    </>
  )
}

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    fetchDeviceListLoading: getLoading('fetchDeviceList'),
  };
};

export default makeConnect(device_management_twice, mapStateToProps)(TwiceDeviceList);
