import React from 'react'

import { WankeDeleteOutlined } from "wanke-icon"

interface Props {
  onDelete?: () => void
}

const Delete1: React.FC<Props> = function (this: null, props) {
  return (
    <div className="export-list-icon vh-center" onClick={props.onDelete} style={{background: '#ff6464'}}>
      <WankeDeleteOutlined style={{color: '#fff', fontSize: 18}}/>
    </div>
  )
}

export default Delete1
