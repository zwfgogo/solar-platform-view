import React, { useState, ReactElement, useEffect, useMemo } from 'react'
import { triggerEvent } from '../../../util/utils'
import { message } from 'antd'

interface ChartData {
  series: any[]
  xData: any[]
  yData: any[][]
}

interface ChildrenProps {
  treeData: any[]
  treeSelectVisible: boolean
  checkList: string[]
  chartData: ChartData
  toggleCheckList: (checkList: string[]) => void
}

interface Props {
  maxLength: number
  chartData: ChartData
  children: (props: ChildrenProps) => ReactElement<any, any>
}

const LimitChartCount: React.FC<Props> = ({ chartData = {}, maxLength, children }) => {
  const [treeData, setTreeData] = useState([])
  const [treeSelectVisible, setTreeSelectVisible] = useState(false)
  const [checkList, setCheckList] = useState([])

  const formatChartData = useMemo(() => {
    const { xData = [], yData = [], series = [] } = chartData
    const formatData = {
      xData,
      yData: [],
      series: []
    }
    checkList.forEach(key => {
      const index = Number(key)
      formatData.yData.push(yData[index])
      formatData.series.push(series[index])
    })
    return formatData
  }, [treeData, JSON.stringify(checkList)])

  const toggleCheckList = (checkList) => {
    if(checkList.length > maxLength) message.error("数据项最多勾选9个，已自动移除图表中首个数据项")
    setCheckList(checkList.slice(-maxLength))
  }
  
  useEffect(() => {
    const { series = [] } = chartData
    const newTreeData = series.map((item, index) => ({
      key: index,
      title: item.name
    }))

    setCheckList(newTreeData.slice(0, maxLength).map(item => item.key))
    setTreeData(newTreeData)
    setTreeSelectVisible(newTreeData.length > maxLength)
  }, [JSON.stringify(chartData)])

  useEffect(() => {
    // 用于图表重绘
    triggerEvent('resize', window)
  }, [treeSelectVisible])

  return children({ treeData, treeSelectVisible, toggleCheckList, checkList, chartData: formatChartData })
}

export default LimitChartCount
