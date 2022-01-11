import { Table } from 'antd'
import React from 'react'
import utils from '../../../public/js/utils';

interface Props {
  dataSource: any[]
  loading?: boolean
}

const EnergyList: React.FC<Props> = (props) => {
  const columns: any = [
    {
      title: utils.intl('能量单元名称'),
      dataIndex: "title",
    },
    {
      title: utils.intl('能量单元类型'),
      dataIndex: "energyUnitType",
      width: 200,
      render: (text, record) => record.energyUnitType?.title
    },
    {
      title: utils.intl('额定功率'),
      dataIndex: "ratedPowerDisplay",
      width: 160,
    },
    {
      title: utils.intl('额定容量'),
      dataIndex: "scaleDisplay",
      width: 160,
    },
    {
      title: utils.intl('初始容量'),
      dataIndex: "startCapacityDisplay",
      width: 160,
    },
    {
      title: utils.intl('起始SoH'),
      dataIndex: "startSoh",
      width: 160,
    },
    {
      title: utils.intl('起始循环次数'),
      dataIndex: "startCycles",
      width: 160,
    },
    {
      title: utils.intl('实际投产时间'),
      dataIndex: "productionTime",
      width: 160,
    }
  ];

  return (
    <Table
      loading={props.loading}
      dataSource={props.dataSource}
      columns={columns}
      pagination={false}
    />
  )
}

export default EnergyList
