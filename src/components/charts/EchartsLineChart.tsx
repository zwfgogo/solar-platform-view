import React, { useEffect, useState } from 'react'
import { FullLoading } from 'wanke-gui'
import CommonEcharts from './common-echarts/CommonEcharts'
import { useEchartsOption, CustomChartOption } from "./common-echarts/useEchartsOption"
import { getMarkLine } from './common-echarts/calcOption/chartsTool'
import './echarts-line-chart.less'
import { LineChartProps } from './common-echarts/calcOption/lineType'

const defaultGrid = {
  left: "40",
  right: "16",
  top: "40",
  bottom: "36"
};

interface Props extends Omit<LineChartProps, 'customOption' | 'data' | 'type'> {
  xData: string[]
  yData: number[][]
  series: { name: string, unit: string }[]
  xAxisName?: string
  yAxisName?: string
  yAxis?: any
  xAxis?: any
  dividing?: string[]
  grid?: any
  legend?: any
  tooltip?: any
  markLineList?: number[]
  markLineFormatter?: () => string
  loading?: boolean
  onClick?: (params) => void
  yAxisScale?: boolean
}

const EchartsLineChart: React.FC<Props> = (props) => {
  const {
    loading,
    xData,
    yData,
    series,
    markLineFormatter,
    legend,
    dividing,
    showLegend = true,
    showUnit = true,
    seriesOption,
    xAxisName,
    yAxisName,
    yAxis,
    xAxis,
    tooltip,
    yAxisScale,
    ...other
  } = props
  const { option } = useEchartsOption<CustomChartOption.SplitLineChart>({
    type: dividing ? 'splitLine' : 'line',
    showLegend,
    showUnit,
    data: {
      xData: xData,
      yData: yData,
      series: series,
      dividing
    },
    seriesOption: {
      markLine: getMarkLine(props.markLineList, { markLineFormatter }),
      ...(seriesOption as any),
    },
    customOption: {
      legend,
      grid: { ...defaultGrid, ...props.grid },
      xAxis: xAxis ?? (xAxisName ? { name: xAxisName } : {}),
      yAxis: yAxis ?? (yAxisName ? { name: yAxisName, scale: yAxisScale } : { scale: yAxisScale }),
      tooltip,
    },
    ...other
  })

  const handleClick = (params) => {
    props.onClick?.(params)
  }

  return (
    <div className="echart-chart-container">
      {loading && <FullLoading />}
      <CommonEcharts option={option} onClick={handleClick} />
    </div>
  )
}

export default EchartsLineChart
