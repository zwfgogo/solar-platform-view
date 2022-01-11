import http from '../../../public/js/http'

export function fetchPriceInfo(data) {
  return http({
    method: 'get',
    url: '/run-strategy/priceInfo',
    data,
  })
}

export function fetchTodayCommandList(data) {
  // return mock(mockTodayCommandList)
  return http({
    method: 'get',
    url: '/run-strategy/todayControlCommand',
    data,
  })
}

export function fetchCurrentControlArgumentList(data) {
  // return mock(mockControlArgumentList)
  return http({
    method: 'get',
    url: '/run-strategy/currentControlArgumentList',
    data,
  })
}

export function fetchCurrentCommandList(data) {
  // return mock(mockCurrentCommandList)
  return http({
    method: 'get',
    url: '/run-strategy/currentControlCommandList',
    data,
  })
}

export function addArgument(data) {
  // return mock(mockCurrentCommandList)
  return http({
    method: 'post',
    url: '/run-strategy/addArgument',
    data,
  })
}

export function updateArgument(data) {
  // return mock(mockCurrentCommandList)
  return http({
    method: 'put',
    url: '/run-strategy/updateArgument',
    data,
  })
}

export function resetArgument(data) {
  return http({
    method: 'delete',
    url: '/run-strategy/deleteArgument',
    data,
  })
}

export function deleteArgument(data) {
  return http({
    method: 'delete',
    url: '/run-strategy/deleteArgument',
    data,
  })
}

export function fetchLocalArgument(data) {
  // return mock(mockCurrentCommandList)
  return http({
    method: 'get',
    url: '/run-strategy/getLocalArgument',
    data,
  })
}

export function fetchTempCommandList(data) {
  return http({
    method: 'get',
    url: '/run-strategy/tempCommandList',
    data,
  })
}

export function sendTempCommand(data) {
  return http({
    method: 'post',
    url: '/run-strategy/sendTempCommand',
    data,
  })
  // return mock(mockControlArgumentList)
}

export function stopTempCommand(data) {
  return http({
    method: 'put',
    url: '/run-strategy/stopTempCommand',
    data,
  })
}

export function fetchCommandTypeOption(data) {
  return http({
    method: 'get',
    url: '/run-strategy/command-type-option',
    data,
  })
}

export function stopControlArgument(data) {
  return http({
    method: 'put',
    url: '/run-strategy/stopArgument',
    data,
  })
}

export function startControlArgument(data) {
  return http({
    method: 'put',
    url: '/run-strategy/startArgument',
    data,
  })
}

export function fetchNotSendArgumentList(data) {
  return http({
    method: 'get',
    url: '/run-strategy/notSendArgumentList',
    data,
  })
}

export function fetchControlTypeOption(data) {
  return http({
    method: 'get',
    url: '/run-strategy/control-type-option',
    data,
  })
}

export function fetchEndControlOption(data) {
  return http({
    method: 'get',
    url: '/run-strategy/end-control-option',
    data,
  })
}

export function send(data) {
  return http({
    method: 'post',
    url: '/run-strategy/sendArgument',
    data
  })
}
