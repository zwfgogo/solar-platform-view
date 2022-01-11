import React from 'react'
import { Table2 } from 'wanke-gui'
import { PageTableProps } from "../../interfaces/CommonInterface"
import { ValueName } from "../../interfaces/CommonInterface"
import utils from "../../public/js/utils";
import AbsoluteBubble from '../../components/AbsoluteBubble'
import moment from 'moment';

interface Props extends PageTableProps {
  stationOptions: ValueName[]
  updateBug: (record) => void
  showCkgd: (id) => void
}

const ListBug: React.FC<Props> = function(this: null, props) {
  const columns: any = [
    {
      title: utils.intl('序号'), dataIndex: 'num', key: 'date', width: 65, align: 'center'
    },
    {
      title: utils.intl('电站名称'), dataIndex: 'stationId', render: (value) => {
        let match = props.stationOptions.find(item => item.value == value)
        return match && match.name
      }
    },
    {
      title: utils.intl('缺陷发现日期'), dataIndex: 'startTime', key: 'startTime', width: 120, align: 'center',
      render: (value) => value ? moment(value).format("YYYY-MM-DD") : value
    },
    {
      title: utils.intl('发现人'), dataIndex: 'discoverer', key: 'discoverer'
    },
    {
      title: utils.intl('缺陷内容'), dataIndex: 'bugContent', key: 'bugContent', width: 200,
      render: (value) => <AbsoluteBubble>{value}</AbsoluteBubble>
    },
    {
      title: utils.intl('消除人'), dataIndex: 'processer', key: 'processer'
    },
    {
      title: utils.intl('消除日期'), dataIndex: 'endTime', key: 'endTime', width: 120, align: 'center',
      render: (value) => value ? moment(value).format("YYYY-MM-DD") : value
    },
    {
      title: utils.intl('验收人'), dataIndex: 'acceptor', key: 'acceptor'
    },
    {
      title: utils.intl('负责人'), dataIndex: 'director', key: 'director'
    },
    {
      title: utils.intl('操作'), dataIndex: 'position', key: 'position', render: (text, record, index) => {
        return (
          <div>
            {!record.endTime && (
              <a style={{marginRight: 7}} onClick={() => props.updateBug(record)}>{utils.intl('消除')}</a>
            )}

            <a onClick={() => props.showCkgd(record.id)}><span>{utils.intl('查看')}</span></a>
          </div>
        );
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

export default ListBug
