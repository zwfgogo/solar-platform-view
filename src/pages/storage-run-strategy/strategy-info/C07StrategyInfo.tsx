import moment from 'moment'
import React, { useEffect, useState } from 'react'
import FullContainer from '../../../components/layout/FullContainer'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import utils from '../../../public/js/utils'
import { storage_run_strategy_info } from '../../constants'
import { makeConnect } from '../../umi.helper'
import CommonHeader from '../component/CommonHeader'
import CommonTabHeader from '../component/CommonTabHeader'
import { RunStrategyInfoModel } from '../models/strategyInfo'
import C07ChartInfo from './C07ChartInfo'
import C07ControlParams from './C07ControlParams'
import C07CurrentControlParams from './C07CurrentControlParams'


interface Props extends MakeConnectProps<RunStrategyInfoModel>, RunStrategyInfoModel {
  stationId: number
  runStrategyId: number
  currentControlParamLoading: boolean
}

const C07StrategyInfo: React.FC<Props> = (props) => {
  const [activeKey, setActiveKey] = useState('1')

  return (
    <FullContainer className="c07-strategy-info run-strategy-info-page multiply-tab">
      <CommonTabHeader
        tabList={[
          { key: '1', title: utils.intl('strategy.策略跟踪曲线') },
          { key: '2', title: utils.intl('strategy.当前控制参数') },
          { key: '3', title: utils.intl('strategy.待下发参数') },
        ]}
        activeKey={activeKey}
        onChange={setActiveKey}
      />
      <section>
        {activeKey === '1' && (
          <C07ChartInfo
            stationId={props.stationId}
            runStrategyId={props.runStrategyId}
            action={props.action}
            runDates={props.runDates}
            runDateList={props.runDateList}
          />
        )}
        {activeKey === '2' && (
          <C07CurrentControlParams
            loading={props.currentControlParamLoading}
            stationId={props.stationId}
            runStrategyId={props.runStrategyId}
            action={props.action}
            c07CurrentControlParam={props.c07CurrentControlParam}
          />
        )}
        {activeKey === '3' && (
          <C07ControlParams
            stationId={props.stationId}
            runStrategyId={props.runStrategyId}
          />
        )}
      </section>
    </FullContainer>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }) => {
  return {
    ...model,
    currentControlParamLoading: getLoading('fetchC07CurrentControlParams'),
  }
}

export default makeConnect(storage_run_strategy_info, mapStateToProps)(C07StrategyInfo)
