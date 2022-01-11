import React from 'react'
import styles from './style/export-button.less'
import { WankeAddOutlined, LoadingOutlined, GfExportFilled } from 'wanke-icon'
import { Button } from 'wanke-gui'
import utils from '../public/js/utils'

interface Props {
  loading?: boolean
  onExport?: () => void
  disabled?: boolean
}

const ExportButton: React.FC<Props> = ({ loading, onExport, disabled }) => {
  const handleClick = () => {
    if(!loading) {
      onExport && onExport()
    }
  }

  return (
    <Button type="primary" onClick={handleClick} loading={loading} disabled={disabled}>{utils.intl('导出')}</Button>
    // <div className={styles['export-btn']} onClick={handleClick}>
    //   <GfExportFilled style={{ fontSize: 20, color: '#92929d', marginRight: 10 }} />
    //   <span>导出</span>
    //   {loading && <LoadingOutlined style={{ fontSize: 14, color: '#92929d', marginLeft: 5 }} />}
    // </div>
  )
}

export default ExportButton