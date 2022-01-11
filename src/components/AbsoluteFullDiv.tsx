import React from 'react'

interface Props {
  style?: React.CSSProperties
  className?: string
}

const AbsoluteFullDiv: React.FC<Props> = (props) => {
  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', ...props.style }} className={props.className}>
      {props.children}
    </div>
  )
}

export default AbsoluteFullDiv
