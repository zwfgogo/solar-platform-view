import http from "../../public/js/http";
import createServices from "../../util/createServices";

const services = {
  getTreeList: function (params) {
    return createServices<{
      userId: number
    }>("get", "/acquisition-configuration/getTreeDataByUserId", params);
  },
  getUnit: function () {
    return createServices<any>("get", "/enums", { resource: "measurementUnit", hasAll: false, property: '*' });
  },
  getAccuracy: function () {
    return createServices<any>("get", "/enums", { resource: "accuracy", property: '*' });
  },
  getMeasurePointsByDeviceId: function (params) {
    return createServices<any>("get", "/acquisition-configuration/getMeasurePointsByDeviceId", params);
  },
  getPointsByDeviceIdAndTerminal: function (params) {
    return createServices<any>("get", "/acquisition-configuration/getPointsByDeviceIdAndTerminal", params);
  },
  addMeasurePoints: function (params) {
    const { deviceId, value } = params
    return createServices<any>("post", `/acquisition-configuration/addMeasurePoints?deviceId=${deviceId}`, value);
  },
  updateMeasurePoints: function (params) {
    const { id, value } = params
    return createServices<any>("put", `/acquisition-configuration/updateMeasurePoints?id=${id}`, value);
  },
  deleteMeasurePoints: function (params) {
    return createServices<any>("delete", `/acquisition-configuration/deleteMeasurePoints`, params);
  },
  getPointListByDeviceId: function (params) {
    return createServices<any>("get", "/acquisition-configuration/getPointListByDeviceId", params);
  },
  getOtherPointsByDevIdList: function (params) {
    return createServices<any>("get", "/acquisition-configuration/getOtherPointsByDevIdList", params);
  },
  addOtherPoints: function (params) {
    return createServices<any>("post", `/acquisition-configuration/addOtherPoints`, params);
  },
  updateOtherPoints: function (params) {
    const { id, value } = params
    return createServices<any>("put", `/acquisition-configuration/updateOtherPoints?id=${id}`, value);
  },
  deleteOtherPoints: function (params) {
    return createServices<any>("delete", `/acquisition-configuration/deleteOtherPoints`, params);
  },
  getRemotePulse: function (params) {
    return createServices<any>("get", "/acquisition-configuration/getRemotePulse", params);
  },
  addRemotePulse: function (params) {
    return createServices<any>("post", `/acquisition-configuration/addRemotePulse`, params);
  },
  updateRemotePulse: function (params) {
    const { id, value } = params
    return createServices<any>("put", `/acquisition-configuration/updateRemotePulse?id=${id}`, value);
  },
  deleteRemotePulse: function (params) {
    const { id } = params
    return createServices<any>("delete", `/acquisition-configuration/deleteRemotePulse?id=${id}`);
  },
  getTerminals: function (params) {
    return createServices<any>("get", `/acquisition-configuration/getTerminals`, params);
  },
  addPoints: function (params) {
    return createServices<any>("post", `/acquisition-configuration/addPoints`, params);
  },
  updatePoints: function (params) {
    return createServices<any>("put", `/acquisition-configuration/updatePoints`, params);
  },
  deletePoints: function (params) {
    return createServices<any>("delete", `/acquisition-configuration/deletePoints`, params);
  },
  addAllPoints: function (params) {
    const { deviceId, list } = params
    return createServices<any>("post", `/acquisition-configuration/addAllPoints`, { list });
  },
  addAllOtherPoints: function (params) {
    const { deviceId, list } = params
    return createServices<any>("post", `/acquisition-configuration/addAllOtherPoints?deviceId=${deviceId}`, { list });
  },
  getEndMeasure: function (params) {
    return createServices<any>("get", `/acquisition-configuration/getEndMeasure`, params);
  },
  getStartMeasure: function (params) {
    return createServices<any>("get", `/acquisition-configuration/getStartMeasure`, params);
  },
  getPointNumber: function (params, cancelToken) {
    return http({
      method: "get",
      url: "/acquisition-configuration/getPointNumber",
      data: params,
      cancelToken
    })
    // return createServices<any>("get", `/acquisition-configuration/getPointNumber`, params);
  },
  getSecondaryDevicesList: function (params) {
    return createServices<any>("get", `/basic-data-management/twice-device/devices`, params);
  },
};

export default services;