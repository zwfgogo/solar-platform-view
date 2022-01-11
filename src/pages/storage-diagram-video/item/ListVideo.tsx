import React from 'react'
import {Table2} from 'wanke-gui'
import ListItemEditAndDelete from '../../../components/layout/ListItemEditAndDelete'
import AbsoluteBubble from '../../../components/AbsoluteBubble'

import utils from '../../../public/js/utils'

interface Props {
  loading: boolean
  total: number
  dataSource: any[]
  pageSize: any
  setPageSize: any
  onEdit: (index) => void
  onDelete: (index) => void
}

const ListVideo: React.FC<Props> = (props) => {
  let pageSize = props.pageSize

  const columns = [
    {title: utils.intl('序号'), width: 70, render: (_, _1, index) => (pageSize.page - 1) * pageSize.size + index + 1},
    {
      title: utils.intl('视频监控名称'), dataIndex: 'title', width: 150, render: (v) => {
        return (
          <AbsoluteBubble>{v}</AbsoluteBubble>
        )
      }
    },
    {title: utils.intl('URL地址'), dataIndex: 'urlAddress'},
    {title: utils.intl('数据频率'), dataIndex: 'frequency', width: 120},
    {
      title: utils.intl('设备品牌'), dataIndex: 'brand', width: 150, render: (v) => {
        return (
          <AbsoluteBubble>{v}</AbsoluteBubble>
        )
      }
    },
    {
      title: utils.intl('操作'), width: 120,
      render: (value, record, index) => {
        return (
          <ListItemEditAndDelete onEdit={() => props.onEdit(index)} onDelete={() => props.onDelete(index)}/>
        )
      }
    },
  ]

  return (
    <Table2
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

export default ListVideo