import http from '../../public/js/http'

const services = {
  getTable: function(params) {
    return http({
      method: "get",
      url: "/basic-data-management/data-mock/template",
      data: params
    })
  },
  deleteTemplate: function(params) {
    return http({
      method: "delete",
      url: `/basic-data-management/data-mock/template/${params.templateId}`,
      data: {}
    })
  },
  export: function(params) {
    return http({
      method: "post",
      url: "/basic-data-management/data-mock/export",
      data: params,
      results: false,
      timeout: -1
    })
  },
  import: function(params) {
    return http({
      method: "post",
      url: "/basic-data-management/data-mock/import",
      data: params,
      results: false
    })
  },
  startTemplate: function(params) {
    return http({
      method: "post",
      url: "/basic-data-management/data-mock/start",
      data: params,
    })
  },
  stopTemplate: function(params) {
    return http({
      method: "post",
      url: "/basic-data-management/data-mock/stop",
      data: params,
    })
  }
};

export default services;
