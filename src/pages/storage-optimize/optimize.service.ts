import myAxios from '../../public/js/myAxios'
import {mock_fetchStrategyDetail} from './optimize.mock'

export function fetchStationList(data) {
  return myAxios({
    method: 'get',
    url: '/basic-data-management/optimization-strategy/list',
    data
  })
}

export function getStrategyList(data) {
  return myAxios({
    method: 'get',
    url: '/basic-data-management/optimization-strategy/strategyList',
    data
  })
}

export function putStationStrategy(data) {
  return myAxios({
    method: 'put',
    url: '/basic-data-management/optimization-strategy',
    data
  })
}

export function getStrategyParams(data) {
  return myAxios({
    method: 'get',
    url: '/basic-data-management/optimization-strategy/params',
    data
  })
}

export function putStrategyParams(data) {
  return myAxios({
    method: 'put',
    url: '/basic-data-management/optimization-strategy/params/:id',
    data
  })
}

export function postStrategyParams(data) {
  return myAxios({
    method: 'post',
    url: '/basic-data-management/optimization-strategy/params',
    data
  })
}

export function fetchStrategyDetail(data) {
  return myAxios({
    method: 'get',
    url: '/optimization-strategy/detail',
    data,
    mockData: mock_fetchStrategyDetail
  })
}

export function fetchTemplateList(data) {
  return myAxios({
    method: 'get',
    url: '/optimization-strategy/modal',
    data
  })
}

export function addTemplate(data) {
  return myAxios({
    method: 'post',
    url: '/optimization-strategy/modal/save',
    data
  })
}

export function updateStrategy(data) {
  return myAxios({
    method: 'post',
    url: '/optimization-strategy/detail/update',
    data
  })
}

export function addStrategy(data) {
  return myAxios({
    method: 'post',
    url: '/optimization-strategy/detail/create',
    data
  })
}

export function checkStrategy(data) {
  return myAxios({
    method: 'post',
    url: '/optimization-strategy/checkAccount',
    data
  })
}

export function checkPrice(data) {
  return myAxios({
    method: 'post',
    url: '/optimization-strategy/checkPrice',
    data
  })
}

export function checkPointData(data) {
  return myAxios({
    method: 'post',
    url: '/optimization-strategy/checkPointData',
    data
  })
}

export function sendStrategy(data) {
  return myAxios({
    method: 'post',
    url: '/optimization-strategy/send',
    data
  })
}

export function curve(data) {
  return myAxios({
    method: 'get',
    url: '/optimization-strategy/curve',
    data,
    results: false
  })
}

export function fetchQrCode(data) {
  return myAxios({
    method: 'get',
    url: '/optimization-strategy/qr-code',
    data
  })
}

export function fetchScanResult(data) {
  console.log(data)
  return myAxios({
    method: 'get',
    url: '/optimization-strategy/auth-result',
    data
  })
}
