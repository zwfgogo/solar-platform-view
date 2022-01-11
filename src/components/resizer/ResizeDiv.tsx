import classnames from 'classnames'
import React, { useRef, useState } from 'react'
import Resizer from './Resizer'
import './resize-div.less'

const resizerWidth = 12

interface Props {
  defaultWidth: number
  minWidth?: number
  maxWidth?: number
  className?: string
  direction?: 'right' | 'left'
  onResize?: () => void
}

const ResizeDiv: React.FC<Props> = (props) => {
  const { direction = 'right', minWidth, maxWidth } = props
  const [width, setWidth] = useState(props.defaultWidth)
  const divRef = useRef<HTMLDivElement>()

  const getStyle = () => {
    const style: React.CSSProperties = {
      width,
      position: 'relative'
    }

    switch(direction) {
      case 'left':
        break
      case 'right':
        break
      default:
        break
    }

    return style
  }

  const handlePositionChange = (x) => {
    let width = x
    const divRect = divRef.current.getBoundingClientRect()
    const bodyRect = document.body.getBoundingClientRect()
    switch(direction) {
      case 'left':
        width = bodyRect.width - x
        break
      case 'right':
        width = x - divRect.x
        break
      default:
        break
    }

    if (minWidth !== null && minWidth !== undefined) {
      width = minWidth > width ? minWidth : width
    }

    if (maxWidth !== null && maxWidth !== undefined) {
      width = maxWidth < width ? maxWidth : width
    }

    setWidth(width)
    props.onResize?.()
  }

  const renderResizer = () => {
    const style: React.CSSProperties = {
      position: 'absolute',
      top: 0
    }

    switch(direction) {
      case 'left':
        style.left = 0
        break
      case 'right':
        style.right = 0
        break
      default:
        break
    }

    return (
      <Resizer onPositionChange={handlePositionChange} style={style} />
    )
  }

  return (
    <div style={getStyle()} className={classnames("resize-div", props.className)} ref={divRef}>
      {props.children}
      {renderResizer()}
    </div>
  )
}

export default ResizeDiv
