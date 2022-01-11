import { ValueName } from '../interfaces/CommonInterface'
import moment from 'moment';

import utils from '../public/js/utils';
export function getBool(value) {
  return value === true || value == 'true'
}


// /**
//  * 遍历树结构函数禁用某一个name下所有节点
//  */
// export function disabledAllNode(treeList, treeResult = [], name = '') {
//   console.log(treeResult)
//   if (treeList[0]) {
//     treeList.map((o, i) => {
//       console.log(o, name)
//       if (o.name === name) {
//         console.log(o?.key)
//         if (o?.children) {
//           let a = getTreeItemList(o?.children, [], 'key')
//           console.log(a)
//         }
//       } else {
//         if (o?.children) {
//           disabledAllNode(o?.children, treeResult, name)
//         }
//       }
//     })
//   }
//   console.log(treeResult)
//   return treeResult
// }

//提取对象数组的某个属性值，组成新的字符串或是数组
export function extractByKey(arr, key, resultType = 'String', separator = ',') {
  let resultArr = [];
  arr.length && arr.map(item => {
    if (item[key]) resultArr.push(item[key]);
  })
  if (resultType === 'Array') return resultArr;
  else if (resultType === 'String') return resultArr.join(separator)
  else throw new Error("resultType无效");
}

/**
 * 合并树
 */
export function mergeTreeList(treeList, mergeResult = {}, title = '') {
  if (treeList.length) {
    treeList.map((o, i) => {
      o[title] = mergeResult[o.id]
      if (o?.children) {
        mergeTreeList(o.children, mergeResult, title)
      }
    })
  }
  return treeList
}

/**
 * 遍历树结构函数
 */
export function getTreeItemList(treeList, treeResult = [], name = '') {
  if (treeList[0]) {
    treeList.map((o, i) => {
      if (name) {
        treeResult.push(o?.[name])
      } else {
        treeResult.push(o)
      }
      if (o?.children) {
        treeResult = getTreeItemList(o?.children, treeResult, name)
      }
    })
  }
  return treeResult
}

/**
 * 通用的遍历树结构函数
 */
export function traverseTree(treeList, callback, parent = null) {
  let result = null
  for (let tree of treeList) {
    result = callback(tree, parent)
    if (result !== null) {
      return result
    }
    if (tree.children) {
      result = traverseTree(tree.children, callback, tree)
      if (result !== null) {
        return result
      }
    }
  }
  return null
}

/**
 * 通用的遍历树结构函数
 */
export function findTreeItem(treeList, callback, parent = null): Record<any, any> {
  let treeItem = null
  for (let tree of treeList) {
    let result = callback(tree, parent)
    if (result === true) {
      return tree
    }
    if (tree.children) {
      treeItem = findTreeItem(tree.children, callback, tree)
      if (treeItem !== undefined) {
        return treeItem
      }
    }
  }
}

export function filterTree(treeList, callback): any[] {
  return treeList.filter(item => {
    if (item.children) {
      item.children = filterTree(item.children, callback)
    }
    return callback(item)
  })
}

export function findTreeParents(treeList, callback, parents: any[] = []) {
  for (let item of treeList) {
    const result = callback(item)
    if (result != undefined) {
      return parents
    } else if (item.children) {
      const result = findTreeParents(item.children, callback, parents.concat(item))
      if (result.length) {
        return result
      }
    }
  }
  return []
}

/**
 * 获取当前节点所有父节点
 */
export function getAllParentNodeByKey(treeList, key, parentNodeList: any[] = []) {
  let list = []
  for (let item of treeList) {
    const target = item.key === key
    if (target) {
      return parentNodeList
    } else if (item.children) {
      const result = getAllParentNodeByKey(item.children, key, parentNodeList.concat(item))
      if (result.length) return result
    }
  }
  return []
}

export function getInputRegex(length: number) {
  return RegExp(`^.{1,}$`)
}

export function getInputRule(required: boolean, message: string, length: number) {
  return {
    required,
    message,
    pattern: getInputRegex(length)
  }
}

export const inputRule = (length: number) => (message: string) => {
  let rules = []
  rules.push(getInputRule(true, message, length))
  rules.push(inputLengthRule(length))
  return rules
}

export const floatDotLengthRule = (length: number) => {
  return {
    validator: (rule, value: any, callback) => {
      if (typeof value != 'number') {
        console.error('不是number类型')
      } else {
        let valueTxt = value + ''
        if (valueTxt.indexOf('.') != -1) {
          let parts = valueTxt.split('.')
          let dotPart = parts[1]
          if (dotPart && dotPart.length > length) {
            callback(`小数点${length}位以内`)
          }
        }
      }
      callback()
    }
  }
}

export const inputLengthRule = (length: number) => {
  return {
    validator: (rule, value: any, callback) => {
      if (length == null) {
        return callback()
      }
      if (typeof value == 'number') {
        let valueTxt = value + ''
        if (valueTxt.indexOf('.') != -1) {
          if (valueTxt && valueTxt.length - 1 > length) {
            callback(`请输入${length}位以内`)
          }
        } else {
          if (valueTxt && valueTxt.length > length) {
            callback(`请输入${length}位以内`)
          }
        }
      } else {
        if (value && value.length > length) {
          callback(`请输入${length}字符以内`)
        }
      }
      callback()
    }
  }
}

// 只能输入英文和数字
export const asciiLetterRule = (length: number) => {
  return {
    validator: (rule, value: any, callback) => {
      if (!/^\w*$/.test(value)) {
        callback('只能输入英文和数字')
        return
      }
      callback()
    }
  }
}

// 不能输入中文
export const nonChineseLetterRule = () => {
  return {
    validator: (rule, value: any, callback) => {
      if (/[\u4e00-\u9fa5]/.test(value)) {
        callback('只能输入英文，数字和符号')
        return
      }
      callback()
    }
  }
}

export const inputRule32 = inputRule(32)

export function convertPropertyName(params) {
  let newParams: any = {}
  let keys = Object.getOwnPropertyNames(params)
  keys.forEach(key => {
    newParams[key.substring(2)] = params[key]
  })
  return newParams
}

export function convertSelectParam(propertyList, params) {
  propertyList.forEach(property => {
    if (property.type == 'Enum') {
      let name = property.name
      let match = property.enumValues.find(enumItem => enumItem.id == params[name])
      params[name] = match
    }
    if (property.type == 'Float Range') {
      let name = property.name
      let value1 = params[name + '_1'] != null ? params[name + '_1'] : ''
      let value2 = params[name + '_2'] != null ? params[name + '_2'] : ''
      delete params[name + '_1']
      delete params[name + '_2']
      params[name] = value1 + ',' + value2
    }
    if (property.type == 'Boolean') {
      let name = property.name
      params[name] = params[name] == 1
    }
  })
}

export function range(length) {
  let list = []
  for (let i = 1; i <= length; i++) {
    list.push(i)
  }
  return list
}

export function range0(length) {
  let list = []
  for (let i = 0; i < length; i++) {
    list.push(i)
  }
  return list
}

export function renderTitle(value): string {
  return value && value.title
}

export function renderPercent(value): string {
  if (value == null || value == '') {
    return ''
  }
  if (typeof value == 'string') {
    if (value.indexOf('%') == -1) {
      return value + '%'
    }
    return value
  }
  return value + '%'
}

export function renderEmpty(value: string): string {
  return value ?? utils.intl('无')
}

export function withUnit(value, unit = '') {
  return value ? value + unit : null
}

export function addEmptyOption(options: ValueName[]): ValueName[] {
  options.unshift({
    value: -1,
    name: utils.intl('select.无')
  })
  return options
}

interface ChangedKeysItem {
  type: 'add' | 'remove',
  key: string;
}

interface ChangedKeys {
  keys: ChangedKeysItem[];
  addKeys: string[];
  removeKeys: string[];
}

// 获取变更keys
export function getChangedKeys(curKeys: string[], prevKeys: string[]): ChangedKeys {
  const addKeys = curKeys.filter(key => prevKeys.indexOf(key) < 0)
  const removeKeys = prevKeys.filter(key => curKeys.indexOf(key) < 0)
  return {
    keys: addKeys
      .map(key => ({ type: 'add', key } as ChangedKeysItem))
      .concat(
        removeKeys
          .map(key => ({ type: 'remove', key } as ChangedKeysItem))
      ),
    addKeys,
    removeKeys
  }
}

export function getFirmType(title) {
  if (title == '平台') {
    return ''
  }
  return title || ''
}

export function removeChildren(list: any[]) {
  if (!list) {
    return list
  }
  return list.map(item => {
    if (item == null) {
      return item
    }
    let { children, ...otherItem } = item
    return otherItem
  })
}

export function getImageUrl(url) {
  if (!url) {
    return null
  }
  return window.imagePrefix + url
}

interface CurChartData {
  xData?: any[];
  yData?: any[][];
  series?: any[];
}

interface targetChartItem {
  dtime: string;
  val: any;
  flag: any;
}

interface targetChartData {
  [key: string]: targetChartItem[]
}

export function formatChartData(
  curData: CurChartData = {},
  targetData: targetChartData = {},
  targetAttr: string[] = []
) {
  const current = JSON.parse(JSON.stringify(curData));
  const xDataIndexMap = {};
  if (!current.xData) current.xData = [];
  if (!current.yData) current.yData = [];
  current.xData.forEach((time, index) => {
    xDataIndexMap[time] = index
  })
  targetAttr.forEach((key, index) => {
    //需要先生成yData,否则yData中会有为null的数组,组件需要数组嵌套数组
    if (!current.yData[index]) current.yData[index] = []
    const targetList = targetData[key] || [];
    targetList.forEach(item => {
      // const targetIndex = current.xData.indexOf(item.dtime)
      const targetIndex = xDataIndexMap[item.dtime] ?? -1
      let value = item.val
      if (targetIndex > -1) {
        // if(!current.yData[index]) current.yData[index] = [];
        current.yData[index][targetIndex] = { value, flag: item?.flag };
      } else {
        current.xData.push(item.dtime);
        xDataIndexMap[item.dtime] = current.xData.length - 1
        // if(!current.yData[index]) current.yData[index] = [];
        current.yData[index][current.xData.length - 1] = { value, flag: item?.flag };
        // current.yData[index].push(item.val);
      }
    });
  });
  return current;
}

export function oldFormatChartData(
  curData: CurChartData = {},
  targetData: targetChartData = {},
  targetAttr: string[] = []
) {
  const current = JSON.parse(JSON.stringify(curData));
  if (!current.xData) current.xData = [];
  if (!current.yData) current.yData = [];
  targetAttr.forEach((key, index) => {
    //需要先生成yData,否则yData中会有为null的数组,组件需要数组嵌套数组
    if (!current.yData[index]) current.yData[index] = []
    const targetList = targetData[key] || [];
    targetList.forEach(item => {
      const targetIndex = current.xData.indexOf(item.dtime)
      if (targetIndex > -1) {
        // if(!current.yData[index]) current.yData[index] = [];
        current.yData[index][targetIndex] = item.val;
      } else {
        current.xData.push(item.dtime);
        // if(!current.yData[index]) current.yData[index] = [];
        current.yData[index][current.xData.length - 1] = item.val
        // current.yData[index].push(item.val);
      }
    });
  });
  return current;
}

export function sortChartData(data, config = { fillPoint: false }) {
  const current = JSON.parse(JSON.stringify(data));
  if (!current.xData.length) {
    return current
  }

  const yData = [];
  const formatXData = current.xData.map((key, index) => ({
    key,
    index
  }))
  // formatXData.sort((prev, next) => (new Date(prev.key).getTime() - new Date(next.key).getTime()))
  formatXData.sort((prev, next) => (prev.key > next.key ? 1 : -1))
  let lastVal = []
  current.xData = formatXData.map(item => {
    current.yData.forEach((list, yIndex) => {
      list = list ? list : []
      if (!yData[yIndex]) yData[yIndex] = []
      let value = list[item.index]
      if (config.fillPoint) {
        if (value === null || value === undefined) {
          value = lastVal[yIndex]
        } else {
          lastVal[yIndex] = value
        }
      }

      yData[yIndex].push(value)
    })
    return item.key
  })
  current.yData = yData
  return current
}

function getNumber(value) {
  const result = value || 0;
  if (typeof result === 'string') {
    return Number(result)
  }
  return result
}

function addChartData(cur, target) {
  // console.log('Number((getNumber(cur) + getNumber(target))', Number(getNumber(cur) + getNumber(target)))
  // if(Number.isNaN(Number(getNumber(cur) + getNumber(target)))) console.log('Number((getNumber(cur) + getNumber(target))', cur, target);
  return Number((getNumber(cur?.value !== undefined ? cur.value : cur) + getNumber(target)).toFixed(2))
}

// 同值累加
export function formatChartDataCumulative(
  curData: CurChartData = {},
  targetData: targetChartData = {},
  targetAttr: string[] = []
) {
  // console.log(curData, targetData)
  const current = JSON.parse(JSON.stringify(curData))
  if (!current.xData) current.xData = []
  if (!current.yData) current.yData = []
  targetAttr.forEach((key, index) => {
    const targetList = targetData[key] || [];
    targetList.forEach(item => {
      const targetIndex = current.xData.indexOf(item.dtime)
      if (targetIndex > -1) {
        if (!current.yData[index]) current.yData[index] = [];
        current.yData[index][targetIndex] = addChartData(current.yData[index][targetIndex], item.val);
      } else {
        current.xData.push(item.dtime);
        if (!current.yData[index]) current.yData[index] = [];
        current.yData[index][current.xData.length - 1] = item.val;
      }
    });
  });
  // console.log('current', current)
  return current;
}

export function formatArrData(
  curData: any,
  targetData: any,
  targetString: string
) {
  let resArr = JSON.parse(JSON.stringify(curData));
  let currentObj = {};
  curData.forEach((item, i) => {
    if (item[targetString] !== null) {
      currentObj[item[targetString]] = i;
    }
  })
  targetData.forEach((item) => {
    if (item[targetString] !== null) {
      if (currentObj[item[targetString]] === undefined) {
        resArr.push(item)
      } else {
        resArr[currentObj[item[targetString]]] = item
      }
    }
  })
  return resArr;
}

export function formatAbnormalData(
  curData: any,
) {
  let deviceObj = {
    deviceNum: 0,
    deviceAbnormal: [0, 0, 0, 0]
  };
  curData.forEach((item) => {
    deviceObj.deviceNum += 1
    switch (item.WorkStatus) {
      case 1:
        deviceObj.deviceAbnormal[0] += 1;
        break;
      case 2:
        deviceObj.deviceAbnormal[1] += 1;
        break;
      case 3:
        deviceObj.deviceAbnormal[2] += 1;
        break;
      case 4:
        deviceObj.deviceAbnormal[3] += 1;
        break;
      default:
        deviceObj.deviceAbnormal[0] += 1;
    }
  })
  return deviceObj;
}
export function unitChange(
  curData: any,
  unit: string
) {
  let unitObj = { 'kWh': 'MWh', 'kg': '吨', '元': '万元', '澳元': '万澳元' }
  let res = ''
  if (curData === '' || curData === undefined || curData.toString() === 'NaN') {
    return res = utils.intl(unit)
  }
  if (Math.round(curData) !== 0 && !unitObj[unit]) {
    return res = curData.toFixed(2) + ' ' + utils.intl(unit)
  }
  if (unit === utils.intl('元') || unit === utils.intl('澳元')) {
    if (curData > 10000) {
      res = (curData / 10000).toFixed(2) + ' ' + utils.intl(unitObj[unit])
    } else {
      if (curData === 0) {
        res = '0' + ' ' + utils.intl(unit)
      } else {
        res = curData.toFixed(2) + ' ' + utils.intl(unit)
      }
    }
  } else {
    if (curData > 10000) {
      res = (curData / 1000).toFixed(2) + ' ' + utils.intl(unitObj[unit])
    } else {
      if (Math.round(curData) === 0) {
        res = '0' + ' ' + utils.intl(unit)
      } else {
        res = curData.toFixed(2) + ' ' + utils.intl(unit)
      }
    }
  }

  return res;
}

export function unitValueChange(
  curData: any,
  unit: string,
  toFixed: number = 0
) {
  let res = ''
  if (curData === '' || curData === undefined || curData === null) {
    return res = ''
  }
  curData = parseFloat(curData);
  if (unit === '元') {
    if (curData >= 1000000 || curData < -1000000) {
      res = (curData / 10000).toFixed(2)
    } else {
      if (curData === 0) {
        res = '0'
      } else {
        res = curData.toFixed(toFixed)
      }
    }
  } else if (unit === 'yuan') {
    res = curData;
  } else {
    if (curData >= 10000 || curData <= -10000) {
      res = (curData / 1000).toFixed(2)
    } else {
      if (curData === 0) {
        res = '0'
      } else {
        res = curData.toFixed(toFixed)
      }
    }
  }

  return res;
}

export function valueUnitChange(
  curData: any,
  unit: string
) {
  let unitObj = { 'kWh': 'MWh', 'kg': '吨', '元': '万元', 'kWp': 'MWp', '棵': '万棵' }
  let res = ''
  if (curData === '' || curData === undefined || curData === null) {
    return res = unit
  }
  // curData = parseFloat(curData);
  if (unit === '元') {
    if (curData > 1000000 || curData < -1000000) {
      res = unitObj[unit]
    } else {
      if (curData === 0) {
        res = unit
      } else {
        res = unit
      }
    }
  } else if (unit === 'yuan') {
    res = 'yuan';
  } else {
    if (curData >= 10000 || curData <= -10000) {
      res = unitObj[unit]
    } else {
      if (curData === 0) {
        res = unit
      } else {
        res = unit
      }
    }
  }
  return res;
}

export function arrRange(count) {
  let arr = [];
  for (let i = count; i >= 0; i--) {
    arr.push(moment().subtract(i, 'day').startOf('day'))
  }
  return arr;
}

export function getChartMax(
  curData: number,
) {
  if (curData >= 0) {
    return Math.floor(curData * 1.05)
  } else {
    return Math.floor(curData * 0.95)
  }
}

export function getChartMin(
  curData: number,
) {
  if (curData >= 0) {
    return Math.floor(curData * 0.95)
  } else {
    return Math.floor(curData * 1.05)
  }
}

export function formatValue(value, unit = '', empty = '-') {
  if (value === '' || value === undefined || value === null) return empty

  return `${value}${unit}`
}
