import React from 'react'
import classNames from 'classnames'
import "./index.less"


interface Props {
  
}

const CardText = (props) => {
  const { color, backgroundColor, text, showIcon = true, style = {}, className, ...restProps } = props
  return (
    <div className={classNames(className, "card-text-box")} {...restProps} style={{ ...style, backgroundColor }}>
      {
        showIcon ? <div className="card-text-icon" style={{ backgroundColor: color }} /> : null
      }
      <div className="card-text" style={{ color }}>{text}</div>
    </div>
  )
}

export default CardText
