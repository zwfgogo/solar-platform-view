import React from 'react'
import { Table2 } from 'wanke-gui'
import { PageTableProps } from "../../interfaces/CommonInterface"
import utils from '../../public/js/utils';
import { renderTitle } from "../page.helper"

interface Props extends PageTableProps {
  lookStation: (record) => void
}

const ListStation: React.FC<Props> = function(this: null, props) {
  const renderStationName = (value, record) => {
    return (
      <a onClick={() => props.lookStation(record)}>{value}</a>
    )
  }

  const columns: any = [
    {title: utils.intl('序号'), width: 70,  dataIndex: 'num'},
    {title: utils.intl('电站名称'), dataIndex: 'title', render: renderStationName},
    {title: utils.intl('电站类型'), width: 120, dataIndex: 'stationType', render: renderTitle},
    {title: utils.intl('建设规模'), width: 150, dataIndex: 'scaleDisplay'},
    {title: utils.intl('运行天数'), width: 140, dataIndex: 'runDays'},
    {title: utils.intl('累计收益(元)'), width: 120, dataIndex: 'profitAmount'},
    {title: utils.intl('平均日收益(元/日)'), width: 190, dataIndex: 'profitDay'},
    {title: utils.intl('单位容量日均收益(元/MWh·日)'), width: 240, dataIndex: 'profitDayScale'}
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

export default ListStation
