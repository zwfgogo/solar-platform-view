import React, {useEffect} from 'react'
import Flow from '../../public/components/Flow'

import OptimizeRunningList from './OptimizeRunningList'
import UpdateStrategy from './strategy/UpdateStrategy'
import StrategyMaintenance from './strategyMaintenance/strategyMaintenance'
import navigateHoc from '../../public/navigateHoc'

const OptimizeEntry = ({pageId, forward}) => {
  return (
    <>
      <Flow pageName="list" component={OptimizeRunningList} default={true} pageId={pageId}/>
      <Flow pageName="updateStrategy" component={UpdateStrategy}/>
      <Flow pageName="strategyMaintenance" component={StrategyMaintenance}/>
    </>
  )
}

export default navigateHoc(OptimizeEntry)
