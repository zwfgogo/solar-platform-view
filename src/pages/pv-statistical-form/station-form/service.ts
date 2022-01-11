import http from '../../../public/js/http'
import { fileDownload } from '../../../util/myAxios'

export function getTable(data) {
  return http({
    method: "post",
    url: "/statistical-reports/station",
    data: data
  })
}

export function exportTable(data) {
  return fileDownload({
    method: "post",
    url: "/statistical-reports/station/export",
    data: data
  })
}

export function fetchStationSetting(data) {
  return http({
    method: "get",
    url: "/statistical-reports/station/setting",
    data: data
  })
}

export default {
  getTable,
  exportTable,
  fetchStationSetting
}
