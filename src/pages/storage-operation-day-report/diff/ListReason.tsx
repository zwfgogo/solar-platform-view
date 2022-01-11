import React from 'react'
import { Table1 } from 'wanke-gui'
import { BasicTableProps } from "../../../components/BasicTable"
import { Input, message } from 'wanke-gui'
import { Column } from 'wanke-gui/lib/table'
import ListItemEditAndDelete from "../../../components/layout/ListItemEditAndDelete"
import utils from '../../../public/js/utils'

interface Props extends BasicTableProps {
  editId: number
  editTitle: string
  onEdit: (record) => void
  onTitleChange: (v: string) => void
  onDelete: (id: number) => void
  onSave: () => void
  onCancel: () => void
}

const ListReason: React.FC<Props> = function (this: null, props) {
  const onSave = () => {
    if (!props.editTitle || props.editTitle.trim() == '') {
      return
    }
    if (props.editTitle.length > 32) {
      message.error(utils.intl('最大32个字符'))
      return
    }
    props.onSave()
  }

  const renderTitle = (value, record, index) => {
    if ((props.editId == -1 && index == 0) || record.id == props.editId) {
      return (
        <Input value={props.editTitle} onChange={v => props.onTitleChange(v.target.value)}/>
      )
    }
    return value
  }

  const renderOpe = (value, record, index) => {
    if ((props.editId == -1 && index == 0) || record.id == props.editId) {
      return (
        <div>
          <a onClick={onSave}>{utils.intl('保存')}</a>
          <a style={{marginLeft: 5}} onClick={props.onCancel}>{utils.intl('取消')}</a>
        </div>
      )
    }
    return (
      <ListItemEditAndDelete onEdit={() => props.onEdit(record)} onDelete={() => props.onDelete(record.id)}/>
    )
  }

  const columns: Column<any>[] = [
    {title: utils.intl('序号'), width: 70, dataIndex: 'num'},
    {title: utils.intl('原因标题'), dataIndex: 'title', render: renderTitle},
    {title: utils.intl('操作'), width: 100, align: 'right', render: (value, record, index) => renderOpe(value, record, index)}
  ]

  return <Table1 x={500} loading={props.loading} dataSource={props.dataSource} columns={columns}></Table1>
}

export default ListReason
