import React from 'react'
import { ExportColumn } from "../../../interfaces/CommonInterface"
import utils from "../../../public/js/utils";

export default function(this: void, props) {
  const showFqgd = (record) => {
    const {dispatch} = props
    dispatch({
      type: 'abnormalWarning/updateState',
      payload: {record: record, orderModal: true, type: 'new'}
    })
      dispatch({
          type: 'abnormalWarning/getEnums',
      })
  }
  const showCkgd = (record) => {
    const {dispatch} = props
    dispatch({
      type: 'abnormalWarning/updateState',
      payload: {orderModal: true, type: 'query'}
    }).then(res => {
      dispatch({
        type: 'abnormalWarning/getDetail',
        payload: {id: record}
      })
    })
  }
  const ignore = (record) => {
    const {dispatch} = props
    dispatch({
      //需要调用对于namespace下effects中的该函数
      type: 'abnormalWarning/updateState',
      payload: {ignoreModal: true, id: record}
    })
  }
  return [
    {
      title: (utils.intl('编号')), dataIndex: 'num', width: 65
    },
    {
      title: (utils.intl('设备对象')), dataIndex: 'devTitle', width: 120
    },
    {
      title: (utils.intl('异常名称')), dataIndex: 'alarmTitle'
    },
    {
      title: (utils.intl('电站名称')), dataIndex: 'stationTitle', width: 130
    },
    {
      title: (utils.intl('异常详情')), dataIndex: 'records'
    },
    {
      title: (utils.intl('告警级别')), dataIndex: 'alarmLevelTitle', width: 100
    },
    {
      title: (utils.intl('发生时间')), dataIndex: 'startTime', width: 140
    },
    {
      title: (utils.intl('异常状态')), dataIndex: 'abnormalStatusTitle', width: 100
    },
    {
      title: (utils.intl('操作')), dataIndex: 'operation', key: 'cz', width: 100, render: (text, record, index) => {
        if (record.action === (utils.intl('查看工单'))) {
          return (
            <span>
                        <a onClick={showCkgd.bind(this, record.id)}>查看工单</a>
                    </span>
          )
        } else {
          return (
            <span>
                       <a className="e-mr10" onClick={showFqgd.bind(this, record)}>派单</a>
                       <a onClick={ignore.bind(this, record.id)}>忽略</a>
                   </span>
          )
        }
      }
    }
  ]
}

export const current_exception_columns: ExportColumn[] = [
  {
    title: (utils.intl('编号')), dataIndex: 'num'
  },
  {
    title: (utils.intl('设备对象')), dataIndex: 'devTitle'
  },
  {
    title: (utils.intl('异常名称')), dataIndex: 'alarmTitle'
  },
  {
    title: (utils.intl('电站名称')), dataIndex: 'stationTitle'
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
  }
]
