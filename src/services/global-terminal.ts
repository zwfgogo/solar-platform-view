import createServices from '../public/js/createServices'
import http from '../public/js/http'

export default createServices({
  getInfo: '/users/:id',
  loginOut: '/models/login/out|post',
  revisePassword: '/models/users/revisePassword|put',
  getMenus: '/models/menus|get',
  addWarning: '/settings/warning|post',
  updateWarning: '/settings/warning/:id|patch',
  deleteWarning: '/settings/warning/:id|delete'
})

export function enumsApi(data) {
  return http({
    method: 'get',
    url: '/enums',
    data
  })
}

export function fetchStationDetail(data) {
  return http({
    method: 'get',
    url: '/stations/detail',
    data
  })
}

export function fetchWarningCount(data) {
  return http({
    method: 'get',
    url: '/overhaul-maintenance/event-management/by-alaram-level',
    data
  })
}

export function getStationById(data) {
  return http({
    method: 'get',
    url: '/basic-data-management/equipment-ledger/stations/:id',
    data
  })
}
