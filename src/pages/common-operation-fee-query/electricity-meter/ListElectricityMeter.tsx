import React from 'react'
import { Table1 } from 'wanke-gui'
import { BasicTableProps } from "../../../components/BasicTable"
import { Column } from 'wanke-gui/lib/table'

interface Props extends BasicTableProps {
  columns: any[]
  header: any[]
}

const ListElectricityMeter: React.FC<Props> = function(this: null, props) {
  let columnCount = props.header.reduce((result, item) => {
    let count = item.length
    if (item.length > 1) {
      count = item.length - 1
    }
    return result + count
  }, 0)

  const columns: Column<any>[] = props.columns.map(item => {
    let [first, ...otherColumn] = item
    if (item.length == 1) {
      return {title: first.name, dataIndex: first.value}
    }
    return {
      title: first.name, dataIndex: first.value,
      children: otherColumn.map((subColumn, index) => {
        return {
          title: subColumn.name,
          dataIndex: subColumn.value,
          width: 110,
          className: index === otherColumn.length - 1 ? "no-content-border" : '',
          render: (text) => {
            if (!text && text !== 0) return text
            if (typeof text === 'string') {
              return Number(Number(text).toFixed(2))
            }
            if (typeof text === 'number') {
              return Number(text.toFixed(2))
            }
            return text
          }
        }
      })
    }
  })
  return (
    <Table1
      className="wanke-subfield-table"
      x={columnCount * 110 + 20}
      loading={props.loading}
      dataSource={props.dataSource}
      columns={columns}
    ></Table1>
  );
}

export default ListElectricityMeter
