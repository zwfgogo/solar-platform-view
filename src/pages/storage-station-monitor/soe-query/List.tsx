import React from 'react'
import { Table2 } from 'wanke-gui'
import utils from '../../../public/js/utils';

interface Props {
  dataSource: any[],
  page: number,
  size: number,
  loading: boolean,
  total: number,
  onPageChange: any,
}

const List: React.FC<Props> = function (this: null, props) {
  const columns: any = [
    {
      title: utils.intl('序号'),
      width: 75,
      render: (text, record, index) => {
        return (props.page - 1) * props.size + index + 1;
      }
    },
    {
      title: utils.intl('数据时间'),
      dataIndex: 'dtime',
      width: 220
    },
    {
      title: utils.intl('设备对象'),
      dataIndex: 'deviceTitle',
    },
    {
      title: utils.intl('所属单元'),
      dataIndex: 'energyUnitTitle',
    },
    {
      title: utils.intl('原始值'),
      dataIndex: 'previousVal',
      width: 100
    },
    {
      title: utils.intl('新值'),
      dataIndex: 'val',
      width: 100
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