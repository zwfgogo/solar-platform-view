import createServices from "../../util/createServices";

export default {
  getSummaryChart: function (params) {
    return createServices<{ energyUnitId: number; startDate: string, endDate: string }>(
      "get",
      "/battery-analyse/milestone/summary",
      params
    );
  },
  getTendencyChart: function (params) {
    return createServices<{ energyUnitId: number; dtime: string }>(
      "get",
      "/battery-analyse/milestone/tendency",
      params
    );
  },
};
