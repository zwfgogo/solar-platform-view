import React from 'react'
import { Pagination } from 'antd'
import { Checkbox } from 'wanke-gui'
import { TableProps } from 'antd/lib/table'
import DeleteConfirm from './ListItemDelete'
import AutoSizer from './AutoSizer'
import FullContainer from './layout/FullContainer'
import { ScrollTable } from './base/ScrollTable'
import { Column } from 'wanke-gui/lib/table'
import { PageTableProps } from '../interfaces/CommonInterface'

class PageTable<Props extends PageTableProps, T = any> extends React.Component<Props> {
  static defaultProps = {
    checkedList: [],
    singleCheck: false,
    x: 1050
  }

  getKeyName() {
    return 'id'
  }

  showTotal = (total) => {
    return (<span>共 {total} 条</span>)
  }

  getColumns(): Column<T>[] {
    console.log('override onEdit in subclass')
    return []
  }

  columnCheckAll(): Column<any> {
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

  columnIndex(width = 70): Column<any> {
    return {
      title: '序号',
      width,
      align: 'center',
      dataIndex: 'num'
    }
  }

  columnOperation(width = 170): Column<any> {
    return {
      title: '操作',
      width,
      render: (text: any, record: any, index: number) => {
        const {disableColumnOperation} = this.props
        const disableFlag = disableColumnOperation && disableColumnOperation(record)
        if (disableFlag) return <div></div>
        return (
          <div>
            <a onClick={() => this.onEdit(record, index)}>编辑</a>
            <DeleteConfirm onConfirm={() => this.onDelete(record, index)}>
              <a style={{marginLeft: 9}}>删除</a>
            </DeleteConfirm>
          </div>
        )
      }
    }
  }

  render() {
    let columns = this.getColumns()

    return (
      <_PageTable
        rowKey={this.getKeyName()}
        dataSource={this.props.dataSource}
        columns={columns}
        x={this.props.x}
        loading={this.props.loading}
        rowSelection={this.props.rowSelection}
        page={this.props.page}
        size={this.props.size}
        total={this.props.total}
        onPageChange={this.props.onPageChange}
        showTotal={this.showTotal}
        draggable={this.props.draggable}
        moveRow={this.props.moveRow}
      />
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

interface Props2 extends Pick<TableProps<any>, 'dataSource' | 'rowSelection' | 'rowKey'> {
  columns: Column<any>[]
  loading: any
  x: number
  total: number
  page: number
  size: number
  onPageChange: (page, size) => void
  showTotal: (total) => React.ReactNode
  draggable?: boolean
  moveRow?: (dragIndex, hoverIndex) => void
}

export class _PageTable extends React.Component<Props2> {
  render() {
    return (
      <FullContainer>
        <div className="flex1">
          <AutoSizer>
            {
              ({width, height}) => {
                return (
                  <ScrollTable
                    width={width}
                    height={height}
                    rowKey={this.props.rowKey}
                    dataSource={this.props.dataSource}
                    columns={this.props.columns}
                    loading={this.props.loading}
                    rowSelection={this.props.rowSelection}
                    x={this.props.x}
                    draggable={this.props.draggable}
                    moveRow={this.props.moveRow}
                  />
                )
              }
            }
          </AutoSizer>
        </div>
        <div style={{height: 35, marginTop: 10}}>
          {
            this.props.total > 0 && (
              <Pagination
                style={{textAlign: 'right'}}
                showSizeChanger
                pageSizeOptions={['20', '30', '50', '100']}
                onShowSizeChange={this.props.onPageChange}
                onChange={this.props.onPageChange}
                current={this.props.page}
                pageSize={this.props.size || 0}
                total={this.props.total}
                showTotal={this.props.showTotal}
              />
            )
          }
        </div>
      </FullContainer>
    )
  }
}

export default PageTable
