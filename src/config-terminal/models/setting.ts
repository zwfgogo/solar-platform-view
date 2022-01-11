import Service from '../services/global'
import { getAction, makeModel } from '../pages/umi.helper'
import { enumsNS, globalNS, settingNS } from '../pages/constants'
import globalService from '../services/global-terminal'
import { md5 } from '../util/utils'
import { message } from 'wanke-gui'

export class SettingState {
  activeKey = 1
  showSetting = false

  showUpdateWarning = false
  updateWarningSuccess = false

  warningList = []
  warningCount = 0
  query = {
    page: 1,
    size: 20,
    queryStr: ''
  }
  warningId = null
  account = ''
  mobile = ''
  period = null
  levels = []
  remind = 1

  oldPassword = ''
  newPassword = ''
  newPassword1 = ''

  timeZoneId = ''
}

export default makeModel(settingNS, new SettingState(), (updateState, updateQuery, getState) => {
  return {
    * fetchWarningList(action, { put, call, select }) {
      const { query } = yield getState(select)
      let { results } = yield call(Service.fetchWarningList, query)
      yield updateState(put, { warningList: results.results, warningCount: results.totalCount })
    },
    * addWarning(action, { put, call, select }) {
      const { username, isIndividual } = yield select(state => state[globalNS])
      const { mobile, account, levels, period } = yield getState(select)
      const { userList } = yield select(state => state[enumsNS])
      let matchUser = userList.find(item => item.value == account)
      let data = yield call(globalService.addWarning, {
        receiveName: isIndividual ? username : matchUser.name,
        phone: mobile,
        levelNames: levels,
        dtime: period
      })
      message.success('添加告警成功')
      yield updateState(put, { showUpdateWarning: false })
      yield updateQuery(select, put, { queryStr: '' })
      yield put(getAction(null, 'fetchWarningList'))
    },
    * updateWarning(action, { put, call, select }) {
      const { username, isIndividual } = yield select(state => state[globalNS])
      const { warningId, mobile, account, levels, period } = yield getState(select)
      const { userList } = yield select(state => state[enumsNS])
      let matchUser = userList.find(item => item.value == account)
      let data = yield call(globalService.updateWarning, {
        id: warningId,
        receiveName: isIndividual ? username : matchUser.name,
        phone: mobile,
        levelNames: levels,
        dtime: period
      })
      message.success('更新告警成功')
      yield updateState(put, { showUpdateWarning: false })
      yield updateQuery(select, put, { queryStr: '' })
      yield put(getAction(null, 'fetchWarningList'))
    },
    * deleteWarning(action, { call, put }) {
      const { id } = action.payload
      yield call(globalService.deleteWarning, { id })
      message.success('删除成功')
      yield put(getAction(null, 'fetchWarningList'))
    },
    * changePassword(action, { put, call, select }) {
      const { oldPassword, newPassword } = action.payload
      const { userId, username } = yield select(state => state[globalNS])

      yield call(Service.changePassword, {
        userId: userId,
        userName: username,
        password: md5(oldPassword),
        newPassword: md5(newPassword)
      })
      message.success('修改密码成功')
      yield updateState(put, { showSetting: false, oldPassword: '', newPassword: '', newPassword1: '' })
    },
    * changeUserSetting(action, { put, call, select }) {

      const { currency, timeZone } = action.payload;
      const { userId } = yield select(state => state[globalNS])

      // 通知首页货币变更
      yield put(getAction('indexPage', 'changeCurrency'))
      let res = yield call(Service.changeUserSetting, {
        id: userId,
        currency: currency,
        timeZone: timeZone
      })
      if (res.results.timeZone) {
        yield updateState(put, { timeZoneId: res.results.timeZone })
        yield put(getAction(globalNS, 'emitSocket', { eventName: 'systemTime', params: { timeZoneId: res.results.timeZone } }))
      } else {
        yield updateState(put, { timeZoneId: 'Asia/Shanghai' })
        yield put(getAction(globalNS, 'emitSocket', { eventName: 'systemTime', params: { timeZoneId: 'Asia/Shanghai' } }))
      }
      window.location.reload();
      message.success(utils.intl('修改成功'))
      yield updateState(put, { showSetting: false })
    }
  }
})
