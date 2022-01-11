import React from 'react'
import utils from '../../public/js/utils'
import DeleteConfirm from '../ListItemDelete'

interface Props {
  onEdit: () => void
  onDelete: () => void
}

const ListItemEditAndUpdate: React.FC<Props> = function(this: null, props) {
  return (
    <div>
      <a onClick={props.onEdit}>{utils.intl('编辑')}</a>
      <DeleteConfirm onConfirm={props.onDelete}>
        <a style={{marginLeft: 9}}>{utils.intl('删除')}</a>
      </DeleteConfirm>
    </div>
  )
}

export default ListItemEditAndUpdate
