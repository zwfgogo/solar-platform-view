import http from '../../public/js/http'
import createServices from '../../util/createServices'

const services = {
  getBaseInfo: function (data) {
    return http({
      method: "get",
      url: "/api-screen/home-page/static",
      data
    })
  },
  getTime: function (data) {
    return http({
      method: "get",
      url: "/api-screen/settings/time",
      data
    })
  },
  jumpPath: function (params) {
    return createServices<{
    }>("get", "/api-screen/menu/jumpPath", params);
  },
  getStationDetail: function (data) {
    return http({
      method: "get",
      url: "/api-screen/home-page/station-detail",
      data
    })
  },
};

export default services;
