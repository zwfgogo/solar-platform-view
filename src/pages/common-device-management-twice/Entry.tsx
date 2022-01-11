import React from 'react'

import Flow from '../../public/components/Flow'
import DeviceManageMentTwice from './index'
import SignalList from './signal-list'

const RightsRoleEntry = ({pageId}) => {
  return (
    <>
      <Flow pageName="DeviceManagementTwice" component={DeviceManageMentTwice} default={true} pageId={pageId}/>
      <Flow pageName="SignalList" component={SignalList} />
    </>
  )
}

export default RightsRoleEntry
