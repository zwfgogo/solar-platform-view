import createServices from "../../util/createServices"

const services = {
  getDetail: function (params) {
    return createServices<{ name: string; password: string }>(
      'get',
      '/basic-data-management/customers/byUserId',
      params
    )
  },
  putDetail: function (params) {
    return createServices<{ name: string; password: string }>(
      'put',
      '/basic-data-management/customers/:id',
      params
    )
  },
}

export default services
