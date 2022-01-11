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
  series: { name: string, unit: string, type?: string }[]
  dividing?: string[]
  grid?: any
  legend?: any
  loading?: boolean
  onClick?: (params) => void
}

const EchartsBarChart: React.FC<Props> = (props) => {
  const {
    loading,
    xData,
    yData,
    series,
    legend,
    dividing,
    showLegend = true,
    showUnit = true,
    seriesOption,
    ...other
  } = props
  const { option } = useEchartsOption<CustomChartOption.SplitLineChart>({
    type: dividing ? 'splitBar' : 'bar',
    showLegend,
    showUnit,
    data: {
      xData: xData,
      yData: yData,
      series: series.map((item, index) => ({ ...item, type: item.type || 'bar' })),
      dividing
    },
    seriesOption: {
      ...(seriesOption as any),
    },
    customOption: {
      legend,
      grid: { ...defaultGrid, ...props.grid }
    },
    ...other,
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

export default EchartsBarChart
