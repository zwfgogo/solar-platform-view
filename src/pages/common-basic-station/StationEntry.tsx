import React, { useEffect } from 'react'
import Flow from '../../public/components/Flow'

import List from './list/List'
import UpdatePage from './station-update/UpdatePage'
import EnergyUnit from './energy-unit/EnergyUnit'
import DataPoint from './station-update/TabDataPoint'
import SelectMap from './station-update/SelectMap'
import StationStatus from './station-status'
import navigateHoc from '../../public/navigateHoc'
import PageProps from '../../interfaces/PageProps'
import DataPointHistory from './data-point-history/DataPointHistory'
import StrategySetting from './strategy-setting';

interface Props extends PageProps {

}

const StationEntry: React.FC<Props> = function (this: null, props) {
  useEffect(() => {
    // props.forward('stationUpdate', {stationId: 101776})
    // props.forward('stationUpdate', {mode: Mode.add, stationType: 6322})
    // props.forward('energyUnit', {stationId: 101776, selectEnergyUnitId: 168051,editable: true})
  }, [])

  return (
    <>
      <Flow pageName="list" component={List} default={true} pageId={props.pageId} />
      <Flow pageName="stationStatus" component={StationStatus} />
      <Flow pageName="stationUpdate" component={UpdatePage} />
      <Flow pageName="energyUnit" component={EnergyUnit} />
      <Flow pageName="dataPoint" component={DataPoint} />
      <Flow pageName="dataPointHistory" component={DataPointHistory} />
      <Flow pageName="selectMap" component={SelectMap} />
      <Flow pageName="strategySetting" component={StrategySetting}></Flow>
    </>
  )
}

export default navigateHoc(StationEntry)
