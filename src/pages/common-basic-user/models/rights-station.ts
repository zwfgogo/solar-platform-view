import services from '../services'
import { message } from 'wanke-gui'
import { globalNS, r_u_station } from '../../constants'
import { enumsApi, fetchStationPrice } from '../../../services/global2'
import { makeModel } from '../../umi.helper'
import { GlobalState } from '../../../models/global'
import utils from '../../../public/js/utils'

export class UserStationAuthorityState {
  list = []
  stationEnums = null
  stations = []
  query = {
    firmId: null,
    userId: null,
    stationTypeId: null
  }
  isSaved = true
  roleName = ''
  stationSelected = []
  canUpdate = false
  rules1 = []
  rules2 = {}
  periodEnumList = []
}

export default makeModel(r_u_station, new UserStationAuthorityState(), (updateState, updateQuery, getState) => {
  return {
    * pageChange({ payload }, { select, put }) {
      yield updateQuery(select, put, payload)
      yield put({ type: '$getList' })
    },
    * $getEnums(action, { call, put, select }) {
      const { firmId }: GlobalState = yield select(state => state[globalNS])
      const { query } = yield select(state => state[r_u_station])
      const stationEnums = yield call(services.fetchStationTypes, { firmId, curFirmId: query.firmId })
      yield updateState(put, { stationEnums: stationEnums })
      const stationTypeId = stationEnums.length > 0 ? parseInt(stationEnums[0].value) : null
      yield updateQuery(select, put, { stationTypeId })
      if (stationTypeId) {
        yield put({ type: '$getList' })
      }
    },
    * $getList({ payload }, { call, put, select, take }) {
      console.log('getUserStation');
      const { query } = yield select(state => state[r_u_station])
      const data = yield call(services.getUsersStation, { ...query })
      yield updateState(put, {
        list: data.results,
        canUpdate: data.isUpdate,
        stationSelected: data.selected
      })
    },
    * $save(action, { call, put, select, take }) {
      const { query } = yield select(state => state[r_u_station])
      yield call(services.usersStationEdit, { id: query.userId, stationIds: action.payload.stationSelected, ...query })
      message.success(utils.intl('保存成功'))
      yield updateState(put, { isSaved: true })
      yield put({ type: '$getList' })
    },
    * fetchElectrictPeriodEnum({ payload }, { call, put, select, take }) {
      const data = yield call(enumsApi, { resource: 'priceRate' })
      yield updateState(put, { periodEnumList: data })
    },
    * $fetchStationDetail({ payload: { stationId } }, { call, put, select, take }) {
      const data = yield call(fetchStationPrice, { id: stationId })
      yield updateState(put, {
        rules1: data.cost ? data.cost.seasonPrices || [] : [],
        rules2: data.generator ? data.generator : null
      })
    }
  }
})
