import { battery_safe_assess } from "../constants";
import { makeModel } from "../umi.helper";
import * as service from './service'


export class SafeAssessState {
  batteryUintList:any[] = [];
  batteryAlarm: any = {};
  batteryAlarmList: any[] = [];
  page: 1;
  size: 20;
  total: 0;
}

export default makeModel(battery_safe_assess, new SafeAssessState(), (updateState, updateQuery, getState) => {
  return {
    // 根据能量单元获得电池单元列表
    *getBatteryUnitList({ payload }, { put, call }){
      const { energyUnitId } = payload
      const { results } = yield call(service.getBatteryUnitList, { energyUnitId });
      yield updateState(put, { batteryUintList: results });
    },
    // 查询能量单元整体风险等级
    *getBatteryAlarm({ payload }, { put, call }){
      const { deviceId } = payload
      const { results } = yield call(service.getBatteryAlarm, { deviceId });
      yield updateState(put, { batteryAlarm: results });
    },
    // 查询能量单元整体风险等级列表
    *getBatteryAlarmList({ payload }, { put, call }){
      const { page, size } = payload
      const { results, totalCount } = yield call(service.getBatteryAlarmList, payload);
      yield updateState(put, { batteryAlarmList: results, page, size, total: totalCount });
    },
  }
})
