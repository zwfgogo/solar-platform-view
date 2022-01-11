import createServices from "../../../util/createServices";
import qs from 'qs'
import http from "../../../public/js/http";

export default {
  getElectricChart: function (params) {
    return createServices<{ energyUnitId: number; startDate: string, endDate: string }>(
      "get",
      "/battery-maintenance/electric",
      params
    );
  },
  getRecordList: function (params) {
    return createServices<{ energyUnitId: number; dtime: string }>(
      "get",
      "/battery-maintenance/records",
      params
    );
  },
  getOperationPlan: function (params) {
    return createServices<{ stationId: number, energyUnitId: number; replacePackNum: number; capacitySortNum: number }>(
      "get",
      "/battery-maintenance/plan",
      params
    );
  },
  getOperationCalculate: function (params: {
    stationId: number,
    energyUnitId: number;
    replacePackNum: number;
    capacitySortNum: number;
    type: number;
  }) {
    return http({
      method: 'get',
      url: '/battery-maintenance/calculate',
      data: params,
      timeout: 600000
    })
  },
};
