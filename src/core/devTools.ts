import axios from 'axios'
import { Column, HttpProps } from '../interfaces/CommonInterface'
import { message } from 'wanke-gui'

let toGenerateList = []

/**
 * 收集server返回的数据
 */
export function sendMockData(request, data) {
  let {url, rawUrl, method} = request

  let urlInfo = rawUrl || url

  if (urlInfo.indexOf('/api') != -1) {
    urlInfo = urlInfo.substring(4)
  }
  if (urlInfo.indexOf('|') == -1) {
    urlInfo = urlInfo + '|' + method
  }
  try {
    if (toGenerateList.length >= 10) {
      axios.post('http://192.168.2.94:3333/generateApiTypes', {list: toGenerateList})
      toGenerateList = []
    } else {
      toGenerateList.push({url: urlInfo, param: request.data, data})
    }
  } catch (e) {
    //ignore
  }
}

function getUrlInfo(url, data) {
  return url + JSON.stringify(data)
}

/**
 * 开发模式 请求必定成功，减少前端等待和联调时间
 * 请求server失败后请求mock，mock失败后使用 mockDate
 */
export function devFetchData<T>(params: HttpProps, http): Promise<T> {
  return new Promise((resolve, reject) => {
    http(params, 'server').then(res => {
      // console.log(`${params.url} server正常返回`)
      resolve(res)
    }, () => {
      // console.log(getUrlInfo(params.url, params.data))
      http(params, 'mock').then(res1 => {
        resolve(res1)
        message.error(`${params.url} server无法提供数据，使用mock数据代替`)
      }, () => {
        if (params.mockData == undefined) {
          message.error(`${params.url} 接口server和mock都无法获取数据，service中提供默认值 mockData`)
        } else {
          message.error(`${params.url} 使用本地 mockData`)
        }
        resolve(params.mockData || {})
      }).catch((e) => {
        console.log(e)
        reject()
      })
    }).catch((e) => {
      console.log(e)
      reject()
    })
  })
}

/**
 * 开发模式 请求必定成功，减少前端等待和联调时间
 * 请求mock失败后请求server，server失败后使用 mockDate
 */
export function mockFirstFetchData<T>(params: HttpProps, http): Promise<T> {
  return new Promise((resolve, reject) => {
    http(params, 'mock').then(res => {
      // console.log(`${params.url} server正常返回`)
      resolve(res)
    }, () => {
      // console.log(getUrlInfo(params.url, params.data))
      http(params, 'server').then(res1 => {
        resolve(res1)
        message.error(`${params.url} mock无法提供数据，使用server数据`)
      }, () => {
        if (params.mockData == undefined) {
          message.error(`${params.url} 接口server和mock都无法获取数据，service中提供默认值 mockData`)
        } else {
          message.error(`${params.url} 使用本地 mockData`)
        }
        resolve(params.mockData || {})
      }).catch((e) => {
        console.log(e)
        reject()
      })
    }).catch((e) => {
      console.log(e)
      reject()
    })
  })
}

/**
 * 开发模式 请求必定成功，减少前端等待和联调时间
 * 请求mock失败后请求server，server失败后使用 mockDate
 */
export function useLocalMock<T>(params: HttpProps, http): Promise<T> {
  return new Promise((resolve, reject) => {
    if (params.mockData) {
      console.log(`使用mockData，${params.url}`)
      resolve(params.mockData || {})
    } else {
      http(params, 'mock').then(res => {
        // console.log(`${params.url} server正常返回`)
        resolve(res)
      }, () => {
        // console.log(getUrlInfo(params.url, params.data))
        http(params, 'server').then(res1 => {
          resolve(res1)
          message.error(`${params.url} mock无法提供数据，使用server数据`)
        }, () => {
        }).catch((e) => {
          console.log(e)
          reject()
        })
      }).catch((e) => {
        console.log(e)
        reject()
      })
    }
  })
}

export function columnsInfo(rowSelection, columns: Column<any>[]) {
  return columns.reduce((result: number, item) => {
    if (item.children) {
      return result + columnsInfo(null, item.children)
    }
    if (typeof item.width == 'number') {
      return result + item.width
    } else if (typeof item.width == 'string') {
      console.log(`${item.title} width不为number类型`)
    } else {
      console.log(`存在没有宽度的列`)
    }
    return result
  }, rowSelection?.columnWidth || 0)
}
