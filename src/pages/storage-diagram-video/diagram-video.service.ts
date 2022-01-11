import http from '../../public/js/http'

export function fetchStationDiagram(data) {
  let stationId = data.stationId
  return new Promise((resolve) => {
    if (stationId == '231136' || stationId == '20259') { //上海数据中心储能电站
      resolve(require('./pic/shang-hai.svg'))
      return
    }
    if (stationId == '306228' || stationId == '347755') { // 口镇综能储能电站
      resolve(require('./pic/shan-dong.svg'))
      return
    }
    if (stationId == '535234' || stationId == '82195') { // 肇庆AGC储能电站
      resolve(require('./pic/zhao-qing.jpg'))
      return
    }
    if (stationId == '522183' || stationId == '429739') { // 浙能
      resolve(require('./pic/zhe-neng.gif'))
      return
    }
    resolve(null)
  })
}

export function fetchVideoList(data) {
  return http({
    method: 'get',
    url: '/diagram-video/list',
    data,
  })
}

export function addVideoItem(data) {
  return http({
    method: 'post',
    url: '/diagram-video/',
    data,
  })
}

export function updateVideoItem(data) {
  return http({
    method: 'patch',
    url: '/diagram-video/',
    data,
  })
}

export function deleteVideoItem(data) {
  return http({
    method: 'delete',
    url: '/diagram-video/',
    data,
  })
}
