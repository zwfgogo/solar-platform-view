import createServices from "../../../util/createServices";

export default {
  getStations: function (params) {
    return createServices<{ userId: string; firmId: string }>(
      "get",
      "/battery-cabin/station",
      params
    );
  },
  getEnergyListByStationId: function (params) {
    return createServices<{ stationId: string }>(
      "get",
      "/battery-cabin/station/getEnergyListByStationId",
      params
    );
  },
  getBatteryUnitByEnergyId: function (params) {
    return createServices<{ stationId: string }>(
      "get",
      "/battery-cabin/station/getBatteryUnitListByEnergyUnitId",
      params
    );
  },
  getdeviceListBySuperId: function (params) {
    return createServices<{ stationId: string }>(
      "get",
      "/battery-cabin/station/getdeviceListBySuperId",
      params
    );
  },
};
