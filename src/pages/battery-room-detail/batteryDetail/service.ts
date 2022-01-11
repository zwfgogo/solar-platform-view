import createServices from "../../../util/createServices";

const services = {
  fetchDeviceTree: function (params) {
    return createServices<{
      stationId: number
    }>("get", "/api/information-room/devices", params);
  },
  fetchPointDataType: function (params) {
    return createServices<{
      deviceTypeId: number,
      deviceId: number
    }>('get', '/api/station-monitoring/real-data-query/point-data-type', params)
  },
  getInfoHealthScore: function (params) {
    return createServices<{
    }>('get', '/api/information-room/getBatteryInfoHealthScore', params)
  },
};

export default services;
