import React from 'react'
import {Table1, Table2} from 'wanke-gui'
import DeleteConfirm from '../../../components/ListItemDelete'
import { isZh } from '../../../core/env'

import utils from '../../../public/js/utils'
import { ControlModes, StrategyStatus, StrategyStatusTitleMap } from '../strategy.constant'

interface Props {
  total: number
  dataSource: any[]
  // pageSize: any
  // setPageSize: any
  loading?: boolean
  toLook: (index) => void
  toStart: (index) => void
  toStop: (index) => void
}

const List2: React.FC<Props> = (props) => {

  const columns = [
    {title: utils.intl('序号'), width: 60, render: (_, _1, index) => index + 1},
    {
      title: utils.intl('strategy.策略名称'), dataIndex: 'title', render: (value, _, index) => {
        return (
          <a onClick={() => props.toLook(index)}>{value}</a>
        )
      }
    },
    {title: utils.intl('适用对象'), dataIndex: 'applicableEnergyUnits'},
    {title: utils.intl('strategy.控制模式'), dataIndex: 'controlModes', render: (value) => {
      return (value || []).map(item => item.title).join("、")
    }},
    {
      title: utils.intl('状态'), dataIndex: 'strategyStatus', width: 120, render: (value) => {
        return <span className={`strategy-status ${value}`}>{StrategyStatusTitleMap[value] || ''}</span>
      }
    },
    {
      title: utils.intl('strategy.远程启停'),
      width: isZh() ? 120 : 150,
      align: 'right',
      render: (value, record, index) => {
        const hasRemoteMode = record.controlModes?.some(item => item.name === ControlModes.RemoteMode)
        if (hasRemoteMode) {
          const strategyStatus = record.strategyStatus
          return (
            <>
              {strategyStatus === StrategyStatus.stopped && (
                <DeleteConfirm tip={utils.intl('strategy.确定启动吗')} onConfirm={() => props.toStart(index)}>
                  <a>{utils.intl('strategy.启动')}</a>
                </DeleteConfirm>
              )}
              {strategyStatus === StrategyStatus.started && (
                <DeleteConfirm tip={utils.intl('strategy.确定停止吗')} onConfirm={() => props.toStop(index)}>
                  <a>{utils.intl('strategy.停止')}</a>
                </DeleteConfirm>
              )}
            </>
          )
        }
        return null
      }
    },
  ]

  return (
    <Table1
      dataSource={props.dataSource}
      total={props.total}
      loading={props.loading}
      // page={pageSize.page}
      // size={pageSize.size}
      // onPageChange={props.setPageSize}
      columns={columns}
    />
  )
}

export default List2
