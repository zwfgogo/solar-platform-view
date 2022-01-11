import createServices from "../../util/createServices";

const services = {
  getDataByDay: function(params) {
    return createServices<{
      firmId: number;
      startDate: string;
      endDate: string;
      energyUnitId: string;
      stationId: string;
    }>("get", "/api/profit-analysis/day", params);
  },
  getDataByMonth: function(params) {
    return createServices<{
      firmId: number;
      startDate: string;
      endDate: string;
      energyUnitId: string;
      stationId: string;
    }>("get", "/api/profit-analysis/month", params);
  },
  getEnergyList: function(params) {
    return createServices<{
      firmId: number;
      stationId: string;
      resource: string;
    }>("get", "/api/enums", params);
  }
};

export default services;
