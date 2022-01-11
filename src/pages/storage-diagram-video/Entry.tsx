import React from 'react'
import Flow from '../../public/components/Flow'
import PageProps from '../../interfaces/PageProps'
import Diagram from './Diagram'
import Video from './Video'
import VideoList from './VideoList'
import SingleVideo from './SingleVideo'

interface Props extends PageProps {

}

const StationEntry: React.FC<Props> = function (this: null, props) {
  console.log(2222)
  return (
    <>
      <Flow pageName="diagram" component={Diagram} default={true} pageId={props.pageId} />
      <Flow pageName="single-video" component={SingleVideo} />
      <Flow pageName="video" component={Video} />
      {/* <Flow pageName="video-list" component={VideoList}/> */}
    </>
  )
}

export default StationEntry
