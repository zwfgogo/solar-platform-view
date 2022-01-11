import React from 'react';
import { Row, Col } from 'wanke-gui'
import classnames from 'classnames'
import { style } from 'd3-selection';
import styles from './index.less'
export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: any,
  title: string,
  btnsStyle?: any,
  borderBottom?: boolean,
}

export default function Header(props: HeaderProps) {
  const { borderBottom, children, title, btnsStyle = '', className, ...otherProps } = props;
  return (
    <div className={styles["strategy-header"]} {...otherProps}>
      <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>{title}</span>
      <div className={classnames("btns", btnsStyle)}>
        {children}
      </div>
    </div>
  )
}