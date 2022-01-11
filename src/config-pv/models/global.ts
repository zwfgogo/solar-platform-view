import { history } from 'umi'
import Service from '../services/global'
import { makeModel } from '../pages/umi.helper'
import { globalNS, Socket_Port, settingNS } from '../pages/constants'
import services, { fetchImagePrefix, fetchWarningCount } from '../services/global2'
import gdata from '../public/js/gdata'
import { traverseTree } from '../pages/page.helper'
import { md5 } from '../util/utils'
import { message } from 'wanke-gui'
import { isDev, getSystemTheme } from '../core/env'
import SocketHelper from '../pages/socket.helper'
import utils from '../public/js/utils'
import { fetchStationList } from '../pages/common-basic-station/station.service'

const socket = new SocketHelper(globalNS, Socket_Port, '/overview', {
  forceNew: true,
  reconnectionAttempts: undefined, // 一直尝试重连
});
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
  stationList = []
  scenariosStationList = []
  allStationList = []
  selectedStation = { timeZone: '' }
  fullScreenState = false
  scenariosMenus = {} // 应用场景菜单
  menuToStationList = {}
  firm = {}
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
        sessionStorage.setItem('currency', data.currency ? data.currency : '')
        sessionStorage.setItem('timeZone', data.timeZone ? data.timeZone : '')
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
    * updateScreen(action, { call, put }) {
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
    * initSocket(action, { call, put, select }) {
      console.log('initSocket');
      const { dispatch } = action.payload;
      const { timeZone } = yield select(state => state[settingNS]);
      const { stationList } = yield select(state => state[globalNS]);
      socket.start(dispatch, {
        'abnormal': 'getAbnormal',
        'systemTime': 'getSystemTime'
      }, {
        'connect': () => {
          socket.emit('systemTime', { timeZoneId: timeZone || sessionStorage.getItem('timeZone') || 'Asia/Shanghai' });
        }
      })
    },
    * fetchWarningCount(action, { call, put, select }) {
      const userId = sessionStorage.getItem('user-id')
      socket.emit('abnormal', { userId });
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
      const { queryStr } = action.payload;
      const params = {
        userId: sessionStorage.getItem("user-id"),
        title: queryStr
      };
      const res = yield call(Service.getTableData, params);
      const data = res.results || {};
      const { results: list = [] } = data;
      const mapStationList = list.map((item, index) => ({
        ...item,
        key: index
      }));
      if (sessionStorage.getItem('stationActiveNode')) {
        let obj = mapStationList.find(item => item.id === JSON.parse(sessionStorage.getItem('stationActiveNode')).id);
        yield put({ type: "updateToView", payload: { activeNode: obj, stationDetail: obj } })
      } else {
        sessionStorage.setItem('stationActiveNode', JSON.stringify(mapStationList[0] ? mapStationList[0] : {}))
        yield put({ type: "updateToView", payload: { activeNode: mapStationList.length > 0 ? mapStationList[0] : '', stationDetail: mapStationList[0] ? mapStationList[0] : {} } });
      }
      yield put({ type: "updateToView", payload: { mapStationList } });
    },
    *getSearchMapStationList(action, { put, call }) {
      const { queryStr } = action.payload;
      const params = {
        userId: sessionStorage.getItem("user-id"),
        title: queryStr
      };
      const res = yield call(Service.getTableData, params);
      const data = res.results || {};
      const { results: list = [] } = data;
      const mapStationList = list.map((item, index) => ({
        ...item,
        key: index
      }));
      yield put({ type: "updateToView", payload: { mapStationList } });
    },
    * fetchStationList(action, { call, put }) {
      let data = yield call(fetchStationList, action.payload)
      let stationId = null
      let stationCode = null
      if (data.results.length > 0) {
        stationId = data.results[0].id
        stationCode = data.results[0].code
      }
      if (sessionStorage.getItem('station-id')) {
        let match = data.results.find(item => item.id == sessionStorage.getItem('station-id'))
        if (match) {
          stationId = match.id
          stationCode = match.code
        }
      }
      sessionStorage.setItem('station-id', stationId)
      yield updateState(put, {
        stationList: data.results,
        selectedStationId: stationId,
        selectedStationCode: stationCode,
        stationDetail: data.results.find(item => item.id === stationId),
        selectedStation: data.results.find(item => item.id === stationId)
      })
    },
    * getScenariosMenus(action, { call, put, select }) {
      const { results: scenariosMenus } = yield Service.getScenariosMenus()
      yield put({ type: "updateToView", payload: { scenariosMenus } });
    },
  }
})
