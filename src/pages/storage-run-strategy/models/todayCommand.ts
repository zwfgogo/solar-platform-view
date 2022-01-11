import {makeModel} from '../../umi.helper'
import {Socket_Port, storage_today_command} from '../../constants'
import { fetchCommonTodayCommandList, fetchEnergyUnits } from '../run-strategy.service'
import { fetchCommandTypeOption, fetchControlTypeOption, fetchEndControlOption, fetchTodayCommandList } from '../services/c01.services'

export class TodayCommandModel {
  // ----- c01 --------
  energyUnitList = []
  commandTypeOptions = []
  controlTypeOptions = []
  endControlOptions = []
  todayCommandList = []
  // ------------------

  // ----- c07 --------
  c07CommandList = []
  // ------------------
}

export default makeModel(storage_today_command, new TodayCommandModel(), (updateState, updateQuery, getState) => {
  return {
    // ------------- c01 -----------------
    * fetchEnergyUnitList(action, {put, call}) {
      const {stationId, runStrategyId} = action.payload
      let options = yield call(fetchEnergyUnits, {
        stationId,
        activity: true,
        runStrategyId
      })
      yield updateState(put, {
        energyUnitList: options
      })
    },
    * fetchCommandTypeOptions(action, {put, call}) {
      let options = yield call(fetchCommandTypeOption)
      yield updateState(put, {
        commandTypeOptions: options
      })
    },
    * fetchControlTypeOptions(action, {put, call}) {
      let options = yield call(fetchControlTypeOption)
      yield updateState(put, {
        controlTypeOptions: options
      })
    },
    * fetchEndControlTypeOptions(action, {put, call}) {
      let options = yield call(fetchEndControlOption)
      yield updateState(put, {
        endControlOptions: options
      })
    },
    * fetchTodayCommandList(action, {put, call}) {
      let data = yield call(fetchTodayCommandList, action.payload)
      yield updateState(put, {
        todayCommandList: data
      })
    },
    // -----------------------------------

    // -------------- c07 ----------------
    * fetchC07TodayCommandList(action, {put, call}) {
      let data = yield call(fetchCommonTodayCommandList, action.payload)
      yield updateState(put, {
        c07CommandList: data
      })
    },
    // -----------------------------------
  }
})
