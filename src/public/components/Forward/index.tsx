import React, { FC, Children } from 'react'
import navigateHoc, { NavigateProps } from '../../navigateHoc'

interface ForwardConProps extends NavigateProps {
  children: any,
  to: string,
  data?: any,
  title: string,
  Tag?: any,
  className?: string,
  style?: any,
  dispatch: any
}

interface ForwardProps extends ForwardConProps {
  onClick?: () => void
}

const Forward = navigateHoc<ForwardProps>((props: ForwardProps) => {
  let {children, forward, data, to, Tag, back, dispatch, onClick, ...otherProps} = props
  const {title} = props
  if (!Tag) {
    Tag = 'a'
  }
  return (
    <Tag onClick={() => {
      onClick?.()
      forward(to, data, title)
    }}
         {...otherProps}
    >
      {children}
    </Tag>
  )
})
export default Forward

