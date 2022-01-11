import React from 'react'
import Flow from "../../public/components/Flow"

import batteryList from './batteryList/index'

const Battery = ({pageId}) => {
    return (
    <>
        <Flow pageName="batteryList" component={batteryList} default={true} pageId={pageId}/>
    </>
  )
}

export default Battery
