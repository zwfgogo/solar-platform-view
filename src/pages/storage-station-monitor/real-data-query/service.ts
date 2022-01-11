import createServices from "../../../util/createServices";

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
  }
};

export default services;
