import React from 'react'
import { Table1 } from 'wanke-gui'
import { BasicTableProps } from '../../../components/BasicTable'
import { Column } from 'wanke-gui/lib/table'
import utils from '../../../public/js/utils'

interface Props extends BasicTableProps {
}

const List5: React.FC<Props> = function(this: null, props) {
  const columns: Column<any>[] = [
    {
      title: utils.intl('序号'),
      dataIndex: 'num',
      key: 'num',
      width: 80
    },
    {
      title: utils.intl('数据项名称'),
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: utils.intl('数据项ID'),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: utils.intl('符号'),
      dataIndex: 'symbol',
      key: 'symbol'
    },
    {
      title: utils.intl('单位'),
      dataIndex: 'unitTitle',
      key: 'unitTitle'
    },
    {
      title: utils.intl('界面显示精度'),
      dataIndex: 'accuracyTitle',
      key: 'accuracyTitle'
    }
  ]

  return (
    <Table1
      virtual
      loading={props.loading}
      rowSelection={props.rowSelection}
      dataSource={props.dataSource}
      columns={columns}/>
  )
}

export default List5
