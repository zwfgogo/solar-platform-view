// import Config from '../../src/config';
import XLSX from 'xlsx';
// import eq from '../public/js/eq';
import gdata from '../../public/js/gdata';

var a = [];
var b = [];

interface Utils {
  each?: Function;
  intl?: Function;
  transformKey?: Function;
  unique?: Function;
  delFromArrByIndex?: Function;
  getInitLanguage?: Function,
  setTimeout?: Function,
  getQueryString?: Function,
  memoRequest?: (func: Function) => Function,
  typeOf?: (data: any, type: string) => boolean,
  enumeration?: (type: string, data?: any) => any,
  error?: (msg: any) => void;
  filternull?: (str: any) => string,
  confirm?: () => void,
}

let utils: Utils = {}

/*确定状态字体颜色------应该会删掉*/
export function confirmColor(arg) {
  switch (arg) {
    case '停止':
      return 'red';
    case '故障':
      return 'red';
    default:
      return '#20d1a5';
  }
}
/*16进制颜色转为RGBA格式*/
export function colorRgba(color) {
  //十六进制颜色值的正则表达式
  var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  var sColor = color.toLowerCase();
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      var sColorNew = '#';
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
      }
      sColor = sColorNew;
    }
    //处理六位的颜色值
    var sColorChange = [];
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2), 10));
    }
    return 'RGBA(' + sColorChange.join(',') + ',0.8)';//设置淡化程度
  }
  else {
    return sColor;
  }
}
/*RGB颜色转换为16进制*/
export function colorHex() {
  var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  var that = this;
  if (/^(rgb|RGB)/.test(that)) {
    var aColor = that.replace(/(?:||rgb|RGB)*/g, '').split(',');
    var strHex = '#';
    for (var i = 0; i < aColor.length; i++) {
      var hex = Number(aColor[i]).toString(16);
      if (hex === '0') {
        hex += hex;
      }
      strHex += hex;
    }
    if (strHex.length !== 7) {
      strHex = that;
    }
    return strHex;
  }
  else if (reg.test(that)) {
    var aNum = that.replace(/#/, '').split('');
    if (aNum.length === 6) {
      return that;
    }
    else if (aNum.length === 3) {
      var numHex = '#';
      for (let i = 0; i < aNum.length; i += 1) {
        numHex += (aNum[i] + aNum[i]);
      }
      return numHex;
    }
  }
  else {
    return that;
  }
}
//各个input验证信息的正则表达式
export function getInputVerify(stringName, sNumber, eNumber) {
  let verify = {};
  verify.NUMBER = '^[0-9a-zA-Z]+$';
  verify.ACCOUNTNUMBER = '^[0-9a-zA-Z]{1,16}$';
  verify.PASSWORD = '^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$';
  verify.PHONE = '^(13\\d|14[5-9]|15[0-3]|15[5-9]|166|17[0-8]|18\\d|19[8-9])\\d{8}$';
  verify.FIRMCODE = '^[0-9]+$';
  verify.CAPACITY = '^[1-9]{1}[0-9]{0,19}$';
  verify.NAME = '^.{1,16}$';
  verify.GOAL = '^\\d{1,7}(\\.\\d{1,2})?$';
  verify.TS = '(((^[1-4][0-9])|(^[1-9]))(\\.\\d{1})?$)|(^[5][0]$)|(^[5][0]\\.0$)|(^[0]$)|(^[0]\\.\\d{1}$)';
  verify.NotE = '(^[1-4][0-9]$)|(^[5][0]$)|(^[1-9]$)';
  let regular = verify[stringName];
  return new RegExp(regular);
}
/*轮询方法*/
// export function loopReq(timerName,reqFn) {
//   a.push([reqFn,timerName]);
//   window.myTimer = window.myTimer ? window.myTimer : {};
//   window.myTimer[timerName] = window.setInterval(()=>{
//     reqFn();
//   },Config.dataTimer);
// }
// /*回页面时的轮询方法*/
// export function backLoopReq() {
//   for (let i = 0; i < a.length; i++) {
//     window.myTimer[a[i][1]] = window.setInterval(()=>{
//       a[i][0]();
//     },Config.dataTimer);
//   }
//   for (let i = 0; i < b.length; i++) {
//     window.myTimer[b[i][1]] = window.setInterval(()=>{
//       b[i][0]();
//     },Config.chartTimer);
//   }
// }

export function loopReqChart(timerName, interval, reqFn) {
  // console.log('loopReqChart',interval)
  b.push([reqFn, timerName]);
  window.myTimer = window.myTimer ? window.myTimer : {};
  window.myTimer[timerName] = window.setInterval(() => {
    reqFn();
  }, interval);
}
/*销毁指定轮询方法*/
export function delLoopReq(timerName) {
  if (window.myTimer) {
    window.clearInterval(window.myTimer[timerName]);
  }
  else {
    window.clearInterval(window[timerName]);
  }
}
/*销毁所有轮询方法*/
export function delAllLoopReq() {
  a = [];
  for (let i in window.myTimer) {
    window.clearInterval(window.myTimer[i]);
  }
}
/*判断res是否为undefined*/
export function respondsJudge(res) {
  // if(res !== undefined){
  //   return true
  // }
  return res;
}

/*判断数值长度*/
export function numberLength(number) {
  if (number >= 100000) {
    number = (number / 1000).toFixed(2);
  }
  return number;
}

//导出 excel方法
export function openDownloadDialog(url, saveName) {
  if (typeof url == 'object' && url instanceof Blob) {
    url = URL.createObjectURL(url); // 创建blob地址
  }
  var aLink = document.createElement('a');
  aLink.href = url;
  aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
  var event;
  if (window.MouseEvent) {
    event = new MouseEvent('click')
      ;
  }
  else {
    event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  }
  aLink.dispatchEvent(event);
}
export function sheet2blob(sheet, sheetName, tableHeard) {
  sheetName = sheetName || 'sheet1';
  var workbook = {
    SheetNames: [sheetName],
    Sheets: {}
  };
  workbook.Sheets[sheetName] = sheet;
  workbook.Sheets[sheetName]['!cols'] = [];
  for (let item of tableHeard) {
    workbook.Sheets[sheetName]['!cols'][workbook.Sheets[sheetName]['!cols'].length] = {
      wpx: 130
    };
  }
  // 生成excel的配置项
  var wopts = {
    bookType: 'xlsx', // 要生成的文件类型
    bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
    type: 'binary'
  };
  var wbout = XLSX.write(workbook, wopts);
  var blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
  // 字符串转ArrayBuffer
  function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  }
  return blob;
}
export function sheet2blob1(sheet, tableHeard, sheets) {
  var workbook = {
    SheetNames: sheets,
    Sheets: {}
  };
  sheet.forEach((v, i) => {
    workbook.Sheets[sheets[i]] = v;
    workbook.Sheets[sheets[i]]['!cols'] = [];
    for (let item of tableHeard) {
      workbook.Sheets[sheets[i]]['!cols'][workbook.Sheets[sheets[i]]['!cols'].length] = {
        wpx: 130
      };
    }
  });

  // 生成excel的配置项
  var wopts = {
    bookType: 'xlsx', // 要生成的文件类型
    bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
    type: 'binary'
  };
  var wbout = XLSX.write(workbook, wopts);
  var blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
  // 字符串转ArrayBuffer
  function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xFF
        ;
    }
    return buf;
  }
  return blob;
}
//清除掉localStorge的内容
export function clearLocal() {
  let storage = window.localStorage;
  for (let i = 0; i < storage.length; i++) {
    let key = storage.key(i);
    if (key !== 'oldUser' && key !== 'language') {
      storage.removeItem(key);
    }
  }
  storage.removeItem('a');
  storage.removeItem('a');
  storage.removeItem('a');
  storage.removeItem('a');
}
/*表头转中文*/
export function nameChange(o, title) {
  let nameTable = {
    stationTitle: '电站',
    firmTitle: '单位名称',
    orderName: '工单名称',
    statusTitle: '事件状态',
    typeTitle: '工单类型',
    devTitle: '设备对象',
    description: '工单描述',
    userTitleCreate: '发起人',
    userTitleProcess: '处理人员',
    latestProcessTime: '操作时间',
    abnormalTitle: '异常名称',
    records: '异常详情',
    abnormalStatusTitle: '异常状态',
    continueTime: '异常持续时间',
    userNameProcess: '操作人',
    startTime: '发生时间',
    conditions: '判断条件',
    receiveName: '短信接收人姓名',
    phone: '手机号',
    dtime: '短信接收时间',
    abnormalType: '异常类型',
    alarm: '是否显示异常告警',
    devTypeTitle: '设备类型',
    validTime: '计划有效时间',
    updateTime: '更新时间',
    templateName: '模板名称',
    date: '执行时间',
    power: '固定功率(kW)',
    module: '功能模块',
    type: '操作类型',
    record: '操作记录',
    operatorName: '操作账号',
    operatorTitle: '操作人'
  };
  let chinese = {};
  let table = [];
  for (let key in title) {
    if (nameTable[title[key].dataIndex] !== undefined) {
      chinese[title[key].dataIndex] = nameTable[title[key].dataIndex];
    }
  }
  for (let item of o) {
    let b = {};
    for (let subItem in item) {
      if (chinese[subItem] !== undefined) {
        b[chinese[subItem]] = item[subItem];
      }
    }
    table.push(b);
  }
  return table;
}
export function changeName(dataSource, columns) {
  let newData = [];
  const changeNameChild = (dataSource, columns) => {
    dataSource.forEach(v => {
      let i = {};
      let keys = Object.keys(v);
      keys.forEach(h => {
        columns.forEach(m => {
          if (h == m.dataIndex) {
            if (typeof m.title === 'object') {
              i[m.title.props.id] = v[h];
            } else {
              i[m.title] = v[h];
            }
          }
          else if ((h + '.title') === m.dataIndex) {
            if (typeof m.title === 'object') {
              i[m.title.props.id] = v[h]['title'];
            } else {
              i[m.title] = v[h]['title'];
            }
          }
        });
      });
      newData.push(i);
      if (v.children) {
        changeNameChild(v.children, columns);
      }
    });
  };
  changeNameChild(dataSource, columns);
  return newData;
}
/*表头生成*/
export function tableTitle(o) {
  let titleArr = [];
  for (let value of o) {
    if (typeof value.title === 'object') {
      if (value.title.props.id !== utils.intl('操作')) {
        titleArr.push(value.title.props.id);
      }
    } else {
      if (value.title !== utils.intl('操作')) {
        titleArr.push(value.title);
      }
    }
  }
  return titleArr;
}

/*判断单位长度*/
export function judgeUnit(number, nowUnit) {
  if (nowUnit === 'kWh') {
    let unit = 'kWh';
    if (number >= 100000) {
      unit = 'MWh';
    }
    return unit;
  }
  if (nowUnit === '元') {
    let unit = '元';
    if (number >= 100000) {
      unit = '千元';
    }
    return unit;
  }
}


// 定义工具类
utils.each = function (arr, fn) {
  for (var i = 0; i < arr.length; i++) {
    fn(arr[i], i);
  }
};
// 获取今日日期
function getToday() {
  const d = new Date();
  const year = d.getFullYear();
  let month = d.getMonth() + 1;
  if (month < 10) {
    month = '0' + month;
  }
  let date = d.getDate();
  if (date < 10) {
    date = '0' + date;
  }
  const today = year + '-' + month + '-' + date;
  return today;
}
//获取上个月的时间
function getPreMonth(date) {
  var arr = date.split('-');
  var year = arr[0]; //获取当前日期的年份
  var month = arr[1]; //获取当前日期的月份
  var day = arr[2]; //获取当前日期的日
  var days = new Date(year, month, 0);
  days = days.getDate(); //获取当前日期中月的天数
  var year2 = year;
  var month2 = parseInt(month) - 1;
  if (month2 == 0) {
    year2 = parseInt(year2) - 1;
    month2 = 12;
  }
  var day2 = day;
  var days2 = new Date(year2, month2, 0);
  days2 = days2.getDate();
  if (day2 > days2) {
    day2 = days2;
  }
  if (month2 < 10) {
    month2 = '0' + month2;
  }
  var t2 = year2 + '-' + month2 + '-' + day2;
  return t2;
}
// 获取今日月份
function getMonth() {
  const d = new Date();
  const year = d.getFullYear();
  let month = d.getMonth() + 1;
  if (month < 10) {
    month = '0' + month;
  }
  const today = year + '-' + month;
  return today;
}
// 获取明天的日期
function getTodayAddOne() {
  var date = new Date();
  date.setDate(date.getDate() + 1);
  var seperator1 = '-';
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = '0' + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = '0' + strDate;
  }
  var currentdate = year + seperator1 + month + seperator1 + strDate;
  return currentdate;
}

// 获取明天的日期
function getDay() {
  const d = new Date();
  const weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const number = d.getDay();
  const day = weekday[number];
  return day;
}
function getNowTime() {
  let myDate = new Date();
  let hour = myDate.getHours(); //获取系统时，
  let minute = myDate.getMinutes(); //分
  let seconds = myDate.getSeconds(); //秒
  if (minute < 10) {
    minute = '0' + minute
  }
  if (seconds < 10) {
    seconds = '0' + seconds
  }
  if (hour < 10) {
    hour = '0' + hour
  }
  let str = hour + ':' + minute + ':' + seconds;
  return str;
}
// 获取数组中value所对应的name
function getNameByValue(arr, value) {
  for (let o of arr) {
    if (o.value === parseInt(value, 10)) {
      return o.name;
    }
  }
}
// 获取url传参
function getQueryString(name) {
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
//get后缀填充
function getSuffix(data) {
  let flag = true;
  let suffix = '';
  if (data !== undefined) {
    let keysArr = Object.keys(data).sort();
    keysArr.forEach((v) => {
      if (typeof data[v] !== 'undefined' && data[v].length > 0 || typeof data[v] !== 'object') {
        if (flag) {
          suffix = suffix + '?' + v + '=' + encodeURIComponent(data[v]);
          flag = false;
        }
        else {
          suffix = suffix + '&' + v + '=' + encodeURIComponent(data[v]);
        }
      }
    });
  }
  return suffix;
}

/* @func 四舍五入保留小数，原生toFixed会有精度问题
* @return <String>
* @param digit <String, Number> 待转换数字
* @param decimal <Number> 保留位数
* @param number <Number> 小数部分末尾最多显示0的数量
*/
utils.toFixed = function (digit, decimal, number) {
  if (isNaN(digit) || digit === '') {
    return digit;
  }
  //默认末尾只保留2个0
  if (number === undefined) {
    number = 2;
  }
  decimal = decimal || 0;
  //将数字转换为字符串，用于分割
  var value = digit.toString();
  //补零
  var mend = function (num) {
    var zero = '';
    while (num > 0) {
      zero += '0';
      num--;
    }
    return zero;
  };
  //正负数
  var pre = '';
  if (value < 0) {
    value = value.replace('-', '');
    pre = '-';
  }
  //获取小数点所在位置
  var i = value.indexOf('.');
  //存在小数点
  if (i !== -1 && decimal >= 0) {
    var integer = parseInt(value.substr(0, i));
    //小数部分转为0.xxxxx
    var _decimal = '0' + value.substr(i);
    var num = '1' + mend(decimal);
    _decimal = (Math.round(_decimal * num) / num).toFixed(decimal);
    //小数四舍五入后，若大于等于1，整数部分需要加1
    if (_decimal >= 1) {
      integer = (integer + 1).toString();
    }
    value = pre + integer + _decimal.substr(1);
  }
  else if (decimal > 0) {
    //整数就直接补零
    value = pre + value + '.' + mend(decimal);
  }
  if (number !== null && number >= 0 && number < decimal) {
    value = value.replace(/0+$/, '');
    var i = value.indexOf('.'),
      len = 0;
    if (i !== -1) {
      len = value.substr(i + 1).length;
    }
    while (len < number) {
      value = value + '0';
      len++;
    }
    value = value.replace(/\.$/, '');
  }
  return value;
};

/**
 * 将一维的扁平数组转换为多层级对象
 * @param {array} data 树形数据
 * @param {string} root 开始提取数组的树节点key值
 * @param {string} idTxt 键值名称
 * @param {string} pidTxt 指向父元素的键值名称
 * @param {string} pushTxt 树形表示子元素的键值
* @returns {array} 返回树形结构数组
 */
utils.getTreeFromArr = function (data, root, idTxt, pidTxt, pushTxt) {
  root = root || '0';
  idTxt = idTxt || 'id';
  pidTxt = pidTxt || 'pid';
  pushTxt = pushTxt || 'children';
  // 递归方法
  function getNode(id, zindex) {
    var node = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i][pidTxt] === id) {
        data[i].zindex = zindex;
        data[i][pushTxt] = getNode(data[i][idTxt], zindex + 1);
        node.push(data[i]);
      }
    }
    if (node.length === 0) {
      return [];
    }
    else {
      return node;
    }
  }
  // 使用根节点
  return getNode(root, 0);
};

/**
 * 从树形结构获取获取一维数组
 * @returns {array} 返回的一维数组
 */
utils.getArrFromTree = function (params) {
  let { data, transformKey } = params;
  let _transformKey = {
    id: 'id',
    pid: 'pid',
    children: 'children',
    pname: 'name',
    ...transformKey
  };
  let { id: idTxt, pid: pidTxt, children: childrenTxt, pname: pnameTxt } = _transformKey;
  let max = 0;
  function getNode(arr, pid, level, pname) {
    var node = [];
    for (let i = 0; i < arr.length; i++) {
      const element = arr[i];
      let { children, ...other } = element;
      node.push({ ...other, [pidTxt]: pid, level, pname });
      if (level > max) {
        max = level;
      }
      if (element[childrenTxt] && element[childrenTxt].length) {
        node[(node.length - 1)]['haschildren'] = true;
        node.push.apply(node, getNode(element[childrenTxt], other[idTxt], level + 1, other[pnameTxt]));
      }
    }
    if (node.length === 0) {
      return [];
    }
    else {
      return node;
    }
  }
  let result = getNode(data, 0, 0, '');
  result.maxLevel = max;
  return result;
};
utils.transformKey = function (_data, key, names) {
  let data = JSON.parse(JSON.stringify(_data));
  let dataOpt = {};
  utils.each(data, (elem, k) => {
    let temp = {};
    utils.each(names, (text) => {
      temp[text] = elem[text];
    });
    let exist = dataOpt[elem[key].toString()];
    if (exist) {
      if (({}).toString.call(exist).indexOf('Object') > -1) {
        dataOpt[elem[key].toString()] = [exist, temp];
      }
      else if (({}).toString.call(exist).indexOf('Array') > -1) {
        dataOpt[elem[key].toString()] = exist.push(temp);
      }
    }
    else {
      dataOpt[elem[key].toString()] = temp;
    }
  });
  return dataOpt;
};
//获取子节点的所有的父节点
utils.getParentsFromNode = function (data, pid, idTxt, pidTxt) {
  idTxt = idTxt || 'id';
  pidTxt = pidTxt || 'pid';
  function getParents(arr, parentId) {
    var node = [];
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      if (element[idTxt] == parentId) {
        node.push(parentId);
        if (typeof element[pidTxt] !== 'undefined') {
          node.push.apply(node, getParents(arr, element[pidTxt]));
        }
      }
    }
    return node;
  }
  return getParents(data, pid);
};

// utils.setTimeout = function (func,times) {
// //上一次数组
// let lastArgs = [];
// let lastThis;
// let calledOnce = false;
//     return function () {
//         let _len = arguments.length;
//         let newArgs = new Array(_len);
//         let _key = 0;
//         for (_len; _key < _len; _key++) {
//             newArgs[_key] = arguments[_key];
//         }
//         // eslint-disable-next-line block-scoped-var
//         //如果没有新的参数进来，则执行函数；
//         setTimeout(()=>{
//             //判断两个条件是否相同，以及当前的作用于是否存在；
//             if (calledOnce && lastThis === this && eq(lastArgs,newArgs) && 1) {
//                 func.apply(this,lastArgs);
//             }
//         },times);
//         lastArgs = newArgs;
//         lastThis = this;
//         calledOnce = true;
//     };
// };
utils.getBoundingClientRect = function (selector) {
  let domRect;
  if (typeof selector !== 'string') {
    domRect = selector;
  }
  else {
    domRect = document.querySelector(selector).getBoundingClientRect();
  }
  if (window.isEdge) {
    return {
      top: domRect.top * zoomGrowNumber,
      left: domRect.left * zoomGrowNumber,
      width: domRect.width * zoomGrowNumber,
      height: domRect.height * zoomGrowNumber
    };
  }
  else {
    return domRect;
  }
};

utils.size = function (value) {
  return value * zoomShrinkNumber;
};

utils.getInitLanguage = function () {
  let defaultLanguage = 'en';
  let provideLanguage = new Set(['en', 'zh']);
  let initlanguage = defaultLanguage;
  let localLanauage = localStorage.getItem('language');
  let naviLanguage = navigator.language;
  if (localLanauage && provideLanguage.has(localLanauage)) {
    initlanguage = localLanauage;
  }
  else if (naviLanguage && naviLanguage.indexOf('zh') > -1) {
    initlanguage = 'zh';
  }
  return initlanguage;
};

function handlePlaceholder(string, data, id?) {
  const resultData = data ?? []
  const originString = id || string
  originString.replace(/{.[^\{\}]*}/g, (value, key) => {
    resultData.push(value.substr(1, value.length - 2))
    return 0
  })
  return string.replace(/{.[^\{\}]*}/g, (value, key) => resultData[value.substr(1, value.length - 2)]);
}

utils.intl = function (id, ...arg) {
  if (id === undefined || id === null) return id
  let title = gdata('languageMessages')[id];
  const newTitle = id ? gdata('languageMessages')[id.replace(/{.[^\{\}]*}/g, '{$}')] : undefined
  if (title !== undefined) {
    return handlePlaceholder(title, arg);
  }
  else if (newTitle) {
    return handlePlaceholder(newTitle, arg, id)
  } else {
    id = handlePlaceholder(id, arg)
  }
  if (id.indexOf('.') != -1) {
    id = id.split('.')[1]
  }
  return id
}


utils.getDay = getDay;
utils.getToday = getToday;
utils.getTodayAddOne = getTodayAddOne;
utils.getNameByValue = getNameByValue;
utils.getQueryString = getQueryString;
utils.getMonth = getMonth;
utils.getNowTime = getNowTime;
utils.getSuffix = getSuffix;
utils.getPreMonth = getPreMonth;
// utils.eq = eq;

export default utils;


