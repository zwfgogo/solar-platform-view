import { history } from 'umi'
import Service from '../services/global'
import { makeModel } from '../pages/umi.helper'
import { globalNS, Socket_Port, settingNS } from '../pages/constants'
import services, { fetchImagePrefix, fetchWarningCount } from '../services/global2'
import gdata from '../public/js/gdata'
import { traverseTree } from '../pages/page.helper'
import { md5 } from '../util/utils'
import { message } from 'wanke-gui'
import { isDev, getSystemTheme, setSystemTheme } from '../core/env'
import SocketHelper from '../pages/socket.helper'
import utils from '../public/js/utils'
import { fetchStationList } from '../pages/common-basic-station/station.service'

const socket = new SocketHelper(globalNS, Socket_Port, '/overview', {
  forceNew: true,
  reconnectionAttempts: undefined, // 一直尝试重连
})

// Todo: 临时 目前电池健康平台没有亮色系
// sessionStorage.setItem('theme', 'dark-theme')
setSystemTheme('dark-theme')

export class GlobalState {
  imagePrefix = ''
  userId = null
  username = ''
  firmId = ''
  roleId = null
  roleName = ''
  root = null
  individual = null
  showName = ''
  firmType = ''
  collapsed = false
  menu = []
  selectedKeys = []
  openKeys = []
  moderateWarningCount = 0
  seriousWarningCount = 0
  language = localStorage.getItem('language') || 'zh'
  theme = getSystemTheme()

  time = { year: '', month: '', day: '', time: '' }
  mustChangePassword = false
  oldPassword = ''
  newPassword = ''
  newPassword1 = ''
  activeNode = ''
  mapStationList = []
  stationDetail = {}
  stationId = null
  stations = []
  energyList = []
  firm = {}
  selectedEnergyUnitId = null
  energyUnitList = []
}

export default makeModel(globalNS, new GlobalState(), (updateState, updateQuery, getState) => {
  return {
    * $getInfo({ payload }, { call, put, select }) {
      try {
        const userId = sessionStorage.getItem('user-id')
        const language = localStorage.getItem('language') || 'zh'
        if (!userId) {
          history.push('/')
          return
        }
        const data = yield call(services.getInfo, { id: userId })
        gdata('userInfo', data)
        sessionStorage.setItem('userInfo', JSON.stringify(data))
        localStorage.setItem('currency', data.currency ? data.currency : '')
        sessionStorage.setItem('timeZone', 'Asia/Shanghai')
        sessionStorage.setItem('role-id', data.role.id)
        sessionStorage.setItem('isAdmin', data.role.name)
        yield updateState(put, {
          language,
          userId,
          individual: data.individual || false,
          username: data.name,
          showName: data.title,
          firmId: data.firm.id,
          root: data.firm.root,
          roleName: data.role.name,
          roleId: data.role.id,
          firmType: data.firm.firmType?.name,
          mustChangePassword: data.resetPassword,
          firm: data?.firm
        })
        yield put({ type: 'getMenu' })
        const { dispatch } = payload;
        const { timeZone } = yield select(state => state[settingNS]);
        socket.start(dispatch, {
          'systemTime': 'getSystemTime'
        }, {
          'connect': () => {
            const userId = sessionStorage.getItem('user-id')
            socket.emit('systemTime', { timeZoneId: timeZone || sessionStorage.getItem('timeZone') || 'Asia/Shanghai' });
          }
        })
      } catch (res) {
        // 用户没有登录
        history.push('/')
      }
    },
    * getMenu(action, { call, put, select }) {
      const res = yield Service.getMenus({ userId: sessionStorage.getItem('user-id') })
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
      const pathname = state.router.location.pathname
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
    * updateToView(action, { call, put }) {
      yield updateState(put, action.payload)
      return action.payload
    },
    *emitSocket(action, { put, call }) {
      const { eventName, params = {} } = action.payload
      socket.emit(eventName, params)
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
    * fetchImagePrefix(_, { call, put }) {
      // let results = yield call(fetchImagePrefix)
      let results = '/api/image/info?filePath='
      window.imagePrefix = results
      yield updateState(put, { imagePrefix: results })
    },
    * fetchWarningCount(action, { call, put, select }) {
      const { dispatch } = action.payload;
      const { timeZone } = yield select(state => state[settingNS]);
      socket.start(dispatch, {
        'abnormal': 'getAbnormal',
        'systemTime': 'getSystemTime'
      }, {
        'connect': () => {
          const userId = sessionStorage.getItem('user-id')
          socket.emit('abnormal', { userId });
          socket.emit('systemTime', { timeZoneId: timeZone || sessionStorage.getItem('timeZone') || 'Asia/Shanghai' });
        }
      })
      // const {firmId}: GlobalState = yield select(state => state[globalNS])
      // let results = yield call(fetchWarningCount, {firmId})
      // yield updateState(put, {moderateWarningCount: results.moderate, seriousWarningCount: results.serious})
    },
    *getAbnormal(action, { put, call }) {
      const { result } = action.payload
      const { results } = result
      const { Slight = 0, Moderate = 0, Serious = 0 } = results
      yield updateState(put, { moderateWarningCount: Moderate, seriousWarningCount: Serious })
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
      message.success(utils.intl('更新密码成功'))
      yield updateState(put, { mustChangePassword: false, oldPassword: '', newPassword: '', newPassword1: '' })
    },
    *getMapStationList(action, { put, call }) {
      // const { queryStr } = action.payload;
      // const params = {
      //   userId: sessionStorage.getItem("user-id"),
      //   title: queryStr
      // };
      // const res = yield call(Service.getTableData, params);
      // const data = res.results || {};
      // const { results: list = [] } = data;
      // const mapStationList = list.map((item, index) => ({
      //   ...item,
      //   key: index
      // }));
      // if (sessionStorage.getItem('stationActiveNode')) {
      //   let obj = mapStationList.find(item => item.id === JSON.parse(sessionStorage.getItem('stationActiveNode')).id);
      //   yield put({ type: "updateToView", payload: { activeNode: obj, stationDetail: obj } })
      // } else {
      //   yield put({ type: "updateToView", payload: { activeNode: mapStationList.length > 0 ? mapStationList[0] : '', stationDetail: mapStationList[0] ? mapStationList[0] : {} } });
      // }
      // yield put({ type: "updateToView", payload: { mapStationList } });
    },
    *getSearchMapStationList(action, { put, call }) {
      // const { queryStr } = action.payload;
      // const params = {
      //   userId: sessionStorage.getItem("user-id"),
      //   title: queryStr
      // };
      // const res = yield call(Service.getTableData, params);
      // const data = res.results || {};
      // const { results: list = [] } = data;
      // const mapStationList = list.map((item, index) => ({
      //   ...item,
      //   key: index
      // }));
      // yield put({ type: "updateToView", payload: { mapStationList } });
    },
    // 获取电站列表
    * getStations(_, { select, put }) {
      const firmId = sessionStorage.getItem('firm-id')
      const userId = sessionStorage.getItem('user-id')
      if (!userId) {
        history.push('/')
        return
      }
      const { results: stations } = yield Service.getStations({
        userId,
        firmId
      })
      if (stations && stations.length) {
        yield put({ type: 'getEnergyListByStationId', payload: { stationId: stations[0].value } }) // 根据电站id查询能量单元
        yield put({ type: 'updateToView', payload: { stations, stationId: stations[0].value } })
      }
    },

    // 根据电站id查询能量单元
    *getEnergyListByStationId({ payload: { stationId } }, { put }) {
      const { results: energyList } = yield Service.getEnergyListByStationId({ stationId })
      yield put({ type: 'updateToView', payload: { energyList } })
      return energyList
    },
    * fetchStationList(action, { call, put }) {
      let data = yield call(fetchStationList, action.payload)
      let stationId = null
      if (data.results.length > 0) {
        stationId = data.results[0].id
      }
      if (sessionStorage.getItem('station-id')) {
        let match = data.results.find(item => item.id == sessionStorage.getItem('station-id'))
        if (match) {
          stationId = match.id
        }
      }
      sessionStorage.setItem('station-id', stationId)
      yield updateState(put, {
        stationList: data.results,
        selectedStationId: stationId,
        stationDetail: data.results.find(item => item.id === stationId),
        selectedStation: data.results.find(item => item.id === stationId)
      })
    },
  }
})
