import React from "react";
import { PageTableProps } from '../../../interfaces/CommonInterface'
import { Bubble, Table2 } from "wanke-gui";
import utils from '../../../public/js/utils';

interface Props extends PageTableProps {
  onEdit?: (record: any) => void;
}

const ChangeHistoryList: React.FC<Props> = function(this: null, props) {
  const columns: any = [
    {title: utils.intl('序号'), width: 70, dataIndex: 'num'},
    {
      title: utils.intl('原有设备名称'),
      dataIndex: "oldDevice",
      render: text => (
        <Bubble bubble={true} placement={undefined}>
          {text && text.title}
        </Bubble>
      )
    },
    {
      title: utils.intl('替换设备名称'),
      dataIndex: "newDevice",
      render: text => (
        <Bubble bubble={true} placement={undefined}>
          {text && text.title}
        </Bubble>
      )
    },
    { title: utils.intl('设备更换时间'), width: 170, dataIndex: "replaceTime" },
    {
      title: utils.intl('正向有功电能示数'),
      children: [
        { title: utils.intl('原有设备'), dataIndex: "oldPositive" },
        { title: utils.intl('替换设备'), dataIndex: "newPositive" }
      ]
    },
    {
      title: utils.intl('反向有功电能示数'),
      children: [
        { title: utils.intl('原有设备'), dataIndex: "oldNegative" },
        { title: utils.intl('替换设备'), dataIndex: "newNegative" }
      ]
    },
    {
      title: utils.intl('操作'),
      align: 'right',
      render: (text, record) => {
        return record.isUpdate ? (
        <a onClick={() => props.onEdit(record)}>{utils.intl('编辑')}</a>
        ) : (
          ""
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
      emptyText={utils.intl('暂无数据')}
      showTotal={(total: number, range: [number, number]) => utils.intl(`共{${total}}条`)}
    />
  )
};

export default ChangeHistoryList;
