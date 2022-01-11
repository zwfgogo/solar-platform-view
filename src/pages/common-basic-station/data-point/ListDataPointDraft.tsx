import React from 'react'
import { PageTableProps } from '../../../interfaces/CommonInterface'
import DeleteConfirmPopover from '../../../public/components/ListItemDelete'
import { renderEmpty } from '../../page.helper'
import { Table2 } from 'wanke-gui'
import { Column } from 'wanke-gui/lib/table'
import utils from '../../../public/js/utils';

interface Props extends PageTableProps {
  onDelete: (id) => void
  onUpdate: (record) => void
}

const ListDataPointDraft: React.FC<Props> = function (this: null, props) {
  const columns: Column<any>[] = [
    {
      title: utils.intl('序号'),
      dataIndex: 'num',
      width: 65
    },
    {
      title: utils.intl('数据项业务名称'),
      dataIndex: 'typeTitle',
      width: 180
    },
    {
      title: utils.intl('输入/输出端名称'),
      dataIndex: 'terminalTitle',
      width: 165,
      render: renderEmpty
    },
    {
      title: 'PointID',
      dataIndex: 'pointNumber',
      width: 160
    },
    {
      title: utils.intl('信号名称'),
      dataIndex: 'signalTitle',
      width: 100
    },
    {
      title: utils.intl('操作'),
      width: 100,
      dataIndex: 'action',
      align: 'right',
      render: (text, record, index) => {
        return (
          <div className="editable-row-operations">
            {
              <span>
                <a onClick={() => props.onUpdate(record)}>
                  {utils.intl("编辑")}
                </a>
                <DeleteConfirmPopover onConfirm={() => props.onDelete(record.id)}>
                  <a style={{ marginLeft: '7px' }}>{utils.intl("删除")}</a>
                </DeleteConfirmPopover>
              </span>
            }
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

export default ListDataPointDraft
