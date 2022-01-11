import myAxios from "../../public/js/myAxios"

export function fetchWorkspaceList(data) {
  return myAxios({
    method: 'get',
    url: '/operation-on-duty/duty-management',
    data,
    mockData: {
      results: [],
      totalCount: 20
    }
  })
}

export function fetchSwitchWorkDetail(data) {
  return myAxios({
    method: 'get',
    url: '/operation-on-duty/duty-management/:id',
    data,
    mockData: {
      runningModel: [],
      runningStatus: []
    }
  })
}

export function fetchStationList(data) {
  return myAxios({
    method: 'get',
    url: '/enums/stations',
    data,
    mockData: []
  })
}

export function addSwitchWork(data) {
  return myAxios({
    method: 'post',
    url: '/operation-on-duty/duty-management',
    data,
    mockData: {}
  })
}

export function addBug(data) {
  return myAxios({
    method: 'post',
    url: '/operation-on-duty/defect-records',
    data,
    mockData: {}
  })
}

export function fetchQrcode(data) {
  return myAxios({
    method: 'get',
    url: '/operation-on-duty/duty-management/qr-code',
    data,
    showError: true,
    mockData: {}
  })
}

export function fetchScanningStatus(data) {
  return myAxios({
    method: 'get',
    url: '/operation-on-duty/duty-management/shift-result',
    data,
    mockData: {}
  })
}

export function editSwitchWork(data) {
  return myAxios({
    method: 'put',
    url: '/operation-on-duty/duty-management/:id',
    data,
    mockData: {}
  })
}
