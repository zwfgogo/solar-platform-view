import qs from "qs";
import createServices from "../../util/createServices";

// 查询能量单元整体风险等级
export const getBatteryAlarm = function ({ deviceId }) {
  return createServices<any>("get",`/information-room/getBatteryAlarm?${qs.stringify({ deviceId })}`,);
};

// 查询电池容量
export const getSOHChartData = function ({ deviceId, dtime }) {
  return createServices<any>("get",`/battery-cabin/station/getSOH?${qs.stringify({ deviceId, dtime })}`,);
};

// 查询电池效率
export const getEfficiencyChartData = function ({ deviceId, dtime }) {
  return createServices<any>("get",`/battery-cabin/station/getBatteryEfficiency?${qs.stringify({ deviceId, dtime })}`,);
};

// 查询循环寿命
export const getCycleLife = function ({ deviceId }) {
  return createServices<any>("get",`/battery-cabin/station/getRemainingProfit?${qs.stringify({ deviceId })}`,);
};

// 根据能量单元id查询电池里程
export const getBatteryLife = function ({ deviceId }) {
  return createServices<any>("get",`/battery-cabin/station/getBatteryLife?${qs.stringify({ deviceId })}`,);
};