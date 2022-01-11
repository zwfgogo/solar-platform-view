import React, { useState, useMemo, useEffect, useRef } from 'react'
import moment from 'moment'
import { Button, notification } from 'wanke-gui'
import { isMicrogrid, isPvSystem, isStorageSystem, isTerminalSystem } from '../core/env'
import { useDispatch, useSelector } from 'umi'
import { globalNS } from '../pages/constants'
import { enumsApi } from '../services/global2'

export function useEnergyUnit() {
  const { selectedEnergyUnitId, energyUnitList = [] } = useSelector(state => state[globalNS])
  const target = selectedEnergyUnitId ? energyUnitList.find(item => item.id === selectedEnergyUnitId) : null

  return {
    selectedEnergyUnitId,
    selectEnergyUnit: target,
    energyUnitList,
  }
}

interface Props {
  showEnergyUnit?: any
}

export default function useEnergyUnitSelect(props: Props) {
  const { showEnergyUnit } = props
  const { selectedStationId, energyUnitList = [] } = useSelector(state => state[globalNS])
  const dispatch = useDispatch()

  const onEnergyUnitChange = (v) => {
    dispatch({ type: 'global/updateToView', payload: { selectedEnergyUnitId: v } })
  }

  const reset = () => {
    dispatch({
      type: 'global/updateToView',
      payload: {
        selectedEnergyUnitId: null,
        energyUnitList: [],
      }
    })
  }

  const fetchEnergyUnit = (stationId) => {
    enumsApi({
      resource: 'energyUnits',
      stationId,
      property: '*',
    }).then((data = []) => {
      let list = data.filter(item => item.type === 'Storage' && item.productionTime)
      if (typeof showEnergyUnit === 'function') {
        list = list.filter(showEnergyUnit)
      }

      const payload: any = { energyUnitList: list }

      if (list.length) {
        payload.selectedEnergyUnitId = list[0].id
      } else {
        payload.selectedEnergyUnitId = null
      }

      dispatch({ type: 'global/updateToView', payload })
    })
  }

  useEffect(() => {
    if (selectedStationId && showEnergyUnit) {
      fetchEnergyUnit(selectedStationId)
    } else {
      reset()
    }
  }, [selectedStationId, JSON.stringify(showEnergyUnit)])

  return {
    energyUnitList,
    onEnergyUnitChange,
  }
}
