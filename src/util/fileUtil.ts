import XLSX from 'xlsx'
import utils from '../public/js/utils'

let alphabet = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  'AA',
  'AB',
  'AC',
  'AD'
]

export function doExport(columns, dataSource, fileName?, type?) {
  if (!columns || !dataSource) {
    console.warn('无数据')
    return
  }
  let headers = columns.map(item => item.title)
  let data = dataSource.map((item, index) => {
    let rowData: Record<string, any> = {}
    headers.forEach(title => {
      let column = columns.find(column => column.title == title)
      if (column) {
        let value = item
        if (column.dataIndex instanceof Array) {
          value = column.dataIndex.reduce((result, current) => {
            if (!result) {
              return null
            }
            return result[current]
          }, item)
        } else if (column.dataIndex) {
          value = item[column.dataIndex]
        }
        if (column.renderE) {
          rowData[title] = column.renderE(value, item, index)
        } else {
          rowData[title] = value
        }
      }
    })
    return rowData
  })
  let sheet
  sheet = XLSX.utils.json_to_sheet(data, {header: headers})
  if (type == 'csv') {
    openDownloadDialog(sheet2blob(sheet, 'sheet1', headers, 'csv'), `${fileName || utils.intl('导出')}.csv`)
  } else {
    openDownloadDialog(sheet2blob(sheet, 'sheet1', headers, 'xlsx'), `${fileName || utils.intl('导出')}.xlsx`)

  }
}

export function exportCSV(columns, dataSource, fileName?) {
  doExport(columns, dataSource, fileName, 'csv')
}

export function exportExcel(columns, dataSource, fileName?) {
  doExport(columns, dataSource, fileName, 'xlsx')
}

export function exportFile(columns, dataSource, filter?, extraOption: any = {}) {
  extraOption.fileType = extraOption.fileType || 'csv'
  let maxDeep = 1
  let noDown = new Set(
    filter
      ? ['操作', '默认菜单', '电站权限', '功能菜单', '设备属性', '采集参数', ...filter]
      : ['操作', '默认菜单', '电站权限', '功能菜单', '设备属性', '采集参数']
  )

  function tableTitle(o) {
    let titleArr = []
    for (let value of o) {
      if (typeof value.title === 'object') {
        if (!noDown.has(value.title.props.id)) {
          titleArr.push(value.title.props.id)
        }
      } else {
        if (!noDown.has(value.title)) {
          titleArr.push(value.title)
        }
      }
    }
    return titleArr
  }

  function treeDeep(children) {
    for (let i = 0; i < children.length; i++) {
      if (children[i].children) {
        treeDeep(children[i].children)
        maxDeep++
      }
    }
  }

  function changeName(dataSource, columns) {
    let newData = []
    const changeNameChild = (dataSource, columns) => {
      dataSource.forEach(v => {
        let i = {}
        let keys = Object.keys(v)
        keys.forEach(h => {
          columns.forEach(m => {
            if (h == m.dataIndex && !noDown.has(m.title)) {
              if (typeof m.title === 'object') {
                i[m.title.props.id] = v[h]
              } else {
                if (m.renderE) {
                  i[m.title] = m.renderE(v[h], v)
                } else {
                  i[m.title] = v[h]
                }
              }
            } else if (h + '.title' === m.dataIndex && !noDown.has(m.title)) {
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


  if (columns && dataSource) {
    let header = tableTitle(columns)
    // 暂时只处理2层的表头
    const tableColumns = columns => {
      let arr = []
      for (const iterator of columns) {
        if (!noDown.has(iterator.title)) {
          arr.push(iterator)
        }
      }
      return arr
    }
    const newColumns = tableColumns(columns)
    let tableHeader = JSON.parse(JSON.stringify(newColumns))
    let data

    data = JSON.parse(JSON.stringify(dataSource))
    treeDeep(data)
    data = changeName(data, newColumns)
    //空出标题等行
    if (maxDeep > 1) {
      data.unshift({})
    }
    let sheet
    sheet = XLSX.utils.json_to_sheet(data, {header: [...header]})
    let oneRow = 0 //行占高
    for (let i = 0; i < tableHeader.length; i++) {
      if (tableHeader[i].children) {
        //判断有无嵌套列
        if (i >= 1) {
          //判断嵌套列是否在第一列,如果第一列就是嵌套列，则不用加上嵌套长度
          if (tableHeader[i - 1].children) {
            //如果嵌套列前一列不是嵌套列，则此嵌套列是第一个嵌套列，嵌套中就无需加上嵌套长度
            oneRow += tableHeader[i - 1].children.length
          }
        }
        sheet[alphabet[oneRow] + '1'] = {t: 's', v: tableHeader[i].title}
        sheet['!merges'][sheet['!merges'].length] = {
          s: {
            //s为开始
            c: sheet['!merges'][sheet['!merges'].length - 1].e.c + 1, //开始列
            r: 0 //开始取值范围
          },
          e: {
            //e结束
            c: sheet['!merges'][sheet['!merges'].length - 1].e.c + tableHeader[i].children.length, //结束列
            r: 0 //结束范围
          }
        }
        //嵌套列生成
        let k = oneRow //统计嵌套列的长度
        for (let j = 0; j < tableHeader[i].children.length; j++) {
          sheet[alphabet[k] + '2'] = {t: 's', v: tableHeader[i].children[j].title}
          k++
        }
      } else {
        //无嵌套列的处理
        if (i === 0) {
          sheet['!merges'] = [
            {
              s: {
                //s为开始
                c: 0, //开始列
                r: 0 //开始取值范围
              },
              e: {
                //e结束
                c: 0, //结束列
                r: maxDeep === 1 ? 0 : 1 //结束范围
              }
            }
          ]
        } else {
          if (tableHeader[i - 1].children) {
            oneRow += tableHeader[i - 1].children.length
          }
          sheet['!merges'][sheet['!merges'].length] = {
            s: {
              //s为开始
              c: sheet['!merges'][sheet['!merges'].length - 1].e.c + 1, //开始列
              r: 0 //开始取值范围
            },
            e: {
              //e结束
              c: sheet['!merges'][sheet['!merges'].length - 1].e.c + 1, //结束列
              r: maxDeep === 1 ? 0 : 1 //结束范围
            }
          }
        }
        sheet[alphabet[oneRow] + '1'] = {t: 's', v: tableHeader[i].title}
        oneRow++
      }
    }
    openDownloadDialog(sheet2blob(
      sheet,
      'sheet1',
      header,
      extraOption.fileType),
      `${extraOption.filename || utils.intl('导出')}.${extraOption.fileType}`
    )
  }
}

function sheet2blob(sheet, sheetName, tableHeard, fileType) {
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
    bookType: fileType, // 要生成的文件类型
    bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
    type: 'binary'
  }
  // ts-ignore
  var wbout = XLSX.write(workbook, wopts as any)
  var blob = new Blob([s2ab(wbout)], {type: 'application/octet-stream'})

  // 字符串转ArrayBuffer
  function s2ab(s) {
    var buf = new ArrayBuffer(s.length)
    var view = new Uint8Array(buf)
    for (var i = 0; i != s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xff
    }
    return buf
  }

  return blob
}

//导出 excel方法
function openDownloadDialog(url, saveName) {
  if (typeof url == 'object' && url instanceof Blob) {
    url = URL.createObjectURL(url) // 创建blob地址
  }
  var aLink = document.createElement('a')
  aLink.href = url
  aLink.download = saveName || '' // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
  var event
  if ((window as any).MouseEvent) {
    event = new MouseEvent('click')
  } else {
    event = document.createEvent('MouseEvents')
    event.initMouseEvent(
      'click',
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null
    )
  }
  aLink.dispatchEvent(event)
}