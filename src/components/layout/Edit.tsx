import React from 'react'

import { FormOutlined } from "wanke-icon";

interface Props {
  edit: () => void
}

const Edit: React.FC<Props> = function(this: null, props) {
  return (
    <div className="export-list-icon vh-center" onClick={props.edit}>
      <FormOutlined style={{color: '#fff', fontSize: 18}} />
    </div>
  );
}

export default Edit
