import React from 'react'

import { WankeEdit1Outlined } from "wanke-icon"

interface Props {
  onEdit: () => void
}

const Edit1: React.FC<Props> = function(this: null, props) {
  return (
    <div className="export-list-icon vh-center" onClick={props.onEdit}>
      <WankeEdit1Outlined style={{color: '#fff', fontSize: 18}} />
    </div>
  );
}

export default Edit1
