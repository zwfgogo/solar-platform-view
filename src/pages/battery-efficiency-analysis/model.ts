import utils from "../../public/js/utils";
import { battery_efficiency_analysis } from "../constants";
import { makeModel } from "../umi.helper";
import * as service from "./service";

export class EfficiencyAnalysisState {
  chartData = {
    xData: [],
    yData: [],
    series: [],
  };
}

export default makeModel(
  battery_efficiency_analysis,
  new EfficiencyAnalysisState(),
  (updateState, updateQuery, getState) => {
    return {
      // 查询历史数据量测值
      *getEfficiency({ payload }, { put, call }) {
        const { deviceId, dtime } = payload;
        const { results } = yield call(service.getEfficiency, {
          deviceId,
          dtime,
        });
        yield updateState(put, { chartData: transformChartData(results) });
      },
    };
  }
);

const typeNameMap = {
  BatteryEfficiencyDay: utils.intl("能量效率"),
  ChargeEnergyRetention: utils.intl("充电能量保持率"),
  DischargeEnergyRetention: utils.intl("放电能量保持率"),
};

// 转化chartData数据格式
function transformChartData(data) {
  const keys = Object.keys(data);
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
        xData.push(item.dtime)
        return {
          ...pre,
          [item.dtime]: { value: item.val, flag: item.flag }
        };
      },{})
    }else{
      xDataMap[index] = {}
    }
    return { name: typeNameMap[key], unit: "%" };
  });

  chartData.xData = Array.from(new Set(xData)).sort((a, b) => a > b ? 1 : -1);
  chartData.yData = xDataMap.map(kMap => Object.keys(kMap).length ? chartData.xData.map(x => kMap[x] ?? null) : []);
  return chartData;
}
