import { Modal } from 'wanke-gui'
import moment from 'moment'
import gdata from '../public/js/gdata'
import axios from 'axios'
import { isZh } from '../core/env'

interface Utils {
  each?: Function;
  intl?: Function;
  transformKey?: Function;
  unique?: Function;
  delFromArrByIndex?: Function;
  getInitLanguage?: Function;
  setTimeout?: Function;
  memoRequest?: (func: Function) => Function;
  typeOf?: (data: any, type: string) => boolean;
  enumeration?: (type: string, data?: any) => any;
  error?: (msg: any) => void;
  filternull?: (str: any) => string;
  confirm?: () => void;
  checkTimeRepeat?: (timeArr: any[], property: string[]) => boolean;
  checkListRepeat?: (list: any[]) => boolean;
  addMicrometerOperator?: (str: string) => string;
  formatEmptyValue?: (value: any, defaultStr?: string) => any;
  downloadFile?: (url: string, filename: string) => Promise<any>;
  downloadFileByBlob?: (blob: Blob, filename: string) => void;
  addTableNum?: (list: any[], page?, size?) => any[]
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

export function withAll(
  options: any[],
  allOption: any = { value: '', name: '全部' }
) {
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
        if ({}.toString.call(exist).indexOf('Object') > -1) {
          dataOpt[newkey] = [exist, temp]
        } else if ({}.toString.call(exist).indexOf('Array') > -1) {
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

utils.typeOf = function (data, type) {
  return {}.toString.call(data).indexOf(type) > -1
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
      return (enumeration[type] = dataObj)
    } else {
      return (enumeration[type] = data)
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
    title: '提示',
    content: msg
  })
}
utils.confirm = function () {
}

utils.checkListRepeat = function (list: any[]) {
  const set = new Set(list)
  return set.size === list.length
}

// 检测时间是否重复
utils.checkTimeRepeat = function (timeArr: any[], property: string[]) {
  if (!timeArr.length) {
    return false
  }
  const startTimeArr = []
  const endTimeArr = []
  timeArr.map(function (item) {
    startTimeArr.push(item[property[0]])
    // 结束时间为00:00时，默认为24:00
    let end = item[property[1]] === '00:00' ? '24:00' : item[property[1]]
    endTimeArr.push(end)
  })
  // 判断是否有重复的开始结束时间
  const startHasRepeat = utils.checkListRepeat(startTimeArr)
  const endHasRepeat = utils.checkListRepeat(endTimeArr)
  if (!startHasRepeat || !endHasRepeat) {
    return true
  }
  const allStartTime = startTimeArr.sort()
  const allEndTime = endTimeArr.sort()
  let result = 0
  for (let k = 1; k < allStartTime.length; k++) {
    if (allStartTime[k] < allEndTime[k - 1]) {
      result += 1
    }
  }
  return Boolean(result > 0)
}

utils.enumeration('months', gdata('months'))

// 添加千分符
utils.addMicrometerOperator = function (str: string) {
  let isNegative = false
  if (str[0] === '-') {
    str = str.slice(1)
    isNegative = true
  }
  const numberReg = /^\d+(\.\d+)?$/
  if (!numberReg.test(str)) return str

  let parts = str.split('.')
  let reg = /\d{1,3}(?=(\d{3})+$)/g
  let res = parts[0].replace(reg, '$&,') + (parts[1] ? '.' + parts[1] : '')
  return isNegative ? '-' + res : res
}

utils.formatEmptyValue = (value: any, defaultStr: string = "") => {
  if (value === null || value === undefined) return defaultStr;
  return value;
};

// 下载文件
utils.downloadFile = (url: string, filename: string) => {
  return axios({
    method: 'GET',
    responseType: 'blob',
    url
  }).then(res => {
    utils.downloadFileByBlob(res.data, filename);
    // const urlObject: any = window.URL || window.webkitURL || window;
    // const a = document.createElement('a')
    // a.href = urlObject.createObjectURL(res.data);;
    // a.download = filename;
    // a.click();
  })
}

utils.downloadFileByBlob = (blob, filename) => {
  const urlObject: any = window.URL || window.webkitURL || window;
  const a = document.createElement('a')
  a.href = urlObject.createObjectURL(blob);;
  a.download = filename;
  a.click();
}

export default utils

function md5(str) {
  const forge = require('node-forge')
  const md = forge.md.md5.create()
  md.update(str + '@wanke')
  return md.digest().toHex()
}


function copy<T>(obj: T): T {
  let objCopy = JSON.parse(JSON.stringify(obj))
  if (JSON.stringify(objCopy).length != JSON.stringify(obj).length) {
    console.log('存在无法序列号的字段')
  }
  return objCopy
}

export function isDeepEqual(a, b) {
  return JSON.stringify(a) == JSON.stringify(b)
}

function triggerEvent(eventName, target, data?= {}) {
  const myEvent = new Event(eventName);
  myEvent.data = data
  target.dispatchEvent(myEvent);
}

export {
  md5,
  copy,
  triggerEvent
}

utils.intl = function (id) {
  let title = gdata('languageMessages')[id];
  if (title) {
    return title;
  }
  else {
    return id;
  }
};

export function getQueryString(name) {
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  let r = null;
  if ((window.location.pathname + window.location.search).split('?')[1]) {
    r = (window.location.pathname + window.location.search).split('?')[1].match(reg);
  }
  // console.log(window.location.hash.split('?')[1]);
  if (r !== null) {
    return decodeURI(r[2]);
  }
  return null;
}

export function fixDigits(target: number, digits: number = 2, isMandatoryDigits: boolean = false): string {
  let value: number = target;
  if (isNaN(value) || !isFinite(value)) {
    // NaN, Infinity 或者非数字类型抛出错误
    throw new Error();
  }
  if (value === 0) {
    if (isMandatoryDigits) {
      return value.toFixed(digits);
    }
    return '0';
  }
  // 判断是否含有小数
  const string: string = value.toString();
  if (!string.includes('.')) {
    // 整数
    if (isMandatoryDigits) {
      return parseFloat(string).toFixed(digits);
    } else {
      return parseInt(string, 10).toString();
    }
  }
  // 小数
  const radix = Math.pow(10, digits);
  value = parseFloat(string);
  value = Math.round(value * radix) / radix;
  return value.toString();
}

interface IConversionUnitParams {
  target: number | null;
  unit: string;
  language: string;
  threshold?: number;
  digits?: number;
}

export function conversionUnit(options: IConversionUnitParams): { value: string, unit: string } {
  // 中文环境下:
  // 当前平台都默认kWh，所以此条暂不实现 能量单位默认千瓦时，10000千瓦时转为1万千瓦时，10000万千瓦时转为1亿千瓦时，10000亿千瓦时转为1万亿千瓦时
  // 功率单位默认kW,1000kW转换为1MW,1000MW转换为1GW,1000GW转换为1TW
  // 货币单位默认元,10000元转换为1万元,然后1万亿元。元/kWh与元相同。若货币选择
  // 为其他类型的货币,那么根据币种展示其中文,比如澳元、美元等,转换方式与元相同
  // 质量单位默认kg，1000kg为1吨，10000吨为1万吨，10000万吨为1亿吨，10000亿吨转为1万亿吨
  // 英文环境下:
  // 能量单位默认kWh,1000kWh转1MWh，1000MWh转1GWh，1000GWh转1TWh
  // 功率单位默认kW,1000kW转换为1MW,1000MW转换为1GW,1000GW转换为1TW
  // 货币单位默认CNY,1000000元转换为1M CNY,然后10亿元为1B CNY CNY /kWh与CNY
  // 相同。若货币选择为其他类型的货币,那么根据币种展示其英文,比如AUD、USD等,转换
  // 方式与CNY相同
  // 质量单位默认kg，1000kg转为1t，1000t转为1kt，1000kt转为1Mt，1000Mt转为Gt，1000Gt转为1Tt
  if (options.target === null) {
    return { value: '', unit: options.unit };
  }
  let unit = options.unit;
  let value = options.target || 0;
  let threshold = options.threshold || 1000;
  const language = options.language || 'zh';
  const isChinese = language === 'zh';
  const isEnglish = language === 'en';
  const digits = options.digits || 2;
  // 标准单位转换，特殊单位转换规则在中英文环境下特殊处理
  let preUnit = [
    'Wh', 'kWh', 'MWh', 'GWh',
    'W', 'kW', 'MW', 'GW',
    'kWp', 'MWp', 'GWp',
    'A',
    'V',
    'kVar',
    'Hz',
    'kVA',
    'kg', 't', 'kt', 'Mt', 'Gt',
    'M CNY'
  ];
  let curUnit = [
    'kWh', 'MWh', 'GWh', 'TWh',
    'kW', 'MW', 'GW', 'TW',
    'MWp', 'GWp', 'TWp',
    'kA',
    'kV',
    'MVar',
    'kHz',
    'MVA',
    't', 'kt', 'Mt', 'Gt', 'Tt',
    'B CNY'
  ];
  const specialUnitObj = {
    profit: [
      '元', '澳元',
      '元/kWh', '澳元/MWh',
      'CNY', 'AUD',
      'CNY/kWh', 'AUD/MWh'
    ],
    quality: ['kg']
  };

  if (specialUnitObj.profit.includes(unit)) {
    if (isChinese) {
      preUnit = ['元', '万元', '亿元', '澳元', '万澳元', '亿澳元'];
      curUnit = ['万元', '亿元', '万亿元', '万澳元', '亿澳元', '万亿澳元'];
      threshold = 10000;
    } else if (isEnglish) {
      preUnit = ['CNY'];
      curUnit = ['M CNY'];
      threshold = 1000000;
    }
  } else if (specialUnitObj.quality.includes(unit)) {
    if (isChinese) {
      preUnit = ['kg', '吨', '万吨', '亿吨'];
      curUnit = ['吨', '万吨', '亿吨', '万亿吨'];
      threshold = unit === 'kg' ? 1000 : 10000;
    }
  }

  const unitIndex = preUnit.indexOf(unit);
  if (unitIndex === -1) {
    // 个在英文中没有对应的翻译也没有进制，取空
    if (unit === 'count' && isChinese) {
      unit = '个';
    }
    if (unit === 'count' && isEnglish) {
      unit = '';
    }
    return { value: fixDigits(value, digits), unit };
  }

  if (Math.abs(value) >= threshold) {
    return conversionUnit({ target: value / threshold, unit: curUnit[unitIndex], threshold, language, digits });
  } else {
    const target = fixDigits(value, digits);
    return { value: target, unit };
  }
}

export function judgeEmpty(property: any) {
  return typeof property === 'undefined' || property === null || property === '' || property === 'null';
}

export function simpleEqual(a , b) {
  if (a === b) {
    return true
  }
  if (typeof a == typeof b) {
    try {
      if (JSON.stringify(a) == JSON.stringify(b)) {
        return true
      }
    } catch(e) {}
  }
  return false
}

utils.addTableNum = (list: any[], page, size) => {
  let numFix = 0
  if (page && size) {
    numFix = (page - 1) * size
  }
  return list?.map((item, index) => ({
    ...item,
    num: numFix + index + 1
  }))
}
// 数字保留位数
export function numberToFixed(number:number, fix = 2):(string|number){
  if(number && `${number}`.split('.')[1]?.length > fix) return number.toFixed(fix)
  return number
}

// 数字四舍五入
export function roundingNumber(target: number, digits: number = 2): number{
  // const tar = 1 / Math.pow(10, digits)
  // if(target > tar || target < -tar){
  //   const len = findFirstIsNotZero(target)
  //   // if(!len) console.log(`${target} => ${target.toPrecision(Math.max(`${Math.abs(target)}`.indexOf('.'), 0) + digits)}`)
  //   if(len) return Number(target.toPrecision(digits - (len - 1)) ?? null)
  //   else return Number(target.toPrecision(`${Math.abs(target)}`.split('.')[0].length + digits) ?? null)
  // }else if(target >= tar / 2  || target <= -tar / 2){
  //   return tar
  // }
  // return 0
  return target || target === 0 ? Number(target.toFixed(digits)) : null
}

// 数字找到第一个不是0的数字的位数（有效数字里使用）
export function findFirstIsNotZero(num: number, len=0):number{
  if(num < 1 && num > -1){
    len = findFirstIsNotZero(num * 10, len + 1)
  }
  return len
}

export const getTextWidth: any = (text, font) => {
  // re-use canvas object for better performance
  let canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
  let context = canvas.getContext("2d");
  context.font = font;
  let metrics = context.measureText(text);
  return metrics.width;
}

export const getFormLayout = () => {
  return isZh() ? 'horizontal' : 'vertical'
}
