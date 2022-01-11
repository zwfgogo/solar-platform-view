/**
 * 安全评估页面 
 */
import React from 'react'
import Flow from '../../public/components/Flow'
import SafeAssess from './SafeAssess'


const Index = ({ pageId }) => {
  return (
    <>
       <Flow pageName="SafeAssess" component={SafeAssess} default pageId={pageId} />
     </>
  )
}

export default Index
