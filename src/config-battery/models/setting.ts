import Service from '../services/global'
import { getAction, makeModel } from '../pages/umi.helper'
import { globalNS, settingNS } from '../pages/constants'
import globalService, { enumsApi } from '../services/global2'
import { md5 } from '../util/utils'
import { message } from 'wanke-gui'
import { GlobalState } from './global'
import utils from '../public/js/utils'

export class SettingState {
  activeKey = 1
  showSetting = false

  showUpdateWarning = false
  updateWarningSuccess = false

  userList = []
  warningList = []
  warningCount = 0
  query = {
    page: 1,
    size: 20,
    queryStr: ''
  }
  warningId = null
  account = null
  mobile = ''
  internationalCode = ''
  period: 1 | 2 | 3 = null
  remind = 1
  createdByAdmin = null

  currency = ''
  timeZone = ''

  oldPassword = ''
  newPassword = ''
  newPassword1 = ''

  timeZoneId = ''
}

export default makeModel(settingNS, new SettingState(), (updateState, updateQuery, getState) => {
  return {
    * fetchWarningList(_, { put, call, select }) {
      const { query } = yield getState(select)
      let { results } = yield call(Service.fetchWarningList, query)
      yield updateState(put, { warningList: results.results, warningCount: results.totalCount })
    },
    * fetchSelfWarning(_, { put, call }) {
      let { results } = yield call(Service.fetchSelfWarning)
      yield updateState(put, {
        warningId: results.id,
        mobile: results.phone,
        internationalCode: results.internationalCode,
        period: results.noticePerPeriod,
        remind: results.remind ? 1 : 2,
        createdByAdmin: results.createdByAdmin
      })
    },
    * fetchUserList(_, { put, call, select }) {
      const { firmId } = yield select(state => state[globalNS])
      let data = yield call(enumsApi, { resource: 'users', firmId, property: 'name,title' })
      yield updateState(put, { userList: data })
    },
    * addWarning(action, { put, call, select }) {
      const { onlySelf } = action.payload
      const { userId }: GlobalState = yield select(state => state[globalNS])
      const { mobile, account, levels, period, remind, userList, internationalCode } = yield getState(select)
      let matchUser = userList.find(item => item.value == account)
      yield call(globalService.addWarning, {
        userId: onlySelf ? userId : matchUser.value,
        phone: mobile,
        internationalCode,
        levelNames: levels,
        noticePerPeriod: period,
        remind: remind == 1
      })
      message.success(utils.intl('添加告警成功'))
      yield updateState(put, { showUpdateWarning: false })
      if (onlySelf) {
        yield put(getAction(null, 'fetchSelfWarning'))
      } else {
        yield updateQuery(select, put, { queryStr: '' })
        yield put(getAction(null, 'fetchWarningList'))
      }
    },
    * updateWarning(action, { put, call, select }) {
      const { onlySelf } = action.payload
      const { userId }: GlobalState = yield select(state => state[globalNS])
      const { userList, warningId, mobile, account, period, remind, internationalCode } = yield getState(select)
      let matchUser = userList.find(item => item.value == account)
      yield call(globalService.updateWarning, {
        id: warningId,
        userId: onlySelf ? userId : matchUser.value,
        phone: mobile,
        internationalCode,
        noticePerPeriod: period,
        remind: remind == 1
      })
      message.success(utils.intl('更新告警成功'))
      yield updateState(put, { showUpdateWarning: false })
      if (onlySelf) {
        yield put(getAction(null, 'fetchSelfWarning'))
      } else {
        yield updateQuery(select, put, { queryStr: '' })
        yield put(getAction(null, 'fetchWarningList'))
      }
    },
    * deleteWarning(action, { call, put }) {
      const { id } = action.payload
      yield call(globalService.deleteWarning, { id })
      message.success(utils.intl('删除成功'))
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
      message.success(utils.intl('修改密码成功'))
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
