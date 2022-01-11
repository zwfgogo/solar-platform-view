import React from 'react'
import { Table1 } from 'wanke-gui'
import { BasicTableProps } from "../../../components/BasicTable"
import { ExportColumn } from "../../../interfaces/CommonInterface"
import { Column } from 'wanke-gui/lib/table'
import utils from '../../../public/js/utils'
import { inRange } from 'lodash'

export function getTotalIncome(record: any) {
  return (Number(record.dischargeProfit) - Number(record.chargeCost)).toFixed(2)
}

interface Props extends BasicTableProps {
}

const ListFeeMonthDay: React.FC<Props> = function(this: null, props) {
  const columns: Column<any>[] = [
    {title: utils.intl('序号'), width: 70, fixed: true, dataIndex: 'num'},
    {title: utils.intl('日期'), width: 100, fixed: true, dataIndex: 'date', render: text => utils.intl(text)},
    {
      title: utils.intl('充电量(kWh)'), children:
        [
          {title: utils.intl('总'), dataIndex: 'chargeElectricity', width: 110},
          {title: utils.intl('尖峰'), dataIndex: 'chargeSharpElectricity', width: 110},
          {title: utils.intl('高峰'), dataIndex: 'chargePeakElectricity', width: 110},
          {title: utils.intl('平段'), dataIndex: 'chargeFlatElectricity', width: 110},
          {title: utils.intl('低谷'), dataIndex: 'chargeValleyElectricity', width: 110, className: "no-content-border"}
        ]
    },
    {
      title: utils.intl('放电量(kWh)'), children:
        [
          {title: utils.intl('总'), dataIndex: 'dischargeElectricity', width: 110},
          {title: utils.intl('尖峰'), dataIndex: 'dischargeSharpElectricity', width: 110},
          {title: utils.intl('高峰'), dataIndex: 'dischargePeakElectricity', width: 110},
          {title: utils.intl('平段'), dataIndex: 'dischargeFlatElectricity', width: 110},
          {title: utils.intl('低谷'), dataIndex: 'dischargeValleyElectricity', width: 110, className: "no-content-border"}
        ]
    },
    {title: utils.intl('充电成本(元)'), dataIndex: 'chargeCost', width: 140},
    {title: utils.intl('放电收益(元)'), dataIndex: 'dischargeProfit', width: 180},
    {title: utils.intl('总收益(元)'), dataIndex: 'profit', width: 140, render: (text, record) => getTotalIncome(record)}
  ]

  return (
    <Table1
      className="wanke-subfield-table"
      x={1480}
      loading={props.loading}
      dataSource={props.dataSource}
      columns={columns}
    ></Table1>
  )
}

export default ListFeeMonthDay

export const list_fee_columns: ExportColumn[] = [
  {title: utils.intl('序号'), dataIndex: 'num', width: 65},
  {title: utils.intl('日期'), dataIndex: 'date'},

  {title: `${utils.intl('总')}/${utils.intl('充电量(kWh)')}`, dataIndex: 'chargeElectricity', width: 100},
  {title: `${utils.intl('尖峰')}/${utils.intl('充电量(kWh)')}`, dataIndex: 'chargeSharpElectricity', width: 100},
  {title: `${utils.intl('高峰')}/${utils.intl('充电量(kWh)')}`, dataIndex: 'chargePeakElectricity', width: 100},
  {title: `${utils.intl('平段')}/${utils.intl('充电量(kWh)')}`, dataIndex: 'chargeFlatElectricity', width: 100},
  {title: `${utils.intl('低谷')}/${utils.intl('充电量(kWh)')}`, dataIndex: 'chargeValleyElectricity', width: 100},

  {title: `${utils.intl('总')}/${utils.intl('放电量(kWh)')}`, dataIndex: 'dischargeElectricity'},
  {title: `${utils.intl('尖峰')}/${utils.intl('放电量(kWh)')}`, dataIndex: 'dischargeSharpElectricity'},
  {title: `${utils.intl('高峰')}/${utils.intl('放电量(kWh)')}`, dataIndex: 'dischargePeakElectricity'},
  {title: `${utils.intl('平段')}/${utils.intl('放电量(kWh)')}`, dataIndex: 'dischargeFlatElectricity'},
  {title: `${utils.intl('低谷')}/${utils.intl('放电量(kWh)')}`, dataIndex: 'dischargeValleyElectricity'},

  {title: utils.intl('充电成本(元)'), dataIndex: 'chargeCost'},
  {title: utils.intl('放电收益(元)'), dataIndex: 'dischargeProfit'},
  {title: utils.intl('总收益(元)'), dataIndex: 'profit', renderE: (text, record) => getTotalIncome(record)}
]