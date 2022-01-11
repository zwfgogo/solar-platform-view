import React from 'react'
import { Table2 } from 'wanke-gui'
import { PageTableProps } from "../../interfaces/CommonInterface"
import { ExportColumn } from "../../interfaces/CommonInterface"
import utils from "../../public/js/utils";

interface Props extends PageTableProps {
  lookSwitchWork: (id) => void
  updateSwitchWork: (id) => void
}

const ListWorkspace: React.FC<Props> = function (this: null, props) {
  const renderDetail = (value, record) => {
    return (
      <span>
        <a onClick={() => props.lookSwitchWork(record.id)} style={{ marginRight: '0.5em' }}>{utils.intl('详情')}</a>
        {record.isUpdate && <a onClick={() => props.updateSwitchWork(record.id)}>{utils.intl('更新')}</a>}
      </span>
    )
  }

  const columns: any = [
    { title: utils.intl('序号'), width: 70, align: 'center', dataIndex: 'num' },
    { title: utils.intl('值班人'), dataIndex: 'dutyTitle' },
    { title: utils.intl('值班开始时间'), dataIndex: 'dutyStartTime' },
    { title: utils.intl('交班时间'), dataIndex: 'shiftTime' },
    { title: utils.intl('接班人'), dataIndex: 'shiftTitle' },
    { title: utils.intl('交接班记录'), width: 140, render: renderDetail }
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

export default ListWorkspace

export function getExceptionColumns(): ExportColumn[] {
  return [
    { title: utils.intl('序号'), dataIndex: 'num' },
    { title: utils.intl('值班人'), dataIndex: 'dutyTitle' },
    { title: utils.intl('值班开始时间'), width: 200, dataIndex: 'dutyStartTime' },
    { title: utils.intl('交班时间'), width: 200, dataIndex: 'shiftTime' },
    { title: utils.intl('接班人'), width: 180, dataIndex: 'shiftTitle' }
  ]
} 
