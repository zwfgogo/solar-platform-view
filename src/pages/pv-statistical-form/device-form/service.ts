import http from '../../../public/js/http'
import { fileDownload } from '../../../util/myAxios'

export function getTable(data) {
  return http({
    method: "get",
    url: "/statistical-reports/device",
    data: data
  })
}

export function getDeviceList(data) {
  return http({
    method: "get",
    url: "/statistical-reports/device/device-list",
    data: data
  })
}

export function exportTable(data) {
  return fileDownload({
    url: "/statistical-reports/device/export",
    data: data
  })
}

export default {
  getTable,
  getDeviceList,
  exportTable
}
