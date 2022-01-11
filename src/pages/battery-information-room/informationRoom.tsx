
import React from 'react'
import Flow from '../../public/components/Flow'

import RoomIndex from './informationRoomIndex/index'
import BatteryCapacity from './batteryCapacity/index'
import BatteryUniformity from './batteryUniformity/index'
import batteryScore from './batteryScore/index'
import ProblemBattery from './problemBattery/index'

//电池问诊室
const BatteryRoom = ({ pageId }) => {
  return (
    <>
      <Flow pageName="roomIndex" component={RoomIndex} default={true} pageId={pageId} />
      <Flow pageName="batteryCapacity" component={BatteryCapacity} />
      <Flow pageName="batteryUniformity" component={BatteryUniformity} />
      <Flow pageName="batteryScore" component={batteryScore} />
      <Flow pageName="problemBattery" component={ProblemBattery} />
    </>
  )
}

export default BatteryRoom