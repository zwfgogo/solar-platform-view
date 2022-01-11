/**
 * 电池驾驶舱页面（新版） 
 */
import React from 'react'
import Flow from '../../public/components/Flow'
import Home from './Home'
import RealMonitoring from './RealMonitoring'


const Index = ({ pageId }) => {
  return (
    <>
       <Flow pageName="Home" component={Home} default pageId={pageId} />
       <Flow pageName="RealMonitoring" component={RealMonitoring} />
     </>
  )
}

export default Index
