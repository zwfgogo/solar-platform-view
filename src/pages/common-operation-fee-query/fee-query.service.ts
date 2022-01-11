import myAxios from "../../public/js/myAxios"

export function fetchStationList(data) {
  return myAxios({
    method: 'get',
    url: '/operation-mangement/electricity-bill/list',
    data,
    mockData: {
      results: [],
      totalCount: 20
    }
  })
}

export function fetchFeeList(data) {
  return myAxios({
    method: 'get',
    url: '/operation-mangement/electricity-bill',
    data,
    mockData: {
      results: [],
      totalCount: 20
    }
  })
}

export function fetchFeeResult(data) {
  return myAxios({
    method: 'get',
    url: '/report-management',
    data,
    mockData: ''
  })
}

export function fetchMonthList(data) {
  return myAxios({
    method: 'get',
    url: '/operation-mangement/electricity-bill/detail',
    data,
    mockData: {
      results: [],
      totalCount: 20
    }
  })
}

export function fetchMeterList(data) {
  return myAxios({
    method: 'get',
    url: '/operation-mangement/electricity-bill/indication',
    data,
    results: false,
    mockData: {
      results: [],
      totalCount: 20
    }
  })
}
