// 左侧树组件设计
// 通过树组件和多选框组件结合实现
// 多选框选中的情况下，树组件对应的树节点增加半选，全选标记
// 存储一个checkKeyMap,树组件节点ID作键，值为一个对象包含是否全选，选中的对象{ checked: number[], checkboxOptions: [] }
// 通过对比checked和checkboxOptions的长度来判断是否全选，显示不同样式
// 存储一个checkedValueMap,多选框选中的ID作键，树组件节点ID为值

import { makeModel } from '../umi.helper';
import { h_d_q, Tree_Type } from '../constants';
import services from './service';
import { copy } from '../../util/utils';
import { isPvSystem, isStorageSystem } from '../../core/env';
import { tempAnalogFilter } from '../storage-station-monitor/real-data-query/model';

interface ICheckboxOptions {
  label: string,
  value: number,
  disabled: boolean,
  unit: string
}

export class HistoryDataQueryState {
  treeList = []
  dataPointTypeList = []
  currentSelectNode = {
    deviceId: null,
    deviceTypeId: null,
    deviceTitle: null
  }
  pointDataTypeMap = {}
  // 树节点对于多选框内容的映射
  // deviceId作键，值为当前树节点下checked数组,deviceTitle和checkboxOptions数组
  checkKeyMap = {}
  // 当前多选框的可选项
  checkboxOptions: ICheckboxOptions[] = []
  // 是否达到总数据上限
  isThan = false
  // 多选框选中的值
  checkedValues = []
  total = 0
  chartData = {
    xData: [],
    yData: [],
    series: []
  }
  // 设备对应能量单元名字map
  energyUnitNameMap = {}
}

export default makeModel(h_d_q, new HistoryDataQueryState(), (updateState, updateQuery, getState) => {
  return {
    * fetchDeviceTree({ payload }, { put, call }) {
      const { stationId } = payload;
      const data = yield call(services.fetchDeviceTree, { stationId, activity: true });
      const energyUnitNameMap = getDeviceEnergyUnitNameMap([data.results])
      // console.log('energyUnitNameMap', energyUnitNameMap)
      yield updateState(put, {
        treeList: formatTreeList([data.results]),
        energyUnitNameMap
      });
    },
    * fetchPointDataType({ payload }, { call, put, select }) {
      // 点击设备树节点
      // 获取点号数据类型，存入pointDataTypeMap
      // 点击多选框的数据类型，通过pointDataTypeMap[deviceId-typeId]获取点号
      // 通过点号查询数据
      // 重新组装曲线数据刷新页面
      const { checkKeyMap, pointDataTypeMap } = yield getState(select)
      const { deviceId, deviceTypeId, deviceTitle } = payload;
      const data = yield call(services.fetchPointDataType, { deviceTypeId, deviceId });
      const pointDataType = isPvSystem() ? filterPointDataType(data) : data.results;
      let { dataPointTypeList, pointDataTypeMap: analogDataTypeMap } = pointDataType;
      if (isStorageSystem()) {
        dataPointTypeList = tempAnalogFilter(dataPointTypeList);
      }
      const tempPointDataTypeMap = copy(pointDataTypeMap);
      const typeIds = [];
      for (const item of dataPointTypeList) {
        tempPointDataTypeMap[`${deviceId}-${item.id}`] = { value: null, dtime: null, pointNumber: null };
        typeIds.push(item.id);
      }
      for (const key in analogDataTypeMap) {
        if (tempPointDataTypeMap[`${deviceId}-${key}`]) {
          tempPointDataTypeMap[`${deviceId}-${key}`].pointNumber = analogDataTypeMap[key].pointNumber;
        }

        if (analogDataTypeMap[key].pointNumber) {
          const one = dataPointTypeList.find(e => `${e.id}` === `${key}`)
          if (one) {
            one.isSelect = true;
          }
        }
      }

      const checkboxOptions = dataPointTypeList.map(item => ({
        label: item.title,
        value: `${deviceId}-${item.id}`,
        unit: item?.unit?.name,
        disabled: item.isSelect ? false : true,
      }));
      if (!checkKeyMap[deviceId]) {
        yield updateState(put, {
          checkKeyMap: { ...checkKeyMap, [deviceId]: { checked: [], checkboxOptions, deviceTitle } }
        })
      }
      yield updateState(put, {
        dataPointTypeList: dataPointTypeList,
        pointDataTypeMap: tempPointDataTypeMap,
        checkboxOptions
      });
    },
    * updateCurrentSelectNode({ payload }, { call, put }) {
      const { deviceId, deviceTypeId, deviceTitle } = payload;
      yield updateState(put, {
        currentSelectNode: { deviceId, deviceTypeId, deviceTitle }
      });
    },
    * updateState({ payload }, { call, put }) {
      yield updateState(put, {
        ...payload
      });
    },
    * updateCheckbox({ payload }, { call, put, select }) {
      const { checkKeyMap, pointDataTypeMap, currentSelectNode } = yield getState(select)
      const { checkedValues, deviceId, startTime, endTime } = payload;
      // 因为选中的时候已经添加了该ID为键的初始对象，这里只需要更新checked
      const tempCheckKeyMap = copy(checkKeyMap);
      const curCheckMap = tempCheckKeyMap[deviceId];
      curCheckMap.checked = checkedValues;
      const tempCheckedValues = [];
      for (const key in tempCheckKeyMap) {
        tempCheckedValues.push(...tempCheckKeyMap[key].checked);
      }
      yield updateState(put, {
        checkKeyMap: tempCheckKeyMap,
        checkedValues: tempCheckedValues,
      });
      if (!tempCheckedValues.length) {
        yield updateState(put, {
          chartData: new HistoryDataQueryState().chartData
        })
        return;
      }
      const pointNumbers = [];
      for (const item of tempCheckedValues) {
        const [deviceId, deviceTypeId] = item.value.split('-');
        pointNumbers.push(pointDataTypeMap[`${deviceId}-${deviceTypeId}`].pointNumber);
      }
      if (pointNumbers.length) {
        const reply = yield call(services.fetchPointData, {
          pointNumbers: pointNumbers.join(','),
          startTime,
          endTime,
          frequency: 'original'
        });

        const { xData, yData } = reply.results;
        const series = [];
        for (let i = 0, len = tempCheckedValues.length; i < len; i++) {
          series.push({
            name: `${tempCheckedValues[i].label}`,
            unit: tempCheckedValues[i].unit,
            value: tempCheckedValues[i].value
          });
        }
        yield updateState(put, {
          chartData: {
            xData,
            yData,
            series
          }
        });
      }
    },
    * fetchPointData({ payload }, { call, put, select }) {
      const { checkedValues, pointDataTypeMap } = yield getState(select);
      const { startTime, endTime } = payload;
      const pointNumbers = [];
      for (const item of checkedValues) {
        const [deviceId, deviceTypeId] = item.value.split('-');
        pointNumbers.push(pointDataTypeMap[`${deviceId}-${deviceTypeId}`].pointNumber);
      }
      if (!checkedValues.length) {
        yield updateState(put, {
          chartData: new HistoryDataQueryState().chartData
        })
        return;
      }
      const reply = yield call(services.fetchPointData, {
        pointNumbers: pointNumbers.join(','),
        startTime,
        endTime,
        frequency: 'original'
      });

      const { xData, yData } = reply.results;
      const series = [];
      for (let i = 0, len = checkedValues.length; i < len; i++) {
        if(checkedValues[i].label !== 'undefined')
          series.push({
            name: `${checkedValues[i].label}`,
            unit: checkedValues[i].unit
          });
      }
      yield updateState(put, {
        chartData: {
          xData,
          yData,
          series
        }
      });
    }
  }
})

function getDeviceEnergyUnitNameMap(tree, map = {}, energyUnitName?) {
  tree.forEach(node => {
    if (energyUnitName && node.id) {
      map[node.id] = energyUnitName
    }
    if (node.type === 'EnergyUnit') {
      energyUnitName = node.title
    }
    if (node.children) {
      getDeviceEnergyUnitNameMap(node.children, map, energyUnitName)
    }
  })
  return map
}

// 树格式化 key值格式化成 0-0-1
const formatTreeList = (treeList) => {
  if (!treeList || !treeList.length) {
    return []
  }

  return treeList.map((node, index) => {
    const { children, ...rest } = node
    const type = node.type

    return {
      ...rest,
      disabled: type == Tree_Type.virtualNode || type == Tree_Type.station || type == Tree_Type.energyUnit,
      children: formatTreeList(children)
    }
  })
}

// 光伏临时过滤点号
const filterAnalogNameList = ["ChargeMeterIndication", "DirectVoltage", "DirectCurrent", "ApparentPower", "ActivePower", "ReactivePower", "Temperature", "TimeStamp", "DischargeMeterIndication", "BreakerStatus", "S8C", "S7C", "S6C", "S5C", "S2C", "S4C", "S1C", "S3C", "Irradiance", "Humidity", "Voltage", "A_PhaseCurrent", "B_PhaseCurrent", "C_PhaseCurrent", "WindSpeed", "WindDirection", "Current", "AcFrequency", "AbPhaseLineVoltage", "BcPhaseLineVoltage", "CaPhaseLineVoltage", "Frequency", "S9C", "S10C", "S11C", "S12C", "S13C", "S14C", "InsulationImpedance", "ExternalTemperature", "AcBreakerStatus", "DcLoadBreakerStatus3", "P6", "DcLoadBreakerStatus2", "InverterBridgeTemp2", "GfdStatus", "CurrentDeratingStatus", "DcLoadBreakerStatus1", "SetPointReactivePower", "AcTemperatureRange", "InverterBridgeTemp3", "ExportedAmount", "ExportedDay", "DcTemperatureRange", "AuthenticationSecurityError", "Q9", "InternalTemperature", "InverterBridgeTemp1", "SetPointActivePower", "R3", "GridConnectionTime", "FaultCode", "R6", "Alarm", "InternalFault", "ReactivePowerGenerationAmount", "ReactivePowerpurchaseAmount", "EarthBreakerOn", "EarthBreakerFault", "EarthBreakerOff", "IsolatingBreakerOn", "IsolatingBreakerFault", "IsolatingBreakerOff", "BreakerOn", "BreakerFault", "BreakerOff", "T0", "PurchaseAmount", "PanelVoltage", "ModuleTemperature", "IrradianceEast", "IrradianceWest", "AcVoltage", "ApparentPurchaseAmount", "ApparentGenerationAmount", "T8", "T9", "U0", "AirTightPortPressureLevel", "ShutoffAirTightPortpressure", "AirTightPortTemp", "AirtightPressureTemperatureAlarm", "RunningTime", "PermissionDenied", "PermissionToConnect", "A0", "B2", "O2", "O4", "O6", "O7", "O8", "O9", "P0", "P1", "P2", "P3", "P4", "P5", "P7", "P8", "P9", "Q0", "Q1"]
function filterPointDataType(data) {
  const { dataPointTypeList, pointDataTypeMap } = data.results;
  const list = dataPointTypeList.filter(item => filterAnalogNameList.indexOf(item.name) > -1)
  return {
    dataPointTypeList: list,
    pointDataTypeMap
  }
}
