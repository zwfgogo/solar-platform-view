import React, { useEffect } from 'react'
import Page from '../../../components/Page'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import PageProps from '../../../interfaces/PageProps'
import utils from '../../../public/js/utils'
import { storage_run_strategy_info } from '../../constants'
import { makeConnect } from '../../umi.helper'
import { RunStrategyInfoModel } from '../models/strategyInfo'
import { TrackingChartType } from '../strategy.constant'
import C05StrategyInfo from './C05StrategyInfo'
import C06StrategyInfo from './C06StrategyInfo'
import C07StrategyInfo from './C07StrategyInfo'
import C19StrategyInfo from './C19StrategyInfo'
import './strategy-info.less'

const pageNameMap = {
  [TrackingChartType.C05]: utils.intl('strategy.储能调峰'),
  [TrackingChartType.C06]: utils.intl('strategy.紧急功率支撑'),
  [TrackingChartType.C07]: utils.intl('strategy.无功/电压控制'),
  [TrackingChartType.C19]: utils.intl('strategy.手动控制'),
}

interface Props extends PageProps, MakeConnectProps<RunStrategyInfoModel>, RunStrategyInfoModel {
  type: TrackingChartType
  stationId: number
  runStrategyId: number
}

const StrategyInfo: React.FC<Props> = (props) => {
  const renderInfo = () => {
    switch(props.type) {
      case TrackingChartType.C05:
        return (
          <C05StrategyInfo
            stationId={props.stationId}
            runStrategyId={props.runStrategyId}
          />
        )
      case TrackingChartType.C06:
        return (
          <C06StrategyInfo
            stationId={props.stationId}
            runStrategyId={props.runStrategyId}
          />
        )
      case TrackingChartType.C07:
        return (
          <C07StrategyInfo
            stationId={props.stationId}
            runStrategyId={props.runStrategyId}
          />
        )
      case TrackingChartType.C19:
        return (
          <C19StrategyInfo
            stationId={props.stationId}
            runStrategyId={props.runStrategyId}
          />
        )
      default:
        return null
    }
  }

  return (
    <Page
      pageId={props.pageId}
      pageTitle={pageNameMap[props.type]}
    >
      {renderInfo()}
    </Page>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }) => {
  return {
    ...model,
  }
}

export default makeConnect(storage_run_strategy_info, mapStateToProps)(StrategyInfo)

interface StrategyDataItemProps {
  title: string
  value: any
  unit: any
}

export const StrategyDataItem: React.FC<StrategyDataItemProps> = ({ value, unit, title }) => {
  return (
    <span className={'strategy-data-item'}>
      <span style={{ marginRight: 8 }}>{title}:</span>
      <span>
        {
          value || value === 0 ? (
            <>
              <span className={'strategy-data-value'}>{value}</span>
              <span>{unit}</span>
            </>
          ) : (
            <span>-</span>
          )
        }
      </span>
    </span>
  )
}
