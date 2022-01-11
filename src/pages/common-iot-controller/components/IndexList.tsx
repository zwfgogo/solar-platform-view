import React from "react";
import { Table1, Table2 } from 'wanke-gui'
import { PageTableProps } from '../../../interfaces/CommonInterface'
import Forward from "../../../public/components/Forward";
import AbsoluteBubble from "../../../components/AbsoluteBubble";
import utils from '../../../public/js/utils';

interface Props extends PageTableProps {
  onEdit: (record: any) => void;
}

const IndexList: React.FC<Props> = function(this: null, props) {
  const columns: any = [
    {
      title: utils.intl('序号'),
      width: 70,
      dataIndex: 'num'
    },
    { title: utils.intl('电站名称'), dataIndex: "title", width: 300 },
    {
      title: utils.intl('电站类型'),
      dataIndex: "stationType",
      width: 140,
      render: (text, record) => (<span>{text.title}</span>)
    },
    { title: utils.intl('建设规模'), dataIndex: "scaleDisplay", width: 170 },
    {
      title: utils.intl('关联的控制器'),
      dataIndex: "linkControllers",
      render: (text, record) => (
        <AbsoluteBubble>
          <Forward
            to="DeviceInfo"
            data={{ stationId: record.id, stationName: record.title }}
          >
            {(text || []).map(item => item.title).join(",")}
          </Forward>
        </AbsoluteBubble>
      )
    },
    {
      title: utils.intl('操作'),
      align: 'right',
      width: 140,
      render: (text, record) => {
        return (
          <a onClick={() => props.onEdit && props.onEdit(record)}>
            {utils.intl('编辑')}
          </a>
        );
      }
    }
  ];

  return (
    <Table1
      loading={props.loading}
      dataSource={props.dataSource}
      columns={columns}
      // page={props.page}
      // size={props.size}
      // total={props.total}
      // onPageChange={props.onPageChange}
    />
  )
};

export default IndexList;
