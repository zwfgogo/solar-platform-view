import React from 'react'
import Flow from '../../public/components/Flow'
import BatteryOperation from './index'

//拓扑分析
const Entry = ({pageId}) => {
  return (
  <>
    <Flow pageName="BatteryOperation" component={BatteryOperation} default={true} pageId={pageId}/>
  </>
)
}

export default Entry
