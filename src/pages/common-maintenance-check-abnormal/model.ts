import Service from './service'
import { getUpdateQuery, makeModel } from "../umi.helper"
import moment from 'moment'
import { GlobalState } from "../../models/global"
import { globalNS } from "../constants"
import { enumsApi } from "../../services/global2"
import { exportFile } from "../../util/fileUtil"
import { getHistoryExceptionColumns } from './component/historyColumns'
import { getExceptionColumns } from './component/columns'

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
  modalRecord = {}
  abnormalCode = '1'
  query = {
    page: 1,
    size: 20,
    queryStr: '',
    alarmLevelList: null,
    stationIdList: null
  }
  id = ''
  type = ''
  deviceTypeList = []
  alarmLevelsList = []
  chartData = {
    xData: [],
    yData: [],
    series: []
  }
  deviceTreeList = []
  relatedDeviceTreeList = []
  pointTypeMap = {}
}

export default makeModel('abnormalQuery', new AbnormalQueryModal(), (updateState, updateQuery, getState) => {
  return {
    * getList(action, { select, call, put }) {
      // const { query } = yield select(state => state.abnormalQuery)
      const { searchObj, page, size } = action.payload
      const res = yield Service.getList({
        page: page,
        size: size,
        ...searchObj,
        queryStatusCode: 1
      })
      const {
        results: list = [],
        totalCount = 0,
        // page = 1,
        // size = 20
      } = res.results || {};
      yield put({
        type: 'updateToView',
        payload: { list, total: totalCount }
      })
      yield updateQuery(select, put, { page, size })
    },
    * getHistoryList(action, { select, call, put }) {
      // const { query } = yield select(state => state.abnormalQuery)
      // console.log('query', query)
      const { searchObj, page, size } = action.payload
      const res = yield Service.getList({ ...searchObj, page, size, queryStatusCode: 2 })
      const {
        results: list = [],
        totalCount = 0,
        // page = 1,
        // size = 20
      } = res.results || {};
      yield put({
        type: 'updateToView',
        payload: {
          list,
          total: totalCount
        }
      })
      yield updateQuery(select, put, { page, size })
    },
    * fetchStationList(action, { call, put, select }) {
      const { firmId, userId }: GlobalState = yield select(state => state[globalNS])
      const { query } = yield select(state => state.abnormalQuery)
      let stationOptions = yield call(enumsApi, { resource: 'stations', firmId, userId })
      yield updateState(put, { stationOptions, query: { ...query, stationIdList: stationOptions.map(item => item.id) } })
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
      const { record } = yield select(state => state.abnormalQuery)
      const res = yield Service.addList({ ...action.payload.values, eventId: record.id, stationId: record.stationId, devId: record.devId })
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
      const { record } = yield select(state => state.abnormalQuery)
      const { showName } = yield select(state => state[globalNS])
      const res = yield Service.ignoreList({
        id: record.id, userId: sessionStorage.getItem('user-id'),
        userName: JSON.parse(sessionStorage.getItem('userInfo')).name,
        stationId: record.stationId,
        userTitleProcess: showName
      })
      const { searchObj, page, size } = action.payload;
      yield put({
        type: 'getList',
        payload: { searchObj, page, size }
      })
      yield put({
        type: 'updateToView',
        payload: {
          ignoreModal: false
        }
      })
      return res
    },
    * getEnums(action, { select, call, put }) {
      const { record } = yield select(state => state.abnormalQuery)
      const res = yield Service.usersByFirm({
        hasAll: false,
        stationId: record.stationId
      })
      const res2 = yield Service.getSelect({
        resource: 'workOrderTypes',
        hasAll: false
      })
      const res3 = yield Service.getDeciveById({
        id: record.devId,
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
    * stationChange({ payload }, { select, put }) {
      yield updateQuery(select, put, {
        stationIdList: payload.stationIdList
      })
    },
    * alarmLevelChange({ payload }, { select, put }) {
      yield updateQuery(select, put, {
        alarmLevelIdList: payload.alarmLevelIdList
      })
    },
    * pageChange({ payload: { page, size, listType, searchObj } }, { select, put }) {
      yield updateQuery(select, put, {
        page,
        size
      })
      if (listType === 2) {
        yield put({
          type: 'getHistoryList',
          payload: { searchObj, page, size }
        })
      } else {
        yield put({
          type: 'stringChange',
          payload: { queryStr: '' }
        })
        yield put({
          type: 'getList',
          payload: { searchObj, page, size }
        })
      }
    },
    * onExport(action, { call, put, select }) {
      const { stationList: stationIdList, alarmLevelIdList, searchObj } = action.payload
      const { query, abnormalCode, startDate, endDate, stationOptions }: AbnormalQueryModal = yield select(state => state.abnormalQuery)
      if (abnormalCode == 1) {
        const { results } = yield Service.getList({ ...searchObj, queryStatusCode: 1 })
        exportFile(getExceptionColumns(), results.results)
      } else {
        const { results } = yield Service.getList({ ...searchObj, queryStatusCode: 2 })
        exportFile(getHistoryExceptionColumns(stationOptions), results.results)
      }
    },
    * fetchPointDataType(action, { call, put, select }) {
      const { deviceId } = action.payload
      const { results } = yield Service.fetchPointDataType({ deviceId })
      const { dataPointTypeList, pointDataTypeMap } = results
      const deviceTypeList = (dataPointTypeList || []).map(item => {
        return {
          value: JSON.stringify({ pointNumber: pointDataTypeMap[item.id].pointNumber, unit: item.unit, name: item.name, title: item.title }),
          label: item.title
        }
      })
      yield put({
        type: 'updateToView',
        payload: { deviceTypeList }
      })
    },
    * fetchPointData({ payload }, { call, put, select }) {

      const { checkDevice, startTime, endTime } = payload
      if (!checkDevice.length) {
        yield updateState(put, {
          chartData: {
            xData: [],
            yData: [],
            series: [{}]
          }
        })
        return;
      }

      const pointNumbers = checkDevice.map(item => JSON.parse(item).pointNumber).join()

      const reply = yield call(Service.fetchPointData, {
        pointNumbers,
        startTime,
        endTime,
        frequency: "original" // 原始值
      });

      let { xData, yData } = reply.results;
      const series = checkDevice.map(item => {
        const { title, unit } = JSON.parse(item)
        return {
          name: title,
          unit: unit?.name
        }
      });
 
      if(xData?.length === 1 && xData[0] === startTime){
        xData = [ ...xData, moment(endTime).format('YYYY-MM-DD HH:mm:00') ]
        yData = yData.map(yItem => [...yItem, 0])
      }else if(xData?.length === 1 && xData[0] === moment(endTime).format('YYYY-MM-DD HH:mm:00')){
        xData = [ startTime, ...xData ]
        yData = yData.map(yItem => [0, ...yItem])
      }else if(xData?.length === 1){
        xData = [ startTime, ...xData, moment(endTime).format('YYYY-MM-DD HH:mm:00') ]
        yData = yData.map(yItem => [0, ...yItem, 0])
      }

      yield updateState(put, {
        chartData: {
          xData,
          yData,
          series
        }
      });
    },
    * getAlarmLevelsList(action, { select, call, put }) {
      const { query } = yield select(state => state.abnormalQuery)
      const { results } = yield call(Service.getAlarmLevelsList)
      yield put({
        type: 'updateToView',
        payload: {
          alarmLevelsList: results,
          query: { ...query, alarmLevelIdList: results.map(item => item.value) }
        }
      })
    },
    * fetchPointDataChart({ payload }, { call, put, select }) {
      const { checkDevice, startTime, endTime } = payload
      if (!checkDevice.length) {
        yield updateState(put, {
          chartData: {
            xData: [],
            yData: [],
            series: [{}]
          }
        })
        return;
      }

      const pointNumbers = checkDevice.map(item => item.pointNumber).join()

      const reply = yield call(Service.fetchPointData, {
        pointNumbers,
        startTime,
        endTime,
        frequency: "original" // 原始值
      });

      let { xData, yData } = reply.results;
      const series = checkDevice.map(item => {
        const { title, unit, chartTitle } = item
        return {
          name: chartTitle,
          unit: unit
        }
      });
 
      if(xData?.length === 1 && xData[0] === startTime){
        xData = [ ...xData, moment(endTime).format('YYYY-MM-DD HH:mm:00') ]
        yData = yData.map(yItem => [...yItem, 0])
      }else if(xData?.length === 1 && xData[0] === moment(endTime).format('YYYY-MM-DD HH:mm:00')){
        xData = [ startTime, ...xData ]
        yData = yData.map(yItem => [0, ...yItem])
      }else if(xData?.length === 1){
        xData = [ startTime, ...xData, moment(endTime).format('YYYY-MM-DD HH:mm:00') ]
        yData = yData.map(yItem => [0, ...yItem, 0])
      }

      yield updateState(put, {
        chartData: {
          xData,
          yData,
          series
        }
      });
    },
    * getDeviceModalTree(action, { select, call, put }) {
      const { id } = action.payload
      const { results } = yield call(Service.getDeviceModalTree, { id })
      const { treeList = [], relatedTreeList = [] } = results
      const pointTypeMap = {};
      const deviceTreeList = formatTreeData(treeList, pointTypeMap)
      const relatedDeviceTreeList = formatTreeData(relatedTreeList, pointTypeMap)
      yield put({
        type: 'updateToView',
        payload: {
          deviceTreeList,
          relatedDeviceTreeList,
          pointTypeMap,
        }
      })
    }
  }
})

function formatTreeData(list: any[], pointTypeMap) {
  if (!list) return list

  return list.map(device => {
    const deviceKey = device.id.toString()
    const dItem: any = {
      key: deviceKey,
      title: device.title,
      checkable: false,
    }
    dItem.children = (device.measurePoints || []).map(terminal => {
      const terminalKey = `${deviceKey}-${terminal.id.toString()}`
      const tItem: any = {
        key: terminalKey,
        title: terminal.title,
        checkable: false,
        disabled: true,
      }
      tItem.children = (terminal.analogs || []).map(point => {
        const pointKey = `${terminalKey}-${point.id.toString()}`
        pointTypeMap[pointKey] = point
        pointTypeMap[pointKey].chartTitle = `${device.title}-${terminal.title}-${point.title}`
        return {
          key: pointKey,
          title: point.title,
        }
      })
      return tItem
    })
    return dItem
  })
}
