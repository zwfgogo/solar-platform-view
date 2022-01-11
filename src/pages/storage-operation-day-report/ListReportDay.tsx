import React from 'react'
import { Table1 } from 'wanke-gui'
import { BasicTableProps } from "../../components/BasicTable"
import { renderPercent } from "../page.helper"
import { WankeReasonSuccessOutlined } from 'wanke-icon'
import { WankeReasonFailureOutlined } from 'wanke-icon'
import { Column } from 'wanke-gui/lib/table'
import utils from '../../public/js/utils'

interface Props extends BasicTableProps {
  onLook: (id, date) => void
}

const ListFeeMonthDay: React.FC<Props> = function (this: null, props) {
  const renderDiff = (value) => {
    return value ? (
      <><div className="success-circle-icon"/>{utils.intl('合理')}</>
      // <WankeReasonSuccessOutlined style={{fontSize: 20, color: 'green'}} title={utils.intl('合理')}/>
    ) : (
      <><div className="error-circle-icon"/>{utils.intl('不合理')}</>
      // <WankeReasonFailureOutlined style={{fontSize: 20, color: 'red'}} title={utils.intl('不合理')}/>
    )
  }

  const lookReason = (value, record) => {
    return (
      <a onClick={() => props.onLook(record.id, record.date)}>{utils.intl('查看')}</a>
    )
  }

  const columns: Column<any>[] = [
    {title: utils.intl('序号'), width: 70,  dataIndex: 'num'},
    {title: utils.intl('日期'), width: 120, dataIndex: 'date'},
    {
      title: utils.intl('充电电量(kWh)'), children:
        [
          {title: utils.intl('目标值'), dataIndex: 'chargeTarget'},
          {title: utils.intl('实际值'), dataIndex: 'chargeReal'},
          {title: utils.intl('偏差'), dataIndex: 'chargeDeviation', render: renderPercent, className: "no-content-border"}
        ]
    },
    {
      title: utils.intl('放电电量(kWh)'), children:
        [
          {title: utils.intl('目标值'), dataIndex: 'dischargeTarget'},
          {title: utils.intl('实际值'), dataIndex: 'dischargeReal'},
          {title: utils.intl('偏差'), dataIndex: 'dischargeDeviation', render: renderPercent, className: "no-content-border"}
        ]
    },
    {
      title: utils.intl('收益(元)'), children:
        [
          {title: utils.intl('目标值'), dataIndex: 'incomeTarget'},
          {title: utils.intl('实际值'), dataIndex: 'incomeReal'},
          {title: utils.intl('偏差'), dataIndex: 'incomeDeviation', render: renderPercent, className: "no-content-border"}
        ]
    },
    {title: utils.intl('收益偏差阈值'), width: 160, dataIndex: 'profitDeviationThreshold', render: renderPercent},
    {title: utils.intl('偏差合理性'), width: 180, dataIndex: 'rationality', render: renderDiff},
    {title: utils.intl('差异原因'),  dataIndex: 'phone', render: lookReason}
  ]

  return (
    <Table1
      className="wanke-subfield-table"
      loading={props.loading}
      dataSource={props.dataSource}
      columns={columns}
    ></Table1>
  )
}

export default ListFeeMonthDay
