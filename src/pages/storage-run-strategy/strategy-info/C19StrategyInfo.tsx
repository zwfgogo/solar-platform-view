import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Button, DatePicker, Form, message, Select } from 'wanke-gui'
import FullContainer from '../../../components/layout/FullContainer'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import utils from '../../../public/js/utils'
import { storage_run_strategy_info } from '../../constants'
import { makeConnect } from '../../umi.helper'
import CommonHeader from '../component/CommonHeader'
import CommonTabHeader from '../component/CommonTabHeader'
import { RunStrategyInfoModel } from '../models/strategyInfo'
import C19ChartInfo from './C19ChartInfo'
import C19ControlParams from './C19ControlParams'
import C19CurrentControlParams from './C19CurrentControlParams'

const FormItem = Form.Item

interface Props extends MakeConnectProps<RunStrategyInfoModel>, RunStrategyInfoModel {
  stationId: number
  runStrategyId: number
  currentControlParamLoading: boolean
}

const C19StrategyInfo: React.FC<Props> = (props) => {
  const [activeKey, setActiveKey] = useState('1')

  return (
    <FullContainer className="c19-strategy-info run-strategy-info-page multiply-tab">
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
          <C19ChartInfo
            stationId={props.stationId}
            runStrategyId={props.runStrategyId}
            action={props.action}
            runDates={props.runDates}
            runDateList={props.runDateList}
          />
        )}
        {activeKey === '2' && (
          <C19CurrentControlParams
            loading={props.currentControlParamLoading}
            stationId={props.stationId}
            runStrategyId={props.runStrategyId}
            action={props.action}
            c19CurrentControlParam={props.c19CurrentControlParam}
          />
        )}
        {activeKey === '3' && (
          <C19ControlParams
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
    currentControlParamLoading: getLoading('fetchC19CurrentControlParams'),
  }
}

export default makeConnect(storage_run_strategy_info, mapStateToProps)(C19StrategyInfo)
