import React from 'react'
import { Table } from 'antd'
import { Checkbox } from 'wanke-gui'
import { TableProps } from 'antd/lib/table'

import { ColumnProps } from 'antd/lib/table'
import DeleteConfirm from './ListItemDelete'
import AutoSizer from './AutoSizer'
import { widthVirtualTableHOC } from './VirtualTable'
import { ScrollTable } from './base/ScrollTable'

const TableWrapComponent = widthVirtualTableHOC(Table)

export interface BasicTableProps
  extends Pick<TableProps<any>, 'rowSelection' | 'dataSource' | 'columns' | 'loading'> {
  singleCheck?: boolean
  checkedList?: any[]
  onCheckChange?: (ids: (string | number) []) => void
  x?: number
}

class BasicTable<Props extends BasicTableProps, T = any> extends React.Component<Props> {
  static defaultProps = {
    checkedList: [],
    singleCheck: false,
    x: 1050
  }

  getKeyName() {
    return 'id'
  }

  getColumns(): ColumnProps<T>[] {
    console.log('override onEdit in subclass')
    return []
  }

  columnCheckAll(): ColumnProps<any> {
    let self = this
    let checkedList = this.props.checkedList
    let key = this.getKeyName()
    return {
      title: this.props.singleCheck ? null : (
        <Checkbox
          indeterminate={checkedList.length > 0 && checkedList.length != this.props.dataSource.length}
          checked={checkedList.length > 0 && checkedList.length == this.props.dataSource.length}
          onChange={this.onCheckAll}
        />
      ),
      width: 50,
      align: 'center',
      render(text, record, index: number) {
        return (
          <Checkbox checked={checkedList.find(id => id == record[key]) != undefined}
                    onChange={(e) => self.onCheckChange(e, record[key])}/>
        )
      }
    }
  }

  columnIndex(width = 70): ColumnProps<any> {
    return {
      title: '序号',
      width,
      align: 'center',
      dataIndex: 'num'
    }
  }

  columnOperation(width = 170): ColumnProps<any> {
    return {
      title: '操作',
      width,
      render: this.renderOperation
    }
  }

  renderOperation(text: any, record: any, index: number) {
    return (
      <div>
        <a onClick={() => this.onEdit(record, index)}>编辑</a>
        <DeleteConfirm onConfirm={() => this.onDelete(record, index)}>
          <a style={{marginLeft: 9}}>删除</a>
        </DeleteConfirm>
      </div>
    )
  }

  render() {
    let columns = this.getColumns()

    return (
      <AutoSizer>
        {
          ({width, height}) => {
            return (
              <ScrollTable
                width={width}
                height={height}
                rowKey={this.getKeyName()}
                dataSource={this.props.dataSource}
                columns={columns}
                loading={this.props.loading}
                rowSelection={this.props.rowSelection}
                x={this.props.x}
              />
            )
          }
        }
      </AutoSizer>
    )
  }

  onCheckAll = (e) => {
    if (e.target.checked) {
      let ids = this.props.dataSource.map(record => record[this.getKeyName()])
      this.props.onCheckChange(ids)
    } else {
      this.props.onCheckChange([])
    }
  }

  onCheckChange(e, id) {
    let newList = null
    if (e.target.checked) {
      newList = this.props.checkedList.map(item => item)
      if (this.props.singleCheck) {
        newList = [id]
      } else {
        newList.push(id)
      }
    } else {
      newList = this.props.checkedList.filter(item => item != id)
    }

    this.props.onCheckChange(newList)
  }

  onEdit(record: T, index: number) {
    console.log('override onEdit in subclass')
  }

  onLook(record: T, index: number) {
    console.log('override onLook in subclass')
  }

  onDelete(record: T, index: number) {
    console.log('override onDelete in subclass')
  }
}

export default BasicTable
