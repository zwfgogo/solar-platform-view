import axios from 'axios'
import { message, Modal } from 'wanke-gui'
import { history } from 'umi'
import { devFetchData, sendMockData } from '../core/devTools'
import { isDev } from '../core/env'
import { HttpProps } from '../interfaces/CommonInterface'
import utils from '../util/utils';

let size = 1

interface Iconfig {
  params?: any;
  data?: any;
}

function error(content, title = utils.intl('系统异常'), o?) {
  if (process.env.NODE_ENV != 'production') {
    message.error(content)
    return
  }
  size === 1 &&
    Modal.error({
      title,
      content: content,
      onOk() {
        size = 1
      }
    })
  size = size - 1
  return o
}

export type DataReturnType = 'server' | 'mock' | 'defaultValue'

let ignoreList = [
  '/login/verification',
  '/login',
  ['/customer', 'post'],
  ['/analogs/batch', 'post']
]

function devHttp<T>(params: HttpProps) {
  let match = ignoreList.find(item => {
    if (typeof item == 'string') {
      return params.url.indexOf(item) != -1
    }
    return params.url.indexOf(item[0]) != -1 && params.method == item[1]
  })
  if (match) {
    return myAxios(params)
  }
  return devFetchData(params, myAxios)
}

function myAxios<T>(params: HttpProps, type: DataReturnType = 'server'): Promise<any> {
  const { method, data, rawUrl, showError, bodyData, cancelToken } = params
  let { url } = params
  const config: Iconfig = {}

  if (method === 'get' || method === 'delete' || method === 'head' || method === 'options') {
    config.params = data
    if (bodyData) {
      config.data = bodyData
    }
  } else {
    config.data = data
  }
  if (url[0] != '/') {
    url = '/' + url
  }
  if (type == 'server') {
    if (url.indexOf('api') < 0) {
      url = '/api' + url
    }
  }
  if (type == 'mock') {
    url = url.replace(/\/api/, '/mock')
    if (url.indexOf('/mock') < 0) {
      url = '/mock' + url
    }
  }
  return axios({
    timeout: params.timeout || 25000,
    method,
    url: url,
    cancelToken,
    ...config,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Access-Token': sessionStorage.getItem('token') || '',
      Language: localStorage.getItem('language') || 'zh',
      'Firm-Id': sessionStorage.getItem('firm-id') || '',
      'User-Id': sessionStorage.getItem('user-id') || '',
      'Role-Id': sessionStorage.getItem('role-id') || '',
      'Station-Id': sessionStorage.getItem('station-id') || null,
      'System-platform': process.env.SYSTEM_PLATFORM || 'pv',
      'Time-Zone': sessionStorage.getItem('timeZone') || 'Asia/Shanghai'
    },
    validateStatus: function (status) {
      return true
    }
  }).then((res: any) => {
    return new Promise((resolve, reject) => {
      if (res.status >= 200 && res.status < 300) {
        if ((res.data.message || res.data.error) && !res.data.errorMsg) {
          res.data.errorMsg = res.data.message || res.data.error
        }
        // 网关异常
        if (typeof res.data.errorCode === 'undefined') {
          error(res.data.errorMsg)
          reject(res.data)
        }
        // 成功
        if (res.data.errorCode === 0) {
          let results = params.results ? res.data.results : res.data
          if (params.convert) {
            results = params.convert(results)
          }
          resolve(results)
          // todo 发布时需要删除
          if (type == 'server') {
            // sendMockData(params, res.data)
          }
        }
        // 中间层请求不到后台,服务器异常
        else if (res.data.errorCode === 51) {
          error(res.data.errorMsg)
          reject(res.data)
        }
        // 登录失效
        // else if (res.data.errorCode === 53) {
        //   Modal.error({
        //     title: utils.intl('提示'),
        //     content: utils.intl('登录失效，请重新登录'),
        //     onOk() {
        //       size = 1
        //       history.push('/')
        //     }
        //   })
        //   reject(res.data)
        // }
        //业务异常
        else if (res.data.errorCode === 52) {
          if ((params.method == 'get' || params.method == 'GET') && !showError) {
            return reject(res.data)
          }
          if (params.url == '/run-strategy/auth') {
            error(utils.intl('验证密码错误'), utils.intl('提示'))
            return reject(res.data)
          }
          // 特殊判断，登录页为轻提示，不弹框
          if (res.data.errorMsg === utils.intl('用户名或密码错误') || res.data.errorMsg === utils.intl('用户已经被锁定')) {
            return resolve(res.data)
          }
          if (params.url == '/optimization-strategy/curve') {
            return resolve(res.data)
          }
          if (params.url == '/vpp/detail/summary') {
            error(res.data.errorMsg, utils.intl('提示'))
            return resolve(res.data)
          }
          if (params.url == '/vpp/detail/power-curve') {
            error(res.data.errorMsg, utils.intl('提示'))
            return resolve(res.data)
          }
          if (params.url == '/customer' && params.method == 'post') {
            return reject(res.data)
          }
          if (params.url == '/basic-data-management/equipment-ledger/analogs-temp/batch' && params.method == 'post') {
            return reject(res.data)
          }
          error(res.data.errorMsg, utils.intl('提示'))
          reject(res.data)
        }
        // 其他异常
        else {
          reject(res.data)
        }
      } else {
        error(res.data.errorMsg)
        reject(res.data)
      }
    })
  })
}

export const fileDownload = (params) => {
  const { data } = params
  let { url, method } = params
  method = method ?? 'get'
  const config: Iconfig = {}

  if (url[0] != '/') {
    url = '/' + url
  }

  if (url.indexOf('api') < 0) {
    url = '/api' + url
  }

  if (method === 'get' || method === 'delete' || method === 'head' || method === 'options') {
    config.params = data
  } else {
    config.data = data
  }

  return axios({
    timeout: 0,
    method: method,
    url: url,
    responseType: 'blob',
    ...config,
    headers: {
      'Access-Token': sessionStorage.getItem('token') || '',
      Language: localStorage.getItem('language') || 'zh',
      'Firm-Id': sessionStorage.getItem('firm-id') || '',
      'User-Id': sessionStorage.getItem('user-id') || '',
      'Role-Id': sessionStorage.getItem('role-id') || '',
      'Time-Zone': sessionStorage.getItem('timeZone') || 'Asia/Shanghai'
    },
    validateStatus: function (status) {
      return true
    }
  }).then((response: any) => {
    return new Promise((resolve, reject) => {
      const contentType = response.headers['content-type'];
      if (contentType.indexOf('application/json') < 0) {
        try {
          const filename = decodeURIComponent(response.headers['content-disposition']
            .match(/filename=(.*)/g)[0].replace('filename=', ''))
          utils.downloadFileByBlob(response.data, filename);
          resolve();
        } catch (e) {
          console.log(e)
        }
        return;
      }

      const reader = new FileReader();
      reader.readAsText(response.data, 'utf-8');
      reader.onload = function () {
        const res = {
          ...response,
        };
        try {
          res.data = JSON.parse(reader.result as string)
        } catch (error) {
        }
        console.log(999)
        if (res.status >= 200 && res.status < 300) {
          if ((res.data.message || res.data.error) && !res.data.errorMsg) {
            res.data.errorMsg = res.data.message || res.data.error
          }
          // 网关异常
          if (typeof res.data.errorCode === 'undefined') {
            error(res.data.errorMsg)
            reject(res.data)
          }
          // 成功
          if (res.data.errorCode === 0) {
            let results = params.results ? res.data.results : res.data
            if (params.convert) {
              results = params.convert(results)
            }
            resolve(results)
          }
          // 中间层请求不到后台,服务器异常
          else if (res.data.errorCode === 51) {
            error(res.data.errorMsg)
            reject(res.data)
          }
          // 登录失效
          else if (res.data.errorCode === 53) {
            console.log(11)
            Modal.error({
              title: utils.intl('提示'),
              content: utils.intl('登录失效，请重新登录'),
              onOk() {
                size = 1
                // history.push('/')
              }
            })
            reject(res.data)
          }
          //业务异常
          else if (res.data.errorCode === 52) {
            // 特殊判断，登录页为轻提示，不弹框
            if (res.data.errorMsg === utils.intl('用户名或密码错误') || res.data.errorMsg === utils.intl('用户已经被锁定')) {
              return resolve(res.data)
            }
            if (params.url == '/optimization-strategy/curve') {
              return resolve(res.data)
            }
            if (params.url == '/api-vpp/vpp/detail/summary') {
              error(res.data.errorMsg, utils.intl('提示'))
              return resolve(res.data)
            }
            if (params.url == '/api-vpp/vpp/detail/power-curve') {
              error(res.data.errorMsg, utils.intl('提示'))
              return resolve(res.data)
            }
            if (params.url == '/customer' && params.method == 'post') {
              return reject(res.data)
            }
            if (params.url == '/basic-data-management/equipment-ledger/analogs-temp/batch' && params.method == 'post') {
              return reject(res.data)
            }
            error(res.data.errorMsg, utils.intl('提示'))
            reject(res.data)
          }
          // 其他异常
          else {
            reject(res.data)
          }
        } else {
          error(res.data.errorMsg)
          reject(res.data)
        }
      }
    })
  })
}

const CancelToken = axios.CancelToken

export function createCancelSource() {
  return CancelToken.source()
}

export default myAxios
