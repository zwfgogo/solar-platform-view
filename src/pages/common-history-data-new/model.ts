// 左侧树组件设计
// 通过树组件和多选框组件结合实现
// 多选框选中的情况下，树组件对应的树节点增加半选，全选标记
// 存储一个checkKeyMap,树组件节点ID作键，值为一个对象包含是否全选，选中的对象{ checked: number[], checkboxOptions: [] }
// 通过对比checked和checkboxOptions的长度来判断是否全选，显示不同样式
// 存储一个checkedValueMap,多选框选中的ID作键，树组件节点ID为值

import { makeModel } from "../umi.helper";
import { h_d_q, Tree_Type } from "../constants";
import services from "./service";
import utils from "../../public/js/utils";
import { tempAnalogFilter } from "../storage-station-monitor/real-data-query/model";
import { isPvSystem, isStorageSystem } from "../../core/env";
import _ from 'lodash';

export const modelKey = "history-data-new";

export class HistoryDataNewState {
  treeList: any[] = [];
  defaultExpandedKeys: string[] = [];
  checkBoxOptions: any[] = [];
  chartData = {
    xData: [],
    yData: [],
    series: [],
  };
}

const defaultExpandedKeys = [];

export default makeModel(
  modelKey,
  new HistoryDataNewState(),
  (updateState, updateQuery, getState) => {
    return {
      *fetchDeviceTree({ payload }, { put, call }) {
        const { stationId } = payload;
        yield updateState(put, {
          treeList: [],
          defaultExpandedKeys: [],
        });
        defaultExpandedKeys.splice(0, defaultExpandedKeys.length);
        const data = yield call(services.fetchDeviceTree, {
          stationId,
          activity: true,
        });

        const treeList = formatTreeList([data.results]);
        yield updateState(put, {
          treeList,
          defaultExpandedKeys,
        });
      },
      *fetchPointDataType({ payload }, { call, put, select }) {
        // 点击设备树节点
        // 获取点号数据类型，存入pointDataTypeMap
        // 点击多选框的数据类型，通过pointDataTypeMap[deviceId-typeId]获取点号
        // 通过点号查询数据
        // 重新组装曲线数据刷新页面
        // const { checkKeyMap, pointDataTypeMap } = yield getState(select);
        yield updateState(put, {
          checkBoxOptions: [],
        })
        const { deviceId, deviceTypeId, deviceTitle } = payload;
        const data = yield call(services.fetchPointDataType, {
          deviceTypeId,
          deviceId,
        });

        // console.log('dataPointTypeList', data.results.dataPointTypeList, _.groupBy(data.results.dataPointTypeList, 'terminalTitle'))

        const pointDataType = isPvSystem()
          ? filterPointDataType(data)
          : data.results;
        let {
          dataPointTypeList,
          pointDataTypeMap: analogDataTypeMap,
        } = pointDataType;
        if (isStorageSystem()) {
          dataPointTypeList = tempAnalogFilter(dataPointTypeList);
        }


        const language = localStorage.getItem('language') || 'zh'
        // console.log('dataPointTypeList', dataPointTypeList, language)
        // 过滤出没有端子的数据(按端子分组)
        const checkBoxOptions = dataPointTypeList.find(i => i?.terminalTitle) ? 
        dataPointTypeList
        .filter(item => item?.terminalName && item.pointNumber) // 需要过滤点号 -- 徐旋
        .map((item) => ({
          // label: language === 'zh' ? item.title : item.signalTitle,
          id: item.id,
          label: item.title,
          value: item.pointNumber,
          unit: item?.unit,
          terminalTitle: item?.terminalTitle,
          accuracy: item?.accuracy,
          // title: language === 'zh' ? item.title : item.signalTitle,
          title: item.title,
          disabled: !analogDataTypeMap[item.id], // item.isSelect ? false : true,
        })) : dataPointTypeList
        .map((item) => ({
          // label: language === 'zh' ? item.title : item.signalTitle,
          id: item.id,
          label: item.title,
          value: item.pointNumber,
          unit: item?.unit,
          terminalTitle: item?.terminalTitle,
          title: item.title,
          accuracy: item?.accuracy,
          // title: language === 'zh' ? item.title : item.signalTitle,
          disabled: !analogDataTypeMap[item.id], // item.isSelect ? false : true,
        })) ;

        yield updateState(put, {
          checkBoxOptions,
        });
      },

      *fetchChartData({ payload }, { call, put, select }) {
        const { unitMap, date } = payload;
        const pointNumbers = Object.keys(unitMap);
        yield updateState(put, {
          chartData: {
            xData: [],
            yData: [],
            series: [],
          },
        });
        if (pointNumbers.length > 0) {
          const reply = yield call(services.fetchPointData, {
            pointNumbers: pointNumbers.join(","),
            startTime: date[0].format("YYYY-MM-DD"),
            endTime: date[1].format("YYYY-MM-DD"),
            fix: Object.values(unitMap).map(item => item.accuracy).join(),
            frequency: "original",
          });

          const { xData, yData } = reply.results;
          const series = [];

          const unitList = Object.values(unitMap);

          for (let i = 0; i < unitList.length; i++) {
            series.push({
              name: `${unitList[i]?.treeName}`,
              unit: unitList[i]?.name,
              value: Object.keys(unitMap)[i],
            });
          }
          yield updateState(put, {
            chartData: {
              xData,
              yData,
              series,
            },
          });
        } else {
          yield updateState(put, {
            chartData: {
              xData: [],
              yData: [],
              series: [],
            },
          });
        }
      },
    };
  }
);

// 树格式化 key值格式化成 0-0-1
const formatTreeList = (treeList) => {
  if (!treeList || !treeList.length) {
    return [];
  }

  return treeList.map((node, index) => {
    const { children, ...rest } = node;
    const type = node.type;
    if (children && children[0]?.type !== "Cell")
      defaultExpandedKeys.push(rest.key);
    return {
      ...rest,
      disabled:
        type == Tree_Type.virtualNode ||
        type == Tree_Type.station ||
        type == Tree_Type.energyUnit,
      children: formatTreeList(children),
    };
  });
};

// 光伏临时过滤点号
const filterAnalogNameList = [
  "ChargeMeterIndication",
  "DirectVoltage",
  "DirectCurrent",
  "ApparentPower",
  "ActivePower",
  "ReactivePower",
  "Temperature",
  "TimeStamp",
  "DischargeMeterIndication",
  "BreakerStatus",
  "S8C",
  "S7C",
  "S6C",
  "S5C",
  "S2C",
  "S4C",
  "S1C",
  "S3C",
  "Irradiance",
  "Humidity",
  "Voltage",
  "A_PhaseCurrent",
  "B_PhaseCurrent",
  "C_PhaseCurrent",
  "WindSpeed",
  "WindDirection",
  "Current",
  "AcFrequency",
  "AbPhaseLineVoltage",
  "BcPhaseLineVoltage",
  "CaPhaseLineVoltage",
  "Frequency",
  "S9C",
  "S10C",
  "S11C",
  "S12C",
  "S13C",
  "S14C",
  "InsulationImpedance",
  "ExternalTemperature",
  "AcBreakerStatus",
  "DcLoadBreakerStatus3",
  "P6",
  "DcLoadBreakerStatus2",
  "InverterBridgeTemp2",
  "GfdStatus",
  "CurrentDeratingStatus",
  "DcLoadBreakerStatus1",
  "SetPointReactivePower",
  "AcTemperatureRange",
  "InverterBridgeTemp3",
  "ExportedAmount",
  "ExportedDay",
  "DcTemperatureRange",
  "AuthenticationSecurityError",
  "Q9",
  "InternalTemperature",
  "InverterBridgeTemp1",
  "SetPointActivePower",
  "R3",
  "GridConnectionTime",
  "FaultCode",
  "R6",
  "Alarm",
  "InternalFault",
  "ReactivePowerGenerationAmount",
  "ReactivePowerpurchaseAmount",
  "EarthBreakerOn",
  "EarthBreakerFault",
  "EarthBreakerOff",
  "IsolatingBreakerOn",
  "IsolatingBreakerFault",
  "IsolatingBreakerOff",
  "BreakerOn",
  "BreakerFault",
  "BreakerOff",
  "T0",
  "PurchaseAmount",
  "PanelVoltage",
  "ModuleTemperature",
  "IrradianceEast",
  "IrradianceWest",
  "AcVoltage",
  "ApparentPurchaseAmount",
  "ApparentGenerationAmount",
  "T8",
  "T9",
  "U0",
  "AirTightPortPressureLevel",
  "ShutoffAirTightPortpressure",
  "AirTightPortTemp",
  "AirtightPressureTemperatureAlarm",
  "RunningTime",
  "PermissionDenied",
  "PermissionToConnect",
  "A0",
  "B2",
  "O2",
  "O4",
  "O6",
  "O7",
  "O8",
  "O9",
  "P0",
  "P1",
  "P2",
  "P3",
  "P4",
  "P5",
  "P7",
  "P8",
  "P9",
  "Q0",
  "Q1",
];
function filterPointDataType(data) {
  const { dataPointTypeList, pointDataTypeMap } = data.results;
  const list = dataPointTypeList.filter(
    (item) => filterAnalogNameList.indexOf(item.name) > -1
  );
  return {
    dataPointTypeList: list,
    pointDataTypeMap,
  };
}
