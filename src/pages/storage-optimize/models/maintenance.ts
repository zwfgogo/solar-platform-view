import { makeModel } from '../../umi.helper'
import { getStrategyList, getStrategyParams, postStrategyParams, putStationStrategy, putStrategyParams } from '../optimize.service'

export class OptimizeMaintenanceModel {
  dataSource = []
  totalCount = 0
  query = {
    page: 1,
    size: 20,
    queryStr: ''
  }
  bindStrategies = []
  specifyParametersModal = false
  strategyId = ''
  strategyParams = []
  strategyName = ''
  selectId = []
}

export default makeModel('strategy_maintenance', new OptimizeMaintenanceModel(), (updateState, updateQuery, getState) => {
  return {
    * fetchList(action, { call, put, select }) {
      const { query } = yield getState(select)
      const { stationId } = action.payload;
      const results = yield call(getStrategyList, { stationId, ...query })
      yield updateState(put, { dataSource: results.allStrategies, totalCount: results.allStrategies.length, bindStrategies: results.bindStrategies })
    },
    *putStrategy(action, { call, put, select }) {
      const { stationId, id, bind } = action.payload;
      const results = yield call(putStationStrategy, { stationId, id, bind })
      yield put({
        type: 'fetchList',
        payload: { stationId }
      })
    },
    *getStrategyParams(action, { call, put, select }) {
      const { stationId, runStrategyId, energyUnitTypeNames } = action.payload;
      const results = yield call(getStrategyParams, { stationId, runStrategyId, energyUnitTypeNames })
      let selectId = [];
      results.details.map((o, i) => {
        o.key = i
        if (o.enable) {
          selectId.push(o.energyUnitId)
        }
      })
      yield updateState(put, { strategyParams: results, selectId })
      // yield put({
      //   type: 'fetchList',
      //   payload: { stationId }
      // })
    },
    *putStrategyParams(action, { call, put, select }) {
      const { stationId, id, runStrategyId, ...other } = action.payload;
      if (id) {
        const results = yield call(putStrategyParams, { ...other, stationId, runStrategyId, id })
      } else {
        const results = yield call(postStrategyParams, { ...other, stationId, runStrategyId })
      }
      yield updateState(put, { specifyParametersModal: false })
      yield put({
        type: 'fetchList',
        payload: { stationId }
      })
    }
  }
})
