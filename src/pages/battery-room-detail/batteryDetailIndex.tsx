import React from 'react'
import Flow from '../../public/components/Flow'

import BatteryDetail from './batteryDetail'
import ProblemBattery from '../battery-information-room/problemBattery'

//电池问诊室
const BatteryRoom = ({ pageId }) => {
  return (
    <>
      <Flow pageName="batteryDetail" component={BatteryDetail} default={true} pageId={pageId} />
      <Flow pageName="problemBattery" component={ProblemBattery} />
    </>
  )
}

export default BatteryRoom