import {message} from 'wanke-gui'
import {BoardType} from './contant'
import Service from './service'
import SocketHelper from "../socket.helper";
import { Socket_Port } from "../constants";
import {storage_station_monitor} from '../constants'
import {exportCSV} from '../../util/fileUtil'
import styles from './components/styles/powerStationTable.less'
import React from 'react'
import {formatEmptyValue, getRunningStatus, getStationStatus} from './components/powerStationTable'
import {ExportColumn} from '../../interfaces/CommonInterface'
import { triggerEvent } from '../../util/utils'

const socket = new SocketHelper(storage_station_monitor, Socket_Port, '/station-monitoring')
export default {
  namespace: storage_station_monitor,
  state: {
    boardType: BoardType.Map,
    queryStr: '',
    tableData: {
      list: [],
      page: 1,
      size: 20,
      totalCount: 0
    },
    matrixList: [],
    realStationMap: {}
  },
  reducers: {
    updateToView(state, {payload}) {
      return {
        ...state,
        ...payload
      }
    }
  },
  effects: {
    *init(action, { put, call, select }) {
      const { dispatch } = action.payload
      socket.start(dispatch, {
        'real': 'getReal',
      }, {
        'connect': () => {
        }
      })
    },
    *closeSocket() {
      socket.close()
    },
    *emitSocket(action, { put, call }) {
      const { eventName, params = {} } = action.payload
      socket.emit(eventName, params)
    },
    *getReal(action, { put, call, select }) {
      console.log(1221)
      const { result, count } = action.payload
      const { results = {} } = result
      let { realStationMap } = yield select(state => state[storage_station_monitor])
      const newRealStationMap = { ...realStationMap };
      Object.keys(results).forEach(key => {
        newRealStationMap[key] = {
          ...(newRealStationMap[key] || {}),
          ...(results[key] || {}),
        }
      })
      triggerEvent('updateMapCard', window, { realStationMap: newRealStationMap })
      yield put({ type: "updateToView", payload: { realStationMap: newRealStationMap } })
    },
    * getTableData(action, {put, call}) {
      const {queryStr, page, size} = action.payload
      const params = {
        userId: sessionStorage.getItem('user-id'),
        title: queryStr,
        page,
        size
      }
      const res = yield call(Service.getTableData, params)
      const data = res.results || {}
      const {
        totalCount = 0,
        totalPages = 0,
        results: list = [],
        page: pageNum = 1,
        size: pageSize = 20
      } = data
      const tableData = {
        queryStr,
        list: list.map((item, index) => ({
          ...item,
          key: index + 1 + pageSize * (pageNum - 1)
        })),
        totalCount,
        totalPages,
        page: Number(pageNum),
        size: Number(pageSize)
      }
      yield put({ type: "updateToView", payload: { tableData, queryStr } });
      if(list.length) {
        yield put({ type: "emitSocket", payload: {
          eventName: 'real',
          params: { stationIds: list.map(item => item.id).join(',') }
        }});
      }
    },
    * exportTableData(action, {put, call}) {
      const {queryStr} = action.payload
      const params = {
        userId: sessionStorage.getItem('user-id'),
        title: queryStr
      }
      const res = yield call(Service.getTableData, params)
      const data = res.results || {}
      const {
        results: list = [],
        page: pageNum = 1,
        size: pageSize = 20
      } = data
      const tableData = list.map((item, index) => ({
        ...item,
        key: index + 1 + pageSize * (pageNum - 1)
      }))
      exportCSV(exportColumns(), tableData)
    },
    * getMatrixData(action, {put, call}) {
      const {queryStr} = action.payload
      const params = {
        userId: sessionStorage.getItem('user-id'),
        title: queryStr
      }
      const res = yield call(Service.getTableData, params)
      const data = res.results || {}
      const {results: list = []} = data
      const matrixList = list.map((item, index) => ({
        ...item,
        key: index
      }))
      yield put({ type: "updateToView", payload: { matrixList, queryStr } });
      if(list.length) {
        yield put({ type: "emitSocket", payload: {
          eventName: 'real',
          params: { stationIds: list.map(item => item.id).join(',') }
        }});
      }
    },
    * getStationData(action, {put, call}) {
      const {stationId} = action.payload
      yield put({ type: "emitSocket", payload: {
        eventName: 'real',
        params: { stationIds: stationId }
      }});
    }
  }
}

function exportColumns(): ExportColumn[] {
  return [
    {
      title: '序号',
      dataIndex: 'key',
      width: 65
    },
    {
      title: '电站名称',
      dataIndex: 'title',
    },
    {
      title: '电站类型',
      dataIndex: 'stationType',
      renderE: (text, record) => {
        const stationType = record.stationType || {}
        return stationType.title
      },
    },
    {
      title: '电站状态',
      dataIndex: 'stationStatus',
      renderE: (text, record) => {
        const stationStatus = record.stationStatus || {}
        return stationStatus.title
      },

    },
    {
      title: '建设规模',
      dataIndex: 'buildingScale',
      renderE: (text, record) =>
        `${formatEmptyValue(record.ratedPowerDisplay)}/${formatEmptyValue(
          record.scaleDisplay
        )}`,

    },
    {
      title: '工作状态',
      dataIndex: 'workStatus',
      renderE: (text, record) =>
        `${getRunningStatus(text, record.offLine, true)}`,

    },
    {
      title: '实时功率',
      dataIndex: 'power',
      renderE: (text) => `${formatEmptyValue(text, '-')}`,
    },
    {
      title: '今日充电量',
      dataIndex: 'charge',
      renderE: (text) => `${formatEmptyValue(text, '-')}`,
    },
    {
      title: '今日放电量',
      dataIndex: 'discharge',
      renderE: (text) => `${formatEmptyValue(text, '-')}`,
    }
  ]
}
