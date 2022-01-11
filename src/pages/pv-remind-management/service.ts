import myAxios from "../../util/myAxios";

export function fetchUserList(data) {
  return myAxios({
    method: 'get',
    url: '/remind-management/users',
    data,
    results: true
  })
}

export function fetchRemindSettings(data) {
  return myAxios({
    method: 'get',
    url: '/remind-management/remind-settings',
    data,
    results: true
  })
}

export function newRemindSettings(data) {
  return myAxios({
    method: 'post',
    url: '/remind-management/remind-settings',
    data,
    results: true
  })
}

export function editRemindSettings(data) {
  return myAxios({
    method: 'put',
    url: '/remind-management/remind-settings',
    data,
    results: true
  })
}

export function deleteRemindSettings(data) {
  return myAxios({
    method: 'delete',
    url: `/remind-management/remind-settings/${data.id}`,
    data,
    results: true
  })
}

// -----提醒内容-----

export function fetchRemindInto(data) {
  return myAxios({
    method: 'get',
    url: '/remind-management/remind-info',
    data,
    results: true
  })
}

export function newRemindInto(data) {
  return myAxios({
    method: 'post',
    url: '/remind-management/remind-info',
    data,
    results: true
  })
}

export function editRemindInto(data) {
  return myAxios({
    method: 'put',
    url: '/remind-management/remind-info',
    data,
    results: true
  })
}

export function deleteRemindInto(data) {
  return myAxios({
    method: 'delete',
    url: `/remind-management/remind-info/${data.id}`,
    data,
    results: true
  })
}
