import React from 'react'
import {FullContainer} from 'wanke-gui'

import PageProps from '../../interfaces/PageProps'
import Page from '../../components/Page'
import VideoItem from './item/VideoItem'

interface Props extends PageProps {
  url: string
}

const SingleVideo: React.FC<Props> = function (this: null, props) {
  return (
    <Page
      pageId={props.pageId}
      className={'diagram-video-page'}
    >
      <FullContainer>
        <div className="flex1 flex-wrap video-list">
          <VideoItem style={{width: '100%', height: '100%'}} url={props.url}/>
        </div>
      </FullContainer>
    </Page>
  )
}

export default SingleVideo
