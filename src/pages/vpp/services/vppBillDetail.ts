import createServices from "../../../util/createServices";

const services = {
  getTable: function(params) {
    return createServices<{
      dateType: string;
      vppId: string;
      date: string;
    }>("get", "/vpp/report/profit/detail", params);
  }
};

export default services;
