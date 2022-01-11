import React from 'react'
import {LoadingOutlined, VerticalAlignBottomOutlined} from 'wanke-icon'

interface Props {
  onExport: () => void
  loading?: boolean
}

const Export: React.FC<Props> = function (this: null, props) {
  const handleExport = () => {
    if (!props.loading) {
      props.onExport()
    }
  }

  return (
    <div className="export-list-icon vh-center" onClick={handleExport}>
      {
        props.loading
          ? <LoadingOutlined style={{color: '#fff', fontSize: 18}}/>
          : <VerticalAlignBottomOutlined style={{color: '#fff', fontSize: 18}}/>
      }
    </div>
  )
}

export default Export
