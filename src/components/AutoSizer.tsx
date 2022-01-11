import React, {useEffect, useState} from 'react'
import _ from 'lodash'

interface Props {
  children: ({width, height}) => React.ReactNode
  style?: React.CSSProperties;
}


//@ts-ignore
const AutoSizer: React.FC<Props> = function (this: null, props) {
  let ref = React.useRef<HTMLDivElement>()
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  const handleResize = _.throttle(() => {
    setTimeout(() => {
      if (ref.current) {
        setWidth(ref.current.clientWidth)
        setHeight(ref.current.clientHeight)
      }
    }, 10)
  }, 200)

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div ref={ref} style={{width: '100%', height: '100%', position: 'relative', overflow: 'hidden', ...(props.style || {})}}>
      {
        props.children({width, height})
      }
    </div>
  )
}

export function wrapAutoSizer<T>(Component) {

  class WrapAutoSizer extends React.Component<Omit<T, 'width' | 'height'>> {
    render() {
      return (
        <AutoSizer>
          {
            ({width, height}) => {
              return <Component width={width} height={height} {...this.props}/>
            }
          }
        </AutoSizer>
      )
    }
  }

  return WrapAutoSizer
}

export default AutoSizer
