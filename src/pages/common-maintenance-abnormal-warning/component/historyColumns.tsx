import React from 'react'
import { ExportColumn } from "../../../interfaces/CommonInterface"
import utils from "../../../public/js/utils";

export default function(stationOptions) {
  return [
    {
      title: (utils.intl('编号')), dataIndex: 'num', key: 'bh', width: 65
    },
    {
      title: utils.intl('电站名称'), dataIndex: 'stationId', render: (value) => {
        let match = stationOptions.find(item => item.value == value)
        return match && match.name
      }
    },
    {
      title: (utils.intl('设备对象')), dataIndex: 'devTitle', key: 'sb', width: 100
    },
    {
      title: (utils.intl('异常名称')), dataIndex: 'alarmTitle', key: 'ycmc', width: 150
    },
    {
      title: (utils.intl('异常详情')), dataIndex: 'records', key: 'ycxq', width: 200
    },
    {
      title: (utils.intl('告警级别')), dataIndex: 'alarmLevelTitle', key: 'gjjb', width: 100
    },
    {
      title: (utils.intl('发生时间')), dataIndex: 'startTime', key: 'fssj', width: 130
    },
    {
      title: (utils.intl('异常状态')), dataIndex: 'abnormalStatusTitle', key: 'dqgjzt', width: 100
    },
    {
      title: (utils.intl('异常持续时间')), dataIndex: 'continueTime', key: 'ycclsj', width: 140
    },
    {
      title: (utils.intl('操作人')), dataIndex: 'userTitleProcess', key: 'czr', width: 110
    },
    {
      title: (utils.intl('操作时间')), dataIndex: 'latestProcessTime', key: 'czsj', width: 130
    }
  ]
}


export function getHistoryExceptionColumns(stationOptions): ExportColumn[] {
  return [
    {
      title: (utils.intl('编号')), dataIndex: 'num'
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
      title: (utils.intl('异常名称')), dataIndex: 'alarmTitle'
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
      title: (utils.intl('操作人')), dataIndex: 'userNameProcess'
    },
    {
      title: (utils.intl('操作时间')), dataIndex: 'latestProcessTime'
    }
  ]
}