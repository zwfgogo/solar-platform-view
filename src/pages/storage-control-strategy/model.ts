// import Service from '/services/global'
import { getAction, makeModel } from '@/pages/umi.helper'
import { history } from 'umi'
// import { strategyNS } from '@/pages/constants'
// import utils from '@/public/js/utils'
// import { SERVICE_MAP } from '@/common/paramsMap'

export class strategyModel {
  strategyInfoList = [
    {
      "id": 1,
      "title": "光伏发电计划跟踪",
      "energyUnitId": "74",
      "energyUnitTitle": "1#储能单元",
      "status": 0
    },
    {
      "id": 2,
      "title": "光伏限电储能充电",
      "energyUnitId": "74",
      "energyUnitTitle": "1#储能单元",
      "status": 0
    },
    {
      "id": 3,
      "title": "有功控制/削峰填谷",
      "energyUnitId": "74",
      "energyUnitTitle": "1#储能单元",
      "status": 0
    }
  ]
  strategyInfoPage = 1
  strategyInfoSize = 20
  strategyInfoTotal = 5
  strategyParamList = [
    {
      "id": 74,
      "name": null,
      "title": "山东项目储能单元",
      "ratedPower": 999999,
      "scale": 9999,
      "remark": null,
      "hasTransformer": null,
      "activity": true,
      "plannedProductionTime": "2020-09-11 17:57:00",
      "plannedProductionMillisecond": 1599818220000,
      "productionTime": "2020-09-11 17:57:00",
      "productionMillisecond": 1599818220000,
      "sn": 1599818187893,
      "type": null,
      "energyUnitType": {
        "id": 382,
        "name": "Storage",
        "title": "储能",
        "sn": 1,
        "activity": true,
        "regions": null,
        "deviceTypes": [
          {
            "id": 144,
            "name": "BatteryUnit",
            "title": "电池单元",
            "sn": 6,
            "activity": true,
            "terminalNum": null,
            "inputOutputEqual": null,
            "inputOutputReverse": null,
            "deviceProperty": null,
            "deviceCategory": {
              "id": 198,
              "name": "StorageBattery",
              "title": "储能电池",
              "sn": 5,
              "activity": true
            },
            "regions": null,
            "terminals": null,
            "isDefault": true
          },
          {
            "id": 145,
            "name": "BatteryCluster",
            "title": "电池簇/组/串",
            "sn": 7,
            "activity": true,
            "terminalNum": null,
            "inputOutputEqual": null,
            "inputOutputReverse": null,
            "deviceProperty": null,
            "deviceCategory": {
              "id": 198,
              "name": "StorageBattery",
              "title": "储能电池",
              "sn": 5,
              "activity": true
            },
            "regions": null,
            "terminals": null,
            "isDefault": true
          },
          {
            "id": 146,
            "name": "Pack",
            "title": "电池包",
            "sn": 8,
            "activity": true,
            "terminalNum": null,
            "inputOutputEqual": null,
            "inputOutputReverse": null,
            "deviceProperty": null,
            "deviceCategory": {
              "id": 198,
              "name": "StorageBattery",
              "title": "储能电池",
              "sn": 5,
              "activity": true
            },
            "regions": null,
            "terminals": null,
            "isDefault": true
          },
          {
            "id": 147,
            "name": "Cell",
            "title": "单体电池",
            "sn": 9,
            "activity": true,
            "terminalNum": null,
            "inputOutputEqual": null,
            "inputOutputReverse": null,
            "deviceProperty": null,
            "deviceCategory": {
              "id": 198,
              "name": "StorageBattery",
              "title": "储能电池",
              "sn": 5,
              "activity": true
            },
            "regions": null,
            "terminals": null,
            "isDefault": true
          },
          {
            "id": 149,
            "name": "Container",
            "title": "集装箱",
            "sn": 11,
            "activity": true,
            "terminalNum": null,
            "inputOutputEqual": null,
            "inputOutputReverse": null,
            "deviceProperty": null,
            "deviceCategory": {
              "id": 199,
              "name": "DeviceContainer",
              "title": "设备容器",
              "sn": 6,
              "activity": true
            },
            "regions": null,
            "terminals": null,
            "isDefault": true
          },
          {
            "id": 120,
            "name": "GatewayBreaker",
            "title": "关口开关",
            "sn": 14,
            "activity": true,
            "terminalNum": null,
            "inputOutputEqual": null,
            "inputOutputReverse": null,
            "deviceProperty": null,
            "deviceCategory": {
              "id": 196,
              "name": "Breaker",
              "title": "开关",
              "sn": 3,
              "activity": true
            },
            "regions": null,
            "terminals": null,
            "isDefault": true
          },
          {
            "id": 139,
            "name": "DoubleWindingTransformer",
            "title": "双绕组变压器",
            "sn": 1,
            "activity": true,
            "terminalNum": 2,
            "inputOutputEqual": false,
            "inputOutputReverse": true,
            "deviceProperty": null,
            "deviceCategory": {
              "id": 138,
              "name": "Transformer",
              "title": "变压器",
              "sn": 1,
              "activity": true
            },
            "regions": null,
            "terminals": null,
            "isDefault": true
          },
          {
            "id": 140,
            "name": "PCS",
            "title": "储能PCS",
            "sn": 2,
            "activity": true,
            "terminalNum": 2,
            "inputOutputEqual": false,
            "inputOutputReverse": true,
            "deviceProperty": null,
            "deviceCategory": {
              "id": 159,
              "name": "ConverterInverter",
              "title": "变流器",
              "sn": 2,
              "activity": true
            },
            "regions": null,
            "terminals": null,
            "isDefault": true
          },
          {
            "id": 141,
            "name": "Breaker",
            "title": "开关",
            "sn": 3,
            "activity": true,
            "terminalNum": 2,
            "inputOutputEqual": true,
            "inputOutputReverse": null,
            "deviceProperty": null,
            "deviceCategory": {
              "id": 196,
              "name": "Breaker",
              "title": "开关",
              "sn": 3,
              "activity": true
            },
            "regions": null,
            "terminals": null,
            "isDefault": true
          },
          {
            "id": 142,
            "name": "ThreeWindingTransformer",
            "title": "三绕组变压器",
            "sn": 4,
            "activity": true,
            "terminalNum": 3,
            "inputOutputEqual": false,
            "inputOutputReverse": true,
            "deviceProperty": null,
            "deviceCategory": {
              "id": 138,
              "name": "Transformer",
              "title": "变压器",
              "sn": 1,
              "activity": true
            },
            "regions": null,
            "terminals": null,
            "isDefault": true
          }
        ],
        "default": true
      },
      "properties": {},
      "socUpperLimit": 80,
      "socLowerLimit": 6,
      "batteryLife": null,
      "maxPower": null,
      "maxOverload": null,
      "adjustZone": null
    }
  ]
  todayParamList = [
    {
      "startTime": "2020-09-17 17:15:29",
      "endTime": "2020-09-17 17:16:01",
      "content": "SOC=[5.0%,90.0%];允许跟踪误差=[%,%]"
    },
    {
      "startTime": "2020-09-17 17:16:01",
      "endTime": "2020-09-17 17:16:38",
      "content": "SOC=[5.0%,90.0%];允许跟踪误差=[%,%]"
    },
    {
      "startTime": "2020-09-17 17:16:38",
      "endTime": "2020-09-17 17:17:47",
      "content": "SOC=[5.0%,90.0%];允许跟踪误差=[%,%]"
    },
    {
      "startTime": "2020-09-17 17:17:47",
      "endTime": "2020-09-17 17:19:06",
      "content": "SOC=[5.0%,90.0%];允许跟踪误差=[%,%]"
    },
    {
      "startTime": "2020-09-17 17:19:06",
      "endTime": "2020-09-17 17:20:06",
      "content": "SOC=[5.0%,90.0%];允许跟踪误差=[%,%]"
    },
    {
      "startTime": "2020-09-17 17:20:06",
      "endTime": "2020-09-17 17:58:25",
      "content": "SOC=[5.0%,90.0%];允许跟踪误差=[8.0%,2.0%]"
    },
    {
      "startTime": "2020-09-17 17:58:25",
      "endTime": "2020-09-17 17:58:41",
      "content": "SOC=[6.0%,80.0%];允许跟踪误差=[8.0%,2.0%]"
    },
    {
      "startTime": "2020-09-17 17:58:41",
      "endTime": "2020-09-17 17:59:00",
      "content": "SOC=[6.0%,80.0%];允许跟踪误差=[9.0%,3.0%]"
    },
    {
      "startTime": "2020-09-17 17:59:00",
      "endTime": "2020-09-17 17:59:12",
      "content": "SOC=[6.0%,80.0%];允许跟踪误差=[45.0%,3.0%]"
    },
    {
      "startTime": "2020-09-17 17:59:12",
      "endTime": "",
      "content": "SOC=[6.0%,80.0%];允许跟踪误差=[455.0%,3.0%]"
    }
  ]
  strategyObj = {} // 当前的设备
  planList = [] // 计划集合
  planObj = {} // 具体计划内容
  orderMap = []
  socMap = []
  controlMap = []
  runningModel = {}
  issueList = [
    {
      "title": "紧急功率支撑",
      "id": 1,
      "status": 0,
      "type": "ActivePower"
    },
    {
      "title": "储能调峰",
      "id": 2,
      "status": 0,
      "type": "ActivePower"
    },
    {
      "title": "一次调频",
      "id": 3,
      "status": 1,
      "type": "ActivePower"
    },
    {
      "title": "二次调频",
      "id": 4,
      "status": 0,
      "type": "ActivePower"
    },
    {
      "title": "有功控制/削峰填谷",
      "id": 5,
      "status": 0,
      "type": "ActivePower"
    },
    {
      "title": "无功/电压控制",
      "id": 6,
      "status": 0,
      "type": "ReactivePower"
    }
  ]
  issuePage = 1
  issueSize = 20
  issueTotal = 5


  //-----
  energyUnitsList = [{
    "id": 74,
    "name": null,
    "title": "1#储能单元",
    "ratedPower": 999999,
    "scale": 9999,
    "remark": null,
    "hasTransformer": null,
    "activity": true,
    "plannedProductionTime": "2020-09-11 17:57:00",
    "plannedProductionMillisecond": 1599818220000,
    "productionTime": "2020-09-11 17:57:00",
    "productionMillisecond": 1599818220000,
    "sn": 1599818187893,
    "type": null,
    "energyUnitType": {
      "id": 382,
      "name": "Storage",
      "title": "储能",
      "sn": 1,
      "activity": true,
      "regions": null,
      "deviceTypes": [
        {
          "id": 144,
          "name": "BatteryUnit",
          "title": "电池单元",
          "sn": 6,
          "activity": true,
          "terminalNum": null,
          "inputOutputEqual": null,
          "inputOutputReverse": null,
          "deviceProperty": null,
          "deviceCategory": {
            "id": 198,
            "name": "StorageBattery",
            "title": "储能电池",
            "sn": 5,
            "activity": true
          },
          "regions": null,
          "terminals": null,
          "isDefault": true
        },
        {
          "id": 145,
          "name": "BatteryCluster",
          "title": "电池簇/组/串",
          "sn": 7,
          "activity": true,
          "terminalNum": null,
          "inputOutputEqual": null,
          "inputOutputReverse": null,
          "deviceProperty": null,
          "deviceCategory": {
            "id": 198,
            "name": "StorageBattery",
            "title": "储能电池",
            "sn": 5,
            "activity": true
          },
          "regions": null,
          "terminals": null,
          "isDefault": true
        },
        {
          "id": 146,
          "name": "Pack",
          "title": "电池包",
          "sn": 8,
          "activity": true,
          "terminalNum": null,
          "inputOutputEqual": null,
          "inputOutputReverse": null,
          "deviceProperty": null,
          "deviceCategory": {
            "id": 198,
            "name": "StorageBattery",
            "title": "储能电池",
            "sn": 5,
            "activity": true
          },
          "regions": null,
          "terminals": null,
          "isDefault": true
        },
        {
          "id": 147,
          "name": "Cell",
          "title": "单体电池",
          "sn": 9,
          "activity": true,
          "terminalNum": null,
          "inputOutputEqual": null,
          "inputOutputReverse": null,
          "deviceProperty": null,
          "deviceCategory": {
            "id": 198,
            "name": "StorageBattery",
            "title": "储能电池",
            "sn": 5,
            "activity": true
          },
          "regions": null,
          "terminals": null,
          "isDefault": true
        },
        {
          "id": 149,
          "name": "Container",
          "title": "集装箱",
          "sn": 11,
          "activity": true,
          "terminalNum": null,
          "inputOutputEqual": null,
          "inputOutputReverse": null,
          "deviceProperty": null,
          "deviceCategory": {
            "id": 199,
            "name": "DeviceContainer",
            "title": "设备容器",
            "sn": 6,
            "activity": true
          },
          "regions": null,
          "terminals": null,
          "isDefault": true
        },
        {
          "id": 120,
          "name": "GatewayBreaker",
          "title": "关口开关",
          "sn": 14,
          "activity": true,
          "terminalNum": null,
          "inputOutputEqual": null,
          "inputOutputReverse": null,
          "deviceProperty": null,
          "deviceCategory": {
            "id": 196,
            "name": "Breaker",
            "title": "开关",
            "sn": 3,
            "activity": true
          },
          "regions": null,
          "terminals": null,
          "isDefault": true
        },
        {
          "id": 139,
          "name": "DoubleWindingTransformer",
          "title": "双绕组变压器",
          "sn": 1,
          "activity": true,
          "terminalNum": 2,
          "inputOutputEqual": false,
          "inputOutputReverse": true,
          "deviceProperty": null,
          "deviceCategory": {
            "id": 138,
            "name": "Transformer",
            "title": "变压器",
            "sn": 1,
            "activity": true
          },
          "regions": null,
          "terminals": null,
          "isDefault": true
        },
        {
          "id": 140,
          "name": "PCS",
          "title": "储能PCS",
          "sn": 2,
          "activity": true,
          "terminalNum": 2,
          "inputOutputEqual": false,
          "inputOutputReverse": true,
          "deviceProperty": null,
          "deviceCategory": {
            "id": 159,
            "name": "ConverterInverter",
            "title": "变流器",
            "sn": 2,
            "activity": true
          },
          "regions": null,
          "terminals": null,
          "isDefault": true
        },
        {
          "id": 141,
          "name": "Breaker",
          "title": "开关",
          "sn": 3,
          "activity": true,
          "terminalNum": 2,
          "inputOutputEqual": true,
          "inputOutputReverse": null,
          "deviceProperty": null,
          "deviceCategory": {
            "id": 196,
            "name": "Breaker",
            "title": "开关",
            "sn": 3,
            "activity": true
          },
          "regions": null,
          "terminals": null,
          "isDefault": true
        },
        {
          "id": 142,
          "name": "ThreeWindingTransformer",
          "title": "三绕组变压器",
          "sn": 4,
          "activity": true,
          "terminalNum": 3,
          "inputOutputEqual": false,
          "inputOutputReverse": true,
          "deviceProperty": null,
          "deviceCategory": {
            "id": 138,
            "name": "Transformer",
            "title": "变压器",
            "sn": 1,
            "activity": true
          },
          "regions": null,
          "terminals": null,
          "isDefault": true
        }
      ],
      "default": true
    },
    "properties": {},
    "socUpperLimit": 80,
    "socLowerLimit": 6,
    "batteryLife": null,
    "maxPower": null,
    "maxOverload": null,
    "adjustZone": null
  }]
}

export const strategyNS = 'strategy'

export default makeModel(strategyNS, new strategyModel(), (updateState, updateQuery) => {
  return {
    // // 查询策略概览的table数据
    // * getStrategyInfoList({ payload }: any, { put, select }: any) {
    //   const { page, size } = payload
    //   const { results, totalCount: total } = yield Service.allRequest({
    //     service: SERVICE_MAP.controlStrategies,
    //     data: { pageParam: { page, size } }
    //   })
    //   yield put({ type: 'updateToView', payload: { strategyInfoList: results, strategyInfoPage: page, strategyInfoSize: size, strategyInfoTotal: total } })
    // },
    // // 编辑策略
    // * updateStrategy({ payload }: any, { put, select }: any) {
    //   const { data } = payload
    //   const { results, totalCount: total, error } = yield Service.allRequest({
    //     service: SERVICE_MAP.controlStrategiesUpdate,
    //     data
    //   })
    //   // const { strategyInfoPage, strategyInfoSize } = yield select(state => state[strategyNS])
    //   yield put({ type: 'getStrategyObj', payload: { id: data.id } })
    //   return error
    // },
    // // 查询策略概览的通用控制参数
    // * getStrategyParamList(_: any, { put, select }: any) {
    //   // const { page, size } = payload
    //   const { results } = yield Service.allRequest({
    //     service: SERVICE_MAP.controlStrategiesParam,
    //     data: {}
    //   })
    //   yield put({ type: 'updateToView', payload: { strategyParamList: results } })
    // },
    // // 修改策略概览的通用控制参数
    // * updateStrategyParam({ payload }: any, { put, select }: any) {
    //   const { energyUnits } = payload
    //   const { results, error } = yield Service.allRequest({
    //     service: SERVICE_MAP.controlStrategiesParamUpdate,
    //     data: { energyUnits }
    //   })
    //   yield put({ type: 'getStrategyParamList' })
    //   return error
    // },
    // // 修改策略概览的状态
    // * updateStrategyStatus({ payload }: any, { put, select }: any) {
    //   const { data } = payload
    //   const { results, error } = yield Service.allRequest({
    //     service: SERVICE_MAP.strategyStatus,
    //     data
    //   })
    //   const { strategyInfoPage, strategyInfoSize } = yield select(state => state[strategyNS])
    //   yield put({ type: 'getStrategyInfoList', payload: { page: strategyInfoPage, size: strategyInfoSize } })
    //   return error
    // },// 修改策略概览的能量单元
    // * updateStrategyEnergyUnitId({ payload }: any, { put, select }: any) {
    //   const { data } = payload
    //   const { results, error } = yield Service.allRequest({
    //     service: SERVICE_MAP.strategyEnergyUnitId,
    //     data
    //   })
    //   const { strategyInfoPage, strategyInfoSize } = yield select(state => state[strategyNS])
    //   yield put({ type: 'getStrategyInfoList', payload: { page: strategyInfoPage, size: strategyInfoSize } })
    //   return error
    // },
    // // 查询今日控制参数
    // * getTodayParamList({ payload }: any, { put, select }: any) {
    //   const { date } = payload
    //   const { results } = yield Service.allRequest({
    //     service: SERVICE_MAP.strategyOperatorLog,
    //     data: {
    //       dtimes: [date.format('YYYY-MM-DD 00:00:00'), date.format('YYYY-MM-DD 23:59:59')]
    //     }
    //   })
    //   yield put({ type: 'updateToView', payload: { todayParamList: results } })
    // },
    // // 获取当前设备
    // *getStrategyObj({ payload }: any, { put, select }: any) {
    //   const { id } = payload
    //   const { results } = yield Service.allRequest({
    //     service: SERVICE_MAP.strategyObj,
    //     data: {
    //       id
    //     }
    //   })
    //   yield put({ type: 'updateToView', payload: { strategyObj: results } })
    // },
    // // 查询充放电量
    // *getElectricityList({ payload }: any, { put, select, all }: any) {
    //   const { deviceId, timeType, type, dtime } = payload
    //   const { results } = yield Service.allRequest({
    //     service: SERVICE_MAP.electricity,
    //     data: { deviceId, electricityType: type, timeType, dtime }
    //   })
    //   return results
    // },
    // //----------------------------------------------手动控制 start---------------------------------------------
    // // 获取所有削峰填谷计划id和name
    // *getPlanIdAndName(_: any, { put, select, all }: any) {
    //   const { results } = yield Service.allRequest({
    //     service: SERVICE_MAP.planIdAndName,
    //     data: {}
    //   })
    //   yield put({ type: 'updateToView', payload: { planList: results } })
    //   return results
    // },
    // // 通过id获取削峰填谷策略计划
    // *getPlanByPlanId({ payload }: any, { put, select, all }: any) {
    //   const { id } = payload
    //   const { results } = yield Service.allRequest({
    //     service: SERVICE_MAP.planByPlanId,
    //     data: {
    //       args: {
    //         id
    //       }
    //     }
    //   })
    //   yield put({ type: 'updateToView', payload: { planObj: results } })
    // },
    // // 枚举值获取(储能指令)
    // *getOrderMap(_: any, { put, select, all }: any) {
    //   const { results } = yield Service.allRequest({
    //     service: SERVICE_MAP.getOrderMap,
    //     data: {}
    //   })
    //   yield put({ type: 'updateToView', payload: { orderMap: results } })
    // },
    // // 枚举值获取(soc指令)
    // *getSOCMap(_: any, { put, select, all }: any) {
    //   const { results } = yield Service.allRequest({
    //     service: SERVICE_MAP.getSOCMap,
    //     data: {}
    //   })
    //   yield put({ type: 'updateToView', payload: { socMap: results } })
    // },

    // // 枚举值获取(运行控制方式)
    // *getControlMap(_: any, { put, select, all }: any) {
    //   const { results } = yield Service.allRequest({
    //     service: SERVICE_MAP.getControlMap,
    //     data: {}
    //   })
    //   yield put({ type: 'updateToView', payload: { controlMap: results } })
    // },

    // // 删除计划
    // *deletePlan({ payload }: any, { put }: any) {
    //   const { id } = payload
    //   const { results, error } = yield Service.allRequest({
    //     service: SERVICE_MAP.deletePlan,
    //     data: {
    //       args: {
    //         id
    //       }
    //     }
    //   })
    //   yield put({ type: 'getPlanIdAndName' })
    //   return error
    // },

    // // 新增削峰填谷策略计划
    // *addPlan({ payload }: any, { put }: any) {
    //   const { args } = payload
    //   const { results, error } = yield Service.allRequest({
    //     service: SERVICE_MAP.addPlan,
    //     data: {
    //       args
    //     }
    //   })
    //   yield put({ type: 'getPlanIdAndName' })
    //   return error
    // },

    // // 编辑削峰填谷策略计划
    // *editPlan({ payload }: any, { put }: any) {
    //   const { args } = payload
    //   const { results, error } = yield Service.allRequest({
    //     service: SERVICE_MAP.editPlan,
    //     data: {
    //       args
    //     }
    //   })
    //   yield put({ type: 'getPlanIdAndName' })
    //   return error
    // },
    // //----------------------------------------------手动控制 end---------------------------------------------
    // // 模式切换
    // *changeModel({ payload }: any, { put }: any) {
    //   const { model } = payload
    //   const { results, error } = yield Service.allRequest({
    //     service: SERVICE_MAP.changeModel,
    //     data: {
    //       model
    //     }
    //   })
    //   return error
    // },
    // // 查询当前运行模式
    // *getRunningModel(_: any, { put }: any) {
    //   const { results, error } = yield Service.allRequest({
    //     service: SERVICE_MAP.getRunningModel,
    //     data: {}
    //   })
    //   yield put({ type: 'updateToView', payload: { runningModel: results } })
    // },
    // // 保存指令
    // *saveOrder({ payload }: any, { put }: any) {
    //   const { energyUnitPowerValue } = payload
    //   const { results, error } = yield Service.allRequest({
    //     service: SERVICE_MAP.saveOrder,
    //     data: {
    //       energyUnitPowerValue
    //     }
    //   })
    //   yield put({ type: 'getRunningModel' })
    //   return error
    // },
    // // 调度模式查询
    // * getIssueList({ payload }: any, { put, select }: any) {
    //   const { page, size } = payload
    //   const { results, totalCount: total } = yield Service.allRequest({
    //     service: SERVICE_MAP.getIssueList,
    //     data: { pageParam: { page, size } }
    //   })
    //   yield put({ type: 'updateToView', payload: { issueList: results, issuePage: page, issueSize: size, issueTotal: total } })
    // },

    // // 修改远程调度策略功率
    // *editIssue({ payload }: any, { put, select }: any) {
    //   const { id, ...value } = payload
    //   const { results, error } = yield Service.allRequest({
    //     service: SERVICE_MAP.putIssue,
    //     data: {
    //       id,
    //       ...value
    //     }
    //   })
    //   const { issuePage, issueSize } = yield select(state => state[strategyNS])
    //   yield put({ type: 'getIssueList', payload: { page: issuePage, size: issueSize } })
    //   return error
    // },
  }
})
