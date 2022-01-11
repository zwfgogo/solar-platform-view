import { load_management } from "../../../constants"
import { message } from 'wanke-gui'
import { makeModel } from "../../../umi.helper"
import Service from "../services/load-management"
import utils from "../../../../util/utils"

export class LoadManagementModal {
  list = []
  switchList = []
  totalCount = 0
  modalVisible = false
  modalMode = 'new'
  record: any = {}
  aliasMap = {}
  switchMap = {}
}

export default makeModel(load_management, new LoadManagementModal(), (updateState, updateQuery, getState) => {
  return {
    * fetchSwitchList(action, {put, call, select}) {
      const { stationId } = action.payload
      const { results = [] } = yield call(Service.getSwitchList, {
        stationId
      });
      yield updateState(put, {
        switchList: results.map(item => ({
          value: item.id,
          name: item.title
        })),
      })
    },
    * fetchList(action, {put, call, select}) {
      const { stationId } = action.payload
      const { results } = yield call(Service.getLoadDeviceList, {
        stationId
      });
      const aliasMap = {}
      const switchMap = {}
      results.forEach(item => {
        aliasMap[item.alias] = true
        if (item.device?.id) {
          switchMap[item.device?.id] = item.id
        }
      })

      yield updateState(put, {
        list: utils.addTableNum(results),
        aliasMap,
        switchMap
      })
    },
    * edit(action, {put, call, select}) {
      const { values } = action.payload
      const data = formatData(values)
      yield call(Service.putLoadDevice, {
        loadDevice: data
      });
      message.success('操作成功')
      const { selectedStationId: stationId } = yield select(state => state.global);
      yield put({ type: 'fetchList', payload: { stationId } })
    },
    * new(action, {put, call, select}) {
      const { values, stationId } = action.payload
      const data = formatData(values)
      yield call(Service.postLoadDevice, {
        loadDevice: data,
        stationId
      });
      message.success('操作成功')
      yield put({ type: 'fetchList', payload: { stationId } })
    },
    * delete(action, {put, call, select}) {
      const { id } = action.payload
      yield call(Service.deleteLoadDevice, {
        id
      });
      message.success('操作成功')
      const { selectedStationId: stationId } = yield select(state => state.global);
      yield put({ type: 'fetchList', payload: { stationId } })
    },
  }
})

function formatData(values) {
  const data = { ...values }
  data.controlPeriod = data.timeList
    .filter(item => item.startTime)
    .map(item => `${item.startTime.format('HH:mm')},${item.endTime.format('HH:mm')}`)
    .join(';')
  delete data.timeList
  delete data.switchObjectId
  return data
}

const firstList = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
const secondList = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
const firstListLen = firstList.length
const secondListLen = secondList.length

export function getNextAlias(aliasMap) {
  let str = ''
  for (let fIndex = 0;fIndex < firstListLen;fIndex++) {
    for (let sIndex = 0;sIndex < secondListLen;sIndex++) {
      str = firstList[fIndex] + secondList[sIndex]
      if (!aliasMap[str]) {
        return str
      }
    }
  }
  throw new Error('无新代号')
}
