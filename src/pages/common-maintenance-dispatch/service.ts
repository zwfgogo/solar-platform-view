import createServices from "../../util/createServices"

const services = {
  getList: function (params) {
    return createServices<{ name: string; password: string }>(
      'get',
      '/operation-on-duty/work-order',
      params
    )
  },
  getStationList: function (params) {
    return createServices<any>(
      'get',
      '/enums/stations/has-device',
      params
    )
  },
  getSelect: function (params) {
    return createServices<{ name: string; password: string }>(
      'get',
      '/api/enums',
      params
    )
  },
  getDetail: function (params) {
    return createServices<{ name: string; password: string }>(
      'get',
      '/operation-on-duty/work-order/:id',
      params
    )
  },
  addOrder: function (params) {
    return createServices<{ name: string; password: string }>(
      'post',
      '/operation-on-duty/work-order',
      params
    )
  },
  editOrder: function (params) {
    return createServices<{ name: string; password: string }>(
      'patch',
      '/operation-on-duty/work-order',
      params
    )
  },
  usersByFirm: function (params) {
    return createServices<{ name: string; password: string }>(
      'get',
      '/api/enums/users/by-firm',
      params
    )
  },

}

export default services
