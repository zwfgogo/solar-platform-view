import React from 'react'

import { RollbackOutlined } from "wanke-icon";

interface Props {
  back: () => void
}

const Back1: React.FC<Props> = function(this: null, props) {
  return (
    <div className="export-list-icon vh-center" onClick={props.back}>
      <RollbackOutlined style={{color: '#fff', fontSize: 18}} />
    </div>
  );
}

export default Back1
