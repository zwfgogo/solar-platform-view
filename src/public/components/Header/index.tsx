import React from 'react'
import classnames from 'classnames'

export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: any,
  title: string,
}


export default function Header(props: HeaderProps) {
  const { children, title, className, ...otherProps } = props
  return (
    <div className={classnames('box-header', className)} {...otherProps}>
      <span style={{ marginLeft: '16px', fontWeight: 'bold' }}>{title}</span>
      <div className="btns">
        {children}
      </div>
    </div>
  )
}