import services, { deviceTypesAnalogsDelete } from '../services'
import { message } from 'wanke-gui'
import { r_e_data_item } from '../../constants'
import { enumsApi } from '../../../services/global2'
import { makeModel } from '../../umi.helper'
import Service from '../servicesGlobal';
import utils from '../../../public/js/utils'

export class DeviceTypeDetail {
  list = []
  autoData = []
  batchList = []
  libraryList = []
  deviceTypeId = ''
  stationTypeId = ''
  isBind = true
  enums = []
  modal = false
  record = {}
  batchAddition = ''
  parameterLibrary = ''
  libraryModal = false
  libraryRecord = {}
  libraryModalTitle = ''
  modalTitle = ''
  deleteModal = false
  deleteType = ''
  deleteId = []
  accuracy = []
  accuracyId = ''
  symbol = ''
  search = ''
  detailSearch = ''
  unitArr = []
  terminals = []
  selectTerminal = null
}

export default makeModel('model_data_item', new DeviceTypeDetail(), (updateState, updateQuery) => {
  return {
    * reset(action, { put, call }) {
      yield put({ type: 'updateToView', payload: new DeviceTypeDetail() })
    },
    * pageChange({ payload }, { select, put }) {
      yield updateQuery(select, put, payload)
      yield put({ type: '$getList' })
    },
    * $getEnums({ payload }, { call, put, select, take }) {
      const data = yield call(enumsApi, { resource: 'deviceTypes' })
      yield updateState(put, {
        enums: data
      })
      const accuracy = yield call(enumsApi, { resource: 'accuracy' })
      yield updateState(put, {
        accuracy: accuracy
      })
      let unitArr = [{ name: utils.intl('select.无'), value: null }]
      const res3 = yield Service.getSelect({
        resource: 'measurementUnit',
        hasAll: false
      })
      unitArr = unitArr.concat(res3.results);
      yield updateState(put, {
        unitArr: unitArr
      })
    },
    * $getList(action, { call, put, select, take }) {
      const { deviceTypeId, isBind, selectTerminal } = yield select(state => state['model_data_item'])
      let data, autoData
      data = yield call(services.getDeviceTypesAnalogs, { deviceTypeId, isBind, terminal: formatSelectTerminal(selectTerminal) })
      yield updateState(put, {
        list: data.results,
      })
    },
    * $getAutoData(action, { call, put, select, take }) {
      const { deviceTypeId } = yield select(state => state['model_data_item'])
      let autoData
      autoData = yield call(services.getAnalogsTypes, { deviceTypeId })
      yield updateState(put, {
        autoData: autoData.results
      })
    },
    * $getTerminals(action, { call, put, select, take }) {
      const { deviceTypeId } = yield select(state => state['model_data_item'])
      let terminalsData = yield call(services.getDeviceTypesTerminals, { deviceTypeId })
      if (!terminalsData.length) {
        terminalsData.push({
          id: -1,
          name: 'default',
          title: utils.intl('默认端子')
        })
      }
      yield updateState(put, {
        terminals: terminalsData,
        selectTerminal: terminalsData[0].name
      })
    },

    * $save({ payload: { values } }, { call, put, select, take }) {
      const {
        recordName,
        modalTitle,
        record,
        deviceTypeId,
        stationTypeId,
        selectTerminal,
      } = yield select(state => state['model_data_item'])
      if (modalTitle === '添加数据项') {
        yield call(services.deviceTypesAnalogsAdd, { ...values, deviceTypeId, terminal: formatSelectTerminal(selectTerminal) })
        message.success(utils.intl('新增成功'))
      } else {
        yield call(services.deviceTypesAnalogsEdit, { ...values, id: record.id, name: recordName })
        message.success(utils.intl('编辑成功'))
      }
      yield updateState(put, {
        modal: false,
        accuracyId: '',
        symbol: ''
      })
      yield put({ type: '$getList' })
      yield put({ type: '$getAutoData' })
    },
    * $del(action, { call, put, select, take }) {
      const { deleteId } = action.payload
      const {
        deviceTypeId, stationTypeId, selectTerminal
      } = yield select(state => state['model_data_item'])
      yield call(deviceTypesAnalogsDelete, {
        analogTypeIds: deleteId.join(),
        deviceTypeId,
        terminal: formatSelectTerminal(selectTerminal)
      })
      yield updateState(put, {
        deleteId: [],
        deleteModal: false
      })
      message.success(utils.intl('删除成功'))
      yield put({ type: '$getList' })
      yield put({ type: '$getAutoData' })
    },
    * $delBatch(action, { call, put, select, take }) {
      const { deleteId } = action.payload
      const {
        deviceTypeId, stationTypeId, selectTerminal
      } = yield select(state => state['model_data_item'])
      yield call(deviceTypesAnalogsDelete, {
        analogTypeIds: deleteId.join(),
        deviceTypeId,
        terminal: formatSelectTerminal(selectTerminal)
      })
      yield updateState(put, {
        deleteId: [],
        deleteModal: false
      })
      message.success(utils.intl('删除成功'))
      yield put({ type: '$getList' })
      yield put({ type: '$getAutoData' })
    }
  }
})

export function formatSelectTerminal(selectTerminal) {
  return selectTerminal
}
