import http from "../../public/js/http";

const services = {
  getEnergyUnits: (data) => {
    return http({
      method: "get",
      url: "/profit-analysis/energyUnits",
      data: data
    })
  },
  getOffsetSummary: (data) => {
    return http({
      method: "get",
      url: "/profit-analysis/offset-summary",
      data: data
    })
  },
  getOffsetAnalyse: (data) => {
    return http({
      method: "get",
      url: "/profit-analysis/offset-analyse",
      data: data
    })
  },
};

export default services;
