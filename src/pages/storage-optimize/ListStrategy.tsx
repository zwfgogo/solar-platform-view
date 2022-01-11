import React from 'react'
import { Table2 } from 'wanke-gui'
import AbsoluteBubble from '../../components/AbsoluteBubble'
import { PageTableProps } from '../../interfaces/CommonInterface'

import utils from '../../public/js/utils'

interface Props extends PageTableProps {
  onEdit: (id: number) => void
}

// interface ListItem {
//   stationId: number
// }

const ListStrategy: React.FC<Props> = function (this: null, props) {
  const renderOperation = (record: any) => {
    return (
      <div>
        <a onClick={() => props.onEdit(record)}>{utils.intl('维护')}</a>
      </div>
    )
  }

  const columns: any = [
    { title: utils.intl('序号'), width: 65, dataIndex: 'num' },
    { title: utils.intl('电站名称'), dataIndex: 'title' },
    { title: utils.intl('时区'), width: 200, dataIndex: 'timeZone' },
    {
      title: utils.intl('运营商'), width: 200, dataIndex: 'operator',
      render: (value) => {
        return <AbsoluteBubble>{value && value.title}</AbsoluteBubble>
      }
    },
    {
      title: utils.intl('电站类型'), width: 200, dataIndex: 'stationType',
      render: (value) => {
        return <AbsoluteBubble>{value && value.title}</AbsoluteBubble>
      }
    },
    { title: utils.intl('额定功率'), width: 200, dataIndex: 'ratedPowerDisplay' },
    { title: utils.intl('策略数量'), width: 200, dataIndex: 'runStrategiesNum' },
    { title: utils.intl('策略维护'), width: 100, render: renderOperation }
  ]

  return (
    <Table2
      key="num"
      loading={props.loading}
      dataSource={props.dataSource}
      columns={columns}
      page={props.page}
      size={props.size}
      total={props.total}
      onPageChange={props.onPageChange}
    />
  )
}

export default ListStrategy
