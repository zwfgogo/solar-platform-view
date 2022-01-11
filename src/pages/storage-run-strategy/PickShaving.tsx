import React, {useEffect, useState} from 'react'
import {Tabs} from 'antd'

import MakeConnectProps from '../../interfaces/MakeConnectProps'
import PageProps from '../../interfaces/PageProps'
import {RunStrategyModel} from './models/data'
import Page from '../../components/Page'
import {storage_run_strategy_shaving} from '../constants'
import {makeConnect} from '../umi.helper'
import {RunStrategyModelSocket} from './models/socket'
import StrategyCurveTab from './pick-shaving/StrategyCurveTab'
import CurrentControlArgumentTab from './pick-shaving/CurrentControlArgumentTab'
import NotSendedArgumentTab from './pick-shaving/NotSendedArgumentTab'

import utils from '../../public/js/utils'

interface Props extends PageProps, MakeConnectProps<null>, RunStrategyModel, RunStrategyModelSocket {
  stationId: number
  strategyId: number
  strategyStatus: string
}

const PickShaving: React.FC<Props> = function (this: null, props) {
  const [activeKey, setActiveKey] = useState('1')

  useEffect(() => {
    props.action('fetchEnergyUnitList', {stationId: props.stationId, runStrategyId: props.strategyId})
    props.action('fetchPriceInfo', {stationId: props.stationId})
    props.action('fetchCommandTypeOptions')
    props.action('fetchControlTypeOptions')
    props.action('fetchEndControlTypeOptions')
  }, [])

  return (
    <Page
      pageId={props.pageId}
      pageTitle={utils.intl('有功控制/削峰填谷')}
      className={'pick-shaving-page'}
    >

      <Tabs activeKey={activeKey} onChange={setActiveKey}>
        <Tabs.TabPane key="1" tab={utils.intl('策略跟踪曲线')}>
        </Tabs.TabPane>
        <Tabs.TabPane key="2" tab={utils.intl('当前控制参数')}>
        </Tabs.TabPane>
        <Tabs.TabPane key="3" tab={utils.intl('待下发参数')}>
        </Tabs.TabPane>
      </Tabs>
      <div className="flex1">
        {
          activeKey == '1' && (<StrategyCurveTab stationId={props.stationId} strategyId={props.strategyId}/>)
        }
        {
          activeKey == '2' && (<CurrentControlArgumentTab stationId={props.stationId} strategyId={props.strategyId} strategyStatus={props.strategyStatus}/>)
        }
        {
          activeKey == '3' && (<NotSendedArgumentTab stationId={props.stationId} strategyId={props.strategyId}/>)
        }
      </div>
    </Page>
  )
}

const mapStateToProps = (model, {getLoading, isSuccess}) => {
  return {
    ...model,
  }
}

export default makeConnect(storage_run_strategy_shaving, mapStateToProps)(PickShaving)
