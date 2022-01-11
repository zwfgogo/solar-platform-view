import createServices from '../public/js/createServices'
import http from '../public/js/http'

export default createServices({
  getInfo: '/basic-data-management/users/:id',
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

export function fetchStationPrice(data) {
  return http({
    method: 'get',
    url: '/basic-data-management/equipment-ledger/stations/:id/prices',
    data
  })
}

export function fetchStationBase(data) {
  return http({
    method: 'get',
    url: '/basic-data-management/equipment-ledger/stations/:id/base',
    data
  })
}

export function fetchWarningCount(data) {
  return http({
    method: 'get',
    url: '/alarm-service/alarm-monitor/by-alaram-level',
    data
  })
}

export function fetchImagePrefix() {
  return http({
    url: '/image/prefix',
    method: 'get'
  })
}

export function getStationsBySystem(data) {
  return http({
    method: 'get',
    url: '/enums/stations/by-system-type',
    data,
    mockData: {}
  })
}

export function patchStationAuthority(data) {
  return http({
    method: 'patch',
    url: '/basic-data-management/equipment-ledger/station-authority/:id',
    data,
  })
}

export function loadTreeChildApi(data) {
  return http({
    method: 'get',
    url: '/basic-data-management/equipment-ledger/devices/getDeviceTreeChild',
    data,
  })
}