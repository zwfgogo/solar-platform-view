import createServices from "../../../util/createServices";

const services = {
  getData: function(params) {
    return createServices<{
      firmId: number;
      stationId: string;
      startDate: string;
      endDate: string;
    }>("get", "/api/energy-analysis", params);
  }
};

export default services;
