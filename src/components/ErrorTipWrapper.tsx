import React, { CSSProperties } from 'react'
import {Tooltip} from 'wanke-gui'
import { InfoCircleOutlined } from 'wanke-icon'
import classnames from 'classnames'
import styles from './style/error-tip-wrapper.less'

interface ErrorTipWrapperProps {
  children: React.ReactElement
  errorTitle?: string
  iconStyle?: CSSProperties
}

const ErrorTipWrapper: React.FC<ErrorTipWrapperProps> = (props) => {
  const { errorTitle, iconStyle } = props
  
  return (
    <div className={classnames(styles["error-tip-wrapper"], { [styles['error']]: errorTitle })}>
      {props.children}
      {errorTitle && (
        <Tooltip title={errorTitle}>
          <InfoCircleOutlined className={styles["tip-icon"]} style={{ top: '50%', ...iconStyle }} />
        </Tooltip>
      )}
    </div>
  )
}

export default ErrorTipWrapper
