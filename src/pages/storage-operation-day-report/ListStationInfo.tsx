import React from 'react'
import { Table2 } from 'wanke-gui'
import { PageTableProps } from "../../interfaces/CommonInterface"
import { renderPercent } from "../page.helper"
import { WankeReasonSuccessOutlined } from "wanke-icon";
import { WankeReasonFailureOutlined } from "wanke-icon";
import utils from '../../public/js/utils';

interface Props extends PageTableProps {
  onLook: (id, name) => void;
}

const ListStationInfo: React.FC<Props> = function(this: null, props) {
  const renderDetail = (value, record) => {
    return (
      <a onClick={() => props.onLook(record.id, record.title)}>{utils.intl('查看')}</a>
    )
  }

  const render1 = value => {
    return value && value.title
  }

  const render2 = value => {
    return value ? (<><div className="success-circle-icon"/>{utils.intl('合理')}</>
      // <WankeReasonSuccessOutlined style={{fontSize: 20, color: 'green'}} title={utils.intl('合理')} />
    ) : (
      <><div className="error-circle-icon"/>{utils.intl('不合理')}</>
      // <WankeReasonFailureOutlined style={{fontSize: 20, color: 'red'}} title={utils.intl('不合理')} />
    );
  }

  const columns: any = [
    {
      title: utils.intl('序号'),
      width: 70,
      // align: 'center',
      dataIndex: 'num'
    },
    {title: utils.intl('电站名称'), width: 250, dataIndex: 'title'},
    {
      title: utils.intl('电站类型'),
      width: 120,
      dataIndex: 'stationType',
      render: render1
    },
    {
      title: utils.intl('建设规模'),
      width: 160,
      dataIndex: 'scaleDisplay'
    },
    {
      title: utils.intl('收益(元)'),
      children: [
        {title: utils.intl('目标值'), dataIndex: 'incomeTarget'},
        {title: utils.intl('实际值'), dataIndex: 'incomeReal'},
        {title: utils.intl('偏差'), dataIndex: 'incomeDeviation', render: renderPercent}
      ]
    },
    {title: utils.intl('偏差合理性'), width: 180, dataIndex: 'deviation', render: render2},
    {title: utils.intl('详情'), align: 'right', render: renderDetail}
  ];

  return (
    <Table2
      className="wanke-subfield-table"
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

export default ListStationInfo
