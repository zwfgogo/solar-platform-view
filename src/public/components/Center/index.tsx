import React, { CSSProperties, FC } from 'react'

interface Props {
  style?: CSSProperties
}

const Center: FC<Props> = (props) => {
  const {children} = props
  return (
    <div className="vh-center" style={props.style}>
      {children}
    </div>
  )
}

export default Center
