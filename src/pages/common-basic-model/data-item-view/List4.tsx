import React from 'react'
import { Table1 } from 'wanke-gui'
import { BasicTableProps } from '../../../components/BasicTable'
import ListItemDelete from '../../../public/components/ListItemDelete/index'
import { Column } from 'wanke-gui/lib/table'
import utils from '../../../public/js/utils'

interface Props extends BasicTableProps {
  edit: (record) => void
  del: (record) => void
}

const List4: React.FC<Props> = function(this: null, props) {
  const columns: Column<any>[] = [
    {
      title: utils.intl('序号'),
      dataIndex: 'num',
      key: 'num',
      width: 65,
    },
    {
      title: utils.intl('数据项名称'),
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: utils.intl('符号'),
      dataIndex: 'symbol',
      key: 'symbol'
    },
    {
      title: utils.intl('单位'),
      dataIndex: 'unitTitle',
      key: 'unitTitle'
    },
    {
      title: utils.intl('界面显示精度'),
      dataIndex: 'accuracyTitle',
      key: 'accuracyTitle'
    },
    {
      width: 150,
      title: utils.intl('操作'),
      dataIndex: 'action',
      align: 'right',
      render: (text, record, index) => {
        return (
          <div className="editable-row-operations">
            {
              <span>
              <a onClick={() => props.edit(record)}>{utils.intl('编辑')}</a>
            </span>
            }
            {
              <ListItemDelete onConfirm={() => props.del(record)}>
                <a style={{marginLeft: '5px'}}>{utils.intl('删除')}</a>
              </ListItemDelete>
            }
          </div>
        )
      }
    }
  ];

  return (
      <Table1
        virtual
        rowSelection={props.rowSelection}
        loading={props.loading}
        dataSource={props.dataSource}
        columns={columns}
      ></Table1>
    );
};

export default List4
