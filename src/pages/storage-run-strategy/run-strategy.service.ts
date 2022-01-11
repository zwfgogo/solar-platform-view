import http from '../../public/js/http'

export function fetchStationStrategyList(data) {
  return http({
    method: 'get',
    url: '/run-strategy/station-list',
    data,
  })
}

export function fetchEnergyUnits(data) {
  return http({
    method: 'get',
    url: '/run-strategy/energyUnits',
    data,
  })
}

export function auth(data) {
  const forge = require('node-forge')
  const md = forge.md.md5.create()
  md.update(data.password + '@wanke')
  md.digest().toHex()
  return http({
    method: 'get',
    url: '/run-strategy/auth',
    data: {
      username: data.username,
      password: md.digest().toHex()
    },
    showError: true
  })
}

export function fetchStrategyRunDateList(data) {
  return http({
    method: 'get',
    url: '/run-strategy/strategy-run-date-list',
    data,
  })
}

export function fetchStrategyList(data) {
  return http({
    method: 'get',
    url: '/run-strategy/strategy-list',
    data,
  })
}

export function sendStrategyControl(data) {
  return http({
    method: 'put',
    url: '/run-strategy/strategy-control',
    data,
  })
}

export function fetchStrategyLogList(data) {
  return http({
    method: 'get',
    url: '/run-strategy/strategy-log-list',
    data,
  })
}

export function fetchStrategyRunDates(data) {
  return http({
    method: 'get',
    url: '/run-strategy/strategy-run-dates',
    data,
  })
}

export function fetchCommonTodayCommandList(data) {
  return http({
    method: 'get',
    url: '/run-strategy/today-control-command',
    data,
  })
}

export function fetchCurrentControlParams(data) {
  return http({
    method: 'get',
    url: '/run-strategy/current-control-command',
    data,
  })
}

export function fetchPlanControlParams(data) {
  return http({
    method: 'get',
    url: '/run-strategy/plan-control-command',
    data,
  })
}

export function postPlanControlParams(data) {
  return http({
    method: 'post',
    url: '/run-strategy/plan-control-command',
    data,
  })
}

export function fetchLocalControlParams(data) {
  return http({
    method: 'get',
    url: '/run-strategy/local-control-command',
    data,
  })
}

// -------------------- no use -----------------------
export function fetchStrategyModes(data) {
  return http({
    method: 'get',
    url: '/run-strategy/mode-list',
    data,
  })
}

export function fetchRemoteStrategyList(data) {
  return http({
    method: 'get',
    url: '/run-strategy/remote-strategy-list',
    data,
  })
}

export function fetchLocalStrategyList(data) {
  return http({
    method: 'get',
    url: '/run-strategy/local-strategy-list',
    data,
  })
}

export function fetchManualStrategyList(data) {
  return http({
    method: 'get',
    url: '/run-strategy/manual-strategy-list',
    data,
  })
}

export function fetchDispatchStrategyList(data) {
  return http({
    method: 'get',
    url: '/run-strategy/dispatch-strategy-list',
    data,
  })
}

export function fetchCurrentReuseEnergyUnits(data) {
  return http({
    method: 'get',
    url: '/run-strategy/current-reuse-energy-units',
    data,
  })
}

export function fetchPlanReuseEnergyUnits(data) {
  return http({
    method: 'get',
    url: '/run-strategy/plan-reuse-energy-units',
    data,
  })
}

export function fetchControlModes(data) {
  return http({
    method: 'get',
    url: '/run-strategy/fetch-control-modes',
    data,
  })
}

export function fetchCurrentControlModes(data) {
  return http({
    method: 'get',
    url: '/run-strategy/current-control-modes',
    data,
  })
}

export function updateControlModes(data) {
  return http({
    method: 'put',
    url: '/run-strategy/update-control-modes',
    data,
  })
}
//----------------------------------------------------