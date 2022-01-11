import {makeModel} from '../../umi.helper'
import {Socket_Port, storage_run_strategy} from '../../constants'
import {
  fetchStationStrategyList,
  fetchStrategyRunDateList,
  fetchStrategyList,
  sendStrategyControl,
  fetchStrategyRunDates,
  fetchEnergyUnits
} from '../run-strategy.service'
import SocketHelper from '../../socket.helper'
import { isActiveStrategyMap } from '../strategy.constant'

const socket = new SocketHelper(storage_run_strategy, Socket_Port, '/run-strategy', { forceNew: true })

export class RunStrategyModel {
  total: 0
  list: any[] = []
  strategyList = []
  strategyCount = 0
  runStrategy: any = {}
  runDateList = []
  runDates = []
  energyUnitList = []
  selectEnergyUnitId = null
}

export default makeModel(storage_run_strategy, new RunStrategyModel(), (updateState, updateQuery, getState) => {
  return {
    * fetchStationStrategyList(action, {put, call}) {
      let result = yield call(fetchStationStrategyList, action.payload)
      yield updateState(put, {
        total: result.totalCount,
        list: result.list
      })
    },
    * fetchRunStrategyId(action, {put, call}) {
      const { dispatch, stationId } = action.payload
      socket.start(dispatch, {
        'currentStrategy': 'currentStrategySocket',
      }, {
        'connect': () => {
          socket.emit('currentStrategy', { stationId })
        },
        'reconnect': (e) => {
          const newState = new RunStrategyModel()
          dispatch({
            type: `${storage_run_strategy}/updateToView`,
            payload: newState
          })
        }
      })
    },
    * currentStrategySocket(action, {call, put, select}) {
      const { results } = action.payload.result
      const runStrategy = getCurrentRunStrategy(results || [])

      yield updateState(put, {
        runStrategy: runStrategy
      })
    },
    * fetchStrategyList(action, {put, call}) {
      let data = yield call(fetchStrategyList, action.payload)
      yield updateState(put, {
        strategyList: data.list,
        strategyCount: data.totalCount,
      })
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
    * send(action, {put, call}) {
      yield call(sendStrategyControl, action.payload)
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
    * clearDetail(action, {put}) {
      yield updateState(put, {
        runDateList: [],
        strategyList: [],
        strategyCount: 0,
        runStrategy: {},
        runDates: [],
      })
    },
    * closeSocket(action, {put}) {
      socket.close()
      yield updateState(put, {
        runDateList: [],
        runStrategy: {},
        runDates: [],
      })
    },
  }
})

function getCurrentRunStrategy(list: any[]) {
  const len = list.length
  if (len === 1) {
    return list[0]
  } else if (len > 1) {
    // 返回第一个主动的策略 如果没有主动策略就返回第一个策略
    for (let i = 0; i < len; i++) {
      const item = list[i]
      if (isActiveStrategyMap[`${item.name}-${item.controlMode?.name || ''}`]) {
        return item
      }
    }
    return list[0]
  }

  return {}
}
