import Service from './service'
import { makeModel } from '../../umi.helper'
import moment from 'moment'
import { GlobalState } from '../../../models/global'
import {globalNS, t_check_abnormal} from '../../constants'
import { enumsApi, getStationsBySystem } from '../../../services/global2'
import { exportFile } from '../../../util/fileUtil'
import { current_exception_columns } from './component/columns'
import { getHistoryExceptionColumns } from './component/historyColumns'


export class AbnormalQueryModal {
  list = []
  total = 0
  stationOptions = []
  ignoreModal = false
  startDate = moment().subtract(29, 'day').format('YYYY-MM-DD')
  endDate = moment().format('YYYY-MM-DD')
  orderModal = false
  IgnoreModal = false
  record = {}
  abnormalCode = 1
  query = {
    page: 1,
    size: 20,
    queryStr: ''
  }
  id = ''
  type = ''
}

export default makeModel(t_check_abnormal, new AbnormalQueryModal(), (updateState, updateQuery, getState) => {
  return {
    * getList(action, { select, call, put }) {
      const { query } = yield select(state => state.t_check_abnormal)
      const res = yield Service.getList({ ...query, queryStatusCode: 1 })
      yield put({
        type: 'updateToView',
        payload: { list: res.results.results, total: res.results.totalCount }
      })
      yield updateQuery(select, put, {
        page: res.results.page, size: res.results.size
      })
    },
    * getListDetail(action, { select, call, put }) {
      const res = yield Service.getListDetail({ id: action.payload.id })
      if (res.results.abnormalStatusName === 'Eliminated') {
        yield put({
          type: 'updateToView',
          payload: { abnormalCode: 2 }
        })
      } else {
        yield put({
          type: 'updateToView',
          payload: { abnormalCode: 1 }
        })
      }
      yield put({
        type: 'updateToView',
        payload: { list: res.results, total: 1 }
      })
      yield updateQuery(select, put, {
        page: 1, size: 20
      })
    },
    * getHistoryList(action, { select, call, put }) {
      const { query, startDate, endDate } = yield select(state => state.t_check_abnormal)
      const res = yield Service.getList({ ...query, startDate, endDate, queryStatusCode: 2 })
      yield put({
        type: 'updateToView',
        payload: {
          list: res.results.results,
          total: res.results.totalCount
        }
      })
      yield updateQuery(select, put, {
        page: res.results.page, size: res.results.size
      })
    },
    * fetchStationList(action, { call, put, select }) {
      const { firmId, userId }: GlobalState = yield select(state => state[globalNS])
      // let stationOptions = yield call(enumsApi, { resource: 'stations', firmId, userId })
      let stationOptions = yield call(getStationsBySystem, { firmId, userId })
      yield updateState(put, { stationOptions })
    },
    * getDetail(action, { call, put }) {
      const res = yield Service.getDetail({
        id: action.payload.id
      })
      yield put({
        type: 'updateToView',
        payload: { record: res.results }
      })
    },
    * addList(action, { select, call, put }) {
      const { record } = yield select(state => state.t_check_abnormal)
      const res = yield Service.addList({ ...action.payload.values, id: record.id, stationId: record.stationId })
      yield put({
        type: 'getList'
      })
      yield put({
        type: 'updateToView',
        payload: {
          orderModal: false
        }
      })
    },
    * ignoreList(action, { select, call, put }) {
      const { id } = yield select(state => state.t_check_abnormal)
      const res = yield Service.ignoreList({
        id: id, userId: sessionStorage.getItem('user-id'),
        userName: JSON.parse(sessionStorage.getItem('userInfo')).name
      })
      yield put({
        type: 'getList'
      })
      yield put({
        type: 'updateToView',
        payload: {
          ignoreModal: false
        }
      })
    },
    * getEnums(action, { select, call, put }) {
      const { record } = yield select(state => state.t_check_abnormal)
      const res = yield Service.getSelect({
        resource: 'users',
        hasAll: false
      })
      const res2 = yield Service.getSelect({
        resource: 'workOrderTypes',
        hasAll: false
      })
      const res3 = yield Service.getSelect({
        resource: 'devices',
        hasAll: false,
        stationId: record.stationId
      })
      yield put({
        type: 'updateToView',
        payload: { usersArr: res.results, workOrderTypesArr: res2.results, devicesArr: res3.results }
      })
    },
    * updateState(action, { call, put }) {
      yield put({
        type: 'updateToView',
        payload: action.payload
      })
    },
    * stringChange({ payload: { queryStr } }, { select, put }) {
      yield updateQuery(select, put, {
        queryStr
      })
    },
    * pageChange({ payload: { page, size, listType } }, { select, put }) {
      yield updateQuery(select, put, {
        page,
        size
      })
      if (listType === 2) {
        yield put({
          type: 'getHistoryList'
        })
      } else {
        yield put({
          type: 'stringChange',
          payload: { queryStr: '' }
        })
        yield put({
          type: 'getList'
        })
      }
    },
    * onExport(action, { call, put, select }) {
      const { query, abnormalCode, startDate, endDate, stationOptions }: AbnormalQueryModal = yield select(state => state.t_check_abnormal)
      if (abnormalCode == 1) {
        const { results } = yield Service.getList({ queryStr: query.queryStr, queryStatusCode: 1 })
        exportFile(current_exception_columns, results.results)
      } else {
        const { results } = yield Service.getList({ queryStr: query.queryStr, startDate, endDate, queryStatusCode: 2 })
        exportFile(getHistoryExceptionColumns(stationOptions), results.results)
      }
    }
  }
})
