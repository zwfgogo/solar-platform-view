import http from '../../public/js/http'

const services = {
  getBaseInfo: function(data) {
    return http({
      method: "get",
      url: "/overview/baseInfo",
      data
    })
  },
  getAbnormal: function(data) {
    return http({
      method: "get",
      url: "/overview/abnormal",
      data
    })
  },
};

export default services;
