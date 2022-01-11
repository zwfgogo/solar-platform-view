import React, { useState } from 'react'
import { Table2 } from 'wanke-gui'
import { PageTableProps } from "../../interfaces/CommonInterface"
import utils from '../../public/js/utils';
import PdfModal from './PdfModal';

interface Props extends PageTableProps {
  stationId: any
  lookMonth: (record) => void
  lookResult: (record) => void
}

const ListStation: React.FC<Props> = function(this: null, props) {
  const [billVisible, setBillVisible] = useState(false)
  const [record, setRecord] = useState(false)

  const renderFeeName = (value, record) => {
    return (
      <a onClick={() => props.lookMonth(record)}>{value}</a>
    )
  }

  const renderResult = (value, record) => {
    return (
      <a onClick={() => lookResult(record)}>{utils.intl('查看')}</a>
    )
  }

  const lookResult = (record) => {
    setRecord(record)
    setBillVisible(true)
  }

  const columns: any = [
    {title: utils.intl('序号'), width: 70, dataIndex: 'num'},
    {title: utils.intl('账单名称'), width: 120, dataIndex: 'billName', render: renderFeeName},
    {title: utils.intl('结算起始时间'), width: 170, dataIndex: 'startTime'},
    {title: utils.intl('结算结束时间'), width: 170, dataIndex: 'endTime'},
    {title: utils.intl('累计充电电量(kWh)'), width: 250, dataIndex: 'totalCharge'},
    {title: utils.intl('充电电费(元)'), width: 170, dataIndex: 'chargeCost'},
    {title: utils.intl('累计放电电量(kWh)'), dataIndex: 'totalDischarge', width: 270},
    {title: utils.intl('放电电费(元)'), dataIndex: 'dischargeCost', width: 170},
    {title: utils.intl('总收益(元)'), dataIndex: 'totalIncome', width: 140},
    {title: utils.intl('结算账单'), dataIndex: 'profitDayScale', width: 130, render: renderResult}
  ];

  return (
    <>
      <Table2
        x={1300}
        loading={props.loading}
        dataSource={props.dataSource}
        columns={columns}
        page={props.page}
        size={props.size}
        total={props.total}
        onPageChange={props.onPageChange}
      />
      {billVisible && (
        <PdfModal
          record={record}
          visible={billVisible}
          stationId={props.stationId}
          cancel={() => setBillVisible(false)}
        />
      )}
    </>
  )
};

export default ListStation
