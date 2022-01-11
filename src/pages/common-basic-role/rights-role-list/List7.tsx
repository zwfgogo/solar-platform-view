import React from 'react'
import {Table2} from 'wanke-gui'
import {PageTableProps} from '../../../interfaces/CommonInterface'
import Forward from '../../../public/components/Forward'
import {Authority} from 'wanke-gui'
import {Pagination} from 'antd'
import ListItemDelete from '../../../public/components/ListItemDelete/index'
import utils from '../../../public/js/utils'

interface Props extends PageTableProps {
  menuDisplay: boolean
  activity: boolean
  treeKey: any
  firmId: any
  firmTitle: any
  edit: (record) => void
  del: (record) => void
  firmTypeName: string
}

const List7: React.FC<Props> = function (this: null, props) {
  const columns: any = [
    {
      title: utils.intl('角色名称'),
      dataIndex: 'title',
      width: 150
    },
    {
      title: utils.intl('有效性'),
      dataIndex: 'activityTitle',
      key: 'activityTitle',
      width: 120,
    },
    {
      title: utils.intl('用户数量'),
      dataIndex: 'count',
      key: 'count',
      width: 100,
      render: (text, record, index) => {
        const {activity, treeKey, firmId} = props
        return record.activity ? (
          <Forward to="RightsUserList" data={{
            queryStr: record.title,
            _treeKey: treeKey,
            activity,
            _firmId: firmId
          }} title={utils.intl('用户权限')}>
            {text}
          </Forward>
        ) : (
          text
        )
      }
    },
    {
      title: utils.intl('功能菜单'),
      width: 130,
      render: (value, record) => {
        if (!props.menuDisplay) {
          return null
        }
        return (
          <div className="editable-row-operations">
            <Forward
              title={utils.intl('Web端菜单选择')} to="MenuSelect"
              data={{
                terminalType: 1,
                roleId: record.id,
                firmId: props.firmId,
                activity: props.activity,
                isAdmin: record.name,
                pageTitle: record.title + `(${utils.intl('Web端')})`,
                firmTypeName: props.firmTypeName
              }}
            >
              {utils.intl('Web端')}
            </Forward>
            <Forward title={utils.intl('App端菜单选择')} className="e-ml10" to="MenuSelect"
                     data={{
                       terminalType: 2,
                       roleId: record.id,
                       firmId: props.firmId,
                       activity: props.activity,
                       isAdmin: record.name,
                       pageTitle: record.title + `(${utils.intl('App端')})`,
                       firmTypeName: props.firmTypeName
                     }}>
              {utils.intl('App端')}
            </Forward>
          </div>
        )
      }
    },
    {
      title: utils.intl('操作'),
      width: 100,
      dataIndex: 'action',
      align: 'right',
      render: (text, record) => {
        if (!props.activity) {
          return null
        }
        return (
          <div className="editable-row-operations">
            <Authority code="edit" codes={record.operation}>
              <a onClick={() => props.edit(record)}>{utils.intl('编辑')}</a>
            </Authority>
            <Authority code="del" codes={record.operation}>
              <ListItemDelete onConfirm={() => props.del(record)}>
                <a style={{marginLeft: '5px'}}>{utils.intl('删除')}</a>
              </ListItemDelete>
            </Authority>
          </div>
        )
      }
    }
  ]

  return (
    <>
      <Table2
        x={700}
        loading={props.loading}
        dataSource={props.dataSource}
        columns={columns}
        page={props.page}
        size={props.size}
        total={props.total}
        onPageChange={props.onPageChange}
      />
    </>
  )
}

export default List7
