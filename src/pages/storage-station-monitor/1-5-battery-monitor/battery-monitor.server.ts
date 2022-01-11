import http from '../../../public/js/http'
import { chartMockData } from '../../mock.helper'

export function fetchEnergyUnitOptions(param) {
  return http({
    url: '/enums',
    method: 'get',
    data: param
  })
}

export function fetchChildDevice(param) {
  return http({
    url: '/enums/devices/child',
    method: 'get',
    data: param
  })
}

export function fetchHistoryChart(param) {
  return http({
    url: '/station-monitoring/battery-monitor/curve',
    method: 'get',
    data: param,
    mockData: chartMockData
  })
}

export function fetchPackContentOptions(param) {
  return http({
    url: '/enums/batteryClusters',
    method: 'get',
    data: param
  })
}

export function fetchPackDetailOptions(param) {
  return http({
    url: '/enums/packs',
    method: 'get',
    data: param
  })
}

export function fetchBatteryInfo(param) {
  return http({
    url: '/station-monitoring/battery-monitor',
    method: 'get',
    data: param
  })
}

export function fetchCascader(param) {
  return http({
    url: '/monographic-analysis/battery-analysis/getBatteryTree',
    method: 'get',
    data: param
  })
}