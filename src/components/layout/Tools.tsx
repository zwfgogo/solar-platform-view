import React from 'react'

interface Props {
  height?: number
  style?: React.CSSProperties
}

const Tools: React.FC<Props> = function (this: null, props) {
  if (props.height) {
    return (
      <div style={{
        height: props.height,
        margin: '0 15px 15px 15px',
        position: 'relative',
        flexShrink: 0,
        ...(props.style || {})
      }}>
        <div className="button-tools">
          {props.children}
        </div>
      </div>
    )
  }
  return (
    <div className="button-tools">
      {props.children}
    </div>
  )
}

export default Tools
