import React from 'react';
import { Row, Col } from 'wanke-gui'
import classnames from 'classnames'
import { style } from 'd3-selection';
export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: any,
  title: string,
  btnsStyle?: any,
  borderBottom?: boolean,
}

export default function BorderHeader(props: HeaderProps) {
  const { borderBottom, children, title, btnsStyle = '', className, ...otherProps } = props;
  return (
    <div className={classnames("border-header", className)} {...otherProps}>
      <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>{title}</span>
      <div className={classnames("btns", btnsStyle)} style={{ ...btnsStyle }}>
        {children}
      </div>
    </div>
  )
}