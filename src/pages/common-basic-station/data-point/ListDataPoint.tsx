import React from 'react'
import { PageTableProps } from '../../../interfaces/CommonInterface'
import { Column, ExportColumn } from '../../../interfaces/CommonInterface'
import { renderEmpty } from '../../page.helper'
import { Table2 } from 'wanke-gui'
import utils from '../../../public/js/utils';

interface Props extends PageTableProps {
  lookHistory: (typeId, typeTitle, terminalTitle) => void
}

const ListDataPoint: React.FC<Props> = function (this: null, props) {
  const columns: any = [
    {
      title: utils.intl("序号"),
      dataIndex: 'num',
      width: 65
    },
    {
      title: utils.intl("数据项业务名称"),
      dataIndex: 'typeTitle',
      width: 180
    },
    {
      title: utils.intl('输入/输出端名称'),
      dataIndex: 'terminalTitle',
      width: 160,
      render: renderEmpty
    },
    {
      title: 'PointID',
      dataIndex: 'pointNumber',
      width: 160
    },
    {
      title: utils.intl("信号名称"),
      dataIndex: 'signalTitle',
      width: 100
    },
    {
      title: utils.intl("历史记录"),
      width: 100,
      render: (value, record) => {
        return <a onClick={() => props.lookHistory(record.typeId, record.typeTitle, record.terminalTitle)}>{utils.intl("查看")}</a>;
      }
    }
  ];

  return (
    <Table2
      loading={props.loading}
      dataSource={props.dataSource}
      columns={columns}
      page={props.page}
      size={props.size}
      total={props.total}
      onPageChange={props.onPageChange}
    />
  )
};

export default ListDataPoint

export const data_point_columns: ExportColumn[] = [
  {
    title: utils.intl("序号"),
    dataIndex: 'num',
    width: 65
  },
  {
    title: utils.intl("数据项业务名称"),
    dataIndex: 'typeTitle',
    width: 165
  },
  {
    title: utils.intl('输入/输出端名称'),
    dataIndex: 'terminalTitle',
    width: 165,
    renderE: renderEmpty
  },
  {
    title: 'PointID',
    dataIndex: 'pointNumber',
    width: 100
  },
  {
    title: utils.intl("信号名称"),
    dataIndex: 'signalTitle',
    width: 100
  }
]
