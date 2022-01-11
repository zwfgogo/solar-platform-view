import React from 'react';
import { Row, Col } from 'wanke-gui'
import classnames from 'classnames'
import { style } from 'd3-selection';
export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: any,
  title: any,
  btnsStyle?: any,
  btnsStyleProps?: React.CSSProperties,
  borderBottom?: boolean,
}

export default function Header(props: HeaderProps) {
  const { borderBottom, children, title, btnsStyle = '', className, btnsStyleProps, ...otherProps } = props;
  return (
    <div className={classnames((borderBottom ? "header-border-bottom " : '') + "box-header", className, { "no-title": !title })} {...otherProps}>
      <span style={{ marginLeft: '24px', fontWeight: 'bold' }}>{title}</span>
      <div className={classnames("btns", btnsStyle)} style={btnsStyleProps}>
        {children}
      </div>
    </div>
  )
}