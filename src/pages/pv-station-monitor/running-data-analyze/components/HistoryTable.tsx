import React from 'react'
import styles from './styles/history-table.less'
import { Table1 } from 'wanke-gui'
import { ObjectType } from '../model';
import { GfDeleteOutlined } from 'wanke-icon';
import utils from '../../../../public/js/utils';

const columnsMap: any = {
  [ObjectType.Station]: [
    {
      title: utils.intl("电站名"),
      dataIndex: "stationTitle",
      width: '40%'
    },
    {
      title: utils.intl("数据项名"),
      dataIndex: "dataTitle",
      width: '40%'
    }
  ],
  [ObjectType.Device]: [
    {
      title: utils.intl("电站名"),
      dataIndex: "stationTitle",
      width: '30%'
    },
    {
      title: utils.intl("设备名"),
      dataIndex: "deviceTitle",
      width: '30%'
    },
    {
      title: utils.intl("数据项名"),
      dataIndex: "dataTitle"
    }
  ]
};

interface Props {
  tableData: any[]
  objectType: string
  loading?: boolean
  onDelete?: (record: any) => void
  onDeleteAll?: () => void
}

const HistoryTable: React.FC<Props> = (props) => {
  const { tableData, loading, objectType, onDelete, onDeleteAll } = props
  const columns = columnsMap[objectType].concat({
    title: (
      <GfDeleteOutlined
        style={{ color: '#b5b5be', cursor: 'pointer' }}
        onClick={() => onDeleteAll && onDeleteAll()}
      />
    ),
    width: 150,
    align: 'center',
    render: (text, record) => (
      <GfDeleteOutlined
        style={{ color: '#b5b5be', cursor: 'pointer' }}
        onClick={() => onDelete && onDelete(record)}
      />
    )
  })

  return (
    <div className={styles['history-table']}>
      <Table1
        x={500}
        columns={columns}
        dataSource={tableData}
        loading={loading}
      />
    </div>
  )
}

export default HistoryTable
