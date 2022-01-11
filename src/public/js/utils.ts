import eq from './eq'
import { Modal } from 'wanke-gui'
import gdata from './gdata'

interface Utils {
  each?: Function;
  intl?: Function;
  transformKey?: Function;
  unique?: Function;
  delFromArrByIndex?: Function;
  getInitLanguage?: Function,
  setTimeout?: Function,
  memoRequest?: (func: Function) => Function,
  typeOf?: (data: any, type: string) => boolean,
  enumeration?: (type: string, data?: any) => any,
  error?: (msg: any) => void;
  filternull?: (str: any) => string,
  confirm?: () => void,
}

let utils: Utils = {}
utils.each = function (arr: any[], fn: Function) {
  const len = arr.length
  for (let i = 0; i < len; i++) {
    let result = fn(arr[i], i)
    if (result === false) {
      break
    }
  }
}

export function withAll(options: any[], allOption: any = { value: '', name: '全部' }) {
  let newOptions = options.map(item => {
    return { value: item.value, name: item.name }
  })
  newOptions.unshift(allOption)
  return newOptions
}

let uid = 1

export function getUid() {
  return uid++
}

utils.transformKey = function ({ data: _data, key, addkey, names = [] }) {
  let data = JSON.parse(JSON.stringify(_data))
  addkey = addkey || ''
  let dataOpt = {}
  utils.each(data, (elem, k) => {
    let temp = { ...elem }
    // 如果是 null 方法会报错
    if (elem[key] !== null && elem[key] !== undefined) {
      let exist = dataOpt[elem[key].toString()]
      const newkey = addkey + elem[key].toString()
      if (exist) {
        if (({}).toString.call(exist).indexOf('Object') > -1) {
          dataOpt[newkey] = [exist, temp]
        } else if (({}).toString.call(exist).indexOf('Array') > -1) {
          dataOpt[newkey] = exist.push(temp)
        }
      } else {
        dataOpt[newkey] = temp
      }
    }
  })
  return dataOpt
}
utils.unique = function (arr) {
  return Array.from(new Set(arr))
}


utils.delFromArrByIndex = function (arr, index) {
  // 如果obj里面有时间对象，则JSON.stringify后再JSON.parse的结果，时间将只是字符串的形式。而不是时间对象
  // 如果obj里有RegExp、Error对象，则序列化的结果将只得到空对象 
  // 如果obj里有函数，undefined，则序列化的结果会把函数或 undefined丢失；
  // 如果obj里有NaN、Infinity和-Infinity，则序列化的结果会变成null
  // JSON.stringify()只能序列化对象的可枚举的自有属性，例如 如果obj中的对象是有构造函数生成的， 则使用JSON.parse(JSON.stringify(obj))深拷贝后，会丢弃对象的constructor；
  // 如果对象中存在循环引用的情况也无法正确实现深拷贝；
  const arr2 = JSON.parse(JSON.stringify(arr))
  arr2.splice(index, 1)
  return arr2
}

utils.getInitLanguage = function () {
  return 'zh'
  let defaultLanguage = 'en'
  let provideLanguage = new Set(['en', 'zh'])
  let initlanguage = defaultLanguage
  let localLanauage = localStorage.getItem('language')
  let naviLanguage = navigator.language
  if (localLanauage && provideLanguage.has(localLanauage)) {
    initlanguage = localLanauage
  } else if (naviLanguage && naviLanguage.indexOf('zh') > -1) {
    initlanguage = 'zh'
  }
  return initlanguage
}
utils.setTimeout = function (func, times) {
  //上一次数组
  let lastArgs = []
  let lastThis
  let calledOnce = false
  return function () {
    let _len = arguments.length
    let newArgs = new Array(_len)
    let _key = 0
    for (_len; _key < _len; _key++) {
      newArgs[_key] = arguments[_key]
    }
    // eslint-disable-next-line block-scoped-var
    //如果没有新的参数进来，则执行函数；
    setTimeout(() => {
      //判断两个条件是否相同，以及当前的作用于是否存在；
      if (calledOnce && lastThis === this && eq(lastArgs, newArgs) && 1) {
        func.apply(this, lastArgs)
      }
    }, times)
    lastArgs = newArgs
    lastThis = this
    calledOnce = true
  }
}
utils.memoRequest = function (func) {
  //上一次数组
  let lastArgs = []
  let lastThis
  let calledOnce = false
  let lastResult
  return async function () {
    let _len = arguments.length
    let newArgs = new Array(_len)
    let _key = 0
    for (_len; _key < _len; _key++) {
      newArgs[_key] = arguments[_key]
    }
    // eslint-disable-next-line block-scoped-var
    //如果没有新的参数进来，则执行函数；
    if (calledOnce && lastThis === this && eq(lastArgs, newArgs) && 1) {
      lastArgs = newArgs
      lastThis = this
      calledOnce = true
      // 返回上一次的数据
      return lastResult
    } else {
      lastArgs = newArgs
      lastThis = this
      calledOnce = true
      lastResult = func.apply(this, lastArgs)
      // 请求数据
      return lastResult
    }
  }
}

utils.typeOf = function (data, type) {
  return ({}).toString.call(data).indexOf(type) > -1
}

// 存储枚举项
const enumeration = {}
utils.enumeration = function (type, data) {
  if (typeof data === 'undefined') {
    if (enumeration[type]) {
      return enumeration[type]
    } else {
      return {}
    }
  } else {
    if (utils.typeOf(data, 'Array')) {
      let dataObj = utils.transformKey({ data, key: 'value', names: ['name'] })
      return enumeration[type] = dataObj
    } else {
      return enumeration[type] = data
    }
  }
}
utils.filternull = function (str) {
  if (str === null || typeof str === 'undefined') {
    return ''
  }

  return str
}

utils.error = function (msg) {
  Modal.error({
    title: utils.intl('提示'),
    content: msg
  })
}
utils.confirm = function () {

}

utils.enumeration('months', gdata('months'))

function handlePlaceholder(string, data, id?) {
  const resultData = data ?? []
  const originString = id || string
  originString.replace(/{.[^\{\}]*}/g, (value, key) => {
    resultData.push(value.substr(1, value.length-2))
    return 0
  })
  return string.replace(/{.[^\{\}]*}/g, (value, key) => resultData[value.substr(1, value.length-2)]);
}

utils.intl = function (id, ...arg) {
  if (id === undefined || id === null) return id
  let title = gdata('languageMessages')[id];
  const newTitle = id ? gdata('languageMessages')[id.replace(/{.[^\{\}]*}/g,'{$}')] : undefined
  if (title !== undefined) {
    return handlePlaceholder(title, arg);
  }
  else if(newTitle) {
    return handlePlaceholder(newTitle, arg, id)
  } else {
    id= handlePlaceholder(id, arg)
  }
  if (id.indexOf('.') != -1) {
    id = id.split('.')[1]
  }
  return id
}

export default utils
