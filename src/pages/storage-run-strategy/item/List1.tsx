import React from 'react'
import {Table2} from 'wanke-gui'

import utils from '../../../public/js/utils'

interface Props {
  loading: boolean
  total: number
  dataSource: any[]
  pageSize: any
  setPageSize: any
  toDetail: (index) => void
}

const List1: React.FC<Props> = (props) => {
  let pageSize = props.pageSize

  const columns = [
    {title: utils.intl('序号'), width: 65, render: (_, _1, index) => (pageSize.page - 1) * pageSize.size + index + 1},
    {
      title: utils.intl('电站名称'),
      dataIndex: 'stationTitle',
      render: (value, record, index) => {
        return <a onClick={() => props.toDetail(index)}>{value}</a>
      }
    },
    {title: utils.intl('电站类型'), dataIndex: 'stationType', width: 150},
    {
      title: utils.intl('建设规模'), dataIndex: 'stationRatedPower', width: 350, render: (_, record) => {
        return (
          <span>
            {record.stationRatedPower}kW/{record.stationScale}kWh
          </span>
        )
      }
    },
    {title: utils.intl('控制模式'), dataIndex: 'runStrategyType', width: 200},
    {title: utils.intl('控制策略'), dataIndex: 'runStrategyTitle', width: 200},
  ]

  return (
    <Table2
      rowKey="stationId"
      loading={props.loading}
      dataSource={props.dataSource}
      total={props.total}
      page={pageSize.page}
      size={pageSize.size}
      onPageChange={props.setPageSize}
      columns={columns}
    />
  )
}

export default List1
