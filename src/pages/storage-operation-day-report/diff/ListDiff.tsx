import React from 'react'
import { ColumnProps } from 'antd/lib/table'
import StringContent from "../../../components/StringContent"
import { Table } from 'wanke-gui'
import ListItemEditAndUpdate from "../../../components/layout/ListItemEditAndUpdate"
import AbsoluteBubble from '../../../components/AbsoluteBubble'
import utils from '../../../public/js/utils'

interface Props {
  dataSource: any[]
  onDelete: (id) => void
  onEdit: (record) => void
}

class ListDiff extends React.Component<Props> {
  onDelete(record: any, index: number) {
    this.props.onDelete(record.id)
  }

  onEdit(record: any, index: number) {
    this.props.onEdit(record)
  }

  getColumns(): ColumnProps<any>[] {
    return [
      {title: utils.intl('序号'), width: 65, dataIndex: 'num'},
      {title: utils.intl('原因标题'), width: 200, dataIndex: 'causeTitle'},
      {title: utils.intl('详情'), dataIndex: 'detail', render: (value) => <AbsoluteBubble>{value}</AbsoluteBubble>},
      {title: utils.intl('解决方案'), dataIndex: 'solution', render: (value) => <AbsoluteBubble>{value}</AbsoluteBubble>},
      {title: utils.intl('计划完成时间'), dataIndex: 'planCompleteTime', render: text => text?.split(' ')[0]},
      {title: utils.intl('责任部门'), width: 190, dataIndex: 'dutyDept'},
      {title: utils.intl('责任人'), width: 160, dataIndex: 'dutyUserTitle'},
      {
        title: utils.intl('操作'), width: 100, align: 'right', render: (value, record, index) => {
          return (
            <ListItemEditAndUpdate
              onEdit={() => this.props.onEdit(record)}
              onDelete={() => this.props.onDelete(record.id)}/>
          )
        }
      }
    ]
  }

  render() {
    return (
      <Table
        pagination={false}
        columns={this.getColumns()} dataSource={this.props.dataSource} rowKey="id"/>
    )
  }
}

export default ListDiff
