import services from '../services'
import { message } from 'wanke-gui'
import { globalNS, battery_cabin, Socket_Port } from '../../constants'
import { makeModel } from '../../umi.helper'
import { GlobalState } from '../../../models/global'
import utils from '../../../public/js/utils'
import { history } from 'umi'
import SocketHelper from '../../socket.helper'
import { ViewMode } from '../constants'
import moment from 'moment'
import { formatChartData, formatChartDataCumulative, sortChartData } from '../../page.helper'

const socket = new SocketHelper(battery_cabin, Socket_Port, "/measurements");

const chartsList = ['currentChart', 'voltageChart', 'powerChart', 'socChart']
const dataKeyMap = ['Current', 'Voltage', 'ActivePower', 'SOC']
const chartsUnit = ['A', 'V', 'kW', '%']

export class BatteryCabinState {
  // stationId = null; // 当前选中的电站id
  // stations = [] // 电站集合
  // energyList = [] // 能量单元集合
  // 运行数据曲线
  runningDataType = ViewMode.BatteryUnit // 查看类型
  viewTime = moment() // 查看时间
  selectParentDeviceId = null // 选中父节点
  selectDeviceIds = [] // 选中设备列表
  batteryUnitList = [] // 电池单元选项列表
  batteryClusterList = [] // 电池组/簇/串选项列表
  packList = [] // 电池包列表
  currentChart = {}
  voltageChart = {}
  powerChart = {}
  socChart = {}
}

export default makeModel(battery_cabin, new BatteryCabinState(), (updateState, updateQuery, getState) => {
  return {
    // 初始化运行数据曲线数据
    *resetSocketDate(action, { put, call }) {
        const newState = new BatteryCabinState()
        yield put({
        type: 'updateToView',
        payload: {
          currentChart: newState.currentChart,
          voltageChart: newState.voltageChart,
          powerChart: newState.powerChart,
          socChart: newState.socChart,
        } 
      })
    },
    // 初始化运行数据曲线socket
    *initSocket(action, { put, select }) {
      const { dispatch } = action.payload
      socket.start(dispatch, {
        'runningData': 'socketRunningData'
      }, {
        'connect': () => {
        },
        'reconnect': (e) => {
          // dispatch({ type: `${battery_cabin}/resetSocketDate` })
          dispatch({ type: `${battery_cabin}/fetchRunningData` })
        }
      })
    },
    *socketRunningData(action, { put, call, select }) {
      const state = yield select(state => state[battery_cabin])
      let {
        selectDeviceIds,
        runningDataType,
        batteryClusterList,
        packList,
        batteryUnitList
      } = state
      const deviceNameMap: any = {}
      let multipleSelectList = []
      if (runningDataType === ViewMode.BatteryCluster) {
        multipleSelectList = batteryClusterList
      } else if (runningDataType === ViewMode.Pack) {
        multipleSelectList = packList
      } else {
        multipleSelectList = batteryUnitList
      }
      multipleSelectList.forEach(item => {
        deviceNameMap[item.name] = item.value
      })

      const { result } = action.payload
      chartsList.forEach((key, index) => {
        const resultKey = dataKeyMap[index]
        const resultItem = result[resultKey] || {}
        // const deviceNames = deviceIds
        const chart = state[key]
        const deviceNames = state[key].series?.map(item => item.name) || []
        const deviceIds = deviceNames.map(name => deviceNameMap[name])
        chart.yData = state[key].series?.map((_, index) => chart.yData?.[index]?.length ? chart.yData[index] : (chart.xData || []).map(i => ({value: 0, show: false})))

        // chart.yData = state[key].series?.map((_, index) => (chart.xData || []).map(i => ({value: 0, show: false})))
        state[key] = sortChartData(formatChartData(
          chart,
          formatDate(resultItem, deviceNames, 'YYYY-MM-DD HH:mm:ss', deviceIds),
          deviceNames
        ))
      })

      yield put({
        type: 'updateToView',
        payload: {
          currentChart: state.currentChart,
          voltageChart: state.voltageChart,
          powerChart: state.powerChart,
          socChart: state.socChart
        }
      })
    },
    *fetchRunningData(action, { put, select }) {
      const {
        viewTime,
        runningDataType,
        selectDeviceIds,
        batteryClusterList,
        packList,
        batteryUnitList
      } = yield select(state => state[battery_cabin])
      if (selectDeviceIds.length) {
        const newState = getChartsInitData(selectDeviceIds, runningDataType, batteryClusterList, packList, batteryUnitList)
        yield put({ type: 'updateToView', payload: newState })
        socket.emit('runningData', {
          viewTime: viewTime.format('YYYY-MM-DD'),
          type: runningDataType,
          deviceIds: selectDeviceIds.join(',')
        })
      }
    },
    *fetchBatteryUnit(action, { put, call, select }) {
      const { realEnergyId } = action.payload
      const { results } = yield call(services.getBatteryUnitByEnergyId, { energyUnitId: realEnergyId })
      const batteryUnitList = results?.map(item => ({ name: item.title, value: item.id })) || []
      yield put({
        type: 'updateToView',
        payload: { batteryUnitList }
      })
      return batteryUnitList
    },
    *fetchBatteryCluster(action, { put, call, select }) {
      let { id } = action.payload
      const { results } = yield call(services.getdeviceListBySuperId, { superId: id, deviceTypeName: 'BatteryCluster' })
      const batteryClusterList = results?.map(item => ({ name: item.title, value: item.id })) || []
      yield put({
        type: 'updateToView',
        payload: { batteryClusterList }
      })
      return batteryClusterList
    },
    *fetchPack(action, { put, call, select }) {
      let { id } = action.payload
      const { results } = yield call(services.getdeviceListBySuperId, { superId: id, deviceTypeName: 'Pack' })
      const packList = results?.map(item => ({ name: item.title, value: item.id })) || []
      console.log('fetchPack', results)
      yield put({
        type: 'updateToView',
        payload: { packList }
      })
      return packList
    },
  }
})

function formatDate(data, attrList, formater, idList) {
  const result = { ...data };
  attrList.forEach((key, index)=> {
    const id = idList[index]
    result[key] = (result[id] || []).map(item => ({
      ...item,
      val: item.val ? Number(item.val.toFixed(2)) : item.val,
      dtime: item.dtime ? moment(item.dtime).format(formater) : item.dtime
    }))
  })
  return result
}

function getChartsInitData(selectDeviceIds, runningDataType, batteryClusterList, packList, batteryUnitList) {
  const deviceNameMap: any = {}
  let multipleSelectList = []
  if (runningDataType === ViewMode.BatteryCluster) {
    multipleSelectList = batteryClusterList
  } else if (runningDataType === ViewMode.Pack) {
    multipleSelectList = packList
  } else {
    multipleSelectList = batteryUnitList
  }
  multipleSelectList.forEach(item => {
    deviceNameMap[item.value] = item.name
  })
  
  const newState = { currentChart: {}, voltageChart: {}, powerChart: {}, socChart: {} }
  chartsList.forEach((key, index) => {
    newState[key].series = selectDeviceIds.map(id => {
      return { name: deviceNameMap[id], unit: chartsUnit[index] }
    })
  })
  return newState
}
