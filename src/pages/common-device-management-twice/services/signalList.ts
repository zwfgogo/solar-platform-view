import http from "../../../public/js/http";

const services = {
  getAnalogs: function(data) {
    return http({
      method: "get",
      url: "/basic-data-management/twice-device/analogs",
      data
    })
  },
  postAnalogs: function(data) {
    return http({
      method: "post",
      url: "/basic-data-management/twice-device/analogs",
      data,
      timeout: 60000
    })
  },
};

export default services;