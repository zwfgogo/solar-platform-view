import React from 'react'
import Flow from '../../../public/components/Flow'

import BasicData from './basicData/index'
import DetailData from './detailData/index'


//vpp
const Investigation = ({pageId}) => {
    return (
    <>
        <Flow pageName="basicData" component={BasicData} default={true} pageId={pageId}/>
        <Flow pageName="detailData" component={DetailData}/>
    </>
  )
}

export default Investigation
