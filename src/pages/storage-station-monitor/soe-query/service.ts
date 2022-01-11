import createServices from "../../../util/createServices";

const services = {
  fetchSoe: function (params) {
    return createServices<{
      page?: number,
      size?: number,
      startTime: string,
      endTime: string
    }>("get", "/api/station-monitoring/soe-query", params);
  }
};

export default services;
