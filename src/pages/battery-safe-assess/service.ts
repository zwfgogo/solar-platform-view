import qs from "qs";
import createServices from "../../util/createServices";


// 根据能量单元获得电池单元列表
export const getBatteryUnitList = function ({ energyUnitId }) {
  return createServices<any>("get",`/battery-cabin/station/getBatteryUnitListByEnergyUnitId?${qs.stringify({ energyUnitId })}`,);
};

// 查询能量单元整体风险等级
export const getBatteryAlarm = function ({ deviceId }) {
  return createServices<any>("get",`/information-room/getBatteryAlarm?${qs.stringify({ deviceId })}`,);
};

// 查询能量单元整体风险等级列表
export const getBatteryAlarmList = function (params) {
  return createServices<any>("get",`/information-room/getBatteryAlarmList?${qs.stringify(params)}`,);
};