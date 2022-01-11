import createServices from "../../util/createServices";

const services = {
  getOverviewList: function(params) {
    return createServices<{ firmId: string }>(
      "get",
      "/api/overview/summary",
      params
    );
  },
  getStatisticList: function(params) {
    return createServices<{ firmId: string }>(
      "get",
      "/api/overview/status",
      params
    );
  },
  getReportList: function(params) {
    return createServices<{}>("get", "/api/overview/abnormal", params);
  },
  getPowerAnalysisChart: function(params) {
    return createServices<{ firmId: string; mod: string }>(
      "get",
      "/api/overview/electric",
      params
    );
  },
  getReportAnalysisChart: function(params) {
    return createServices<{ firmId: string; mod: string }>(
      "get",
      "/api/overview/alarm",
      params
    );
  }
};

export default services;
