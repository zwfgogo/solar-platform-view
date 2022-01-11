import services from '../services'
import { message } from 'wanke-gui'
import { r_e_parameter_library } from '../../constants'

import { makeModel } from '../../umi.helper'
import { enumsApi } from '../../../services/global2'
import Service from '../servicesGlobal';
import utils from '../../../public/js/utils'

export class ParameterLibraryState {
  parameterLibrary = false
  libraryModal = false
  deleteModal = false
  libraryList = []
  enums = []
  accuracy = []
  libraryRecord = {}
  deleteId = null
  libraryModalTitle = ''
  newName = ''
  query = {
    queryStr: ''
  }
  unitArr = []
}

export default makeModel('model_parameter_library', new ParameterLibraryState(), (updateState, updateQuery, getState) => {
  return {
    * updateState({payload}, {select, put}) {
      yield updateState(put, payload)
    },
    * updateQuery({payload}, {select, put}) {
      yield updateQuery(select, put, payload)
    },
    * pageChange({payload}, {select, put}) {
      yield updateQuery(select, put, payload)
      yield put({type: '$getList'})
    },
    * $getList({payload}, {call, put, select, take}) {
      yield updateState(put, {
        parameterLibrary: true
      })
      const {query} = yield select(state => state['model_parameter_library'])
      const data = yield call(services.getAnalogsTypes, {...query, type: 1})
      yield updateState(put, {
        libraryList: data.results
      })
    },
    * $librarySave({payload: {values}}, {call, put, select, take}) {
      const {libraryModalTitle, libraryRecord} = yield select(state => state['model_parameter_library'])
      if (libraryModalTitle === '添加数据项') {
        yield call(services.analogsTypesAdd, {...values})
        message.success(utils.intl('添加成功'))
      } else {
        yield call(services.analogsTypesEdit, {...values, id: libraryRecord.id})
        message.success(utils.intl('编辑成功'))
      }
      yield updateState(put, {
        libraryModal: false
      })
      yield put({type: '$getList'})
    },
    * $del(action, {call, put, select, take}) {
      const {deleteId} = action.payload
      yield call(services.analogsTypesDelete, {analogTypeIds: deleteId.join()})
      yield updateState(put, {
        deleteId: [],
        deleteModal: false
      })
      message.success(utils.intl('删除成功'))
      yield put({type: '$getList'})
    },
    * getName({payload}, {call, put, select, take}) {
      const {accuracy}: ParameterLibraryState = yield getState(select)
      const data = yield call(services.getNewName, {})
      yield updateState(put, {
        newName: data
      })
      yield updateState(put, {
        libraryModal: true,
        libraryRecord: {
          accuracyId: accuracy.length > 0 ? accuracy[0].value : null
        },
        libraryModalTitle: '添加数据项'
      })
    },
    * $getEnums({payload}, {call, put, select, take}) {
      const data = yield call(enumsApi, {resource: 'deviceTypes'})
      yield updateState(put, {
        enums: data
      })
      const accuracy = yield call(enumsApi, {resource: 'accuracy'})
      yield updateState(put, {
        accuracy: accuracy
      })
      let unitArr = [{ name: utils.intl('无'), value: null }]
      const res3 = yield Service.getSelect({
          resource: 'measurementUnit',
          hasAll: false
      })
      unitArr = unitArr.concat(res3.results);
      yield updateState(put, {
        unitArr: unitArr
      })
    }
  }
})
