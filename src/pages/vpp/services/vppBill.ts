import createServices from "../../../util/createServices";

const services = {
  getSummary: function(params) {
    return createServices<{
      dateType: string;
      date: string;
      vppId: number;
    }>("get", "/vpp/report/summary", params);
  },
  getProfitChart: function(params) {
    return createServices<{
      dateType: string;
      date: string;
      vppId: number;
    }>("get", "/vpp/report/profit-curve", params);
  }
};

export default services;
