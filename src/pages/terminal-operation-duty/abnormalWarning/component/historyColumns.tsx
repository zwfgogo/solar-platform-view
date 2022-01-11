import React from 'react'
import { ExportColumn } from '../../../../interfaces/CommonInterface'

export default function(stationOptions) {
  return [
    {
      title: ('编号'), dataIndex: 'num', key: 'bh', width: 65
    },
    {
      title: '电站名称', dataIndex: 'stationId', render: (value) => {
        let match = stationOptions.find(item => item.value == value)
        return match && match.name
      }
    },
    {
      title: ('设备对象'), dataIndex: 'devTitle', key: 'sb', width: 100
    },
    {
      title: ('异常名称'), dataIndex: 'alarmTitle', key: 'ycmc', width: 150
    },
    {
      title: ('异常详情'), dataIndex: 'records', key: 'ycxq', width: 200
    },
    {
      title: ('告警级别'), dataIndex: 'alarmLevelTitle', key: 'gjjb', width: 100
    },
    {
      title: ('发生时间'), dataIndex: 'startTime', key: 'fssj', width: 130
    },
    {
      title: ('异常状态'), dataIndex: 'abnormalStatusTitle', key: 'dqgjzt', width: 100
    },
    {
      title: ('异常持续时间'), dataIndex: 'continueTime', key: 'ycclsj', width: 140
    },
    {
      title: ('操作人'), dataIndex: 'userTitleProcess', key: 'czr', width: 110
    },
    {
      title: ('操作时间'), dataIndex: 'latestProcessTime', key: 'czsj', width: 130
    }
  ]
}


export function getHistoryExceptionColumns(stationOptions): ExportColumn[] {
  return [
    {
      title: ('编号'), dataIndex: 'num'
    },
    {
      title: '电站名称', dataIndex: 'stationId', renderE: (value) => {
        let match = stationOptions.find(item => item.value == value)
        return match && match.name
      }
    },
    {
      title: ('设备对象'), dataIndex: 'devTitle'
    },
    {
      title: ('异常名称'), dataIndex: 'alarmTitle'
    },
    {
      title: ('异常详情'), dataIndex: 'records'
    },
    {
      title: ('告警级别'), dataIndex: 'alarmLevelTitle'
    },
    {
      title: ('发生时间'), dataIndex: 'startTime'
    },
    {
      title: ('异常状态'), dataIndex: 'abnormalStatusTitle'
    },
    {
      title: ('异常持续时间'), dataIndex: 'continueTime'
    },
    {
      title: ('操作人'), dataIndex: 'userNameProcess'
    },
    {
      title: ('操作时间'), dataIndex: 'latestProcessTime'
    }
  ]
}