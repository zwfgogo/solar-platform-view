import React, {useCallback, useEffect, useRef, useState} from 'react'
import { ZdDragOutlined } from 'wanke-icon'
import './resizer.less'

interface Props {
  onPositionChange: (x: number) => any
  style?: React.CSSProperties
}

const Resizer: React.FC<Props> = function (this: null, props) {
  const ref = useRef()
  const iconRef = useRef()
  let [isDown, setIsDown] = useState(false)

  const onMouseDown = useCallback((e) => {
    if (e.path.includes(ref.current)) {
      document.documentElement.className += ' unable-text-select'
      setIsDown(true)
    }
  }, [])

  const onMouseMove = useCallback((e) => {
    if (isDown) {
      props.onPositionChange(e.clientX)
    }
  }, [isDown])

  const onMouseUp = useCallback(() => {
    document.documentElement.className = document.documentElement.className.replace(' unable-text-select', '')
    setIsDown(false)
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
    }
  }, [isDown])

  return (
    <div ref={ref} className="resizer" style={props.style}>
      <ZdDragOutlined className="resizer-icon" ref={iconRef} />
    </div>
  )
}

export default Resizer
