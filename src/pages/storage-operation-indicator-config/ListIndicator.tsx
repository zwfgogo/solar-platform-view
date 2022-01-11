import React from 'react'
import { Table2 } from 'wanke-gui'
import { PageTableProps } from "../../interfaces/CommonInterface"
import ListItemEditAndDelete from "../../components/layout/ListItemEditAndDelete"
import utils from '../../public/js/utils'
import moment from 'moment'

interface Props extends PageTableProps {
  onEdit: (record) => void
  onDelete: (id) => void
}

const ListIndicator: React.FC<Props> = function (this: null, props) {
  const onEdit = (record: any) => {
    props.onEdit(record)
  }

  const onDelete = (record: any) => {
    props.onDelete(record.id)
  }

  const columns: any = [
    { title: utils.intl('序号'), width: 70, dataIndex: 'num' },
    { title: utils.intl('电站名称'), width: 200, dataIndex: 'stationTitle' },
    {
      title: utils.intl('电站规模'), width: 150, dataIndex: 'stationScaleDisplay'
    },
    { title: utils.intl('日充电量目标(kWh)'), width: 180, dataIndex: 'dailyChargeTarget' },
    { title: utils.intl('日放电量目标(kWh)'), width: 180, dataIndex: 'dailyDischargeTarget' },
    { title: utils.intl('日收益目标(元)'), width: 160, dataIndex: 'dailyProfitTarget' },
    { title: utils.intl('收益偏差阈值'), width: 140, dataIndex: 'profitDeviationThresholdStr' },
    { title: utils.intl('生效时间'), width: 130, dataIndex: 'effectTime', render: (text) => text ? moment(text).format('YYYY-MM-DD') : '' },
    { title: utils.intl('失效时间'), width: 150, dataIndex: 'invalidTime', render: (text) => text ? moment(text).format('YYYY-MM-DD') : '' },
    {
      title: utils.intl('状态'), dataIndex: 'status', width: 110, render: text => {
        let color
        if (text === '已执行') {
          // color = '#999999'
          return (<><div className="success-circle-icon"/>{utils.intl('已执行')}</>)
        } else if (text === '待执行') {
          return <><div className="warn-circle-icon"/>{utils.intl('待执行')}</>
        } 
        return (<><div className="info-circle-icon"/>{utils.intl(text)}</>)
      }
    },
    { title: utils.intl('最后更新时间'), width: 165, dataIndex: 'updateTime' },
    { title: utils.intl('最后更新人'), width: 150, dataIndex: 'updateUserTitle' },
    {
      title: utils.intl('操作'),
      width: 120,
      align: 'right',
      render: (value, record, index) => {
        if (record.action && record.action.length) {
          return (
            <ListItemEditAndDelete onEdit={() => onEdit(record)} onDelete={() => onDelete(record)} />
          )
        } else {
          return null
        }
      }
    }
  ]

  return (
    <Table2
      x={1655}
      loading={props.loading}
      dataSource={props.dataSource}
      columns={columns}
      page={props.page}
      size={props.size}
      total={props.total}
      onPageChange={props.onPageChange}
    />
  )
}

export default ListIndicator
