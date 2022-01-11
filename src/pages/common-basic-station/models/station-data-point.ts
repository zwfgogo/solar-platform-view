import * as services from '../station.service'
import { stationDataPointNS } from '../../constants'
import { makeModel } from '../../umi.helper'
import { enumsApi } from '../../../services/global2'
import { exportCSV } from '../../../util/fileUtil'
import { data_point_columns } from '../data-point/ListDataPoint'
import { exportListHistoryColumns } from '../data-point-history/ListHistory'
import { fetchSignalName } from '../station.service'

export class DataPointState {
  list = []
  total = 0
  versionId = null
  draftList = []
  draftTotal = 0
  typeList = []
  terminalTypes = []
  inputOutputOptions = []
  historyList = []
  newSignalName = ''
}

export default makeModel(stationDataPointNS, new DataPointState(), (updateState, updateQuery, getState) => {
  return {
    * fetchInputOutputTypes(action, { call, put }) {
      let results = yield call(enumsApi, action.payload)
      yield updateState(put, { inputOutputOptions: results })
    },
    * fetchSignalName(action, { call, put }) {
      let results = yield call(fetchSignalName, action.payload)
      yield updateState(put, { newSignalName: results || '' })
    },
    fetchList: [function* (action, { select, put }) {
      let data = yield services.fetchDataPointList(action.payload)
      yield updateState(put, { list: data.results, total: data.totalCount })
    }, { type: 'takeLatest' }],
    * fetchDraftVersion(action, { call, put }) {
      const { stationId, deviceId, page, size } = action.payload
      let versionId = yield call(services.fetchDraftVersion, { stationId, deviceId: action.payload.deviceId })
      yield updateState(put, { versionId })
      yield put({ type: 'fetchDraftList', payload: { stationId, versionId, deviceId, page, size } })
    },
    * fetchDraftList(action, { call, put }) {
      // 这个方法在点击编辑的时候会触发两次
      // 编辑后需获取版本ID，然后触发该请求
      // 点击编辑的时候设置了分页参数，分页属性修改会触发该请求
      // TODO：等待优化
      yield updateState(put, { draftList: [], draftTotal: 0 })
      let data = yield call(services.fetchDraftList, action.payload)
      yield updateState(put, { draftList: data.results, draftTotal: data.totalCount })
    },
    * deployVersion(action, { call }) {
      yield call(services.deployVersion, action.payload)
    },
    * fetchTypeList(action, { select, put }) {
      const { deviceTypeId, deviceId, record } = action.payload
      // 获取设备类型所有枚举，不过滤
      let data = yield services.fetchTypeList({ deviceTypeId/* , deviceId */ })
      data = data.map(item => ({ value: item.id, name: item.title }))
      if (record?.id) {
        // 编辑时的特殊逻辑
        if (!data.some(item => item.value == record.typeId)) {
          data.unshift({ name: record.typeTitle, value: record.typeId })
        }
      }
      yield updateState(put, { typeList: data })
    },
    * fetchTerminalTypes(action, { select, put, call }) {
      const { deviceTypeId } = action.payload
      const data = yield call(enumsApi, { resource: 'terminalTypes', deviceTypeId })
      yield updateState(put, {
        terminalTypes: data
      })
    },
    * addDataPoint(action, { select, put }) {
      yield services.addDataPoint(action.payload)
    },
    * updateDataPoint(action, { select, put }) {
      yield services.updateDataPoint(action.payload)
    },
    * deleteDataPoint({ payload }, { select, put }) {
      yield services.deleteDataPoint(payload)
    },
    * onExport(action, { call, put, select }) {
      let { results } = yield services.fetchDataPointList(action.payload)
      exportCSV(data_point_columns, results)
    },
    * fetchHistoryList(action, { call, put }) {
      let data = yield call(services.fetchDataPointHistoryList, action.payload)
      yield updateState(put, { historyList: data })
    },
    * onExportHistory(action, { call, put, select }) {
      const { historyList } = yield getState(select)
      exportCSV(exportListHistoryColumns(), historyList, action.payload.fileName)
    }
  }
})
