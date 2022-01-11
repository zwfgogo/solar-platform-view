import React, {useEffect, useRef, useState} from 'react'
import flvjs from 'flv.js'
import Loader from './loader'
import utils from '../../public/js/utils'

interface Props {
  url: string
}

const HttpFlv: React.FC<Props> = function (this: null, props) {
  const ref = useRef<HTMLVideoElement>()
  const flvRef = useRef<any>()

  useEffect(() => {
    if (!ref.current) {
      return
    }
    if (flvjs.isSupported()) {
      try {
        flvRef.current = flvjs.createPlayer({
          type: 'flv',
          isLive: true,
          url: props.url
        }, {
          customLoader: Loader
        })
        flvRef.current.attachMediaElement(ref.current)
        flvRef.current.load()
        flvRef.current.play()
      } catch (e) {
        console.log(props.url + '无法播放')
      }
    }
    return () => {
      flvRef.current?.destroy()
    }
  }, [])

  if (props.url.indexOf('http') == -1 || props.url.indexOf('rtmp://') != -1) {
    return (
      <div className="vh-center" style={{width: '100%', height: '100%', overflow: 'hidden'}}>
        {utils.intl('无效的视频地址')}：{props.url}
      </div>
    )
  }

  return (
    <video style={{width: '100%', height: '100%', overflow: 'hidden'}} ref={ref}></video>
  )
}

export default HttpFlv
