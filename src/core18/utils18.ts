import XLSX from 'xlsx'
import eq from './eq'

export function transformKey(_data, key, names) {
  let data = JSON.parse(JSON.stringify(_data))
  let dataOpt = {}
  each(data, (elem, k) => {
    let temp = {}
    each(names, (text) => {
      temp[text] = elem[text]
    })
    let exist = dataOpt[elem[key].toString()]
    if (exist) {
      if (({}).toString.call(exist).indexOf('Object') > -1) {
        dataOpt[elem[key].toString()] = [exist, temp]
      } else if (({}).toString.call(exist).indexOf('Array') > -1) {
        dataOpt[elem[key].toString()] = exist.push(temp)
      }
    } else {
      dataOpt[elem[key].toString()] = temp
    }
  })
  return dataOpt
}

export function each(arr, fn) {
  for (let i = 0; i < arr.length; i++) {
    fn(arr[i], i)
  }
}

export function intl(id) {
  return id
}

export function openDownloadDialog(url, saveName) {
  if (typeof url == 'object' && url instanceof Blob) {
    url = URL.createObjectURL(url)
  }
  let aLink = document.createElement('a')
  aLink.href = url
  aLink.download = saveName || ''
  let event

  event = document.createEvent('MouseEvents')
  event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  aLink.dispatchEvent(event)
}

export function sheet2blob(sheet, sheetName, tableHeard) {
  sheetName = sheetName || 'sheet1'
  var workbook = {
    SheetNames: [sheetName],
    Sheets: {}
  }
  workbook.Sheets[sheetName] = sheet
  workbook.Sheets[sheetName]['!cols'] = []
  for (let item of tableHeard) {
    workbook.Sheets[sheetName]['!cols'][workbook.Sheets[sheetName]['!cols'].length] = {
      wpx: 130
    }
  }
  // 生成excel的配置项
  var wopts = {
    bookType: 'xlsx', // 要生成的文件类型
    bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
    type: 'binary'
  }
  // @ts-ignore
  var wbout = XLSX.write(workbook, wopts)
  var blob = new Blob([s2ab(wbout)], {type: 'application/octet-stream'})

  // 字符串转ArrayBuffer
  function s2ab(s) {
    var buf = new ArrayBuffer(s.length)
    var view = new Uint8Array(buf)
    for (var i = 0; i != s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xFF
    }
    return buf
  }

  return blob
}

export function changeName(dataSource, columns) {
  let newData = []
  const changeNameChild = (dataSource, columns) => {
    dataSource.forEach(v => {
      let i = {}
      let keys = Object.keys(v)
      keys.forEach(h => {
        columns.forEach(m => {
          if (h == m.dataIndex) {
            if (typeof m.title === 'object') {
              i[m.title.props.id] = v[h]
            } else {
              i[m.title] = v[h]
            }
          } else if ((h + '.title') === m.dataIndex) {
            if (typeof m.title === 'object') {
              i[m.title.props.id] = v[h]['title']
            } else {
              i[m.title] = v[h]['title']
            }
          }
        })
      })
      newData.push(i)
      if (v.children) {
        changeNameChild(v.children, columns)
      }
    })
  }
  changeNameChild(dataSource, columns)
  return newData
}

export function tableTitle(o) {
  let titleArr = []
  for (let value of o) {
    if (typeof value.title === 'object') {
      if (value.title.props.id !== intl('操作')) {
        titleArr.push(value.title.props.id)
      }
    } else {
      if (value.title !== intl('操作')) {
        titleArr.push(value.title)
      }
    }
  }
  return titleArr
}

let b = []

export function loopReqChart(timerName, interval, reqFn) {
  b.push([reqFn, timerName])
  window.myTimer = window.myTimer ? window.myTimer : {}
  window.myTimer[timerName] = window.setInterval(() => {
    reqFn()
  }, interval)
}

export function delLoopReq(timerName) {
  if (window.myTimer) {
    window.clearInterval(window.myTimer[timerName])
  } else {
    //@ts-ignore
    window.clearInterval(window[timerName])
  }
}

export function getArrFromTree(params) {
  let {data, transformKey} = params
  let _transformKey = {
    id: 'id',
    pid: 'pid',
    children: 'children',
    pname: 'name',
    ...transformKey
  }
  let {id: idTxt, pid: pidTxt, children: childrenTxt, pname: pnameTxt} = _transformKey
  let max = 0

  function getNode(arr, pid, level, pname) {
    var node = []
    for (let i = 0; i < arr.length; i++) {
      const element = arr[i]
      let {children, ...other} = element
      node.push({...other, [pidTxt]: pid, level, pname})
      if (level > max) {
        max = level
      }
      if (element[childrenTxt] && element[childrenTxt].length) {
        node[(node.length - 1)]['haschildren'] = true
        node.push.apply(node, getNode(element[childrenTxt], other[idTxt], level + 1, other[pnameTxt]))
      }
    }
    if (node.length === 0) {
      return []
    } else {
      return node
    }
  }

  let result = getNode(data, 0, 0, '')
  return {
    list: result,
    max
  }
}

export function setTimeout(func, times): any {
  let lastArgs = []
  let lastThis
  let calledOnce = false
  return function() {
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

export function getParentsFromNode(data, pid, idTxt, pidTxt?) {
  idTxt = idTxt || 'id'
  pidTxt = pidTxt || 'pid'

  function getParents(arr, parentId) {
    var node = []
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index]
      if (element[idTxt] == parentId) {
        node.push(parentId)
        if (typeof element[pidTxt] !== 'undefined') {
          node.push.apply(node, getParents(arr, element[pidTxt]))
        }
      }
    }
    return node
  }

  return getParents(data, pid)
}
