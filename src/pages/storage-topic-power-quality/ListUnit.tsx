import React from 'react'
import { Table2 } from 'wanke-gui'
import { PageTableProps } from "../../interfaces/CommonInterface"

interface Props extends PageTableProps {

}

const ListUnit: React.FC<Props> = function(this: null, props) {
  const columns: any = [
    {title: '序号', width: 70, align: 'center', dataIndex: 'num'},
    {title: '储能单元', dataIndex: 'a1'},
    {title: '电压谐波越限次数', dataIndex: 'a2'},
    {title: '电流谐波越限次数', dataIndex: 'a3'},
    {title: '电压合格率', dataIndex: 'a4'},
    {title: '三相不平衡越限日', dataIndex: 'a5'}
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

export default ListUnit
