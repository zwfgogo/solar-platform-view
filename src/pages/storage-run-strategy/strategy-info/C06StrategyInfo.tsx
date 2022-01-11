import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Button, DatePicker, Form, FullLoading, message, Select } from 'wanke-gui'
import AbsoluteFullDiv from '../../../components/AbsoluteFullDiv'
import FullContainer from '../../../components/layout/FullContainer'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import utils from '../../../public/js/utils'
import { getDateStr } from '../../../util/dateUtil'
import { storage_run_strategy_info } from '../../constants'
import { makeConnect } from '../../umi.helper'
import CommonHeader from '../component/CommonHeader'
import { RunStrategyInfoModel } from '../models/strategyInfo'
import { AnalogTypeName, AnalogTypeNameByTypeMap, TrackingChartType } from '../strategy.constant'
import C05TrackingChart from '../tracking-chart/C05TrackingChart'
import C06TrackingChart from '../tracking-chart/C06TrackingChart'
import useTrackingChart from '../tracking-chart/useTrackingChart'
import { StrategyDataItem } from './StrategyInfo'

const FormItem = Form.Item

interface Props extends MakeConnectProps<RunStrategyInfoModel>, RunStrategyInfoModel {
  stationId: number
  runStrategyId: number
  fetchEnergyUnitListSuccess: boolean
}

const C06StrategyInfo: React.FC<Props> = (props) => {
  const { stationId, selectEnergyUnitId } = props
  const [time, setTime] = useState(moment())
  const timeStr = time.format("YYYY-MM-DD 00:00:00")
  const { chartInfo, dataInfo, sendToFetchData, socketLoading } = useTrackingChart({
    type: TrackingChartType.C06,
    time: timeStr,
    mode: 'manual',
    stationId: stationId
  })

  const onSearch = () => {
    if (selectEnergyUnitId) {
      sendToFetchData(stationId, timeStr, {
        runStrategyId: props.runStrategyId,
        energyUnitId: selectEnergyUnitId,
        analogsType: AnalogTypeNameByTypeMap[TrackingChartType.C06]
      })
    } else {
      message.error(utils.intl('请选择储能单元'))
    }
  }

  const handleEnergyChange = (val) => {
    props.action('updateToView', {
      selectEnergyUnitId: val
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
    props.action('fetchEnergyUnitList', { stationId, runStrategyId: props.runStrategyId })
  }, [])

  useEffect(() => {
    if (props.fetchEnergyUnitListSuccess) {
      onSearch()
    }
  }, [props.fetchEnergyUnitListSuccess])

  return (
    <FullContainer className="c06-strategy-info run-strategy-info-page">
      <CommonHeader
        title={utils.intl('strategy.紧急功率支撑')}
        fontSize={16}
        style={{ lineHeight: '22px', height: 22 }}
      />
      <div className="form-item-without-error strategy-search">
        <FormItem label={utils.intl('时间选择')}>
          <DatePicker
            allowClear={false}
            style={{ width: 260, flexShrink: 1 }}
            value={time}
            onChange={value => setTime(value)}
            disabledDate={date => {
              let str = getDateStr(date, 'YYYY-MM-DD 00:00:00')
              return props.runDates.indexOf(str) == -1
            }}
          />
        </FormItem>
        <FormItem label={utils.intl('strategy.储能单元')} style={{ marginLeft: 16, marginRight: 16 }}>
          <Select
            dataSource={props.energyUnitList}
            value={props.selectEnergyUnitId}
            onChange={handleEnergyChange}
            style={{ width: 260 }}
          />
        </FormItem>
        <Button type="primary" onClick={onSearch}>{utils.intl('查询')}</Button>
        <div className="strategy-data">
          <StrategyDataItem
            title={utils.intl('strategy.当日累计放电')}
            value={dataInfo[AnalogTypeName.DischargeDay]}
            unit="kWh"
          />
        </div>
      </div>
      <div className="chart-container">
        {socketLoading && <FullLoading />}
        <AbsoluteFullDiv>
          <C06TrackingChart
            time={timeStr}
            chartInfo={chartInfo}
            runDateList={props.runDateList}
          />
        </AbsoluteFullDiv>
      </div>
    </FullContainer>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }) => {
  return {
    ...model,
    fetchEnergyUnitListSuccess: isSuccess('fetchEnergyUnitList'),
  }
}

export default makeConnect(storage_run_strategy_info, mapStateToProps)(C06StrategyInfo)
