import React from 'react'
import { Table2, Checkbox } from 'wanke-gui'
import utils from '../../../public/js/utils';

interface Props {
  dataSource: any[],
  page: number,
  size: number,
  loading: boolean,
  total: number,
  onPageChange: any,
  onCheckChange: any
}

const List: React.FC<Props> = function (this: null, props) {
  const columns: any = [
    {
      title: utils.intl('序号'),
      width: 75,
      align: 'center',
      dataIndex: 'num'
    },
    {
      title: utils.intl('控制策略名称'),
      dataIndex: 'title',
      align: 'center',
      width: 220
    },
    {
      title: utils.intl('选择'),
      align: 'center',
      render: (text, record, index) => {
        return (
          <Checkbox
            checked={record.checked}
            disabled={record.checkedDisabled}
            onChange={(e) => props.onCheckChange(e, index, 'checked')}
          ></Checkbox>
        )
      }
    },
    {
      title: utils.intl('是否支持远程控制'),
      align: 'center',
      render: (text, record, index) => {
        return (
          <Checkbox
            checked={record.remoteControl}
            onChange={(e) => props.onCheckChange(e, index, 'remoteControl')}
          ></Checkbox>
        )
      }
    }
  ];

  return <Table2
    loading={props.loading}
    dataSource={props.dataSource}
    columns={columns}
    page={props.page}
    size={props.size}
    total={props.total}
    onPageChange={props.onPageChange}
  />
};

export default List;