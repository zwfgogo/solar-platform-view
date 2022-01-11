import createServices from "../../../util/createServices";

const services = {
  getData: function(params) {
    return createServices<{
      firmId: number;
      energyUnitId: string;
      startDate: string;
      endDate: string;
    }>("get", "/api/energy-analysis/energyUnit", params);
  }
};

export default services;
