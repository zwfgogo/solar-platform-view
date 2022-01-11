import React from 'react';
import { Table1 } from 'wanke-gui';
import { Props as Table1Props } from 'wanke-gui/lib/table/Table1'
import { SortableContainer as sortableContainer, SortableElement as sortableElement, SortableHandle as sortableHandle } from 'react-sortable-hoc';
import { ZdDragOutlined } from 'wanke-icon';
import arrayMove from 'array-move';
import _ from 'lodash'
import "./index.less"


export interface SortableTableProps extends Table1Props {
  columns: any[];
  dataSource: any[];
  draggable?: boolean
  onDrag?: (oldIndex, newIndex) => void
}

export interface SortableTableState {
  dataSource: any[]
}

const DragHandle = sortableHandle(() => <ZdDragOutlined style={{ cursor: 'grab', color: '#999' }} />);

const SortableItem = sortableElement(props => <tr {...props} />);
const SortableContainer = sortableContainer(props => <tbody {...props} />);

class SortableTable extends React.Component<SortableTableProps, SortableTableState> {
  cssText = ''
  cssNode
  constructor(props) {
    super(props);
    this.state = {
      dataSource: props.dataSource?.map((item, index) => ({ ...item, index })) || [],
    }
    this.initCssText()
  }

  componentDidUpdate(preProps) {
    if (!_.isEqual(preProps.dataSource, this.props.dataSource)) {
      this.setState({ dataSource: this.props.dataSource?.map((item, index) => ({ ...item, index })) || [] })
    }
    if (!_.isEqual(preProps.columns, this.props.columns)) {
      this.initCssText()
    }
  }

  initCssText = () => {
    const { columns } = this.props
    let cssText = ''
    columns.forEach((column, index) => {
      cssText += `.row-dragging td:nth-of-type(${index + 2}) {`
      if (column.width) {
        cssText += `width: ${column.width}px;`
      } else {
        cssText += `flex-grow: 1;`
      }
      const align = column.align || 'left'
      const flexMap = {
        'left': 'flex-start',
        'center': 'center',
        'right': 'flex-end'
      }
      cssText += `text-align: ${align};justify-content: ${flexMap[align]};}`
    })
    this.cssText = cssText
  }

  createStyle = () => {
    this.cssNode = document.createElement('style')
    this.cssNode.type = 'text/css'
    if(this.cssNode.styleSheet){         //ie下  
      this.cssNode.styleSheet.cssText = this.cssText
    } else {  
      this.cssNode.innerHTML = this.cssText;       //或者写成 nod.appendChild(document.createTextNode(str))  
    }  
    document.getElementsByTagName("head")[0].appendChild(this.cssNode)
  }

  onSortStart = () => {
    this.createStyle()
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    if (this.cssNode) this.cssNode.remove()
    const { onDrag } = this.props
    if (oldIndex !== newIndex) {
      onDrag && onDrag(oldIndex, newIndex)
    }
  };

  DraggableContainer = props => (
    <SortableContainer
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortStart={this.onSortStart}
      onSortEnd={this.onSortEnd}
      {...props}
    />
  );

  DraggableBodyRow = ({ className, style, ...restProps }) => {
    const { dataSource } = this.state;
    const index = dataSource.findIndex(x => x.index === restProps['data-row-key']);
    return <SortableItem index={index} {...restProps} />;
  };

  render() {
    const { draggable, onDrag, ...rest } = this.props
    const { dataSource } = this.state
    const { columns } = rest

    if (!draggable) {
      return <Table1 {...rest} />
    }

    return (
      <Table1
        pagination={false}
        dataSource={dataSource}
        columns={[{
          title: '',
          dataIndex: 'sort',
          align: 'center',
          width: 60,
          className: 'drag-visible',
          render: () => <DragHandle />,
        }, ...columns]}
        // columns={columns}
        rowKey='index'
        components={{
          body: {
            wrapper: this.DraggableContainer,
            row: this.DraggableBodyRow,
          },
        }}
      />
    );
  }
}

export default SortableTable