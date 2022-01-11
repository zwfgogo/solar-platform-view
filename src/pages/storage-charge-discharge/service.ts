import createServices from "../../util/createServices";

const services = {
  getChargeDischargeList: function(params) {
    return createServices("get", "/api/storage-efficiency/charge-discharge-records", params);
  },
};

export default services;
