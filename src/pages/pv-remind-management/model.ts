import { makeModel } from '../umi.helper';
import { globalNS, remind_management } from '../constants';
import { deleteRemindInto, deleteRemindSettings, editRemindInto, editRemindSettings, fetchRemindInto, fetchRemindSettings, fetchUserList, newRemindInto, newRemindSettings } from './service';
import { AdvanceTimeCycle, RemindType } from './contants';
import { message } from 'wanke-gui';
import utils from '../../public/js/utils';
import moment from 'moment';
import { TagType } from './components/RemindCard';

export enum Mode {
  new = 'new',
  edit = 'edit',
}

export class RemindManagementModal {
  userList = []
  remindSettingList = []
  record: any = {}
  mode = Mode.new
  contractList = []
  electricityList = []
  reportList = []
}

export default makeModel(remind_management, new RemindManagementModal(), (updateState, updateQuery, getState) => {
  return {
    * fetchUserList({ payload }, { put, call }) {
      const { id } = payload
      const data = yield call(fetchUserList, { stationId: id })
      const userList = data?.map(item => ({
        phone: item.phone || '',
        email: item.email || '',
        name: item.title,
        value: item.id,
      })) || []
      yield updateState(put, { userList })
    },
    // ----联系人-----
    * fetchRemindSettings({ payload }, { put, call }) {
      const { id } = payload
      const data = yield call(fetchRemindSettings, { stationId: id })
      const remindSettingList = formatRemindSettingData(data)
      yield updateState(put, { remindSettingList })
    },
    * newRemindSettings({ payload }, { put, call, select }) {
      const { values } = payload
      const { selectedStationId } = yield select(state => state[globalNS])
      const data = yield call(newRemindSettings, { ...formatRemindSettingValues(values), stationId: selectedStationId })
      yield put({ type: 'fetchRemindSettings', payload: { id: selectedStationId } })
      message.success(utils.intl('操作成功'));
    },
    * editRemindSettings({ payload }, { put, call, select }) {
      const { values, id } = payload
      const { selectedStationId } = yield select(state => state[globalNS])
      const data = yield call(editRemindSettings, { ...formatRemindSettingValues(values), id, stationId: selectedStationId })
      yield put({ type: 'fetchRemindSettings', payload: { id: selectedStationId } })
      message.success(utils.intl('操作成功'));
    },
    * deleteRemindSettings({ payload }, { put, call, select }) {
      const { id } = payload
      const data = yield call(deleteRemindSettings, { id })
      const { selectedStationId } = yield select(state => state[globalNS])
      yield put({ type: 'fetchRemindSettings', payload: { id: selectedStationId } })
      message.success(utils.intl('操作成功'));
    },
    // ----提醒内容-----
    * fetchRemindInto({ payload }, { put, call }) {
      const { id } = payload
      const data = yield call(fetchRemindInto, { stationId: id })
      const { contractList, electricityList, reportList } = formatRemindInfo(data)
      yield updateState(put, { contractList: sortContractRemindInfo(contractList), electricityList, reportList })
    },
    * newRemindInto({ payload }, { put, call, select }) {
      const { values, type } = payload
      const { selectedStationId } = yield select(state => state[globalNS])
      const data = yield call(newRemindInto, {
        ...formatRemindInfoValues(values),
        stationId: selectedStationId,
        type
      })
      yield put({ type: 'fetchRemindInto', payload: { id: selectedStationId } })
      message.success(utils.intl('操作成功'));
    },
    * editRemindInto({ payload }, { put, call, select }) {
      const { values, id, type } = payload
      const { selectedStationId } = yield select(state => state[globalNS])
      const data = yield call(editRemindInto, {
        ...formatRemindInfoValues(values),
        id,
        stationId: selectedStationId,
        type
      })
      yield put({ type: 'fetchRemindInto', payload: { id: selectedStationId } })
      message.success(utils.intl('操作成功'));
    },
    * deleteRemindInto({ payload }, { put, call, select }) {
      const { id } = payload
      const data = yield call(deleteRemindInto, { id })
      const { selectedStationId } = yield select(state => state[globalNS])
      yield put({ type: 'fetchRemindInto', payload: { id: selectedStationId } })
      message.success(utils.intl('操作成功'));
    },
  }
})

function formatRemindSettingData(list: any[] = []) {
  return list.map(item => {
    const { enableSettingsType, bindUser, pushChannel, ...other } = item

    return {
      ...other,
      userId: bindUser.id,
      pushChannel: pushChannel.split(',').filter(item => item !== ''),
      enableSettings: enableSettingsType ? enableSettingsType.split(',') : []
    }
  })
}

// 格式化编辑联系人信息数据
function formatRemindSettingValues(values) {
  const { enableSettings, pushChannel, ...other } = values
  return {
    ...other,
    pushChannel: pushChannel?.join(',') || '',
    enableSettingsType: enableSettings?.join(',') || ''
  }
}

// 格式化提醒内容数据
function formatRemindInfoValues(values) {
  const { ...other } = values
  return {
    ...other,
  }
}

// 格式化提醒内容
function formatRemindInfo(list: any) {
  const contractList = []
  const electricityList = []
  const reportList = []
  list.forEach(item => {
    switch(item.type) {
      case RemindType.Contract:
        contractList.push(item)
        break;
      case RemindType.ElectricityPrice:
        electricityList.push(item)
        break;
      case RemindType.ReportForms:
        reportList.push(item)
        break;
    }
  })
  return { contractList, electricityList, reportList }
}

function sortContractRemindInfo(list) {
  const mapList = [[], [], [], []]
  list.forEach(item => {
    if (!item.breakerStatus) {
      mapList[3].push(item)
      return
    }
    const tag = getTagType(item.advanceTimeCycle, item.endTime, item.breakerStatus)
    if (tag === TagType.Expired) {
      mapList[0].push(item)
    } else if (tag === TagType.ExpireSoon) {
      mapList[1].push(item)
    } else {
      mapList[2].push(item)
    }
  })

  const sortByTime = (list) => {
    return list.sort((a, b) => a.endTime > b.endTime ? 1 : -1)
  }

  return [].concat(
    sortByTime(mapList[0]),
    sortByTime(mapList[1]),
    sortByTime(mapList[2]),
    sortByTime(mapList[3])
  )
}

// 获取过期情况
export function getTagType(timeCycle, endTime, breakerStatus) {
  if (!breakerStatus || !endTime || !timeCycle) return
  const time = moment(endTime).startOf('day')
  let tag: TagType
  const today = moment().startOf('day')
  if (today.isAfter(time)) return TagType.Expired
  switch(timeCycle) {
    case AdvanceTimeCycle.Day:
      if (moment().startOf('day').add(2, 'day').isAfter(time)) {
        tag = TagType.ExpireSoon
      }
      break
    case AdvanceTimeCycle.Month:
      if (moment().startOf('day').add(2, 'month').isAfter(time)) {
        tag = TagType.ExpireSoon
      }
      break
    case AdvanceTimeCycle.Week:
      if (moment().startOf('day').add(2, 'week').isAfter(time)) {
        tag = TagType.ExpireSoon
      }
      break
  }
  return tag
}
