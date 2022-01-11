import { getSocketMock } from '../../socketMock'

const mocker = getSocketMock();
console.log('mocker', mocker);

interface EventMap {
  [key: string]: any[]
}

interface LooptMap {
  [key: string]: any
}

class SocketMocker {
  namespace: string
  eventMap: EventMap = {}
  loopMap: LooptMap = {}
  on(eventName, callback) {
    if(this.eventMap[eventName]) {
      this.eventMap[eventName].push(callback)
    } else {
      this.eventMap[eventName] = [callback]
    }
  }
  
  emit(eventName, params) {
    console.log('SocketMocker receive', eventName, params);
    const targetMocker = mocker[this.namespace]?.events?.[eventName]
    if(targetMocker) {
      this.trigger(eventName, targetMocker?.init(params), targetMocker.delay)
      this.startLoop(eventName, targetMocker, params)
    }
  }

  startLoop(eventName, targetMocker, params) {
    const timeout = targetMocker.timeout || 10000
    if(this.loopMap[eventName]) {
      clearInterval(this.loopMap[eventName].timer)
    }
    this.loopMap[eventName] = { index: 0 }
    this.loopMap[eventName].timer = setInterval(() => {
      this.trigger(eventName, targetMocker?.loop?.(this.loopMap[eventName].index++, params), targetMocker.delay)
    }, timeout)
  }

  trigger(eventName, data, delay = 500) {
    if(eventName && data) {
      // 模拟延时
      setTimeout(() => {
        console.log('SocketMocker send', eventName, data)
        this.eventMap?.[eventName]?.forEach(callback => {
          callback(JSON.stringify(data));
        })
      }, delay);
    }
  }

  close() {
    console.log('SocketMocker close');
    this.eventMap = {}
    Object.keys(this.loopMap).forEach(key => {
      clearInterval(this.loopMap[key].timer)
    })
    this.loopMap = {};
  }

  constructor(namespace) {
    this.namespace = namespace
    this.trigger('connect', {})
  }
}

export function SocketMockHelper(namespace: string) {
  return new SocketMocker(namespace)
}
