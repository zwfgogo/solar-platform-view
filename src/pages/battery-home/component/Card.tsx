/**
 * 驾驶舱自定义Card组件
 */

import React, { ReactElement } from 'react';
import classNames from 'classnames'
import "./component.less"

export interface CardProps {
  style?: React.CSSProperties,
  type?: 'alarm' | 'default',
  children: React.ReactChildren | React.ReactNode | Element[],
}

const Card: React.FC<CardProps> = (props) => {
  const { style, type = "default", children } = props


  return (
    <div className="page-card-box" style={style}>
      <div className={classNames("page-card", { "page-alarm-card": type === 'alarm' })}>
        {children}
      </div>
    </div>
  )
}

export default Card
