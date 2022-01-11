import React from 'react'
import {Table2} from 'wanke-gui'
import {PageTableProps} from '../../../../interfaces/CommonInterface'

import utils from '../../../../public/js/utils'

interface Props extends PageTableProps {

}

const ListTemplate: React.FC<Props> = function (this: null, props) {
  const columns: any = [
    {title: utils.intl('序号'), width: 100, align: 'center', dataIndex: 'num'},
    {title: utils.intl('模板名称'), dataIndex: 'title'},
    {title: utils.intl('说明'), dataIndex: 'description', width: 300}
  ]

  return (
    <Table2
      x={500}
      rowSelection={{selectedRowKeys: props.checkedList, onChange: props.onCheckChange, type: 'radio'}}
      loading={props.loading}
      dataSource={props.dataSource}
      columns={columns}
      page={props.page}
      size={props.size}
      total={props.total}
      onPageChange={props.onPageChange}
    />
  )
}

export default ListTemplate
