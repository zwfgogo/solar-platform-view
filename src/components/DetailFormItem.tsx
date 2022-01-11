import React from 'react'
import classnames from 'classnames'
import './style/detail-form-item.less'

interface Props {
  label: string
  value: any
  suffix?: string
  noMargin?: boolean
}

const DetailFormItem: React.FC<Props> = (props) => {
  return (
    <div className={classnames("detail-form-item", {"no-margin": props.noMargin})}>
      <div className="detail-form-item-label">{props.label}:</div>
      <div className="detail-form-item-value">{props.value || ''}{props.value && props.suffix || ''}</div>
    </div>
  )
}

export default DetailFormItem
