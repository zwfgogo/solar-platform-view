import moment from 'moment'
import React, { useEffect, useState } from 'react'
import classnames from 'classnames'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import { storage_run_strategy } from '../../constants'
import { makeConnect } from '../../umi.helper'
import { RunStrategyModel } from '../models/data'
import { analogsTypeUnitMap, AnalogTypeName, AnalogTypeNameByTypeMap, ControlModes, TrackingChartType } from '../strategy.constant'
import C01TrackingChart from './C01TrackingChart'
import C05TrackingChart from './C05TrackingChart'
import C06TrackingChart from './C06TrackingChart'
import C07TrackingChart from './C07TrackingChart'
import C19TrackingChart from './C19TrackingChart'
import useTrackingChart, { C07CalcPName, C07CalcRName } from './useTrackingChart'
import styles from './tracking-chart.less'
import { Button, DatePicker, Empty, FullLoading, Select } from 'wanke-gui'
import { disabledDateAfterToday, getDateStr } from '../../../util/dateUtil'
import utils from '../../../public/js/utils'
import AbsoluteFullDiv from '../../../components/AbsoluteFullDiv'
import CommonHeader from '../component/CommonHeader'
import EmptyData from '../../../components/EmptyData'
import { WankeCircleRightOutlined } from 'wanke-icon'
import TodayCommand from '../today-command/TodayCommand'

const showCurrentStrategyTypeList = [
  TrackingChartType.C01,
  TrackingChartType.C07,
]

const ControlModeColorMap = {
  [ControlModes.DispatchMode]: styles['blue'],
  [ControlModes.LocalMode]: styles['orange'],
  [ControlModes.RemoteMode]: styles['green'],
  [ControlModes.ManualMode]: styles['grey'],
}

interface Props extends MakeConnectProps<RunStrategyModel>, RunStrategyModel {
  stationId: number
  toLog: () => void
}

const TrackingChart: React.FC<Props> = (props) => {
  const { stationId, runStrategy, runDateList } = props
  const [time, setTime] = useState(moment())
  const [showCurrentStrategyModal, setShowCurrentStrategyModal] = useState(false)
  const timeStr = time.format("YYYY-MM-DD 00:00:00")

  const getQuestParams = () => {
    switch(runStrategy.name) {
      case TrackingChartType.C05:
      case TrackingChartType.C06:
        return {
          runStrategyId: runStrategy.id,
          energyUnitId: props.selectEnergyUnitId,
          analogsType: AnalogTypeNameByTypeMap[runStrategy.name]
        }
      case TrackingChartType.C07:
        return {
          runStrategyId: runStrategy.id,
          analogsType: AnalogTypeNameByTypeMap[TrackingChartType.C07]
        }
      case TrackingChartType.C01:
      case TrackingChartType.C19:
        return {
          runStrategyId: runStrategy.id
        }
      default:
        return {}
    }
  }

  const { chartInfo, dataInfo, socketLoading } = useTrackingChart({
    type: runStrategy.name,
    time: timeStr,
    stationId,
    socketParams: getQuestParams()
  })


  // 日期变化
  useEffect(() => {
    if (runStrategy.id) {
      props.action('fetchEnergyUnitList', {
        stationId: props.stationId,
        runStrategyId: runStrategy.id
      })
      props.action('fetchStrategyRunDateList', {
        runStrategyId: runStrategy.id,
        stationId: stationId,
        dtime: timeStr
      })
      props.action('fetchStrategyRunDates', {
        runStrategyId: runStrategy.id,
        stationId: props.stationId
      })
    }
  }, [timeStr, runStrategy.id])

  useEffect(() => {
    // 获取当前运行的策略
    props.action('fetchRunStrategyId', {
      stationId: stationId,
      dispatch: props.dispatch,
    })
    return () => {
      props.action('closeSocket')
    }
  }, [])

  const handleEnergyChange = (val) => {
    props.action('updateToView', {
      selectEnergyUnitId: val
    })
  }


  const renderChart = () => {
    let chartDom, dataDom, queryDom
    let showEnergy = false
    switch(runStrategy.name) {
      case TrackingChartType.C01:
        chartDom = (
          <C01TrackingChart
            time={timeStr}
            chartInfo={chartInfo}
            runDateList={runDateList}
          />
        )
        dataDom = (
          <>
            <DataItem
              title={utils.intl('strategy.当日全站累计充电')}
              value={formatValue(dataInfo.charge)}
              unit="kWh"
            />
            <DataItem
              title={utils.intl('strategy.当日全站累计放电')}
              value={formatValue(dataInfo.discharge)}
              unit="kWh"
            />
          </>
        )
        break
      case TrackingChartType.C05:
        showEnergy = true
        chartDom = (
          <C05TrackingChart
            time={timeStr}
            chartInfo={chartInfo}
            runDateList={runDateList}
          />
        )
        dataDom = (
          <>
            <DataItem
              title={utils.intl('strategy.当日累计放电')}
              value={formatValue(dataInfo[AnalogTypeName.DischargeDay])}
              unit="kWh"
            />
          </>
        )
        break
      case TrackingChartType.C06:
        showEnergy = true
        chartDom = (
          <C06TrackingChart
            time={timeStr}
            chartInfo={chartInfo}
            runDateList={runDateList}
          />
        )
        dataDom = (
          <>
            <DataItem
              title={utils.intl('strategy.当日累计放电')}
              value={formatValue(dataInfo[AnalogTypeName.DischargeDay])}
              unit="kWh"
            />
          </>
        )
        break
      case TrackingChartType.C07:
        chartDom = (
          <C07TrackingChart
            time={timeStr}
            chartInfo={chartInfo}
            runDateList={runDateList}
          />
        )
        dataDom = (
          <>
            <DataItem
              title={utils.intl('strategy.当日累计发出无功')}
              value={formatValue(
                dataInfo[AnalogTypeName.PositiveReactiveEnergyIndication] ?? dataInfo[C07CalcPName]
              )}
              unit={analogsTypeUnitMap[AnalogTypeName.PositiveReactiveEnergyIndication]}
            />
            <DataItem
              title={utils.intl('strategy.当日累计吸收无功')}
              value={formatValue(
                dataInfo[AnalogTypeName.ReverseReactiveEnergyIndication] ?? dataInfo[C07CalcRName]
              )}
              unit={analogsTypeUnitMap[AnalogTypeName.ReverseReactiveEnergyIndication]}
            />
          </>
        )
        break
      case TrackingChartType.C19:
        chartDom = (
          <C19TrackingChart
            time={timeStr}
            chartInfo={chartInfo}
            runDateList={runDateList}
          />
        )
        break
      default:
        return {}
    }

    queryDom = [(
      <DatePicker
        key="time-query"
        allowClear={false}
        style={{ width: 260, flexShrink: 1, marginRight: 16 }}
        value={time}
        onChange={value => setTime(value)}
        disabledDate={date => {
          let str = getDateStr(date, 'YYYY-MM-DD 00:00:00')
          return props.runDates.indexOf(str) == -1
        }}
      />
    )]

    if (showEnergy) {
      queryDom.push(
        <Select
          dataSource={props.energyUnitList}
          value={props.selectEnergyUnitId}
          onChange={handleEnergyChange}
          style={{ width: 260 , flexShrink: 1}}
        />
      )
    }

    return { chartDom, dataDom, queryDom }
  }

  const showCurrentStrategy = () => {
    return runStrategy.name && showCurrentStrategyTypeList.includes(runStrategy.name)
  }

  const controlMode = runStrategy.controlMode || {}
  const { chartDom, dataDom, queryDom } = renderChart()

  if (!runStrategy.id) {
    return (
      <div className={styles['empty-container']}>
        <EmptyData message={utils.intl('strategy.当前暂无策略')} />
      </div>
    )
  }

  return (
    <div className={styles['tracking-chart']}>
      <section className={styles['chart-container']}>
        <header>
          <div className={styles['chart-filter']}>
            {queryDom}
          </div>
          <div className={styles['data']}>
            {dataDom}
            {showCurrentStrategy() && (
              <a className={styles['btn']} onClick={() => setShowCurrentStrategyModal(true)}>{utils.intl('strategy.当日控制参数')}</a>
            )}
          </div>
        </header>
        <footer>
          {socketLoading && <FullLoading />}
          <AbsoluteFullDiv>
            {chartDom}
          </AbsoluteFullDiv>
        </footer>
      </section>
      <div className={styles['detail']}>
        <div className={styles['title']}>
          <CommonHeader
            title={runStrategy.title}
            fontSize={20}
            style={{ lineHeight: '60px', height: 60 }}
          />
          {controlMode.name && (
            <span className={classnames(styles['tag'], ControlModeColorMap[controlMode.name])}>
              {controlMode.title}
            </span>
          )}
        </div>
        <div className={styles['detail-label']}>{utils.intl('strategy.开始执行')}</div>
        <div className={styles['detail-content']}>{runStrategy.startTime || '-'}</div>
        <section className={styles['message']}>
          <CommonHeader
            title={utils.intl('strategy.提示信息')}
            fontSize={16}
            style={{ lineHeight: '44px', height: 44 }}
          />
          <div className={styles['message-content']}>
            <EmptyData message={utils.intl('strategy.当前暂无提示信息')} />
          </div>
          <footer>
            <a onClick={props.toLog}>
              {utils.intl('strategy.策略执行日志')}
              <WankeCircleRightOutlined style={{ marginLeft: 8, fontSize: 16 }} />
            </a>
          </footer>
        </section>
      </div>
      {showCurrentStrategyModal && (
        <TodayCommand
          type={runStrategy.name}
          stationId={props.stationId}
          strategyId={runStrategy.id}
          visible={showCurrentStrategyModal}
          onCancel={() => setShowCurrentStrategyModal(false)}
        />
      )}
    </div>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }) => {
  return {
    ...model,
  }
}

export default makeConnect(storage_run_strategy, mapStateToProps)(TrackingChart)

interface DataItemProps {
  title: string
  value: any
  unit: any
}

const DataItem: React.FC<DataItemProps> = ({ value, unit, title }) => {
  return (
    <span className={styles['data-item']}>
      <span style={{ marginRight: 8 }}>{title}:</span>
      <span>
        {
          value || value === 0 ? (
            <>
              <span className={styles['data-value']}>{value}</span>
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

function formatValue(val) {
  if (!val) return val
  return val.toFixed(2)
}
