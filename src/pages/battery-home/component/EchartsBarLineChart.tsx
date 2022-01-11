/**
 * 柱状图和折线图并存
 */
import React, { useEffect, useState, useMemo } from 'react'
import { FullLoading } from 'wanke-gui'
import '../../../components/charts/echarts-line-chart.less'
import { LineChartProps } from '../../../components/charts/common-echarts/calcOption/lineType'
import CommonEcharts from '../../../components/charts/common-echarts/CommonEcharts';

const defaultGrid = {
  left: "40",
  right: "16",
  top: "40",
  bottom: "36"
};

interface Props extends Omit<LineChartProps, 'customOption' | 'data' | 'type'> {
  xData: string[]
  yData: number[][]
  series: { name: string, unit: string, type: 'bar' | 'line' }[],
  theme?: 'light' | 'dark',
  grid?: any
  legend?: any
  loading?: boolean
}

const EchartsBarLineChart: React.FC<Props> = (props) => {
  const {
    loading,
    xData,
    yData,
    series,
    theme = 'dark',
    grid = {},
    colorList
  } = props

  const units = Array.from(new Set(series.map(item => item.unit)));

  const option: any = useMemo(() => {
    return series.length ? {
      tooltip: {
        "trigger": "axis",
        "axisPointer": {
          "type": "line",
          "lineStyle": {
            "type": "dashed"
          }
        },
        formatter: (params) => {
          return `<div>
          ${
            params.map((item, index) => `${item.marker}${item.name}:<span style="margin-left: 16px">${item.value}${series[index].unit}</span>`).join('<br/>')
          }
          </div>`
        },
        textStyle: {
          color: 'rgba(255,255,255,0.85)',
        },
        "borderWidth": 0,
        "appendToBody": true,
        "backgroundColor": "rgba(0, 0, 0, 0.5)",
        "extraCssText": "box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.5);color: #ffffff"
      },
      grid: {
        ...defaultGrid,
        ...grid
      },
      legend: {
        "data": series.map(i => i.name),
        "right": "10px",
        "top": "8px",
        "textStyle": {
          "color": "#fff"
        },
        "pageIconColor": "#aaa",
        "pageIconInactiveColor": "#2f4554",
        "pageTextStyle": {
          "color": "#fff"
        }
      },
      color: colorList,
      xAxis: [
        {
          type: 'category',
          data: (xData ?? []).map(i => i.length > 6 ? `${i.substr(0, 6)}...` : i),
          axisLine: {
            show: true,
            lineStyle: {
              color: 'rgba(255,255,255,0.25)'
            }
          },
          axisTick: { show: false },
          spiitLine: {
            show: true,
            lineStyle: {
              show: true,
              color: "#2a2b2d",
              type: "dotted"
            }
          },
        },
      ],
      yAxis: units.map(i => ({
        type: 'value',
        name: i,
        axisLabel: {
          "show": true
        },
        axisLine: {
          show: true,
          lineStyle: {
            "show": true,
            "lineStyle": {
              "color": "rgba(255,255,255,0.25)"
            }
          },
        },
        "splitLine": {
          "lineStyle": {
            "color": "#2a2b2d",
            "type": "dotted"
          }
        },
        "splitNumber": 5
      })),
      series: series.map((i, index) => ({
        name: i.name,
        type: i.type ?? 'bar',
        yAxisIndex: units.findIndex(unit => i.unit === unit),
        ...(i.type === 'line' ? { symbol: "circle" } : {}),
        data: yData[index] ?? []
      }))
    }
      : {}
  }, [JSON.stringify(series), JSON.stringify(xData), JSON.stringify(yData)])

  return (
    <div className="echart-chart-container">
      {loading && <FullLoading />}
      <CommonEcharts option={option} />
    </div>
  )
}

export default EchartsBarLineChart
