import http from '../../../public/js/http'

export function getStationList(data) {
  return http({
    method: "get",
    url: "/station-monitoring/table",
    data: data
  })
}

export function getTreeList(data) {
  return http({
    method: "get",
    url: "/operation-analysis/device-tree",
    data: data
  })
}

export function getMeasurement(data) {
  return http({
    method: "get",
    url: "/operation-analysis/measurement-type",
    data: data
  })
}

export function getAnalogType(data) {
  return http({
    method: "get",
    url: "/operation-analysis/analog-type",
    data: data
  })
}

export default {
  getStationList,
  getTreeList,
  getMeasurement,
  getAnalogType
}
