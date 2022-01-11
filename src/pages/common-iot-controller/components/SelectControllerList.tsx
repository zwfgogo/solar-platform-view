import React from "react";
import { Table, Table2, Pagination } from 'wanke-gui'
import { Props as TableProps } from 'wanke-gui/lib/table/Table2'
import AbsoluteBubble from "../../../components/AbsoluteBubble";
import { BasicTableProps } from "../../../components/BasicTable";
import utils from '../../../public/js/utils';

interface Props extends Omit<TableProps, 'columns'> {
  isScrollTable: boolean;
}

const SelectControllerList: React.FC<Props> = function(this: null, props) {
  const columns: any = [
    // super.columnCheckAll(), //todo
    {
      title: utils.intl('控制器名称'),
      dataIndex: "title",
      width: 240,
      render: text => (
        <AbsoluteBubble>{text}</AbsoluteBubble>
      )
    },
    {
      title: utils.intl('控制器型号'),
      dataIndex: "model",
      width: 240,
      render: text => (
        <AbsoluteBubble>{text}</AbsoluteBubble>
      )
    },
    {
      title: utils.intl('SN码'),
      dataIndex: "name",
      width: 240,
      render: text => (
        <AbsoluteBubble>{text}</AbsoluteBubble>
      )
    },
    {
      title: utils.intl('配置文件'),
      dataIndex: "configFile",
      width: 240,
      render: text => (
        <AbsoluteBubble>{text}</AbsoluteBubble>
      )
    },
    { title: utils.intl('配置时间'), dataIndex: "configTime", width: 200 },
    {
      title: utils.intl('所属工程名称'),
      dataIndex: "project",
      width: 240,
      render: text => (
        <AbsoluteBubble>{text}</AbsoluteBubble>
      )
    }
  ];

  const rowSelection = {
    selectedRowKeys: props.checkedList,
    onChange: props.onCheckChange,
    columnWidth: '50px'
  }

  return (
    // props.isScrollTable ? (
    //   <Table2
    //     loading={props.loading}
    //     dataSource={props.dataSource}
    //     columns={columns}
    //     page={props.page}
    //     size={props.size}
    //     total={props.total}
    //     onPageChange={props.onPageChange}
    //   />
    // ) : (
      <>
        <Table
          size="small"
          rowSelection={rowSelection}
          loading={props.loading}
          dataSource={props.dataSource}
          columns={columns}
          pagination={false}
          scroll={{ x: 1200, y: 400 }}
        />
        <div style={{ textAlign: 'right', marginTop: 10 }}>
          <Pagination
            showSizeChanger
            showQuickJumper
            pageSizeOptions={['20', '30', '50', '100']}
            current={props.page}
            pageSize={props.size}
            total={props.total}
            onChange={props.onPageChange}
            onShowSizeChange={props.onPageChange}
            showTotal={(total: number, range: [number, number]) => utils.intl(`共{${total}}条`)}
          />
        </div>
      </>
    // )
  )
};

export default SelectControllerList;
