import myAxios from './myAxios'
import utils from './utils'
import { Method } from 'axios'

const promise = new Promise((resolve3, reject3) => {
  // ...
  // reject3('timeout');
}).catch(error => {
  throw new Error(error)
})
promise.catch(error => {
  console.error(error)
})

export function beforeAxios(
  url,
  method,
  data
): { method: Method; url: string; rawUrl: string; data: any } {
  // 容错处理将中文的冒号以及空格处理下
  url = url
    .replace(/ /g, '')
    .replace(/　/g, '')
    .replace(/：/g, ':')
  // url路由上的参数
  const regx = new RegExp(/:([A-Za-z])+/g)
  const urlParams = url.match(regx)
  if (!!urlParams) {
    utils.each(urlParams, function(item) {
      const key = item.replace(':', '')
      const val = data[key]
      url = url.replace(item, val)
      delete data[key]
    })
  }
  return {
    method,
    url,
    rawUrl: url,
    data
  }
}

function createServices<T, T1 = undefined>(
  method: Method,
  url: string,
  data?: T
): Promise<{ errorCode: number; results: T1; errorMsg: string }> {
  const parameter = beforeAxios(url, method, {...data})
  return myAxios<{ errorCode: number; results: T1; errorMsg: string }>(
    parameter
  )
}

export default createServices
