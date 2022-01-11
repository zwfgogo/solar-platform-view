import { history } from 'umi'
import Service from '../services/global'
import { makeModel } from '../pages/umi.helper'
import { globalNS, settingNS } from '../pages/constants'
import services, { fetchWarningCount, getStationById } from '../services/global-terminal'
import gdata from '../public/js/gdata'
import { traverseTree } from '../pages/page.helper'
import { md5 } from '../util/utils'
import { message } from 'wanke-gui'
import { isDev } from '../core/env'
import SocketHelper from '../pages/socket.helper'
import { Terminal_SocketUrl } from '../pages/constants'

const socket = new SocketHelper(globalNS, Terminal_SocketUrl, '/overview', { forceNew: true })

export class GlobalState {
  userId = null
  username = ''
  firmId = ''
  roleId = null
  roleName = ''
  root = null
  isIndividual = null
  showName = ''
  firmType = ''
  collapsed = false
  menu = []
  selectedKeys = []
  openKeys = []
  moderateWarningCount = 0
  seriousWarningCount = 0

  time = { year: 0, month: 0, day: 0, time: 0 }
  mustChangePassword = false
  oldPassword = ''
  newPassword = ''
  newPassword1 = ''
  fullScreenState = false;
  eventAlarm = []

  stationTitle = ''
  stationList = []
}

export default makeModel(globalNS, new GlobalState(), (updateState, updateQuery, getState) => {
  return {
    *init(action, { put, call, select }) {
      const { dispatch } = action.payload
      const { devId } = yield select(state => state.fmMonitoring)
      const { timeZone } = yield select(state => state[settingNS]);
      socket.start(dispatch, {
        'abnormal': 'getAbnormal',
        'systemTime': 'getSystemTime'
        // 'energyUnit-all': 'getEnergyUnitAll',
      }, {
        'connect': () => {
          socket.emit('abnormal', { stationId: sessionStorage.getItem('station-id') })
          socket.emit('systemTime', { timeZoneId: timeZone || sessionStorage.getItem('timeZone') || 'Asia/Shanghai' });
          // socket.emit('energyUnit-all', { stationId: sessionStorage.getItem('station-id') })
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
    *getAbnormal(action, { put, call }) {
      const { result } = action.payload
      yield updateState(put, {
        eventAlarm: result.results
      })
    },
    * $getInfo({ payload }, { call, put, select }) {
      try {
        const userId = sessionStorage.getItem('user-id')
        const stationId = sessionStorage.getItem('station-id')
        if (!userId) {
          history.push('/')
        }
        const data = yield call(services.getInfo, { id: userId })
        const station = yield call(getStationById, { id: stationId })
        sessionStorage.setItem('station-title', station.title)
        gdata('userInfo', data)
        sessionStorage.setItem('userInfo', JSON.stringify(data))
        sessionStorage.setItem('role-id', data.role.id)
        sessionStorage.setItem('isAdmin', data.role.name)
        yield updateState(put, {
          stationTitle: station.title || '万克储能平台',
          userId,
          isIndividual: data.isIndividual || false,
          username: data.name,
          showName: data.title,
          firmId: data.firm.id,
          root: data.firm.root,
          roleName: data.role.name,
          roleId: data.role.id,
          firmType: data.firm.firmType?.name,
          mustChangePassword: data.resetPassword
        })
        yield put({ type: 'getMenu' })
      } catch (res) {
        // 用户没有登录
        history.push('/')
      }
    },
    * getMenu(action, { call, put, select }) {
      const referer = sessionStorage.getItem('referer')
      let res = {};
      // 针对平台跳转过来的用户，调用特殊接口获取菜单
      if (referer === 'platform') {
        res = yield Service.getMenusByJump({})
      } else {
        res = yield Service.getMenus({ userId: sessionStorage.getItem('user-id') })
      }
      const path = window.location.pathname
      let temp = path.split('/')
      let openKeys = [temp[0] + '/' + temp[1]]
      let selectedKeys = [temp[0] + '/' + temp[1] + '/' + temp[2]]
      yield updateState(put, {
        menu: res.results,
        selectedKeys: selectedKeys,
        openKeys: openKeys
      })

      let state = yield select(state => state)
      //接线图页面有search内容需要拼上 否则刷新会跳到首页去
      const pathname = state.router.location.pathname + state.router.location.search
      if (!isDev()) {
        if (!traverseTree(res.results, item => item.key == pathname ? pathname : null)) {
          let firstMenu = res.results[0]
          if (firstMenu) {
            if (firstMenu.children.length > 0) {
              history.replace(firstMenu.children[0].key)
            } else {
              history.replace(firstMenu.key)
            }
          }
        }
      }
    },
    * updateMenu(action, { call, put }) {
      yield updateState(put, action.payload)
      return action.payload
    },
    * updateScreen(action, { call, put }) {
      yield updateState(put, action.payload)
      return action.payload
    },
    *getSystemTime(action, { put, call }) {
      const { result } = action.payload
      const { results } = result
      const timeDate = results.year + '/' + results.month + '/' + results.day + ' ' + results.time
      sessionStorage.setItem('timeDate', timeDate)
      yield updateState(put, { time: results, timeDate })
    },
    * jumpToPage({ payload }, { put }) {
      yield updateState(put, {
        selectedKeys: payload,
      })
      history.push(payload)
    },
    * fetchWarningCount(action, { call, put, select }) {
      const { firmId }: GlobalState = yield select(state => state[globalNS])
      let results = yield call(fetchWarningCount, { firmId })
      yield updateState(put, { moderateWarningCount: results.moderate, seriousWarningCount: results.serious })
    },
    * fetchImagePrefix(_, { call, put }) {
      // let results = yield call(fetchImagePrefix)
      let results = '/api/image/info?filePath='
      window.imagePrefix = results
      yield updateState(put, { imagePrefix: results })
    },
    * mustChangePassword(action, { call, put, select }) {
      const { oldPassword, newPassword } = action.payload
      const { userId, username } = yield getState(select)

      yield call(Service.changePassword, {
        userId: userId,
        userName: username,
        password: md5(oldPassword),
        newPassword: md5(newPassword)
      })
      message.success('更新密码成功')
      yield updateState(put, { mustChangePassword: false, oldPassword: '', newPassword: '', newPassword1: '' })
    }
  }
})
