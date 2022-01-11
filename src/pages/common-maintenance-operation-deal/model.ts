import Service from './service'
import { getUpdateQuery } from "../umi.helper"
import { globalNS } from "../constants"
import { GlobalState } from "../../models/global"
import { ExportColumn } from "../../interfaces/CommonInterface"
import { exportFile } from "../../util/fileUtil"
import utils from "../../public/js/utils";

let d = new Date()
let date = d.getFullYear() + '-' + (d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)) + '-' + (d.getDate() < 10 ? '0' + d.getDate() : d.getDate())
const updateQuery = getUpdateQuery('orderdeal')
export default {
  namespace: 'orderdeal',
  state: {
    list: [],
    selectStatus: [],
    selectStatusValue: '',
    loading: true,
    startDate: '',
    endDate: '',
    dealModal: false,
    record: {},
    queryModal: false,
    query: {
      page: 1,
      size: 20,
      queryStr: ''
    },
    id: ''
  },
  reducers: {
    updateToView(state, { payload }) {
      return {
        ...state,
        ...payload
      }
    },
    _updateState(state, { payload }) {
      return {
        ...state,
        ...payload
      }
    }
  },
  effects: {
    * getList(action, { select, call, put }) {
      const { userId }: GlobalState = yield select(state => state[globalNS])
      const { query, startDate, endDate, selectStatusValue } = yield select(state => state.orderdeal)
      const res = yield Service.getList({
        ...query, startDate, endDate, typeId: selectStatusValue, userId: userId, userNameProcess: userId
      })
      yield put({
        type: 'updateToView',
        payload: { list: res.results.results, total: res.results.totalCount }
      })
      yield updateQuery(select, put, {
        page: res.results.page, size: res.results.size
      })
    },
    * getDetail(action, { call, put }) {
      const res = yield Service.getDetail({
        id: action.payload.id
      })
      yield put({
        type: 'updateToView',
        payload: { record: res.results.results }
      })
    },
    * getDeal(action, { select, call, put }) {
      const { id } = yield select(state => state.orderdeal)
      const res = yield Service.getDeal({
        ...action.payload.values,
        id: id,
        userNameProcess: JSON.parse(sessionStorage.getItem('userInfo')).id
      })
      yield put({
        type: 'getList'
      })
      yield put({
        type: 'updateToView',
        payload: { dealModal: false }
      })
    },
    * getSelect(action, { call, put, select }) {
      const res = yield Service.getSelect({
        resource: 'workOrderTypes',
        hasAll: true
      })
      if (res.results.length) {
        yield put({
          type: 'updateToView',
          payload: { selectStatus: res.results, selectStatusValue: res.results[0].value }
        })
        yield put({
          type: 'getList'
        })
      }
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
    * pageChange({ payload: { page, size } }, { select, put }) {
      yield updateQuery(select, put, {
        page,
        size
      })
      yield put({
        type: 'getList'
      })
    },
    * onExport(action, { call, put, select }) {
      const { userId }: GlobalState = yield select(state => state[globalNS])
      const { query, startDate, endDate, selectStatusValue } = yield select(state => state.orderdeal)
      const { results } = yield Service.getList({
        queryStr: query.queryStr,
        startDate,
        endDate,
        typeId: selectStatusValue,
        userId: userId,
        userNameProcess: userId
      })
      exportFile(getExceptionColumns(), results.results)
    }
  }
}


function getExceptionColumns() {
  return [
    {
      title: (utils.intl('工单名称')), dataIndex: 'orderName'
    },
    {
      title: (utils.intl('工单类型')), dataIndex: 'typeTitle'
    },
    {
      title: (utils.intl('电站名称')), dataIndex: 'stationTitle'
    },
    {
      title: (utils.intl('设备对象')), dataIndex: 'devTitle'
    },
    {
      title: (utils.intl('工单描述')), dataIndex: 'description'
    },
    {
      title: (utils.intl('处理人员')), dataIndex: 'userTitleProcess'
    },

    {
      title: (utils.intl('发起人')), dataIndex: 'userTitleCreate'
    },
    {
      title: (utils.intl('事件状态')), dataIndex: 'statusTitle'
    },
    {
      title: (utils.intl('操作时间')), dataIndex: 'latestProcessTime'
    }
  ]
} 
