import utils from "../../public/js/utils";
import { battery_home } from "../constants";
import { makeModel } from "../umi.helper";
import * as service from './service'  


export class HomeState {
  batteryAlarm: any = {};

  sohChartData = {
    xData: [],
    yData: [],
    series: [],
  };
  nowSOH = null

  efficiencyChartData = {
    xData: [],
    yData: [],
    series: [],
  };
  nowEfficiency = null;

  cycleLifeChartData = {
    xData: [],
    yData: [],
    series: [],
  }
  remainingRecycleTimes = null;
  remainingRecycleDays = null;

  batteryLifeChartData = {
    xData: [],
    yData: [],
    series: [],
  };
  batteryLifeCount = null;
  batteryLifeRange = null;
}

const typeNameMap = {
  RealSOH: `${utils.intl("实际SOH")}|%`,
  TheorySOH: `${utils.intl("理论SOH")}|%`,
  BatteryEfficiencyDay: `${utils.intl("效率值")}|%`,
  quarterProfit: `${utils.intl('预测季度收益')}|${utils.intl('元')}|bar`,
  surplusProfit: `${utils.intl('预测剩余收益')}|${utils.intl('元')}|line`,
  batteryLife: `${utils.intl('电池单元里程')}|${utils.intl('MWh')}|bar`,
  batteryAverage: `${utils.intl('平均里程')}|${utils.intl('MWh')}|line`,
};

export default makeModel(battery_home, new HomeState(), (updateState, updateQuery, getState) => {
  return {
    // 查询能量单元整体风险等级
    *getBatteryAlarm({ payload }, { put, call }){
      const { deviceId } = payload
      const { results } = yield call(service.getBatteryAlarm, { deviceId });
      yield updateState(put, { batteryAlarm: results });
    },

    // 查询电池容量
    *getSOHChartData({ payload }, { put, call }){
      const { deviceId, dtime } = payload
      yield updateState(put, { sohChartData: {
        xData: [],
        yData: [],
        series: [],
      }, nowSOH: null });
      const { results } = yield call(service.getSOHChartData, { deviceId, dtime });
      yield updateState(put, { sohChartData: transformChartData(results, ['nowSOH'], 'YYYY-MM-DD'), nowSOH: results.nowSOH });
    },

    // 查询电池效率
    *getEfficiencyChartData({ payload }, { put, call }){
      const { deviceId, dtime } = payload
      yield updateState(put, { efficiencyChartData: {
        xData: [],
        yData: [],
        series: [],
      }, nowEfficiency: null });
      const { results } = yield call(service.getEfficiencyChartData, { deviceId, dtime });
      yield updateState(put, { efficiencyChartData: transformChartData(results, ['nowEfficiency'], 'YYYY-MM-DD'), nowEfficiency: results.nowEfficiency });
    },

    // 查询循环寿命
    *getCycleLife({ payload }, { put, call }){
      const { deviceId } = payload
      yield updateState(put, { cycleLifeChartData: {
        xData: [],
        yData: [],
        series: [],
      }, remainingRecycleDays: null, remainingRecycleTimes: null });
      const { results } = yield call(service.getCycleLife, { deviceId });
      yield updateState(put, { cycleLifeChartData: transformChartData(results, ['RemainingRecycleTimes', 'RemainingRecycleDays', 'UsedRecycleTimes']), remainingRecycleTimes: results.RemainingRecycleTimes, remainingRecycleDays: results.RemainingRecycleDays });
    },

    // 根据能量单元id查询电池里程
    *getBatteryLife({ payload }, { put, call }){
      const { deviceId } = payload
      yield updateState(put, { batteryLifeChartData: {
        xData: [],
        yData: [],
        series: [],
      }, batteryLifeCount: null, batteryLifeRange: null });
      const { results } = yield call(service.getBatteryLife, { deviceId });
      yield updateState(put, { batteryLifeChartData: transformChartData(results, ['batteryLifeCount', 'batteryLifeRange']), batteryLifeCount: results.batteryLifeCount, batteryLifeRange: results.batteryLifeRange });
    },
  }
});


// 转化chartData数据格式
function transformChartData(data, omitKey=[], format?) {
  const keys = Object.keys(data).filter(key => omitKey.indexOf(key) < 0);
  const chartData = {
    xData: [],
    yData: [],
    series: [],
  };

  const xDataMap = [];
  const xData = [];
  chartData.series = keys.map((key, index) => {
    if(data[key] && data[key].length){
      xDataMap[index] = data[key].reduce((pre, item) => {
        const dtime = format === 'YYYY-MM-DD' ? item.dtime.substr(0, item.dtime.indexOf(' ') + 1) : item.dtime
        xData.push(dtime)
        return {
          ...pre,
          [dtime]: { value: Number(item.val.toFixed(2)), flag: item.flag }
        };
      },{})
    }else{
      xDataMap[index] = {}
    }

    const nameAndUnit = typeNameMap[key].split('|')

    return { name: nameAndUnit[0], unit: nameAndUnit[1], type: nameAndUnit[2] };
  });

  chartData.xData = Array.from(new Set(xData)).sort((a, b) => a > b ? 1 : -1);
  chartData.yData = xDataMap.map(kMap => Object.keys(kMap).length ? chartData.xData.map(x => kMap[x] ?? null) : []);
  return chartData;
}
