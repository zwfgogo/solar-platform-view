import createServices from '../../../util/createServices'

const services = {
  getTree: function(params) {
    return createServices<any>('get', '/api/operation-analysis/tree', params)
  },
  getDeviceType: function(params) {
    return createServices<any>('get', '/api/operation-analysis/type', params)
  },
  getChart: function(params) {
    return createServices<any>('get', '/api/operation-analysis/chart', params)
  }
}

export default services
