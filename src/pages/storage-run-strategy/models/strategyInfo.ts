import {makeModel} from '../../umi.helper'
import {Socket_Port, storage_run_strategy_info} from '../../constants'
import { fetchCurrentControlParams, fetchEnergyUnits, fetchLocalControlParams, fetchPlanControlParams, fetchStrategyRunDateList, fetchStrategyRunDates, postPlanControlParams } from '../run-strategy.service'
import { TrackingChartType } from '../strategy.constant'
import { message } from 'wanke-gui'

export class RunStrategyInfoModel {
  runDateList = []
  runDates = []
  energyUnitList = []
  selectEnergyUnitId = null
  c07CurrentControlParam = {}
  c07PlanControlParam = {}
  c19CurrentControlParam = []
  c19PlanControlParam = []
}

export default makeModel(storage_run_strategy_info, new RunStrategyInfoModel(), (updateState, updateQuery, getState) => {
  return {
    * fetchStrategyRunDateList(action, {put, call}) {
      let data = yield call(fetchStrategyRunDateList, action.payload)
      yield updateState(put, {
        runDateList: data || []
      })
    },
    * fetchStrategyRunDates(action, {put, call}) {
      let data = yield call(fetchStrategyRunDates, action.payload)
      yield updateState(put, {
        runDates: data || []
      })
    },
    * fetchEnergyUnitList(action, {put, call}) {
      const { stationId, runStrategyId } = action.payload
      let options = yield call(fetchEnergyUnits, {
        stationId,
        activity: true,
        runStrategyId
      })
      let selectEnergyUnitId = null
      if (options.length) {
        selectEnergyUnitId = options[0].value
      }
      yield updateState(put, {
        energyUnitList: options,
        selectEnergyUnitId
      })
      return options
    },
    // ------------------ c07 ----------------
    * fetchC07CurrentControlParams(action, {put, call}) {
      const { stationId, runStrategyId } = action.payload
      let c07CurrentControlParam = yield call(fetchCurrentControlParams, {
        stationId,
        runStrategyId,
        runStrategyType: TrackingChartType.C07
      })
      yield updateState(put, {
        c07CurrentControlParam: c07CurrentControlParam || {}
      })
    },
    * fetchC07PlanControlParams(action, {put, call}) {
      const { stationId, runStrategyId } = action.payload
      let c07PlanControlParam = yield call(fetchPlanControlParams, {
        stationId,
        runStrategyId,
        runStrategyType: TrackingChartType.C07
      })
      yield updateState(put, {
        c07PlanControlParam: c07PlanControlParam || {}
      })
    },
    * postC07PlanControlParams(action, {put, call}) {
      const { stationId, runStrategyId, data } = action.payload
      yield call(postPlanControlParams, {
        stationId,
        runStrategyId,
        runStrategyType: TrackingChartType.C07,
        data
      })
      message.success('操作成功')
      yield put({
        type: "fetchC07PlanControlParams",
        payload: {
          stationId,
          runStrategyId,
        }
      })
    },
    * fetchC07LocalControlParams(action, {put, call}) {
      const { stationId, runStrategyId } = action.payload
      let data = yield call(fetchLocalControlParams, {
        stationId,
        runStrategyId,
      })
      return data || {}
    },
    // ---------------------------------------
    // ---------------- c19 ------------------
    * fetchC19CurrentControlParams(action, {put, call}) {
      const { stationId, runStrategyId } = action.payload
      let c19CurrentControlParam = yield call(fetchCurrentControlParams, {
        stationId,
        runStrategyId,
        runStrategyType: TrackingChartType.C19
      })
      c19CurrentControlParam = c19CurrentControlParam.filter(item => item.enable !== false)
      yield updateState(put, {
        c19CurrentControlParam: (c19CurrentControlParam || []).map((item, index) => ({ num: index + 1, ...item }))
      })
    },
    * fetchC19PlanControlParams(action, {put, call}) {
      const { stationId, runStrategyId } = action.payload
      let c19PlanControlParam = yield call(fetchPlanControlParams, {
        stationId,
        runStrategyId,
        runStrategyType: TrackingChartType.C19
      })
      c19PlanControlParam = c19PlanControlParam.filter(item => item.enable !== false)
      yield updateState(put, {
        c19PlanControlParam: c19PlanControlParam || []
      })
    },
    * postC19PlanControlParams(action, {put, call}) {
      const { stationId, runStrategyId, data } = action.payload
      yield call(postPlanControlParams, {
        stationId,
        runStrategyId,
        data,
        runStrategyType: TrackingChartType.C19
      })
      message.success('操作成功')
      yield put({
        type: "fetchC19PlanControlParams",
        payload: {
          stationId,
          runStrategyId,
        }
      })
    },
    // ---------------------------------------
  }
})
