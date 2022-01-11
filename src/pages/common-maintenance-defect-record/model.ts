import Service from './service'
import { getUpdateQuery, makeModel } from "../umi.helper"
import moment, { Moment } from 'moment'
import { exportFile } from "../../util/fileUtil"
import { globalNS } from "../constants"
import { enumsApi, getStationsBySystem } from "../../services/global2"
import { getDateStr } from "../../util/dateUtil"
import { message } from 'wanke-gui'
import React from 'react'
import { ExportColumn } from "../../interfaces/CommonInterface"
import { GlobalState } from "../../models/global"
import utils from "../../public/js/utils";

let d = new Date()
let date = d.getFullYear() + '-' + (d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)) + '-' + (d.getDate() < 10 ? '0' + d.getDate() : d.getDate())
const updateQuery = getUpdateQuery('defectRecord')


export class DefectRecordState {
  list = []
  stationOptions = []
  startDate = ''
  endDate = ''
  query = {
    page: 1,
    size: 20,
    queryStr: ''
  }
  selectStatusValue = null
  selectStatus = null
  total = 0
  id = ''
  type = ''
  record: any = {}
  defectModal = false
  showAddBug = false
  showUpdateBug = false
}

export default makeModel('defectRecord', new DefectRecordState(), (updateState, updateQuery, getState) => {
  return {
    * getList(action, { select, call, put }) {
      const { firmId } = yield select(state => state[globalNS])
      const { query, startDate, endDate } = yield select(state => state.defectRecord)
      const res = yield Service.getList({
        ...query, startDate, endDate, firmId
      })
      yield put({
        type: 'updateToView',
        payload: { list: res.results.results, total: res.results.totalCount }
      })
      yield updateQuery(select, put, {
        page: res.results.page, size: res.results.size
      })
    },
    * fetchStationList(action, { call, put, select }) {
      const { firmId, userId }: GlobalState = yield select(state => state[globalNS])
      // let stationOptions = yield call(enumsApi, { resource: 'stations', firmId, userId, stationTypeName: 'Solar' })
      const stationOptions = yield call(getStationsBySystem, { firmId, userId });
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
    * addBug(action, { select, call, put }) {
      const { record } = yield select(state => state.defectRecord)
      const res = yield Service.addBug({
        ...action.payload.values
      })
      message.success(utils.intl('新增缺陷成功'))
      yield updateQuery(select, put, {
        page: 1
      })
      yield put({
        type: 'getList'
      })
      yield put({
        type: 'updateToView',
        payload: { showAddBug: false }
      })
    },
    * updateBug(action, { select, call, put }) {
      const { record } = yield select(state => state.defectRecord)
      const res = yield Service.updateBug({
        ...action.payload.values,
        id: record.id,
        startTime: getDateStr(record.bugDate, 'YYYY-MM-DD HH:mm:ss'),
        discoverer: record.discoverer,
        bugContent: record.bugContent,
        stationId: record.bugStationId,
        processer: record.processer,
      })
      message.success(utils.intl('消除成功'))
      yield put({
        type: 'getList'
      })
      yield put({
        type: 'updateToView',
        payload: { showUpdateBug: false }
      })
    },
    * deleteRecord(action, { select, call, put }) {
      const { list } = yield select(state => state.runRecord)
      const res = yield Service.deleteList({
        id: action.payload.id
      })
      if (list.length === 1) {
        yield updateQuery(select, put, {
          page: 1, size: 20
        })
      }
      yield put({
        type: 'getList'
      })
    },
    * onExport(action, { call, put, select }) {
      const { startDate, endDate, stationOptions } = yield select(state => state.defectRecord)
      const res = yield Service.getList({
        startDate, endDate, stationId: sessionStorage.getItem('station-id')
      })

      exportFile(getColumn(stationOptions), res.results.results)
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
    }
  }
})

function getColumn(stationOptions) {
  let columns: ExportColumn[] = [
    {
      title: utils.intl('序号'), dataIndex: 'num'
    },
    {
      title: utils.intl('电站名称'), dataIndex: 'stationId', renderE: (value) => {
        let match = stationOptions.find(item => item.value == value)
        return match && match.name
      }
    },
    {
      title: utils.intl('缺陷发现时间'), dataIndex: 'startTime',
      renderE: (value) => value ? moment(value).format("YYYY-MM-DD") : value
    },
    {
      title: utils.intl('发现人'), dataIndex: 'discoverer'
    },
    {
      title: utils.intl('缺陷内容'), dataIndex: 'bugContent'
    },
    {
      title: utils.intl('消除人'), dataIndex: 'processer'
    },
    {
      title: utils.intl('消除日期'), dataIndex: 'endTime'
    },
    {
      title: utils.intl('验收人'), dataIndex: 'acceptor'
    },
    {
      title: utils.intl('负责人'), dataIndex: 'director'
    }
  ]
  return columns
}
