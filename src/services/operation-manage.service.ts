import http from "../public/js/http"


//分析日报
export function operationReport(data) {
  return http({
    method: 'get',
    url: '/operation-mangement/operation-report',
    data,
    mockData: {results: [{}, {}, {}], totalCount: 50}
  })
}

export function operationReportDetail(data) {
  return http({
    method: 'get',
    url: '/operation-mangement/operation-report/list',
    data,
    mockData: [{}, {}, {}]
  })
}

export function operationReportChartsDetail(data) {
  return http({
    method: 'get',
    url: '/operation-mangement/operation-report/electricity',
    data,
    results: false,
    mockData: [{}, {}, {}]
  })
}

export function reasonList(data) {
  return http({
    method: 'get',
    url: '/overhaul-maintenance/electric-variance-analysis/reason/list',
    data,
    mockData: {results: [{}, {}, {}], totalCount: 50}
  })
}

export function deleteReasonConfig(data) {
  return http({
    method: 'delete',
    url: '/overhaul-maintenance/electric-variance-analysis/reason/:id',
    data
  })
}

export function saveReasonConfig(data) {
  return http({
    method: 'post',
    url: 'overhaul-maintenance/electric-variance-analysis/reason',
    data
  })
}

export function updateReasonConfig(data) {
  return http({
    method: 'patch',
    url: 'overhaul-maintenance/electric-variance-analysis/reason/:id',
    data
  })
}

export function fetchReasonList(data) {
  return http({
    method: 'get',
    url: '/overhaul-maintenance/electric-variance-analysis/list',
    data,
    mockData: []
  })
}

export function addReason(data) {
  return http({
    method: 'post',
    url: '/overhaul-maintenance/electric-variance-analysis',
    data
  })
}

export function updateReason(data) {
  return http({
    method: 'put',
    url: '/overhaul-maintenance/electric-variance-analysis/:id',
    data
  })
}

export function deleteReason(data) {
  return http({
    method: 'delete',
    url: '/overhaul-maintenance/electric-variance-analysis/:id',
    data
  })
}

//指标
export function indexConfig(data) {
  return http({
    method: 'get',
    url: '/operation-mangement/operation-config',
    data,
    mockData: {results: [{}, {}, {}], totalCount: 50}
  })
}

export function addIndexConfig(data) {
  return http({
    method: 'post',
    url: '/operation-mangement/operation-config/',
    data,
    mockData: {}
  })
}

export function updateIndexConfig(data) {
  return http({
    method: 'patch',
    url: '/operation-mangement/operation-config/:id',
    data,
    mockData: {}
  })
}

export function deleteIndexConfig(data) {
  return http({
    method: 'delete',
    url: '/operation-mangement/operation-config/:id',
    data,
    mockData: {}
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
