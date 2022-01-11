import React from "react";
import { Table2 } from 'wanke-gui'
import { PageTableProps } from '../../../interfaces/CommonInterface'
import { Bubble } from "wanke-gui";
import Select from "antd/lib/select";
import styles from "./styles/collecting-device-list.less";
import utils from '../../../public/js/utils'

const { Option } = Select;

enum COLLECTING_DEVICE_STATUS {
  delete = "DelDevice",
  new = "NewDevice"
}

export enum OPERATION_STATUS {
  new = "New",
  replace = "Replace",
  replaced = "Replaced",
  removed = "Dismantled",
  reset = "Reset"
}

export const operationStatusMap = {
  [OPERATION_STATUS.new]: utils.intl('新设设备'),
  [OPERATION_STATUS.replace]: utils.intl('替换设备'),
  [OPERATION_STATUS.replaced]: utils.intl('已更换'),
  [OPERATION_STATUS.removed]: utils.intl('已拆除')
};

const ResetOption = { value: OPERATION_STATUS.reset, label: utils.intl('重置') }

const OptionMap = {
  [COLLECTING_DEVICE_STATUS.delete]: [
    { value: OPERATION_STATUS.replaced, label: utils.intl('已更换') },
    { value: OPERATION_STATUS.removed, label: utils.intl('已拆除') }
  ],
  [COLLECTING_DEVICE_STATUS.new]: [
    { value: OPERATION_STATUS.new, label: utils.intl('新设设备') },
    { value: OPERATION_STATUS.replace, label: utils.intl('替换设备') }
  ]
};

interface Props extends PageTableProps {
  onConfirm: (value: OPERATION_STATUS, record: any) => void;
}

const CollectingDeviceList: React.FC<Props> = function(this: null, props) {
  const columns: any = [
    {
      title: utils.intl('序号'),
      width: 70,
      dataIndex: 'num'
    },
    {
      title: utils.intl('设备名称'),
      dataIndex: "name",
      render: text => (
        <Bubble bubble={true} placement={undefined}>
          {text}
        </Bubble>
      )
    },
    { title: utils.intl('设备型号'), dataIndex: "model" },
    { title: utils.intl('协议类型'), dataIndex: "protocolType" },
    {
      title: utils.intl('状态'),
      dataIndex: "state",
      render: (text, record) => (
        <span
          style={
            record.explain && record.explain.name === COLLECTING_DEVICE_STATUS.delete
              ? { color: "#ff0000" }
              : {}
          }
        >
          {text}
        </span>
      )
    },
    { title: utils.intl('设备状态时间'), dataIndex: "stateTime", width: 170 },
    {
      title: utils.intl('说明'),
      dataIndex: "explain",
      render: (text, record) => (
        <span
          style={
            text && text.name === COLLECTING_DEVICE_STATUS.delete
              ? { color: "#ff0000" }
              : { color: "#3588fe" }
          }
        >
          {text && text.title}
        </span>
      )
    },
    {
      title: utils.intl('更换确认'),
      width: 170,
      render: (text, record) => (
        <ReplaceConfirm
          key={record.id}
          rowId={record.id}
          record={record}
          onChange={props.onConfirm}
        />
      )
    }
  ];

  return (
    <Table2
      loading={props.loading}
      dataSource={props.dataSource}
      columns={columns}
      page={props.page}
      size={props.size}
      total={props.total}
      onPageChange={props.onPageChange}
    />
  )
};

export default CollectingDeviceList;

interface ReplaceConfirmProps {
  record: any;
  onChange: (value: OPERATION_STATUS, record: any) => void;
  rowId: string;
}

const ReplaceConfirm: React.FC<ReplaceConfirmProps> = ({
  record,
  onChange,
  rowId,
}) => {
  const isEdit = record.explain && (!record.controlReplace || record.isUpdate);
  if (!isEdit) {
    return (
      <span>
        {record.controlReplace && operationStatusMap[record.controlReplace.name]}
      </span>
    );
  }
  const optionList = OptionMap[record.explain.name].slice();
  if(record.controlReplace) {
    optionList.unshift(ResetOption);
  }
  // select 如果传入undefined 不为受控组件，所以传入 请选择 模拟未选中的状态
  const controlReplaceValue = (record.controlReplace || {}).name || utils.intl('请选择');
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div
        style={{ flexGrow: 1 }}
        // 未选中的状态特殊样式
        className={controlReplaceValue === utils.intl('请选择') ? styles["unselect"] : ""}
      >
        <Select
          placeholder={utils.intl('请选择')}
          style={{ width: "100%" }}
          value={controlReplaceValue}
          onSelect={(val: OPERATION_STATUS) => onChange(val, record)}
        >
          {optionList.map(item => (
            <Option key={item.value} value={item.value}>{item.label}</Option>
          ))}
        </Select>
      </div>
    </div>
  );
};
