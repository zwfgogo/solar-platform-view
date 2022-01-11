import React, { useEffect } from 'react'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import { storage_today_command } from '../../constants'
import { makeConnect } from '../../umi.helper'
import TodayCommandDialog from '../dialog/TodayCommandDialog'
import { TodayCommandModel } from '../models/todayCommand'
import { TrackingChartType } from '../strategy.constant'
import C07TodayCommandDialog from './C07TodayCommandDialog'

interface Props extends MakeConnectProps<TodayCommandModel>, TodayCommandModel {
  type: TrackingChartType
  stationId: number
  strategyId: number
  visible: boolean
  fetchC07TodayCommandListLoading: boolean
  onCancel: () => void
}

const TodayCommand: React.FC<Props> = (props) => {
  const fetchData = () => {
    switch(props.type) {
      case TrackingChartType.C01:
        props.action('fetchEnergyUnitList', {stationId: props.stationId, runStrategyId: props.strategyId})
        props.action('fetchCommandTypeOptions')
        props.action('fetchControlTypeOptions')
        props.action('fetchEndControlTypeOptions')
        break
      case TrackingChartType.C07:
        props.action('fetchC07TodayCommandList', {
          stationId: props.stationId,
          runStrategyId: props.strategyId,
          runStrategyType: props.type,
        })
        break
      default:
        break
    }
  }

  const renderModal = () => {
    switch(props.type) {
      case TrackingChartType.C01:
        return (
          <TodayCommandDialog
            stationId={props.stationId}
            strategyId={props.strategyId}
            energyUnits={props.energyUnitList}
            action={props.action}
            commandTypeOptions={props.commandTypeOptions}
            controlTypeOptions={props.controlTypeOptions}
            endControlOptions={props.endControlOptions}
            todayCommandList={props.todayCommandList}
            visible={props.visible}
            onCancel={() => props.onCancel()}
          />
        )
      case TrackingChartType.C07:
        return (
          <C07TodayCommandDialog
            loading={props.fetchC07TodayCommandListLoading}
            stationId={props.stationId}
            strategyId={props.strategyId}
            c07CommandList={props.c07CommandList}
            action={props.action}
            visible={props.visible}
            onCancel={() => props.onCancel()}
          />
        )
      default:
        return null
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <>
      {renderModal()}
    </>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }) => {
  return {
    ...model,
    fetchC07TodayCommandListLoading: getLoading('fetchC07TodayCommandList'),
  }
}

export default makeConnect(storage_today_command, mapStateToProps)(TodayCommand)
