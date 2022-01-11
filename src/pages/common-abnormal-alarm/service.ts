import createServices from "../../util/createServices";
import qs from 'qs'
import { fileDownload } from "../../util/myAxios";

// 获得当前各异常级别通知配置
export const getLevelConfig = function (params) {
  return createServices<any>("get",`/abnormal-alarm/getLevelConfig?${qs.stringify(params)}`,);
};

// 修改状态 | 修改电站
export const changeStatus = function (params) {
  const { id, ...restParams } = params
  return createServices<any>("patch",`/abnormal-alarm/patchStatus?${qs.stringify({ id })}`, restParams);
};

// 获得系统中所有用户列表
export const getUser = function (params) {
  return createServices<any>("get",`/abnormal-alarm/getUser`, params);
};

// 获得已经绑定的短信接收人
export const getAlarmSmsConfig = function (params) {
  return createServices<any>("get",`/abnormal-alarm/getAlarmSmsConfig`, params);
};

// 短信接收人保存 
export const putAlarmReceiver = function (params) {
  const { alarmNotifyConfigId, body } = params
  return createServices<any>("put",`/abnormal-alarm/putAlarmReceiver?${qs.stringify({ alarmNotifyConfigId })}`, { body });
};

// 获得所有异常类型配置列表
export const getAlarmTypesList = function (params) {
  return createServices<any>("get",`/abnormal-alarm/getAlarmTypes`, params);
};

// 删除异常类型
export const deleteAlarmTypes = function (params) {
  return createServices<any>("delete",`/abnormal-alarm/deleteAlarmTypes`, params);
};

// 批量删除异常类型
export const deleteAllAlarmTypes = function (params) {
  return createServices<any>("delete",`/abnormal-alarm/deleteAllAlarmTypes`, params);
};

// 新增异常类型
export const postAlarmTypes = function (params) {
  return createServices<any>("post",`/abnormal-alarm/postAlarmTypes`, params);
};

// 修改异常类型
export const putAlarmTypes = function (params) {
  return createServices<any>("put",`/abnormal-alarm/putAlarmTypes`, params);
};

// 规则配置的相关方法
// 获取相关枚举集合
export const getAllEnums = function () {
  return createServices<any>("get",`/abnormal-alarm/getAllEnums`);
};

// 获得异常规则对象
export const getAlarmRulesList = function(params){
  return createServices<any>("get",`/abnormal-alarm/getAlarmRulesList`, params);
}

// 删除异常类型
export const deleteAlarmRules = function (params) {
  return createServices<any>("delete",`/abnormal-alarm/deleteAlarmRules`, params);
};

// 批量删除异常类型
export const deleteAllAlarmRules = function (params) {
  return createServices<any>("delete",`/abnormal-alarm/deleteAllAlarmRules`, params);
};

// 批量修改异常规则级别
export const patchAlarmRulesLevel = function (params) {
  return createServices<any>("patch",`/abnormal-alarm/patchAlarmRulesLevel`, params);
};

// 获得设备大类/电站类型对应的点号数据类型列表(数据项)
export const getPointDataTypes = function(params){
  return createServices<any>("get",`/abnormal-alarm/getPointDataTypes`, params);
}

// 根据设备大类获取设备列表
export const getDeviceList = function(params){
  return createServices<any>("get",`/abnormal-alarm/getDevices`, params);
}

// 新增异常规则
export const postAlarmRules = function (params) {
  return createServices<any>("post",`/abnormal-alarm/postAlarmRules`, { body: params });
};

// 编辑异常规则
export const putAlarmRules = function (params) {
  return createServices<any>("put",`/abnormal-alarm/putAlarmRules`, params);
};

// 获得异常规则对象
export const getAlarmRuleById = function(params){
  return createServices<any>("get",`/abnormal-alarm/getAlarmRuleById`, params);
}

// 全部电站开关
export const putIsAllStation = function(params){
  return createServices<any>("put",`/abnormal-alarm/putIsAllStation`, params);
}

// 导出
export const exportSync = function(params) {
  return fileDownload({
    url: "/abnormal-alarm/export",
    data: params
  })
}

// 同步
export const syncAlarmRules = function (params) {
  return createServices<any>("post",`/abnormal-alarm/sync`, params);
};

// 获得适用对象树
export const getAlarmObjectsTree = function(){
  return createServices<any>("get",`/abnormal-alarm/getAlarmObjectsTree`);
}

// 查询适用对象（拼接到树上deviceTypeTree）
export const getDeviceTypeTreeChildren = function(params){
  return createServices<any>("get",`/abnormal-alarm/getDeviceTypeTreeChildren`, params);
}

// 根据设备类型查询端子
export const getTerminalsByDeviceTypeId = function(params){
  return createServices<any>("get",`/basic-data-management/business-models/analog-type/terminals`, params);
}

// 
export const getPointDataTree = function(params) {
  return createServices<any>("get",`/abnormal-alarm/point-data-tree`, params);
}

// 
export const getPointData = function(params) {
  return createServices<any>("get",`/abnormal-alarm/point-data-list`, params);
}

// 
export const getTechPointData = function(params) {
  return createServices<any>("get",`/abnormal-alarm/tech-point-data-list`, params);
}

export const getStationList = function(params) {
  return createServices<any>("get",`/basic-data-management/equipment-ledger/stations`, params);
}

export const getStationTypeByName = function() {
  return createServices<any>("get",`/abnormal-alarm/getStationTypeByName`);
}
