import createServices from "../../util/createServices";

export default {
  getSOHChart: function (params) {
    return createServices<{ energyUnitId: number }>(
      "get",
      "/battery-analyse/soh",
      params
    );
  },
  getProfitChart: function (params) {
    return createServices<{ energyUnitId: number }>(
      "get",
      "/battery-analyse/profit",
      params
    );
  },
};
