import createServices from "../../util/createServices";

const services = {
  getList: function (params) {
    return createServices<{ name: string; password: string }>(
      "get",
      "/alarm-service/alarm-monitor",
      params
    );
  },
  addList: function (params) {
    return createServices<{ name: string; password: string }>(
      "post",
      "/operation-on-duty/work-order",
      params
    );
  },
  ignoreList: function (params) {
    return createServices<{ name: string; password: string }>(
      "put",
      "/alarm-service/alarm-monitor/:id/ignore",
      params
    );
  },
  getDetail: function (params) {
    return createServices<{ name: string; password: string }>(
      "get",
      "/alarm-service/alarm-monitor/:id/work-order",
      params
    );
  },
  getSelect: function (params) {
    return createServices<{ name: string; password: string }>(
      "get",
      "/enums",
      params
    );
  },
  usersByFirm: function (params) {
    return createServices<{ name: string; password: string }>(
      "get",
      "/enums/users/by-firm",
      params
    );
  },
  getDeciveById: function (params) {
    return createServices<{ name: string; password: string }>(
      "get",
      "/basic-data-management/equipment-ledger/devices/:id",
      params
    );
  },
  fetchPointDataType: function (params) {
    return createServices<{
    //   deviceTypeId: number;
      deviceId: number;
    }>(
      "get",
      "/api/station-monitoring/real-data-query/point-data-type",
      params
    );
  },
  fetchPointData: function (params) {
    return createServices<{
      pointNumbers: string
    }>('get', '/api/station-monitoring/history-data-query', params)
  },
  getAlarmLevelsList: function(){
    return createServices<any>('get', '/enums', {
      resource: "alarmLevels"
    })
  },
  getDeviceModalTree: function (params) {
    return createServices<{
      id: string
    }>('get', '/api/alarm-service/alarm-monitor/point-tree', params)
  },
};

export default services;
