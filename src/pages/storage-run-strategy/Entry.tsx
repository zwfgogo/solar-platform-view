import React from 'react'
import Flow from '../../public/components/Flow'
import PageProps from '../../interfaces/PageProps'
import StationStrategyList from './StationStrategyList'
import StationStrategyDetail from './StationStrategyDetail'
import PickShaving from './PickShaving'
import StrategyLog from './strategy-log/StrategyLog'
import StrategyInfo from './strategy-info/StrategyInfo'

interface Props extends PageProps {

}

const StationEntry: React.FC<Props> = function (this: null, props) {
  return (
    <>
      <Flow pageName="station-strategy-list" component={StationStrategyList}
            default={true} pageId={props.pageId}

      />
      <Flow pageName="station-strategy-detail" component={StationStrategyDetail}/>
      <Flow pageName="pick-shaving" component={PickShaving}
      />
      <Flow pageName="strategy-info" component={StrategyInfo}/>
      <Flow pageName="station-strategy-log" component={StrategyLog}/>
    </>
  )
}

export default StationEntry
