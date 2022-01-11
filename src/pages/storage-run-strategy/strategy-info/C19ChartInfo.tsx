import React, { useEffect, useState } from 'react'
import { Button, DatePicker, Form, FullLoading } from 'wanke-gui'
import AbsoluteFullDiv from '../../../components/AbsoluteFullDiv'
import utils from '../../../public/js/utils'
import { analogsTypeUnitMap, AnalogTypeName, AnalogTypeNameByTypeMap, TrackingChartType } from '../strategy.constant'
import { getDateStr } from '../../../util/dateUtil'
import { StrategyDataItem } from './StrategyInfo'
import moment from 'moment'
import useTrackingChart from '../tracking-chart/useTrackingChart'
import C19TrackingChart from '../tracking-chart/C19TrackingChart'

const FormItem = Form.Item

interface Props {
  stationId: number
  runStrategyId: number
  action: any
  runDates: any[]
  runDateList: any[]
}

const C19ChartInfo: React.FC<Props> = (props) => {
  const { stationId } = props
  const [time, setTime] = useState(moment())
  const timeStr = time.format("YYYY-MM-DD 00:00:00")
  const { chartInfo, dataInfo, sendToFetchData, socketLoading } = useTrackingChart({
    type: TrackingChartType.C19,
    time: timeStr,
    mode: 'manual',
    stationId: stationId
  })

  const onSearch = () => {
    sendToFetchData(stationId, timeStr, {
      runStrategyId: props.runStrategyId
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
      </div>
      <div className="chart-container">
        {socketLoading && <FullLoading />}
        <AbsoluteFullDiv>
          <C19TrackingChart
            time={timeStr}
            chartInfo={chartInfo}
            runDateList={props.runDateList}
          />
        </AbsoluteFullDiv>
      </div>
    </>
  )
}

export default C19ChartInfo
