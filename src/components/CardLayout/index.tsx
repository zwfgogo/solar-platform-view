import React from 'react'
import classnames from 'classnames'
import '../style/card-layout.less'

interface Props {
  className?: string
  style?: React.CSSProperties
}

const CardLayout: React.FC<Props> = (props) => {
  return (
    <div className={classnames("wanke-card-layout", props.className)} style={props.style}>
      {props.children}
    </div>
  )
}

export default CardLayout
