import React, { useEffect, useState } from 'react'
import { Button, DatePicker, Form, FullLoading } from 'wanke-gui'
import AbsoluteFullDiv from '../../../components/AbsoluteFullDiv'
import utils from '../../../public/js/utils'
import { analogsTypeUnitMap, AnalogTypeName, AnalogTypeNameByTypeMap, TrackingChartType } from '../strategy.constant'
import C07TrackingChart from '../tracking-chart/C07TrackingChart'
import { getDateStr } from '../../../util/dateUtil'
import { StrategyDataItem } from './StrategyInfo'
import moment from 'moment'
import useTrackingChart, { C07CalcPName, C07CalcRName } from '../tracking-chart/useTrackingChart'
import TodayCommand from '../today-command/TodayCommand'

const FormItem = Form.Item

interface Props {
  stationId: number
  runStrategyId: number
  action: any
  runDates: any[]
  runDateList: any[]
}

const C07ChartInfo: React.FC<Props> = (props) => {
  const { stationId } = props
  const [time, setTime] = useState(moment())
  const [showCurrentStrategyModal, setShowCurrentStrategyModal] = useState(false)
  const timeStr = time.format("YYYY-MM-DD 00:00:00")
  const { chartInfo, dataInfo, sendToFetchData, socketLoading } = useTrackingChart({
    type: TrackingChartType.C07,
    time: timeStr,
    mode: 'manual',
    stationId: stationId
  })

  const onSearch = () => {
    sendToFetchData(stationId, timeStr, {
      runStrategyId: props.runStrategyId,
      analogsType: AnalogTypeNameByTypeMap[TrackingChartType.C07]
    })
  }

  useEffect(() => {
    props.action('fetchStrategyRunDateList', {
      runStrategyId: props.runStrategyId,
      stationId: stationId,
      dtime: timeStr
    })
    props.action('fetchStrategyRunDates', {
      runStrategyId: props.runStrategyId,
      stationId: stationId
    })
    onSearch()
  }, [])

  return (
    <>
      <div className="form-item-without-error strategy-search">
        <FormItem label={utils.intl('时间选择')}>
          <DatePicker
            allowClear={false}
            style={{ width: 260, flexShrink: 1, marginRight: 16 }}
            value={time}
            onChange={value => setTime(value)}
            disabledDate={date => {
              let str = getDateStr(date, 'YYYY-MM-DD 00:00:00')
              return props.runDates.indexOf(str) == -1
            }}
          />
        </FormItem>
        <Button type="primary" onClick={onSearch}>{utils.intl('查询')}</Button>
        <div style={{ flexGrow: 1, textAlign: 'right', display: 'flex' }}>
          <div className="strategy-data">
            <StrategyDataItem
              title={utils.intl('strategy.当日累计发出无功')}
              value={formatValue(
                dataInfo[AnalogTypeName.PositiveReactiveEnergyIndication] ?? dataInfo[C07CalcPName]
              )}
              unit={analogsTypeUnitMap[AnalogTypeName.PositiveReactiveEnergyIndication]}
            />
            <StrategyDataItem
              title={utils.intl('strategy.当日累计吸收无功')}
              value={formatValue(
                dataInfo[AnalogTypeName.ReverseReactiveEnergyIndication] ?? dataInfo[C07CalcRName]
              )}
              unit={analogsTypeUnitMap[AnalogTypeName.ReverseReactiveEnergyIndication]}
            />
          </div>
          <Button className="wanke-primary-blue" style={{ marginLeft: 30 }} onClick={() => setShowCurrentStrategyModal(true)}>{utils.intl('strategy.当日控制参数')}</Button>
        </div>
      </div>
      <div className="chart-container">
        {socketLoading && <FullLoading />}
        <AbsoluteFullDiv>
          <C07TrackingChart
            time={timeStr}
            chartInfo={chartInfo}
            runDateList={props.runDateList}
          />
        </AbsoluteFullDiv>
      </div>
      {showCurrentStrategyModal && (
        <TodayCommand
          type={TrackingChartType.C07}
          stationId={props.stationId}
          strategyId={props.runStrategyId}
          visible={showCurrentStrategyModal}
          onCancel={() => setShowCurrentStrategyModal(false)}
        />
      )}
    </>
  )
}

export default C07ChartInfo

function formatValue(val) {
  if (!val) return val
  return val.toFixed(2)
}
