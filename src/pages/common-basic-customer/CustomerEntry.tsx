import React from 'react'
import Flow from '../../public/components/Flow'

import CustomerList from './customerList/CustomerList'
import StationInfo from './StationInfo'
import StationUpdatePage from '../common-basic-station/station-update/UpdatePage'
import EnergyUnit from '../common-basic-station/energy-unit/EnergyUnit'
import DataPointHistory from '../common-basic-station/data-point-history/DataPointHistory'

const CustomerEntry = ({pageId}) => {
  return (
    <>
      <Flow pageName="customerList" component={CustomerList} default={true} pageId={pageId}/>
      <Flow pageName="stationList" component={StationInfo}/>
      <Flow pageName="stationUpdate" component={StationUpdatePage}/>
      <Flow pageName="energyUnit" component={EnergyUnit}/>
      <Flow pageName="dataPointHistory" component={DataPointHistory}/>
    </>
  )
}

export default CustomerEntry
