import React from 'react'
import { PageTableProps } from '../../interfaces/CommonInterface'
import Forward from '../../public/components/Forward'
import { renderTitle } from '../page.helper'
import { Table2 } from 'wanke-gui'
import utils from '../../public/js/utils'

interface Props extends PageTableProps {
}

const List2: React.FC<Props> = function(this: null, props) {
  const columns: any = [
    {
      title: utils.intl('序号'),
      dataIndex: 'num',
      width: 65,
    },
    {
      title: utils.intl('电站名称'),
      dataIndex: 'title',
      // render: (text, record, index) => {
      //   return (
      //     <Forward to="stationUpdate" data={{stationId: record.id, editable: false}} title={text}>
      //       {text}
      //     </Forward>
      //   )
      // }
    },
    {
      title: utils.intl('能量单元数量'),
      dataIndex: 'energyUnitCount',
      width: 210,
    },
    {
      title: utils.intl('电站类型'),
      dataIndex: 'stationType',
      width: 160,
      render: renderTitle
    },
    {
      title: utils.intl('电站规模'),
      dataIndex: 'scaleDisplay',
      width: 200,
    },
    {
      title: utils.intl('投产时间'),
      dataIndex: 'productionTime',
      width: 250,
    },
    {
      title: utils.intl('运营商'),
      dataIndex: 'operator',
      width: 195,
      render: renderTitle
    },
    // {
    //   title: utils.intl('运维商'),
    //   dataIndex: 'maintenance',
    //   width: 120,
    //   render: renderTitle
    // },
    // {
    //   title: utils.intl('终端用户'),
    //   dataIndex: 'finalUser',
    //   width: 120,
    //   render: renderTitle
    // }
  ];

  return (
    <Table2
      x={1100}
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

export default List2
