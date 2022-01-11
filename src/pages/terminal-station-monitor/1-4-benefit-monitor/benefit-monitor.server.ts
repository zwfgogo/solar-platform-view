import http from '../../../public/js/http'

export function fetchBenefitInfo(param) {
  return http({
    url: '/economicPerforMance/top',
    method: 'get',
    data: param
  })
}

export function fetchChart(param) {
  return http({
    url: '/economicPerformance/curve',
    method: 'get',
    data: param
  })
}