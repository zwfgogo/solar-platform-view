import React from 'react'
import DeleteConfirm from '../ListItemDelete'
import utils from '../../public/js/utils'

interface Props {
  onEdit: () => void
  onDelete: () => void
}

const ListItemEditAndDelete: React.FC<Props> = function(this: null, props) {
  return (
    <div>
      <a onClick={props.onEdit}>{utils.intl('编辑')}</a>
      <DeleteConfirm onConfirm={props.onDelete}>
        <a style={{marginLeft: 9}}>{utils.intl('删除')}</a>
      </DeleteConfirm>
    </div>
  )
}

export default ListItemEditAndDelete
