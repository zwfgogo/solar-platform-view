/**
 * 效率分析页面 
 */
import React from 'react'
import Flow from '../../public/components/Flow'
import EffciencyAnalysis from './EffciencyAnalysis'


const Index = ({ pageId }) => {
  return (
    <>
       <Flow pageName="EffciencyAnalysis" component={EffciencyAnalysis} default pageId={pageId} />
     </>
  )
}

export default Index
