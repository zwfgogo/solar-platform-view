import createServices from "../../../util/createServices";

const services = {
  getTotalAbnormalChartByDay: function(params) {
    return createServices<{
      firmId: number;
      stationId: string;
      startDate: string;
      endDate: string;
    }>("get", "/api/abnormal-analysis/total", params);
  },
  getTotalAbnormalChartByMonth: function(params) {
    return createServices<{
      firmId: number;
      stationId: string;
      startDate: string;
      endDate: string;
    }>("get", "/api/abnormal-analysis/total", params);
  },
  getTotalAbnormalTable: function(params) {
    return createServices<{
      firmId: number;
      stationId: string;
      startDate: string;
      endDate: string;
    }>("get", "/api/abnormal-analysis/total", params);
  },
  getDeviceAbnormalChart: function(params) {
    return createServices<{
      firmId: number;
      stationId: string;
      startDate: string;
      endDate: string;
    }>("get", "/api/abnormal-analysis/byDev", params);
  },
  getDeviceAbnormalTable: function(params) {
    return createServices<{
      firmId: number;
      stationId: string;
      startDate: string;
      endDate: string;
    }>("get", "/api/abnormal-analysis/byDev", params);
  },
  getEventAbnormalChart: function(params) {
    return createServices<{
      firmId: number;
      stationId: string;
      startDate: string;
      endDate: string;
    }>("get", "/api/abnormal-analysis/top", params);
  },
  getEventAbnormalTable: function(params) {
    return createServices<{
      firmId: number;
      stationId: string;
      startDate: string;
      endDate: string;
    }>("get", "/api/abnormal-analysis/top", params);
  }
};

export default services;
