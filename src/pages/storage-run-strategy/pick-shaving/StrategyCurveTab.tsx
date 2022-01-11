import React, { useEffect, useState } from 'react'
import PageProps from '../../../interfaces/PageProps'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import { makeConnect } from '../../umi.helper'
import { storage_run_strategy_shaving, storage_run_strategy_socket } from '../../constants'
import { getDateStr } from '../../../util/dateUtil'
import moment from 'moment'
import { Button, DatePicker, FullContainer, LineChart } from 'wanke-gui'
import Label from '../../../components/Label'
import TodayCommandDialog from '../dialog/TodayCommandDialog'
import { RunStrategyShavingModel } from '../models/shaving'

import utils from '../../../public/js/utils'

interface Props extends PageProps, MakeConnectProps<RunStrategyShavingModel>, RunStrategyShavingModel {
  stationId: number
  strategyId: number
  runDates: any[]
  chargeTotal: number
  dischargeTotal: number
  socketLoading: boolean
  powerList: any[]
  runDateList: any[]
  theme: any
}

const StrategyCurveTab: React.FC<Props> = function (this: null, props) {
  const [date, setDate] = useState(moment())
  const [showTodayCommand, setShowTodayCommand] = useState(false)

  useEffect(() => {
    props.action('fetchChartData', { stationId: props.stationId })
    props.action('fetchStrategyRunDates', { runStrategyId: props.strategyId, stationId: props.stationId })
  }, [])

  useEffect(() => {
    props.action('fetchStrategyRunDateList', {
      runStrategyId: props.strategyId,
      stationId: props.stationId,
      dtime: getDateStr(date, 'YYYY-MM-DD 00:00:00')
    })
    props.action(storage_run_strategy_socket + '/init', {
      runStrategyId: props.strategyId,
      stationId: props.stationId,
      date: getDateStr(date),
      dispatch: props.dispatch
    })
    return () => {
      props.action(storage_run_strategy_socket + '/closeSocket')
    }
  }, [date])


  return (
    <FullContainer className="strategy-curve-tab">
      {
        showTodayCommand && (
          <TodayCommandDialog
            stationId={props.stationId}
            strategyId={props.strategyId}
            energyUnits={props.energyUnitList}
            action={props.action}
            commandTypeOptions={props.commandTypeOptions}
            controlTypeOptions={props.controlTypeOptions}
            endControlOptions={props.endControlOptions}
            todayCommandList={props.todayCommandList}
            visible={showTodayCommand}
            onCancel={() => setShowTodayCommand(false)}
          />
        )
      }
      <div style={{ marginBottom: 16 }}>
        <div className="h-space" style={{ height: 32 }}>
          <div className="d-flex">
            <Label>{utils.intl('时间')}</Label>
            <DatePicker
              allowClear={false}
              value={date}
              onChange={setDate}
              disabledDate={date => {
                let str = getDateStr(date, 'YYYY-MM-DD 00:00:00')
                return props.runDates.indexOf(str) == -1
              }}
            />
          </div>
          <div>
            <div className="statistic-info" style={{ color: props.theme === 'dark-theme' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)' }}>
              <span>
                {utils.intl('当日全站累计充电')}：
                <span style={{ color: '#3D7EFF' }}>{props.chargeTotal?.toFixed(2)}</span>
                kWh
              </span>
              <span style={{ marginLeft: 15 }}>
                {utils.intl('当日全站累计放电')}：
                <span style={{ color: '#3D7EFF' }}>{props.dischargeTotal?.toFixed(2)}</span>
                kWh
              </span>
            </div>
            <Button className="wanke-primary-blue" onClick={() => setShowTodayCommand(true)}>{utils.intl('当日控制参数')}</Button>
          </div>
        </div>
      </div>
      {
        date && (
          <div className="flex1">
            <LineChart
              loading={props.socketLoading}
              xData={props.powerList.map(item => item.xData)}
              yData={props.powerList.map(item => item.yData)}
              series={props.powerList.map(item => item.series)}
              options={{
                startDate: date.startOf('day').valueOf(),
                endDate: date.endOf('day').valueOf(),
                dateFormat: (value) => {
                  return moment(value).format('HH:mm')
                },
                tickWidth: 120,
                standardList: props.runDateList.map(item => {
                  return [moment(item[0]).valueOf(), moment(item[1]).valueOf()]
                })
              }}
            />
          </div>
        )
      }
    </FullContainer>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    theme: state.global.theme,
    ...state[storage_run_strategy_socket]

  }
}

export default makeConnect(storage_run_strategy_shaving, mapStateToProps)(StrategyCurveTab)
