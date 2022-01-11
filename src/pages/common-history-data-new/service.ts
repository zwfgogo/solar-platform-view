import createServices from "../../util/createServices";

const services = {
  fetchDeviceTree: function (params) {
    return createServices<{
      stationId: number
    }>("get", "/api/basic-data-management/equipment-ledger/devices", params);
  },
  fetchPointDataType: function (params) {
    return createServices<{
      deviceTypeId: number,
      deviceId: number
    }>('get', '/api/station-monitoring/real-data-query/point-data-type', params)
  },
  fetchPointData: function (params) {
    return createServices<{
      pointNumbers: string
    }>('get', '/api/station-monitoring/history-data-query', params)
  }
};

export default services;
