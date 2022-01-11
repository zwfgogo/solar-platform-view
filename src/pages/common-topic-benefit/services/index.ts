import createServices from "../../../util/createServices";

const services = {
  getData: function(params) {
    return createServices<{
      firmId: number;
      stationId: string;
      startDate: string;
      endDate: string;
    }>("get", "/api/monographic-analysis/efficiency-analysis", params);
  },
  getEnergyUnitLoss: function(params) {
    return createServices<{
      energyUnitId: number;
    }>("get", "/api/monographic-analysis/efficiency-analysis/loss", params);
  },
};

export default services;
