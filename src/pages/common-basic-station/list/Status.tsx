import React from 'react'
import classnames from 'classnames'
import { Dropdown, Menu } from 'wanke-gui'

import { DownOutlined, ExclamationCircleOutlined } from "wanke-icon";
import PopupContainer from '../../../components/PopupContainer';
import { Modal } from 'antd';
import utils from '../../../public/js/utils';

// TODO：之后这里的code属性应改为name属性，code属性后台之后可能会去除
// 电站状态
const colorMap = {
  '1': '#3a75f8',
  '2': '#606060',
  '3': '#ff284b',
  '4': '#009297',
  '5': '#ff8328',
}

interface Props {
  options: any[];
  current: string;
  code: number;
  children: any;
  onChange: (status) => void;
  disabled?: boolean;
  stationStatusOptions?: any[];
}

function Status(props: Props) {
  const showConfirmModal = (value, label, targetId) => {
    let targetCode;
    let match = (props.stationStatusOptions || []).find(o => o.value == targetId)
    if (match) {
      targetCode = match.code
    }
    Modal.confirm({
      title: (
        <span>
          {utils.intl("确认从")}
          <span style={{ color: colorMap[props.code] }}>{props.children}</span>
          {utils.intl("切换为")}
          <span style={{ color: colorMap[targetCode] }}>{label}</span></span>
      ),
      okText: utils.intl("确认"),
      cancelText: utils.intl("取消"),
      icon: <ExclamationCircleOutlined />,
      onOk() {
        props.onChange(value);
      },
      onCancel() { }
    });
  }

  let menu = (
    <Menu
      data={props.options.filter(item => item.value !== props.current)}
      onClick={({ item }) => {
        // @ts-ignore
        showConfirmModal(item.props.value, item.props.name, item.props.value)
      }}
    >
    </Menu>
  )

  let code = props.code
  let className = ''
  if (code == 1) {
    //已投产
    className = 'type1'
  } else if (code == 2) {
    //建设中
    className = 'type2'
  } else if (code == 3) {
    // 调试中
    className = 'type3'
  } else if (code == 4) {
    //试运行
    className = 'type4'
  } else if (code == 5) {
    //已停用
    className = 'type5'
  }

  return (
    <PopupContainer>
      {(ref) => (
        <Dropdown
          // getPopupContainer={() => ref.current}
          disabled={props.disabled}
          overlay={menu}
          placement="bottomLeft"
          trigger={['click']}
        >
          <div className={classnames('status', className)}>
            {props.children}
            {!props.disabled ? <DownOutlined type="down" /> : ""}
          </div>
        </Dropdown>
      )}
    </PopupContainer>
  );
}

export default Status
