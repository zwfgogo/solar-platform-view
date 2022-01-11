import { makeModel } from '../pages/umi.helper'
import { enumsNS } from '../pages/constants'
import { enumsApi } from '../services/global2'

/**
 * 后端返回的无参数枚举放这里
 */
export class EnumState {
  userList = []
  priceRates = []
  stationTypes = []
}

export default makeModel(enumsNS, new EnumState(), (updateState) => {
  return {
    * fetchUserList(action, {put, call}) {
      let data = yield call(enumsApi, {resource: 'users'})
      yield updateState(put, {userList: data})
    },
    * fetchPriceRates(param, {put, call}) {
      const data = yield call(enumsApi, {resource: 'priceRate'})
      yield updateState(put, {
        priceRates: data
      })
    },
    * fetchStationTypes(param, {select, put, call}) {
      let data = yield call(enumsApi, {resource: 'stationTypes'})
      yield updateState(put, {
        stationTypes: data
      })
    },
  }
})
