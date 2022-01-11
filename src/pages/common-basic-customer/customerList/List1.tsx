import React from 'react'
import { PageTableProps } from '../../../interfaces/CommonInterface'
import Forward from '../../../public/components/Forward'
import { Table2 } from 'wanke-gui'
import utils from '../../../public/js/utils';

interface Props extends PageTableProps {
  edit: (record) => void
}

const List1: React.FC<Props> = function (this: null, props) {
  const columns: any = [
    {
      title: utils.intl('序号'),
      dataIndex: 'num',
      width: 60
    },
    {
      title: utils.intl('客户名称'),
      dataIndex: 'title',
    },
    {
      title: utils.intl('客户性质'),
      dataIndex: 'individual',
      render: (value) => value ? utils.intl('个人') : utils.intl('客户单位'),
      width: 170,
    },
    {
      title: utils.intl('客户类型'),
      dataIndex: 'firmTypeTitle',
      width: 160
    },
    {
      title: utils.intl('电站数量'),
      dataIndex: 'count',
      width: 145,
      render: (text, record, index) => {
        return (
          <>
            {text === 0 ? (
              0
            ) : (
              <Forward to="stationList" data={{ _firmId: record.id, pageTitle: record.title }} title={record.title}>
                {text}
              </Forward>
            )}
          </>
        )
      },
    },
    {
      title: utils.intl('电站总规模'),
      dataIndex: 'scaleDisplay',
      width: 210,
    },
    {
      title: utils.intl('联系人'),
      dataIndex: 'contact',
      width: 150,
      align: 'center'
    },
    {
      title: utils.intl('联系电话'),
      dataIndex: 'phone',
      width: 200,
      render: (text, record) => {
        return `${record.internationalCode || ''}${record.phone || ''}`
      }
    },
    {
      title: utils.intl('有效性'),
      dataIndex: 'activityTitle',
      width: 150,
      render: (text, record, index) => {
        return <div className="editable-row-operations">{<span>{record.activity ? utils.intl('有效') : utils.intl('无效')}</span>}</div>
      }
    },
    {
      width: 150,
      title: utils.intl('操作'),
      dataIndex: 'action',
      align: 'right',
      render: (text, record, index) => {
        return (
          <div className="editable-row-operations">
            <a onClick={() => props.edit(record)}>{utils.intl('编辑')}</a>
          </div>
        );
      }
    }
  ];

  return <Table2
    x={1180}
    loading={props.loading}
    dataSource={props.dataSource}
    columns={columns}
    page={props.page}
    size={props.size}
    total={props.total}
    onPageChange={props.onPageChange}
  />
};

export default List1

// disable-auto-column

function exportList1Columns() {
  return [{
    title: "序号",
    dataIndex: "num"
  }, {
    title: "客户名称",
    dataIndex: "title"
  }, {
    title: "客户性质",
    dataIndex: "individual",
    renderE: value => value ? "个人" : "单位"
  }, {
    title: "客户类型",
    dataIndex: "firmTypeTitle"
  }, {
    title: "电站数量",
    dataIndex: "count",

    renderE: (text, record, index) => {
      return text === 0 ? 0 : text
    }
  }, {
    title: "电站总规模",
    dataIndex: "scaleDisplay"
  }, {
    title: "联系人",
    dataIndex: "contact"
  }, {
    title: "联系电话",
    dataIndex: "phone",
    renderE: (text, record, index) => {
      return `${record.internationalCode || ''}${record.phone || ''}`
    }
  }, {
    title: "有效性",
    dataIndex: "activityTitle",

    renderE: (text, record, index) => {
      return record.activity ? "有效" : "无效"
    }
  }, {
    title: "操作",
    dataIndex: "action",

    renderE: (text, record, index) => {
      return "编辑"
    }
  }]
}