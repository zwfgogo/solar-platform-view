import React, {CSSProperties} from 'react'
import {GfDeleteOutlined, PlusCircleOutlined, PlusOutlined, WankeViewDetailOutlined} from 'wanke-icon'
import HttpFlv from '../../../components/video/HttpFlv'

import utils from '../../../public/js/utils'

interface Props {
  style: CSSProperties
  url: string
  onAdd?: () => void
  onLook?: () => void
  onDelete?: () => void
}

const VideoItem: React.FC<Props> = function (this: null, props) {
  return (
    <div className="g-wh100 video-item-wrap" style={props.style}>
      <div className="video-item vh-center">
        {
          props.url && (
            <>
              <HttpFlv url={props.url}/>
              <div className="video-item-menu">
                <a className="video-item-menu-btn" onClick={props.onLook}><WankeViewDetailOutlined /></a>
                <a className="video-item-menu-btn" onClick={props.onDelete}><GfDeleteOutlined /></a>
              </div>
            </>
          )
        }
        {
          !props.url && (
            <div className="no-video-item" style={{textAlign: 'center'}}>
              <PlusOutlined  style={{fontSize: 40, marginBottom: 10}}/>
              <div>{utils.intl('无视频信号，请')}<span className="to-add" onClick={props.onAdd}>{utils.intl('添加')}</span>
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}

export default VideoItem
