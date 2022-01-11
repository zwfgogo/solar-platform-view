/**
 * 效率分析
 */
import _ from 'lodash'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { GlobalState, EfficiencyAnalysisState } from 'umi'
import { LineChart, Select, Table2 } from 'wanke-gui'
import Page from '../../components/Page'
import { useEnergyUnit } from '../../hooks/useEnergyUnitSelect'
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import PageProps from '../../interfaces/PageProps'
import utils from '../../public/js/utils'
import { battery_efficiency_analysis, globalNS } from '../constants'
import { makeConnect } from '../umi.helper'
import classNames from 'classnames'
import "./index.less"
import moment from 'moment'

interface Props extends PageProps, GlobalState, MakeConnectProps<EfficiencyAnalysisState>, EfficiencyAnalysisState {
  chartDataLoading: boolean
}

const EfficiencyAnalysis: React.FC<Props> = (props) => {
  const { pageId, dispatch, chartDataLoading } = props
  const { selectedEnergyUnitId, selectEnergyUnit, energyUnitList } = useEnergyUnit();
  const [batteryUintValue, setBatteryUintValue] = useState(undefined);
  useEffect(() => {
    if (selectEnergyUnit) {
      const { id, productionTime } = selectEnergyUnit
      dispatch({
        type: `${battery_efficiency_analysis}/updateState`, payload: {
          chartData: {
            xData: [],
            yData: [],
            series: [],
          }
        }
      });
      dispatch({ type: `${battery_efficiency_analysis}/getEfficiency`, payload: { deviceId: id, dtime: `${productionTime},${moment().format("YYYY-MM-DD HH:mm:ss")}` } });
    }
  }, [JSON.stringify(selectEnergyUnit)])

  const LineChartProps = useMemo(() => {
    const { chartData } = props
    return {
      series: (chartData.series || []).filter(item => item.name !== 'undefined'),
      xData: chartData.xData || [],
      yData: chartData.yData || [],
      options: {
        backOpacity: [0, 0],
        startDate: moment(selectEnergyUnit?.productionTime).valueOf(),
        endDate: moment().valueOf(),
        dateFormat: (time) => moment(time).format('YYYY年MM月DD日'),
        tooltipDateFormat: 'YYYY年MM月DD日',
        margin: { left: 70 }
      }
    }
  }, [JSON.stringify(props.chartData), selectEnergyUnit?.productionTime])

  return (
    <Page pageId={pageId} showStation showEnergyUnit>
      <div className="page-header">
        <span style={{ width: 120 }}>{utils.intl('电池系统效率')}</span>
      </div>
      <div className="page-body">
        <LineChart
          {...LineChartProps}
          loading={chartDataLoading}
        />
      </div>
    </Page>
  )
}


const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    stationList: state[globalNS].stationList,
    chartDataLoading: getLoading('getEfficiency')
  }
}

export default makeConnect(battery_efficiency_analysis, mapStateToProps)(EfficiencyAnalysis);
