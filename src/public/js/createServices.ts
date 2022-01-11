import myAxios from './myAxios'
import utils from './utils'

const promise = (new Promise((resolve3, reject3) => {
  // ...
  // reject3('timeout');
}).catch((error) => {
  throw new Error(error)
}))
promise.catch((error) => {
  console.error(error)
})

export function beforeAxios(req, data) {
  const temp = req.split('|')
  // 容错处理将中文的冒号以及空格处理下
  let url = temp[0].replace(/ /g, '').replace(/　/g, '').replace(/：/g, ':')
  const method = temp[1] || 'get'
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
    rawUrl: req,
    data,
    results: true
  }
}

export default (requests = {}): any => {
  const services = {}
  for (const i in requests) {
    if (requests[i]) {
      const req = requests[i]
      if (typeof req === 'function') {
        services[i] = (data = {}, options: any = {}) =>
          new Promise((resolve, reject) => {
            setTimeout(() => {
              const res = req(data)
              if (res.status === 200 || res.errorCode === 0) {
                resolve(res.data || res.results)
              } else {
                reject(res)
              }
              // else {
              //   return promise;
              // }
            }, options.delay || 500)
          })
      } else {
        // 服务器请求数据
        // 可以将接口数据缓存，在请求参数和上次一样的情况下，直接返回上层的数据
        if (i.indexOf('memo') === 0) {
          services[i] = utils.memoRequest(function(data) {
            const parameter = beforeAxios(req, {...data})
            return myAxios(parameter)
          })
        } else {
          // 请求url 解析
          // 请求方式 |
          services[i] = (data) => {
            const parameter = beforeAxios(req, {...data})
            // 没有必要区分 data 是否是空对象
            // if (Object.keys(data || {}).length === 0) {
            //   return myAxios({method,url});
            // }
            return myAxios(parameter)
          }
        }
      }
    }
  }
  return services
};
