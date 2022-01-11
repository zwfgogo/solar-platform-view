import http from "../../../public/js/http"

const services = {
  getData: function(params) {
    return http({
      method: "get",
      url: "/monographic-analysis/efficiency-analysis/detail",
      data: params,
      results: false,
    })
  }
};

export default services;
