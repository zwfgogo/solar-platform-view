import React from 'react'
import { Table2 } from 'wanke-gui'
import { PageTableProps } from '../../../interfaces/CommonInterface'
import Forward from '../../../public/components/Forward'
import ListItemDelete from '../../../public/components/ListItemDelete/index'
import utils from '../../../public/js/utils'

interface Props extends PageTableProps {
  stationDisplay: boolean
  activity: boolean
  edit: (record) => void
  del: (record) => void
  reset: (record) => void
  individual: boolean
}

const List9: React.FC<Props> = function (this: null, props) {
  const operation =
  {
    title: utils.intl('操作'),
    width: 180,
    dataIndex: 'action',
    align: "right",
    render: (text, record, index) => {
      return (
        <div className="editable-row-operations">
          {
            record.operation.indexOf('edit') != -1 && (<a onClick={() => props.edit(record)}>{utils.intl('编辑')}</a>)
          }
          {
            record.operation.indexOf('del') != -1 && (
              <ListItemDelete onConfirm={() => props.del(record)} tip={utils.intl("确定删除吗") + '?'}>
                <a style={{ marginLeft: '5px' }}>{utils.intl('删除')}</a>
              </ListItemDelete>
            )
          }
          {
            record.operation.indexOf('reset') != -1 && (
              <ListItemDelete tip={utils.intl('确定要重置密码吗')} onConfirm={() => props.reset(record)}>
                <a style={{ marginLeft: '5px' }}>{utils.intl('重置密码')}</a>
              </ListItemDelete>
            )
          }
        </div>
      )
    }
  };
  const columns: any = [
    {
      title: utils.intl('账号'),
      dataIndex: 'name',
      key: 'name',
      width: 130
    },
    {
      title: utils.intl('姓名'),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: utils.intl('单位'),
      dataIndex: 'firmTitle',
      key: 'firmTitle',
    },
    {
      title: utils.intl('单位类型'),
      dataIndex: 'firmTypeTitle',
      key: 'firmTypeTitle',
      width: 150,
      render: (value) => {
        return value != utils.intl('平台') ? value : ''
      }
    },
    {
      title: utils.intl('角色'),
      dataIndex: 'roleTitle',
      key: 'roleTitle',
      width: 150
    },
    {
      title: utils.intl('手机号'),
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (text, record) => {
        return `${record.internationalCode || ''}${record.phone || ''}`
      }
    },
    {
      title: utils.intl('电站权限'),
      dataIndex: 'view',
      key: 'view',
      width: 100,
      // align: "right",
      render: (text, record, index) => {
        if (!props.stationDisplay) {
          return null
        }
        return (
          <Forward
            to="RightsStation"
            title={utils.intl("权限查看")}
            data={{
              firmId: record.firmId,
              userId: record.id,
              roleName: record.roleName,
              activity: props.activity
            }}
          >
            {utils.intl("查看")}
          </Forward>
        )
      }
    },
    operation
  ]

  const individualColumns = [{
    title: utils.intl('账号'),
    dataIndex: 'name',
    key: 'name',
    width: 130
  },
  {
    title: utils.intl('客户名称'),
    dataIndex: 'firmTitle',
    key: 'firmTitle',
    width: 150
  }, {
    title: utils.intl('联系方式'),
    dataIndex: 'phone',
    key: 'phone',
    width: 150,
    // align: 'center',
    render: (text, record) => {
      return `${record.internationalCode || ''}${record.phone || ''}`
    }
  },
    operation
  ]

  return (
    <Table2
      loading={props.loading}
      dataSource={props.dataSource}
      columns={props.individual ? individualColumns : columns}
      page={props.page}
      size={props.size}
      total={props.total}
      emptyText={utils.intl('暂无数据')}
      onPageChange={props.onPageChange}
      showTotal={(total: number, range: [number, number]) => utils.intl(`共{${total}}条`)}
    />
  )
};

export default List9
