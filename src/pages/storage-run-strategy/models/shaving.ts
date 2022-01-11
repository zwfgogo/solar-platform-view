import {makeModel} from '../../umi.helper'
import {storage_run_strategy_shaving} from '../../constants'
import {
  fetchStrategyRunDateList, auth, fetchEnergyUnits, fetchStrategyRunDates,
} from '../run-strategy.service'
import {
  addArgument,
  fetchCommandTypeOption,
  fetchControlTypeOption,
  fetchCurrentCommandList, fetchCurrentControlArgumentList,
  fetchEndControlOption, fetchLocalArgument,
  fetchPriceInfo,
  fetchNotSendArgumentList,
  fetchTempCommandList,
  fetchTodayCommandList,
  send, sendTempCommand,
  startControlArgument,
  stopControlArgument,
  stopTempCommand, updateArgument, resetArgument, deleteArgument,
} from '../services/c01.services'

export class RunStrategyShavingModel {
  energyUnitList = []
  commandTypeOptions = []
  controlTypeOptions = []
  endControlOptions = []

  todayCommandList = []
  currentControlArgumentList = []
  tempCommandList = []
  notSendArgumentList = null
  localArgument = null
  currentCommandList = []
  runDateList = []
  runDates = []
  priceInfo: {
    costPrice: any
    generatePrice: any
  }
}

export default makeModel(storage_run_strategy_shaving, new RunStrategyShavingModel(), (updateState, updateQuery, getState) => {
  return {
    * fetchEnergyUnitList(action, {put, call}) {
      const {stationId, runStrategyId} = action.payload
      let options = yield call(fetchEnergyUnits, {
        stationId,
        activity: true,
        energyUnitTypeName: 'Storage',
        runStrategyId
      })
      yield updateState(put, {
        energyUnitList: options
      })
    },
    * fetchTodayCommandList(action, {put, call}) {
      let data = yield call(fetchTodayCommandList, action.payload)
      yield updateState(put, {
        todayCommandList: data
      })
    },
    * fetchCurrentControlArgumentList(action, {put, call}) {
      let data = yield call(fetchCurrentControlArgumentList, action.payload)
      yield updateState(put, {
        currentControlArgumentList: data
      })
    },
    * fetchCurrentCommandList(action, {put, call}) {
      let data = yield call(fetchCurrentCommandList, action.payload)
      yield updateState(put, {
        currentCommandList: data
      })
    },
    * fetchTempCommandList(action, {put, call}) {
      let data = yield call(fetchTempCommandList, action.payload)
      yield updateState(put, {
        tempCommandList: data
      })
    },
    * sendTempCommand(action, {put, call}) {
      yield call(sendTempCommand, action.payload)
    },
    * stopTempCommand(action, {put, call}) {
      yield call(stopTempCommand, action.payload)
    },
    * fetchPriceInfo(action, {put, call}) {
      let data = yield call(fetchPriceInfo, action.payload)
      yield updateState(put, {
        priceInfo: data
      })
    },
    * stopControlArgument(action, {put, call}) {
      yield call(stopControlArgument, action.payload)
    },
    * startControlArgument(action, {put, call}) {
      yield call(startControlArgument, action.payload)
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
    * fetchNotSendArgumentList(action, {put, call}) {
      let result = yield call(fetchNotSendArgumentList, action.payload)
      result.forEach(item => {
        item.applicableDate = item.applicableDate ?? []
      })
      yield updateState(put, {
        notSendArgumentList: result
      })
    },
    * addArgument(action, {put, call}) {
      yield call(addArgument, action.payload)
    },
    * updateArgument(action, {put, call}) {
      yield call(updateArgument, action.payload)
    },
    * resetArgument(action, {put, call}) {
      yield call(resetArgument, action.payload)
    },
    * deleteArgument(action, {put, call}) {
      yield call(deleteArgument, action.payload)
    },
    * fetchLocalArgument(action, {put, call}) {
      let result = yield call(fetchLocalArgument, action.payload)
      yield updateState(put, {
        localArgument: result
      })
    },
    * auth(action, {call}) {
      yield call(auth, action.payload)
    },
    * send(action, {put, call}) {
      yield call(send, action.payload)
    },
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
  }
})
