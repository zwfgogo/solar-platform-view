import React, { useEffect, useMemo } from 'react'
import styles from './styles/history-chart.less'
import { useEchartsOption, CustomChartOption } from '../../../../components/charts/common-echarts/useEchartsOption'
import CommonEcharts from '../../../../components/charts/common-echarts/CommonEcharts';
import moment, { Moment } from 'moment'
import { TimeFormaterMap } from '../model';
import { MultiLineChart } from 'wanke-gui';
import { fillLabelAxisByRange } from '../../../../components/charts/common-echarts/calcOption/chartsTool';
import { margin } from 'wanke-gui/lib/chart/core/chartConstants';

function getTickValues(fillOption, xData = []) {
  const result = {
    labelList: xData,
    tickValues: undefined
  }
  if(fillOption.type === 'total') {
    result.tickValues = xData.map(timeStr => moment(timeStr).valueOf())
  } else {
    // if(xData && xData.length !== 0) {
    result.labelList = fillLabelAxisByRange(fillOption)
    result.tickValues = result.labelList.map(timeStr => {
      return moment(timeStr).valueOf()
    })
    // }
  }
  return result
}

function getTimeRange(timeRange, timeMode, showTime, formater) {
  if(showTime) {
    return {
      startDate: timeRange[0].startOf('days'),
      endDate: timeRange[1].endOf('days')
    }
  }
  
  return {
    startDate: moment(timeRange[0].format(formater)),
    endDate: moment(timeRange[1].format(formater))
  }
}

const grid = {
  left: "80",
  right: "40",
  top: "60",
  bottom: "36"
};

interface Props {
  chartData: any;
  timeMode: any; // 'day' | 'month' | 'year' | 'total'
  showTime: boolean
  timeRange: Moment[],
  theme: 'light' | 'dark'
  chartsRef: {
    current: {
      clearHidedSeries: () => void
    }
  }
}

const HistoryChart: React.FC<Props> = (props) => {
  const { chartData, timeMode, showTime, timeRange, chartsRef } = props
  const [hidedSeriesArray, setHidedSeriesArray] = React.useState([])
  const formater = showTime ? 'YYYY-MM-DD HH:mm:ss' : TimeFormaterMap[timeMode]
  const { startDate, endDate } = getTimeRange(timeRange, timeMode, showTime, formater)

  const clearHidedSeries = () => {
    setHidedSeriesArray([])
  }

  useEffect(() => {
    chartsRef.current = {
      clearHidedSeries
    }
  }, [])

  const fillOption: any = {
    startTime: startDate.format(formater),
    endTime: endDate.format(formater),
    formater: 'YYYY-MM-DD HH:mm:ss'
  };
  if (showTime) {
    fillOption.step = 15;
    fillOption.stepType = 'minutes';
  } else {
    fillOption.type = timeMode;
  }
  
  const { yData, tickValues, labelList } = useMemo(() => {
    const { tickValues = undefined, labelList = [] } = getTickValues(fillOption, chartData.xDataFormat);
    const yData = (chartData.yData || []).map(row => {
      return labelList.map(timeStr => {
        const index = chartData.xDataFormat.indexOf(timeStr)
        if(index > -1) {
          return row?.[index]
        }
        return null
      })
    })
    return { yData, tickValues, labelList }
  }, [JSON.stringify(chartData), JSON.stringify(fillOption)])

  const LineChartProps = {
    series: chartData.series || [{}],
    xData: labelList,
    yData: yData,
    hidedSeriesArray: hidedSeriesArray,
    toggleSeriesDisplay: (index, hidededList) => setHidedSeriesArray(hidededList),
    options: {
      backOpacity: [0, 0],
      startDate: timeMode === 'total' ? undefined : startDate.valueOf(),
      endDate: timeMode === 'total' ? undefined : endDate.valueOf(),
      dateFormat: (time) => moment(time).format(formater),
      tooltipDateFormat: formater,
      tickValues,
      margin: { left: 80 }
    }
  }
  return (
    <div className={styles['history-chart']}>
      {/* <CommonEcharts option={option} /> */}
      <MultiLineChart
        {...LineChartProps}
      />
    </div>
  )
}

export default HistoryChart
