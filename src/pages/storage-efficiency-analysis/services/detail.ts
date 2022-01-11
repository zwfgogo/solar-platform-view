import createServices from "../../../util/createServices";

const services = {
  getLast: function(params) {
    return createServices("get", "/api/storage-efficiency/last", params);
  },
  getSummary: function(params) {
    return createServices("get", "/api/storage-efficiency/summary", params);
  },
  getDetail: function(params) {
    return createServices("get", "/api/storage-efficiency/detail", params);
  },
};

export default services;
