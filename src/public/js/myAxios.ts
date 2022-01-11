import utils from './utils'
import myAxiosNew from '../../util/myAxios'
import { HttpProps } from '../../interfaces/CommonInterface'

function handleUrl(url, data) {
  // 容错处理将中文的冒号以及空格处理下
  let newUrl = url.replace(/ /g, '').replace(/　/g, '').replace(/：/g, ':')
  // url路由上的参数
  const regx = new RegExp(/:([A-Za-z])+/g)
  const urlParams = url.match(regx)
  if (!!urlParams) {
    utils.each(urlParams, function (item) {
      const key = item.replace(':', '')
      const val = data[key]
      newUrl = newUrl.replace(item, val)
      delete data[key]
    })
  }
  return newUrl
}

export default (params: HttpProps) => {
  const { method, data, url, rawUrl, convert, mockData, results, timeout, showError, bodyData, cancelToken } = params
  let convertedUrl = handleUrl(url, data)
  return myAxiosNew({
    url: convertedUrl,
    method: method,
    rawUrl: rawUrl,
    data: data,
    results: results != undefined ? results : true,
    timeout,
    convert,
    mockData,
    showError,
    bodyData,
    cancelToken,
  })
}
