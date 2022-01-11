import React from 'react'
import { ExportColumn } from "../../../interfaces/CommonInterface"
import AbsoluteBubble from "../../../components/AbsoluteBubble"
import utils from "../../../public/js/utils";
const alarmLevelClassNameMap = {
  '预警': 'wanke-color-orange',
  [utils.intl('预警')]: 'wanke-color-orange',
  '故障': 'wanke-color-red',
  [utils.intl('故障')]: 'wanke-color-red',
} 

export default function (stationOptions, openDevMemo) {
  return [
    {
      title: (utils.intl('序号')), dataIndex: 'num', key: 'bh', width: 65
    },
    {
      title: utils.intl('电站名称'), dataIndex: 'stationTitle', width: 180
    },
    {
      title: (utils.intl('设备对象')), dataIndex: 'devTitle', key: 'sb', width: 150,
      render: (text, record, index) => <div className="clickable-text" onClick={() => openDevMemo && openDevMemo(record)}>{text}</div>
    },
    {
      title: (utils.intl('异常类型')), dataIndex: 'alarmTitle', key: 'ycmc', width: 150
    },
    {
      title: (utils.intl('异常详情')), dataIndex: 'records', key: 'ycxq',
      render: (text, record, index) => {
        return <AbsoluteBubble>{text}</AbsoluteBubble>
      }
    },
    {
      title: (utils.intl('告警级别')), dataIndex: 'alarmLevelTitle', key: 'gjjb', width: 120,
      render: (text) => <span className={alarmLevelClassNameMap[text] || ''}>{text}</span>
    },
    {
      title: (utils.intl('发生时间')), dataIndex: 'startTime', key: 'fssj', width: 170
    },
    {
      title: (utils.intl('异常状态')), dataIndex: 'abnormalStatusTitle', key: 'dqgjzt', width: 120,
      render: text => <span><span className="wanke-circle-icon grey-icon"></span>{text}</span>
    },
    {
      title: (utils.intl('异常持续时间')), dataIndex: 'continueTime', key: 'ycclsj', width: 150
    },
    {
      title: (utils.intl('操作人')), dataIndex: 'userTitleProcess', key: 'czr', width: 110
    },
    {
      title: (utils.intl('操作时间')), dataIndex: 'latestProcessTime', key: 'czsj', width: 170
    }
  ]
}


export function getHistoryExceptionColumns(stationOptions): ExportColumn[] {
  return [
    {
      title: (utils.intl('序号')), dataIndex: 'num'
    },
    {
      title: utils.intl('电站名称'), dataIndex: 'stationId', renderE: (value) => {
        let match = stationOptions.find(item => item.value == value)
        return match && match.name
      }
    },
    {
      title: (utils.intl('设备对象')), dataIndex: 'devTitle'
    },
    {
      title: (utils.intl('异常类型')), dataIndex: 'alarmTitle'
    },
    {
      title: (utils.intl('异常详情')), dataIndex: 'records'
    },
    {
      title: (utils.intl('告警级别')), dataIndex: 'alarmLevelTitle'
    },
    {
      title: (utils.intl('发生时间')), dataIndex: 'startTime'
    },
    {
      title: (utils.intl('异常状态')), dataIndex: 'abnormalStatusTitle'
    },
    {
      title: (utils.intl('异常持续时间')), dataIndex: 'continueTime'
    },
    {
      title: (utils.intl('操作人')), dataIndex: 'userTitleProcess'
    },
    {
      title: (utils.intl('操作时间')), dataIndex: 'latestProcessTime'
    }
  ]
}
