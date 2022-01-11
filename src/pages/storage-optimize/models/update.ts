import { getAction, makeModel } from '../../umi.helper'
import { optimize_running_update } from '../../constants'
import {
  addStrategy,
  addTemplate,
  checkPointData,
  checkPrice,
  checkStrategy,
  curve, fetchQrCode, fetchScanResult,
  fetchStrategyDetail,
  fetchTemplateList,
  sendStrategy,
  updateStrategy
} from '../optimize.service'
import { message } from 'wanke-gui'
import { enumsApi } from '../../../services/global2'
import { convertServerEnergyItem, convertUnitEnergy, getAutoId, isAuto, useEnergyTemplate } from '../optimize.helper'
import { copy } from '../../../util/utils'
import moment, { Moment } from 'moment'

export class TimeItem {
  start = null
  end = null
}

export interface AutoMonthItemType {
  months: number[]
  chargeDischargeType: number
  maxCharge: number
  maxDisCharge: number
  chargeV: number
  dischargeA: number
  socMax: number
  socMin: number
  chargeRateLimit: number
  dischargeEndVoltage: number
  backupMinutes: number
  maxDischargeRate: number
}

export interface ManualMonthItemType extends AutoMonthItemType {
  chargeTimes: { start: string, end: string }[]
  dischargeTimes: { start: string, end: string }[]
  backupTimes: { start: string, end: string }[]
}

export interface UnitType {
  mode: number
  unitId: number
  autoItems: AutoMonthItemType[]
  manualItems: ManualMonthItemType[]
}

export class MonthItem {
  id = null
  months = []
  chargeDischargeType = null
  maxCharge = null
  maxDisCharge = null
  chargeV = null
  dischargeA = null
  socMax = null
  socMin = null
  chargeRateLimit = null
  dischargeEndVoltage = null
  backupMinutes = null
  maxDischargeRate = null
  chargeTimes = [{start: null, end: null}]
  dischargeTimes = [{start: null, end: null}]
  backupTimes = [{start: null, end: null}]
}

export class OptimizeRunningUpdateModel {
  updateMode = ''
  touched = false
  modeList = []
  typeList = []
  isPreview = false
  canSendStrategy = true
  energyUnitList = []
  activeKey = 0
  showTemplateList = false
  showAddTemplate = false
  showCheckResult = false
  showSendResult = false
  expandList = []
  strategyId = null
  strategyName = ''
  units: UnitType[] = []
  templateCount = 0
  templateQuery = {
    page: 1,
    size: 20,
    queryStr: ''
  }
  templateList = []
  curveList = []

  addTemplateName = ''
  addTemplateDesc = ''

  step1Success = 0
  step2Success = 0
  step3Success = 0
  checkSuccessTime: Moment = null

  showScanQrCode = false
  qrCode = null
  uniqueId = null
  scanPhase = 0
  scanResult = {}
}

export default makeModel(optimize_running_update, new OptimizeRunningUpdateModel(), (updateState, updateQuery, getState) => {
  return {
    * fetchQrCode(action, {put, call}) {
      let {img, uniqueId} = yield call(fetchQrCode, {stationId: action.payload.stationId})
      yield updateState(put, {qrCode: img, uniqueId, scanPhase: 1})
    },
    * fetchScanResult(action, {put, call, select}) {
      const {stationId,res} = action.payload
      // const {uniqueId} = yield getState(select)
      // if (!uniqueId) {
      //   return
      // }
      // console.log(res)
      // const result = yield call(fetchScanResult, {uniqueId, stationId})
      yield updateState(put, {scanResult: res})
      if (res && res.firstUserId && res.firstAgree && res.secondUserId && res.secondAgree) {
        message.info('策略下发中')
        yield updateState(put, {scanPhase: 2, qrCode: null, showScanQrCode: false})
        yield put({type: 'send', payload: {stationId}})
      }
    },
    * fetchType(action, {put, call, select}) {
      let data = yield call(enumsApi, {resource: 'runStrategyControlTypes'})
      yield updateState(put, {typeList: data})
    },
    * fetchStrategyDetail(action, {call, put, select}) {
      const {stationId} = action.payload
      let modeList = yield call(enumsApi, {resource: 'runStrategyControlModes'})
      yield updateState(put, {modeList})
      let result = yield call(fetchStrategyDetail, {stationId})
      let options = yield call(enumsApi, {resource: 'energyUnits', stationId, hasAccessory: false, activity: true, energyUnitTypeName: 'Storage'})
      yield updateState(put, {energyUnitList: options})
      if (result[0]) {
        let detail = result[0]
        yield updateState(put, {
          updateMode: 'edit',
          strategyName: detail.title,
          strategyId: detail.id,
          units: options.map(item => {
            return convertServerEnergyItem(detail, item.value, modeList)
          })
        })
      } else {
        yield updateState(put, {
          updateMode: 'add',
          strategyName: '',
          strategyId: null,
          units: options.map(item => {
            return {
              mode: getAutoId(modeList), // 默认自动模式
              unitId: item.value,
              autoItems: [],
              manualItems: []
            }
          })
        })
      }
    },
    * fetchTemplateList(action, {call, put, select}) {
      const {templateQuery, units, activeKey}: OptimizeRunningUpdateModel = yield getState(select)
      let mode = units[activeKey].mode
      const {results, totalCount} = yield call(fetchTemplateList,
        {
          runStrategyControlModeId: mode,
          ...templateQuery
        })
      yield updateState(put, {templateList: results, templateCount: totalCount})
    },
    * addTemplate(action, {call, put, select}) {
      const {stationId} = action.payload
      const {addTemplateName, addTemplateDesc, units, activeKey, modeList}: OptimizeRunningUpdateModel = yield getState(select)
      yield call(addTemplate, {
        stationId,
        title: addTemplateName,
        description: addTemplateDesc,
        runStrategyControlModeId: units[activeKey].mode,
        runStrategyTemplateDetails: convertUnitEnergy([units[activeKey]], modeList)
      })
      message.success('添加模板成功')
      yield updateState(put, {showAddTemplate: false})
    },
    * useTemplate(action, {call, put, select}) {
      const {templateInfo} = action.payload
      const {units, activeKey, modeList}: OptimizeRunningUpdateModel = yield getState(select)
      let unitsCopy = copy(units)
      if (isAuto(unitsCopy[activeKey].mode, modeList)) {
        unitsCopy[activeKey].autoItems = useEnergyTemplate(templateInfo)
      } else {
        unitsCopy[activeKey].manualItems = useEnergyTemplate(templateInfo)
      }
      yield updateState(put, {units: unitsCopy, showTemplateList: false})
    },
    * updateStrategy(action, {call, put, select}) {
      const {stationId, needCheckStrategy} = action.payload
      const {updateMode, strategyId, strategyName, units, modeList}: OptimizeRunningUpdateModel = yield getState(select)
      if (updateMode == 'edit') {
        yield call(updateStrategy, {
          id: strategyId,
          title: strategyName,
          runStrategyDetails: convertUnitEnergy(units, modeList)
        })
      } else {
        yield call(addStrategy, {
          stationId,
          title: strategyName,
          runStrategyDetails: convertUnitEnergy(units, modeList)
        })
      }
      if (needCheckStrategy) {
        try {
          yield put(getAction(null, 'checkStrategy', {stationId}))
        } catch (e) {
          //校验失败
        }
      }
      message.success('更新成功')
      yield updateState(put, {isPreview: true})
      yield put(getAction(null, 'fetchCurve', {stationId}))
    },
    * checkStrategy(action, {put, call}) {
      const {stationId} = action.payload
      yield updateState(put, {showCheckResult: true, step1Success: 0, step2Success: 0, step3Success: 0})

      let result1 = false, result2 = false, result3 = false
      result1 = yield call(checkStrategy, {stationId})
      yield updateState(put, {step1Success: result1 ? 1 : 2})
      if (result1) {
        result2 = yield call(checkPrice, {stationId})
        yield updateState(put, {step2Success: result2 ? 1 : 2})
        if (result2) {
          result3 = yield call(checkPointData, {stationId})
          yield updateState(put, {step3Success: result3 ? 1 : 2, checkSuccessTime: moment()})
        }
      }
      if (result3 != true) {
        throw new Error('check failure')
      }
    },
    * send(action, {call, put, select}) {
      const {stationId} = action.payload
      const {checkSuccessTime}: OptimizeRunningUpdateModel = yield getState(select)
      if (checkSuccessTime) {
        if (moment().isAfter(checkSuccessTime.add(5, 'minute'))) {
          yield put.resolve(getAction(null, 'checkStrategy', {stationId}))
        }
      }
      try {
        yield call(sendStrategy, {stationId})
        message.success('下发成功')
      } catch (e) {
        yield updateState(put, {showSendResult: true})
      }
    },
    * fetchCurve(action, {call, put, select}) {
      const {strategyId, activeKey, units}: OptimizeRunningUpdateModel = yield getState(select)

      const {stationId} = action.payload
      let data = yield call(curve, {stationId, strategyId, energyUnitId: units[activeKey].unitId})
      if (data.errorCode == 0) {
        yield updateState(put, {curveList: data.results})
      } else {
        yield updateState(put, {curveList: []})
      }
    }
  }
})
