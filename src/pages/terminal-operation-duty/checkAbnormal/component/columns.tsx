import React from 'react'
import { ExportColumn } from '../../../../interfaces/CommonInterface'

export default function(this: void, props) {
  const showFqgd = (record) => {
    props.action("updateState", {record: record, orderModal: true, type: 'new'})
      props.action("getEnums")
  }
  const showCkgd = (record) => {
    props.action("updateState", {orderModal: true, type: 'query'}).then(res => {
      props.action("getDetail", {id: record})
    })
  }
  const ignore = (record) => {
    props.action("updateState", {ignoreModal: true, id: record})
  }
  return [
    {
      title: ('编号'), dataIndex: 'num', width: 65
    },
    {
      title: ('设备对象'), dataIndex: 'devTitle', width: 120
    },
    {
      title: ('异常名称'), dataIndex: 'alarmTitle'
    },
    {
      title: ('电站名称'), dataIndex: 'stationTitle', width: 130
    },
    {
      title: ('异常详情'), dataIndex: 'records'
    },
    {
      title: ('告警级别'), dataIndex: 'alarmLevelTitle', width: 100
    },
    {
      title: ('发生时间'), dataIndex: 'startTime', width: 140
    },
    {
      title: ('异常状态'), dataIndex: 'abnormalStatusTitle', width: 100
    },
    {
      title: ('操作'), dataIndex: 'action', key: 'cz', width: 100, render: (text, record, index) => {
        return (
                <div className='editable-row-operations'>
                   {
                        text.split(',').map(v => {
                            if (v ==='派单') {
                                return (
                                    <a className="e-mr10" onClick={showFqgd.bind(this, record)}>派单</a>
                                )
                            }else if(v ==='忽略') {
                                return(
                                    <a onClick={ignore.bind(this, record.id)}>忽略</a>
                                )
                            }else if(v ==='查看工单') {
                                return(
                                    <a onClick={showCkgd.bind(this, record.id)}>查看工单</a>
                                )
                            }
                        })
                    }
                </div>
            )
      }
    }
  ]
}

export const current_exception_columns: ExportColumn[] = [
  {
    title: ('编号'), dataIndex: 'num'
  },
  {
    title: ('设备对象'), dataIndex: 'devTitle'
  },
  {
    title: ('异常名称'), dataIndex: 'alarmTitle'
  },
  {
    title: ('电站名称'), dataIndex: 'stationTitle'
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
  }
]
