import createServices from "../../../util/createServices";

const services = {
  getSummary: function(params) {
    return createServices("get", "/api/storage-efficiency/summary", params);
  },
};

export default services;
