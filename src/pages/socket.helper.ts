import SocketClient from 'socket.io-client'
import { message, Modal } from 'wanke-gui'
import { history } from 'umi'
import _ from "lodash";
import { Socket_Use_Mock } from './constants';
import { isDev } from '../core/env';
import { SocketMockHelper } from './socket.mock.helper';

const isMock = Socket_Use_Mock && isDev();

function dealWithError(errorData: any = {}) {
  const errorMsg = errorData.errorMsg || ''
  switch (errorData.errorCode) {
    case 53:
      Modal.error({
        title: '提示',
        content: '登录失效，请重新登录',
        onOk() {
          // history.push('/')
        }
      })
      break;
    case 99:
      break;
    default:
      if (!errorMsg) return;
      break;
  }
}

interface EventOptions {
  [key: string]: string
}

interface CallbackOptions {
  [key: string]: Function;
}

interface CountMap {
  [key: string]: number;
}

interface IConfig {
  mergeTimeInterval?: number
  mergeConfig?: {
    [key: string]: {
      mergeFn: (prevRes, nextRes) => any,
      defaultValue: any
    }
  }
  loadingEventNameMap?: { [key: string]: string }
  loadingWatchNames?: string[] // 如果传入监听事件loading的数组，过滤不需要监听的事件
}

const defaultConfig: IConfig = {
  mergeTimeInterval: 300,
  mergeConfig: {},
  loadingEventNameMap: {},
}

export default class SocketHelper {
  namespace: string
  url: string
  path: string
  ws: any
  countMap: CountMap = {}
  extraOption: any = {}
  config: IConfig = {}
  socketLoading: any = {}
  callbackOptions: any = {}
  constructor(namespace: string, url: string, path: string, extraOption: any = {}, config: IConfig = {}) {
    this.namespace = namespace
    this.url = url
    this.path = path
    this.extraOption = extraOption
    this.config = { ...defaultConfig, ...config }
  }

  triggerLoadingChange = () => {
    const { socketLoadingChange } = this.callbackOptions
    socketLoadingChange?.(this.socketLoading)
  }

  socketLoadingChange(eventName, flag) {
    const { loadingEventNameMap, loadingWatchNames } = this.config
    const targetEventName = loadingEventNameMap[eventName] || eventName

    // 如果传入监听事件loading的数组，过滤不需要监听的事件
    if (loadingWatchNames && loadingWatchNames.indexOf(targetEventName) < 0) return

    if (this.socketLoading[targetEventName] !== flag) {
      this.socketLoading[targetEventName] = flag
      this.triggerLoadingChange()
    }
  }

  start(dispatch: any, eventOptions: EventOptions = {}, callbackOptions: CallbackOptions = {}) {
    this.callbackOptions = callbackOptions
    if (this.ws) {
      this.close()
    }
    if (isMock) {
      this.ws = SocketMockHelper(this.path);
    } else {
      this.ws = SocketClient(this.url + this.path, {
        transports: ['websocket'],
        'query': 'token=' + sessionStorage.getItem('token') + '&language=' + localStorage.getItem('language') + '&timeZone=' + sessionStorage.getItem('timeZone'),
        reconnectionDelayMax: 10000,
        reconnectionDelay: 10000,
        reconnectionAttempts: undefined, // 一直尝试重连
        ...this.extraOption,
      });
    }
    // 触发effect的方式
    const eventList = Object.keys(eventOptions)
    eventList.forEach(eventName => {
      this.registerEvent(eventName, result => {
        this.socketLoadingChange(eventName, false)
        // 统计emit后回调次数
        if (!this.countMap[eventName]) this.countMap[eventName] = 0;
        this.countMap[eventName]++
        dispatch({ type: `${this.namespace}/${eventOptions[eventName]}`, payload: { result, count: this.countMap[eventName], eventName } })
      })
    })
    // 回调的方式
    const callbackList = Object.keys(callbackOptions)
    callbackList.forEach(eventName => {
      this.registerEvent(eventName, result => {
        this.socketLoadingChange(eventName, false)
        // 统计emit后回调次数
        if (!this.countMap[eventName]) this.countMap[eventName] = 0;
        this.countMap[eventName]++
        callbackOptions[eventName](result, this.countMap[eventName])
      })
    })

    // 报错处理
    this.ws.on('serverError', res => {
      let errorData
      if (typeof res === 'object') {
        errorData = res
      } else {
        try {
          errorData = JSON.parse(res)
        } catch (error) {
          errorData = {}
        }
      }
      dealWithError(errorData)
    })
  }

  close() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.countMap = {}
      this.socketLoading = {}
      this.callbackOptions = {}
    }
  }

  emit(eventName, params = {}) {
    if (this.ws) {
      this.socketLoadingChange(eventName, true)
      this.countMap[eventName] = 0
      this.ws.emit(eventName, {
        firmId: sessionStorage.getItem("firm-id"),
        ...params
      })
    }
  }

  registerEvent(eventName, callback) {
    const { mergeConfig, mergeTimeInterval } = this.config
    const config = mergeConfig[eventName]
    let handleMessage = callback
    if (config) {
      let { mergeFn, defaultValue } = config
      handleMessage = debounceSocket(callback, mergeFn, defaultValue, mergeTimeInterval)
    }
    this.ws.on(eventName, res => {
      let data
      res = res || '{}'
      try {
        data = typeof res === 'string' ? JSON.parse(res) : res
      } catch (error) {
        data = {}
      }

      handleMessage(data)
    })
  }
}

function debounceSocket(fn, mergeFn, defaultValue, delay) {
  let timer = null
  let prevRes = defaultValue
  return function(res) {
    let data
    res = res || '{}'
    try {
      data = typeof res === 'string' ? JSON.parse(res) : res
    } catch (error) {
      data = {}
    }

    if(timer){
      clearTimeout(timer)
      prevRes = mergeFn(prevRes, data)
      timer = setTimeout(() => {
        fn(prevRes)
        prevRes = defaultValue
      }, delay) 
    } else {
      prevRes = data
      timer = setTimeout(() => {
        fn(prevRes)
        prevRes = defaultValue
      }, delay)
    }
  }
}
