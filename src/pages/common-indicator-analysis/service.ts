import myAxios from "../../util/myAxios";

export function fetchTreeList(data) {
  return myAxios({
    method: 'get',
    url: '/indicator-analysis/tree',
    data,
    results: true
  })
}

export function fetchIndicatorList(data) {
  return myAxios({
    method: 'get',
    url: '/indicator-analysis/indicator',
    data,
    results: true
  })
}
