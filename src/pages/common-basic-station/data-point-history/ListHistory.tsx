import React from 'react'
import { Table1 } from 'wanke-gui'
import { Column } from 'wanke-gui/lib/table'
import utils from '../../../public/js/utils'

interface Props {
  loading: boolean
  dataSource: any[]
}

const ListHistory: React.FC<Props> = function (this: null, props) {
  const columns: Column<any>[] = [
    {
      title: utils.intl('序号'),
      dataIndex: 'num',
      align: 'center',
      width: 65
    },
    {
      title: utils.intl('操作时间'),
      dataIndex: 'operateTime',
      width: 180
    },
    {
      title: 'pointID',
      dataIndex: 'pointId',
      width: 165
    },
    {
      title: utils.intl('采集信号名称'),
      dataIndex: 'signalName',
      width: 160
    },
    {
      title: utils.intl('操作标识'),
      dataIndex: ['operateTag', 'title'],
      width: 160
    }
  ]

  return (
    <Table1
      loading={props.loading}
      dataSource={props.dataSource}
      columns={columns}
    />
  )
}

export default ListHistory

// disable-auto-column

export function exportListHistoryColumns() {
  return [{
    title: utils.intl('序号'),
    dataIndex: "num"
  }, {
    title: utils.intl('操作时间'),
    dataIndex: "operateTime"
  }, {
    title: "pointID",
    dataIndex: "pointId"
  }, {
    title: utils.intl('采集信号名称'),
    dataIndex: "signalName"
  }, {
    title: utils.intl('操作标识'),
    dataIndex: ['operateTag', 'title']
  }]
}