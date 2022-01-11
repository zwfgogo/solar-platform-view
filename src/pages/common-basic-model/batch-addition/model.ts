import services from '../services'
import { message } from 'wanke-gui'
import { r_e_batch_addition, r_e_data_item } from '../../constants'

import { makeModel, getActionType } from '../../umi.helper'
import utils from '../../../public/js/utils'
import { formatSelectTerminal } from '../data-item-view/model'

let state = {
  libraryList: [],
  queryStr: '',
  deviceTypeId: null,
  stationTypeId: null,
}

export default makeModel('model_batch_addition', state, (updateState, updateQuery) => {
  return {
    * pageChange({ payload }, { select, put }) {
      yield updateQuery(select, put, payload)
      yield put({ type: '$getList' })
    },
    * $getList({ payload }, { call, put, select, take }) {
      const { deviceTypeId, stationTypeId, queryStr } = yield select(state => state['model_batch_addition'])
      let data;
      data = yield call(services.getAnalogsTypes, { deviceTypeId, isBind: false, queryStr, type: 1 })
      yield updateState(put, {
        libraryList: data.results
      })
    },
    * $batchSave({ payload: { selectedRowKeys, back, selectTerminal } }, { call, put, select, take }) {
      const { deviceTypeId, stationTypeId } = yield select(state => state['model_batch_addition'])
      yield call(services.bindAdd, {
        analogTypeIds: selectedRowKeys.join(),
        id: deviceTypeId,
        terminal: formatSelectTerminal(selectTerminal)
      })
      message.success(utils.intl('添加成功'))
      yield put({
        type: 'model_data_item/$getList'
      })
      yield put({
        type: 'model_data_item/$getAutoData'
      })
      back()
    }
  }
})
