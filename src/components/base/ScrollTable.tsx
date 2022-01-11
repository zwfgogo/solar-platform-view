import React from 'react'
import { Table } from 'antd'
import { TableProps } from 'antd/lib/table'
import { findDOMNode } from 'react-dom'
import { widthVirtualTableHOC } from '../VirtualTable'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import { showWidthInfo } from '../../core/env'
import { columnsInfo } from '../../core/devTools'
import { Column } from 'wanke-gui/lib/table'

const TableWrapComponent = widthVirtualTableHOC(Table)

interface Props1 extends Pick<TableProps<any>, 'dataSource' | 'rowKey' | 'rowSelection'> {
  columns: Column<any>[]
  width: number
  height: number
  loading: any
  x: number
  virtual?: boolean
  draggable?: boolean
  moveRow?: (dragIndex, hoverIndex) => void
}

const type = 'DragbleBodyRow'
const DraggableBodyRow = ({index, moveRow, className, style, ...restProps}) => {
  const ref = React.useRef()
  const [{isOver, dropClassName}, drop] = useDrop({
    accept: type,
    collect: monitor => {
      const {index: dragIndex} = monitor.getItem() || {}
      if (dragIndex === index) {
        return {}
      }
      return {
        isOver: monitor.isOver(),
        dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward'
      }
    },
    drop: item => {
      // @ts-ignore
      moveRow(item.index, index)
    }
  })
  const [, drag] = useDrag({
    item: {type, index},
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  })
  drop(drag(ref))
  return (
    <tr
      ref={ref}
      className={`${className}${isOver ? dropClassName : ''}`}
      style={{cursor: 'move', ...style}}
      {...restProps}
    />
  )
}

/*
* 处理滚动条的Table
* */
export class ScrollTable extends React.Component<Props1> {
  oneMoreUpdate = true
  taskId = null
  state = {
    tableHeight: 0,
    headHeight: 0
  }

  getTableInfo() {
    this.taskId = setTimeout(() => {
      let node = findDOMNode(this) as Element
      let head = node.querySelector('.ant-table-thead')
      if (this.state.tableHeight != node.clientHeight) {
        this.setState({tableHeight: node.clientHeight})
      }
      if (this.state.headHeight != head.clientHeight) {
        this.setState({headHeight: head.clientHeight || 0})
      }
    }, 0)
  }

  componentWillUnmount() {
    clearTimeout(this.taskId)
  }

  onRow = (record: any, index: number) => {
    return {
      index,
      moveRow: this.props.moveRow
    }
  }

  componentDidUpdate(prevProps) {
    let props = {
      width: this.props.width,
      height: this.props.height,
      dataSource: this.props.dataSource,
      x: this.props.x
    }
    let props1 = {
      width: prevProps.width,
      height: prevProps.height,
      dataSource: prevProps.dataSource,
      x: prevProps.x
    }
    if (JSON.stringify(props) != JSON.stringify(props1)) {
      this.getTableInfo()
      this.oneMoreUpdate = true
    } else if (this.oneMoreUpdate) {
      this.getTableInfo()
      this.oneMoreUpdate = false
    }
  }

  componentDidMount() {
    this.getTableInfo()
  }

  render() {
    const {width, height, virtual} = this.props
    const scroll = {
      y: this.state.tableHeight + 2 < height ? null : height - this.state.headHeight - 2,
      x: width > this.props.x ? null : this.props.x
    }
    let rowSelection
    if (this.props.rowSelection) {
      rowSelection = {
        columnWidth: 70,
        ...this.props.rowSelection
      }
    }
    if (showWidthInfo) {
      let widthCount = columnsInfo(rowSelection, this.props.columns)
      console.log(`宽度${this.props.x}, ${widthCount}，相差${this.props.x - widthCount}`)
    }
    const tableProps: TableProps<any> = {
      bordered: true,
      dataSource: this.props.dataSource || [],
      rowKey: this.props.rowKey,
      columns: this.props.columns,
      loading: this.props.loading,
      pagination: false,
      rowSelection,
      scroll
    }

    if (this.props.draggable) {
      if (!this.props.moveRow) {
        console.log('拖拽排序 需要提供 moveRow')
      }
      return (
        <DndProvider backend={HTML5Backend}>
          <Table
            {...tableProps}
            components={{
              body: {
                row: DraggableBodyRow
              }
            }}
            // @ts-ignore
            onRow={this.onRow}
          />
        </DndProvider>
      )
    }
    return <TableWrapComponent {...tableProps} tableWidth={width} virtual={virtual}></TableWrapComponent>
  }
}
