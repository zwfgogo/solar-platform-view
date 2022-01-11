import { Moment } from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import utils from '../../../public/js/utils'
import { copy } from '../../../util/utils'
import { Socket_Port } from '../../constants'
import SocketHelper from '../../socket.helper'
import { analogsTypeTitleMap, analogsTypeUnitMap, AnalogTypeName, StatisticAnalogTypeNameByTypeMap, TrackingChartType, TrackingSocketSubject } from '../strategy.constant'

function getInitChartInfo() {
  return {
    xData: [],
    yData: [],
    series: [],
    runDateMap: {},
  }
}

function getInitDataInfo(type: TrackingChartType) {
  const info = {
    [TrackingChartType.C01]: { charge: null, discharge: null },
    [TrackingChartType.C05]: {},
    [TrackingChartType.C06]: {},
    [TrackingChartType.C07]: {},
    [TrackingChartType.C19]: {},
  }

  return info[type] || {}
}

interface Props {
  type: TrackingChartType
  time: string
  stationId: number
  socketParams?: any
  mode?: 'auto' | 'manual' // 手动控制还是自动根据入参调用接口
}

function useTrackingChart(props: Props) {
  const { type, time, stationId, mode = 'auto', socketParams = {} } = props
  const socketRef = useRef<SocketHelper>()
  const chartInfoRef = useRef(getInitChartInfo())
  const dataInfoRef = useRef<any>(getInitDataInfo(type))
  const _cacheDataRef = useRef({})
  const [, forceUpdate] = useState({})
  const [socketLoading, setSocketLoading] = useState(false)
  const socketEvent: any = TrackingSocketSubject[type] || {}
  const isAuto = mode === 'auto'

  // 获取图表数据
  const fetchChartSocket = (result) => {
    const { results } = result
    mergeChartInfo(chartInfoRef.current, results, type, _cacheDataRef, dataInfoRef.current)
    forceUpdate({})
  }

  /**
   * 获取统计数据
   * @param result { [attr]: number }
   */
  const fetchDataSocket = (result) => {
    const { results } = result
    Object.keys(results).forEach(key => {
      // dataInfoRef.current[key] = addValue(dataInfoRef.current[key], results[key])
      dataInfoRef.current[key] = results[key] ?? 0
    })
    forceUpdate({})
  }

  const sendToFetchData = (stationId, time, otherParams = {}) => {
    if (socketRef.current) {
      resetInfo()
      if (socketEvent.chart) {
        socketRef.current.emit(socketEvent.chart, {
          stationId,
          date: time,
          frequency: 'original',
          ...otherParams
        })
      }
      const typeName = StatisticAnalogTypeNameByTypeMap[type]?.join(",")
      if (socketEvent.data && typeName) {
        socketRef.current.emit(socketEvent.data, {
          stationId,
          date: time,
          ...otherParams,
          typeName,
        })
      }
    } else {
      initSocket(stationId, time, otherParams)
    }
  }
  
  // 日期变化
  useEffect(() => {
    if (type && isAuto) {
      sendToFetchData(stationId, time, socketParams)
    }
  }, [time, type, JSON.stringify(socketParams)])

  // 初始化数据
  const resetInfo = () => {
    chartInfoRef.current = getInitChartInfo()
    dataInfoRef.current = getInitDataInfo(type)
    _cacheDataRef.current = {}
    forceUpdate({})
  }

  // 初始化socket
  const initSocket = (stationId, time, otherParams = {}) => {
    socketRef.current = new SocketHelper('tracking-chart', Socket_Port, '/run-strategy', { forceNew: true })
    socketRef.current.start(null, {}, {
      [socketEvent.chart]: fetchChartSocket,
      [socketEvent.data]: fetchDataSocket,
      'connect': () => {
        if (socketEvent.chart) {
          socketRef.current.emit(socketEvent.chart, {
            stationId,
            date: time,
            frequency: 'original',
            ...socketParams,
            ...otherParams
          })
        }
        const typeName = StatisticAnalogTypeNameByTypeMap[type]?.join(",")
        if (socketEvent.data && typeName) {
          socketRef.current.emit(socketEvent.data, {
            stationId,
            date: time,
            ...socketParams,
            ...otherParams,
            typeName,
          })
        }
      },
      'reconnect': (e) => {
        resetInfo()
      },
      'socketLoadingChange': (socketLoading) => {
        setSocketLoading(socketEvent.chart && socketLoading[socketEvent.chart])
      }
    })
  }

  useEffect(() => {
    return () => {
      socketRef.current?.close?.()
    }
  }, [])

  return {
    chartInfo: chartInfoRef.current,
    dataInfo: dataInfoRef.current,
    sendToFetchData,
    socketLoading,
  }
}

export default useTrackingChart

function addValue(val, targetVal) {
  if (val === null || val === undefined) return targetVal
  return val + targetVal ?? 0
}

function mergeChartInfo(chartInfo, results, type, _cacheDataRef, dataInfo) {
  switch (type) {
    case TrackingChartType.C01: {
      let { powerList = [], units = [] } = _cacheDataRef.current
      powerList = copy(powerList)
      units = results.units || units

      units.forEach(unit => {
        let match = powerList.find(item => item.unitId == unit.id)
        if (!match) {
          powerList.push({
            unitId: unit.id,
            xData: [],
            yData: [],
            series: {name: (unit.title || '') + utils.intl('有功功率'), unit: 'kW'}
          })
        }
      })

      results.power.forEach(powerItem => {
        let match = powerList.find(item => item.unitId == powerItem.unitId)
        let matchUnit = units.find(item => item.id == powerItem.unitId)
        if (!match) {
          match = {
            unitId: powerItem.unitId,
            xData: [],
            yData: [],
            series: {name: (matchUnit?.title || '') + utils.intl('有功功率'), unit: 'kW'}
          }
          powerList.push(match)
        }
        match.xData.push(powerItem.dtime)
        match.yData.push(powerItem.val)
      })

      _cacheDataRef.current = { powerList, units }

      chartInfo.xData = powerList.map(item => item.xData)
      chartInfo.yData = powerList.map(item => item.yData)
      chartInfo.series = powerList.map(item => item.series)
      break;
    }
    case TrackingChartType.C05:
    case TrackingChartType.C06: {
      formatChart(chartInfo, results, _cacheDataRef, false)
      break;
    }
    case TrackingChartType.C07: {
      formatChart(chartInfo, results, _cacheDataRef, true)
      formatData(dataInfo, results, _cacheDataRef)
      break;
    }
    case TrackingChartType.C19: {
      formatChart(chartInfo, results, _cacheDataRef, true)
      break;
    }
    default: {
      break;
    }
  }
}

const formatChart = (chartInfo, results, _cacheDataRef, showEnergyUnitName = true) => {
  let { dataList = [], units = [] } = _cacheDataRef.current
  dataList = copy(dataList)
  units = results.units || units
  let runDateMap = results.runDateMap || {}

  units.forEach(unit => {
    const typeName = unit.typeName
    let match = dataList.find(item => item.unitId == unit.id && item.typeName == typeName)
    let matchUnit = units.find(item => item.id == unit.id && item.typeName == typeName)
    let name = analogsTypeTitleMap[typeName]
    if (typeName === AnalogTypeName.ActivePower) {
      name = utils.intl('strategy.储能功率')
    }

    if (showEnergyUnitName) {
      name = (matchUnit?.title || '') + name
    }

    if (!match) {
      dataList.push({
        typeName,
        unitId: unit.id,
        xData: [],
        yData: [],
        series: {
          name: name,
          unit: analogsTypeUnitMap[typeName]
        }
      })
    }
  })

  results.dataList.forEach(dataItem => {
    let match = dataList.find(item => item.unitId == dataItem.unitId && item.typeName == dataItem.typeName)
    let matchUnit = units.find(item => item.id == dataItem.unitId && item.typeName == dataItem.typeName)

    if (!match) {
      const typeName = dataItem.typeName
      let name = analogsTypeTitleMap[typeName]
      if (typeName === AnalogTypeName.ActivePower) {
        name = utils.intl('strategy.储能功率')
      }
  
      if (showEnergyUnitName) {
        name = (matchUnit?.title || '') + name
      }

      match = {
        typeName,
        unitId: dataItem.unitId,
        xData: [],
        yData: [],
        series: {
          name: name,
          unit: analogsTypeUnitMap[typeName]
        }
      }
      dataList.push(match)
    }
    match.xData.push(dataItem.dtime)
    match.yData.push(dataItem.val)
  })

  _cacheDataRef.current = { dataList, units }

  chartInfo.xData = dataList.map(item => item.xData)
  chartInfo.yData = dataList.map(item => item.yData)
  chartInfo.series = dataList.map(item => item.series)
  chartInfo.runDateMap = runDateMap
}

export function getCalcName(str) {
  return `${str}-calc`
}

export const C07CalcPName = getCalcName(AnalogTypeName.PositiveReactiveEnergyIndication)
export const C07CalcRName = getCalcName(AnalogTypeName.ReverseReactiveEnergyIndication)
// 计算C07的累计无功
const formatData = (dataInfo, results, _cacheDataRef) => {
  let { lastPoint } = _cacheDataRef.current
  let pNum = dataInfo[C07CalcPName] || 0
  let rNum = dataInfo[C07CalcRName] || 0
  const dataList = results.dataList
  const len = dataList.length
  if (len === 0) return
  let curI = 0
  for (;curI < len;curI++) {
    const target = dataList[curI]
    if (lastPoint) {
      const res = calcArea(lastPoint, target)
      if (res > 0) {
        pNum += res
      } else {
        rNum += Math.abs(res)
      }
    }

    if (target.flag !== 1) {
      lastPoint = dataList[curI]
    } else {
      lastPoint = null
    }
  }

  dataInfo[C07CalcPName] = pNum
  dataInfo[C07CalcRName] = rNum
  _cacheDataRef.current.lastPoint = lastPoint
}

function calcArea(cur, next) {
  const curDate = new Date(cur.dtime)
  const nextDate = new Date(next.dtime)
  const time = nextDate.getTime() - curDate.getTime()
  const hours = parseInt((time / 1000).toFixed(0)) / 60 / 60

  const isSame = (cur.originVal * next.originVal) > 0
  let result = 0
  if (isSame) {
    result = ((cur.originVal || 0) + (next.originVal || 0)) * hours / 2
  } else {
    result = (cur.originVal || 0) * hours
  }

  return result
}
