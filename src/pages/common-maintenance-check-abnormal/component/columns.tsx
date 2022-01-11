import React from 'react'
import { ExportColumn } from "../../../interfaces/CommonInterface"
import AbsoluteBubble from "../../../components/AbsoluteBubble"
import utils from "../../../public/js/utils";
import { isZh } from '../../../core/env';

const alarmLevelClassNameMap = {
  '预警': 'wanke-color-orange',
  [utils.intl('预警')]: 'wanke-color-orange',
  '故障': 'wanke-color-red',
  [utils.intl('故障')]: 'wanke-color-red',
} 

export default function (this: void, props, openDevMemo) {
  const showFqgd = (record) => {
    const { dispatch } = props
    dispatch({
      type: 'abnormalQuery/updateState',
      payload: { record: record, orderModal: true, type: 'new' }
    }).then(res => {
      dispatch({
        type: 'abnormalQuery/getEnums',
      })
    })
  }
  const showCkgd = (record) => {
    const { dispatch } = props
    dispatch({
      type: 'abnormalQuery/updateState',
      payload: { orderModal: true, type: 'query' }
    }).then(res => {
      dispatch({
        type: 'abnormalQuery/getDetail',
        payload: { id: record }
      })
    })
  }
  const ignore = (record) => {
    const { dispatch } = props
    dispatch({
      //需要调用对于namespace下effects中的该函数
      type: 'abnormalQuery/updateState',
      payload: { ignoreModal: true, record: record }
    })
  }
  return [
    {
      title: (utils.intl('序号')), dataIndex: 'num', width: 65
    },
    {
      title: (utils.intl('设备对象')), dataIndex: 'devTitle', width: 220,
      render: (text, record, index) => <div className="clickable-text" onClick={() => openDevMemo && openDevMemo(record)}>{text}</div>
    },
    {
      title: (utils.intl('异常类型')), dataIndex: 'alarmTitle'
    },
    {
      title: (utils.intl('电站名称')), dataIndex: 'stationTitle'
    },
    {
      title: (utils.intl('异常详情')), dataIndex: 'records',
      render: (text, record, index) => {
        return <AbsoluteBubble>{text}</AbsoluteBubble>
      }
    },
    {
      title: (utils.intl('告警级别')), dataIndex: 'alarmLevelTitle', width: 110,
      render: (text) => <span className={alarmLevelClassNameMap[text] || ''}>{text}</span>
    },
    {
      title: (utils.intl('发生时间')), dataIndex: 'startTime', width: 170
    },
    {
      title: (utils.intl('异常状态')), dataIndex: 'abnormalStatusTitle', width: 110,
      render: text => <span><span className="wanke-circle-icon grey-icon"></span>{text}</span>
    },
    {
      title: (utils.intl('操作')), align: 'right', dataIndex: 'action', width: isZh() ? 70 : 100, key: 'cz', render: (text, record, index) => {
        return (
          <div className='editable-row-operations'>
            {
              text && text.split(',').map(v => {
                if (v === utils.intl('派单')) {
                  // 不需要派单
                  return ''
                  return (
                    <a className="e-mr10" onClick={showFqgd.bind(this, record)}>{utils.intl('派单')}</a>
                  )
                } else if (v === utils.intl('忽略')) {
                  return (
                    <a onClick={ignore.bind(this, record)}>{utils.intl('忽略')}</a>
                  )
                } else if (v === utils.intl('查看工单')) {
                  return ''
                  return (
                    <span>
                      <a onClick={showCkgd.bind(this, record.id)}>{utils.intl('查看工单')}</a>
                    </span>
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

export function getExceptionColumns(): ExportColumn[] {
  return [
    {
      title: (utils.intl('序号')), dataIndex: 'num'
    },
    {
      title: (utils.intl('设备对象')), dataIndex: 'devTitle'
    },
    {
      title: (utils.intl('异常类型')), dataIndex: 'alarmTitle'
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
}


