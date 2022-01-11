import {UnitType} from './models/update'
import {ValueName} from '../../interfaces/CommonInterface'

import utils from '../../public/js/utils'

export function handleTime(times) {
  if (!times) {
    return []
  }
  return times.map(item => {
    return {
      start: item[0],
      end: item[1]
    }
  })
}

export function convertTime(times) {
  if (!times) {
    return []
  }
  return times.map(item => {
    return [item.start, item.end]
  })
}

export function convertUnitEnergy(units: UnitType[], modeList: ValueName[]) {
  let list = []
  for (let unit of units) {
    let modeId = unit.mode
    let months = []
    if (isAuto(modeId, modeList)) {
      months = unit.autoItems
    } else {
      months = unit.manualItems
    }
    for (let month of months) {
      list.push({
        id: month.id,
        energyUnitId: unit.unitId,
        runMonth: month.months.join(','),
        chargeDischargeParam: {
          maxChargePower: month.maxCharge,
          maxDischargePower: month.maxDisCharge,
          chargeVoltage: month.chargeV,
          dischargeCurrent: month.dischargeA,
          runStrategyControlType: {
            id: month.chargeDischargeType
          }
        },
        endControlParam: {
          maxSoc: month.socMax,
          minSoc: month.socMin,
          chargeRateLimit: month.chargeRateLimit,
          dischargeEndVoltage: month.dischargeEndVoltage
        },
        antiBackfeedSet: month.maxDischargeRate,
        standbyTime: month.backupMinutes,
        runStrategyControlMode: {
          id: unit.mode
        },
        chargeTimes: convertTime(month.chargeTimes),
        dischargeTimes: convertTime(month.dischargeTimes),
        storageTimes: convertTime(month.backupTimes)
      })
    }
  }
  return list
}

export function convertServerEnergyItem(detail, unitId, modeList) {
  let unitList = detail.runStrategyDetails.filter(item => item.energyUnitId == unitId)
  if (unitList.length == 0) {
    return {
      unitId,
      mode: getAutoId(modeList),
      autoItems: [],
      manualItems: []
    }
  }
  let modeId = unitList[0].runStrategyControlMode && unitList[0].runStrategyControlMode.id
  let autoItems = [], manualItems = []
  let r: UnitType = {
    mode: modeId,
    unitId,
    autoItems,
    manualItems
  }

  unitList.forEach(unit => {
    let chargeDischargeParam = unit.chargeDischargeParam || {}
    let endControlParam = unit.endControlParam || {}
    let runStrategyControlType = chargeDischargeParam.runStrategyControlType || {}
    let item = {
      id: unit.id,
      months: unit.runMonth.split(',').map(item => parseInt(item)),
      chargeDischargeType: runStrategyControlType && runStrategyControlType.id,
      maxCharge: chargeDischargeParam.maxChargePower,
      maxDisCharge: chargeDischargeParam.maxDischargePower,
      chargeV: chargeDischargeParam.chargeVoltage,
      dischargeA: chargeDischargeParam.dischargeCurrent,
      socMax: endControlParam.maxSoc,
      socMin: endControlParam.minSoc,
      chargeRateLimit: endControlParam.chargeRateLimit,
      dischargeEndVoltage: endControlParam.dischargeEndVoltage,
      backupMinutes: unit.standbyTime,
      maxDischargeRate: unit.antiBackfeedSet,

      chargeTimes: handleTime(unit.chargeTimes),
      dischargeTimes: handleTime(unit.dischargeTimes),
      backupTimes: handleTime(unit.storageTimes)
    }
    let modeId1 = unit.runStrategyControlMode && unit.runStrategyControlMode.id
    if (isAuto(modeId1, modeList)) {
      autoItems.push(item)
    } else {
      manualItems.push(item)
    }
  })
  return r
}

export function useEnergyTemplate(unitList) {
  return unitList.map(unit => {
    let chargeDischargeParam = unit.chargeDischargeParam || {}
    let endControlParam = unit.endControlParam || {}
    let runStrategyControlType = chargeDischargeParam.runStrategyControlType || {}
    return {
      months: unit.runMonth.split(',').map(item => parseInt(item)),
      chargeDischargeType: runStrategyControlType && runStrategyControlType.id,
      maxCharge: chargeDischargeParam.maxChargePower,
      maxDisCharge: chargeDischargeParam.maxDischargePower,
      chargeV: chargeDischargeParam.chargeVoltage,
      dischargeA: chargeDischargeParam.dischargeCurrent,
      socMax: endControlParam.maxSoc,
      socMin: endControlParam.minSoc,
      chargeRateLimit: endControlParam.chargeRateLimit,
      dischargeEndVoltage: endControlParam.dischargeEndVoltage,
      backupMinutes: unit.standbyTime,
      maxDischargeRate: unit.antiBackfeedSet,

      chargeTimes: handleTime(unit.chargeTimes),
      dischargeTimes: handleTime(unit.dischargeTimes),
      backupTimes: handleTime(unit.storageTimes)
    }
  })
}

export function isManual(item) {
  return item && (item.name == 'Manual' || item.name == utils.intl('手动模式'))
}

export function isAuto(id, modeList) {
  let match = modeList.find(item => item.value == id)
  if (match) {
    return match.name == 'Auto' || match.name == utils.intl('自动模式')
  }
  console.log('没有匹配到对应模式')
}

export function getAutoId(list) {
  return list[0].value
}

export function isType1(current, list) {
  let item = list.find(d => d.value == current)
  return item && item.name == utils.intl('功率控制')
}
