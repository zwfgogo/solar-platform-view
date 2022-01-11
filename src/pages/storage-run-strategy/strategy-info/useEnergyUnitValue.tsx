import { Moment } from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import utils from '../../../public/js/utils'
import { copy } from '../../../util/utils'
import { Socket_Port } from '../../constants'
import SocketHelper from '../../socket.helper'
import { analogsTypeTitleMap, analogsTypeUnitMap, AnalogTypeName, C19StrategyControlType, StatisticAnalogTypeNameByTypeMap, TrackingChartType, TrackingSocketSubject } from '../strategy.constant'

interface EnergyUnit {
  id: any
  type: C19StrategyControlType
}

interface Props {
  energyUnits: EnergyUnit[]
}

function useEnergyUnitValue(props: Props) {
  const { energyUnits } = props
  const socketRef = useRef<SocketHelper>()
  const dataRef = useRef<any>({})
  const [, forceUpdate] = useState({})

  // 获取数据
  const fetchInfoSocket = (result) => {
    const { results } = result
    Object.keys(results).map(key => {
      dataRef.current[key] = results[key]
    })
    forceUpdate({})
  }

  const sendToFetchData = (energyUnits) => {
    if (socketRef.current) {
      resetInfo()
      socketRef.current.emit('energyUnitValue', {
        energyUnits: energyUnits
      })
    } else {
      initSocket(energyUnits)
    }
  }
  
  // 日期变化
  useEffect(() => {
    if (energyUnits.length) {
      sendToFetchData(energyUnits)
    }
  }, [JSON.stringify(energyUnits)])

  // 初始化数据
  const resetInfo = () => {
    dataRef.current = {}
    forceUpdate({})
  }

  // 初始化socket
  const initSocket = (energyUnits) => {
    socketRef.current = new SocketHelper('tracking-chart', Socket_Port, '/run-strategy', { forceNew: true })
    socketRef.current.start(null, {}, {
      'energyUnitValue': fetchInfoSocket,
      'connect': () => {
        socketRef.current.emit('energyUnitValue', {
          energyUnits: energyUnits
        })
      },
      'reconnect': (e) => {
        resetInfo()
      }
    })
  }

  useEffect(() => {
    return () => {
      socketRef.current?.close?.()
    }
  }, [])

  return {
    data: dataRef.current
  }
}

export default useEnergyUnitValue
