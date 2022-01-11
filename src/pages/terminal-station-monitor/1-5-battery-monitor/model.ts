import moment from 'moment'

import { makeModel } from '../../umi.helper'
import { terminal_battery_monitor } from '../../constants'
import { fetchHistoryChart, fetchChildDevice, fetchPackDetailOptions, fetchBatteryInfo } from './battery-monitor.server'
import { getDateStr } from '../../../util/dateUtil'
import { enumsApi } from '../../../services/global2'
import services from '../../../services/global'
import { result } from 'lodash'

export class BatteryMonitorState {
  options1 = [] // 能量单元
  options2 = [] // 电池单元
  options3 = [] // 电池簇
  options4 = [] // 电池包
  value1 = null
  value2 = null
  value3 = null
  value4 = null
  showTemporaryDialog = false
  showVoltageDialog = false
  showResistanceDialog = false

  detail = {
    list: [],
    maxVoltage: null,
    minVoltage: null,
    maxTemperature: null,
    minTemperature: null,
    maxResistance: null,
    minResistance: null,
    lastUpdateTime: null
  }
  pointNumberMap = {}
  batteryType = null

  pointNumber = null
  historyStartDate = getDateStr(moment())
  historyEndDate = getDateStr(moment())
  chartInfo = {
    xData: [],
    yData: [],
    series: []
  }
}

export default makeModel(terminal_battery_monitor, new BatteryMonitorState(), (updateState, updateQuery, getState) => {
  return {
    * fetchEnergyUnitOptions({ payload }, { call, put, select }) {
      const { stationId, timeZone } = payload;
      let results = yield call(enumsApi, { resource: 'energyUnits', hasAll: false, activity: true, stationId })
      yield updateState(put, { options1: results })
      if (results.length > 0) {
        yield updateState(put, { value1: results[0].value })
        yield put.resolve({
          type: 'fetchBatteryUnitOptions', payload: {
            energyUnitId: results[0].value,
            socketClient: payload.socketClient,
            timeZone
          }
        })
      }
    },
    * fetchBatteryUnitOptions({ payload }, { call, put }) {
      const { energyUnitId, timeZone } = payload;
      const results = yield call(enumsApi, { energyUnitId, resource: 'devices', activity: true, deviceTypeName: 'BatteryUnit' })
      yield updateState(put, { options2: results });
      if (results.length > 0) {
        yield updateState(put, { value2: results[0].value })
        yield put.resolve({
          type: 'fetchPackOptions', payload: {
            deviceId: results[0].value,
            deviceTypeName: 'BatteryCluster',
            socketClient: payload.socketClient,
            timeZone
          }
        })
      } else {
        yield updateState(put, { value2: null, detail: new BatteryMonitorState().detail })
      }
    },
    * fetchPackOptions({ payload }, { call, put }) {
      const { deviceId, deviceTypeName, timeZone } = payload;

      let results = yield call(fetchChildDevice, { deviceId, deviceTypeName })
      yield updateState(put, { options3: results })
      if (results.length > 0) {
        yield updateState(put, { value3: results[0].value })
        yield put.resolve({
          type: 'fetchPackDetailOptions', payload: {
            deviceId: results[0].value,
            deviceTypeName: 'Pack',
            socketClient: payload.socketClient,
            timeZone
          }
        })
      } else {
        yield updateState(put, { value3: null, detail: new BatteryMonitorState().detail })
        yield put({ type: 'fetchBatteryInfo', payload: { socketClient: payload.socketClient, timeZone: timeZone } })
      }
    },
    * fetchPackDetailOptions({ payload }, { call, put, select }) {
      const { deviceId, deviceTypeName, timeZone } = payload;
      let results = yield call(fetchChildDevice, { deviceId, deviceTypeName })
      yield updateState(put, { options4: results })
      if (results.length > 0) {
        yield updateState(put, { value4: results[0].value })
      } else {
        yield updateState(put, { value4: null, detail: new BatteryMonitorState().detail })
      }
      yield put({ type: 'fetchBatteryInfo', payload: { socketClient: payload.socketClient, timeZone: timeZone } })
    },
    * fetchBatteryInfo({ payload }, { call, put, select }) {
      const { value3, value4 } = yield getState(select);
      const { timeZone, socketClient } = payload;
      const results = yield call(fetchBatteryInfo, { parentId: value4 ? value4 : value3, timeZone: timeZone });
      const detail = {
        list: results.results,
        maxVoltage: results.maxVoltage,
        minVoltage: results.minVoltage,
        maxTemperature: results.maxTemperature,
        minTemperature: results.minTemperature,
        maxResistance: results.maxResistance,
        minResistance: results.minResistance,
        lastUpdateTime: results.lastUpdateTime
      }
      const pointNumberMap = {};
      for (const item of results.results) {
        pointNumberMap[item.voltagePointNumber] = { batteryId: item.batteryId, val: null, property: 'voltage' };
        pointNumberMap[item.temperaturePointNumber] = { batteryId: item.batteryId, val: null, property: 'temperature' };
        pointNumberMap[item.resistancePointNumber] = { batteryId: item.batteryId, val: null, property: 'resistance' };
      }
      // Temperature,Voltage,Resistance 铅酸铅炭
      // Temperature,Voltage 磷酸铁锂，三元锂电池
      yield updateState(put, {
        detail,
        pointNumberMap,
        batteryType: results.batteryType,
      });
      yield put({ type: 'reConnectSocket', payload: { timeZone, socketClient } })
    },
    * reConnectSocket(action, { select }) {
      const { pointNumberMap } = yield getState(select);
      const { timeZone, socketClient } = action.payload;
      const keys = Object.keys(pointNumberMap);
      const pointNumbers = [];
      for (const item of keys) {
        if (item !== 'null') {
          pointNumbers.push(item);
        }
      }
      socketClient.emit('detail', {
        pointNumbers: pointNumbers.join(','),
        timeZone
      })
    },
    * fetchHistoryChart(action, { call, put, select }) {
      const { pointNumber } = action.payload
      const { historyStartDate, historyEndDate } = yield getState(select)
      // 不清空会导致x轴坐标消失
      yield updateState(put, {
        chartInfo: {
          xData: [],
          yData: [],
          series: []
        }
      })
      const results = yield call(fetchHistoryChart, { pointNumber, startDate: historyStartDate, endDate: historyEndDate })
      yield updateState(put, {
        chartInfo: {
          xData: results.xData,
          yData: results.yData,
          series: results.series
        }
      })
    }
  }
})
