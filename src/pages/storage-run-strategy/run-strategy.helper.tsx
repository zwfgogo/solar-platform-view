import React from 'react'
import moment, { Moment } from 'moment'
import { exportCSV, exportExcel } from '../../util/fileUtil'
import { copy } from '../../util/utils'

import utils from '../../public/js/utils'

function findTitle(options, value) {
  return options.find(o => o && o.id == value)?.title || null
}

export function downloadCommandFile(controlTypeOptions, endControlOptions, list, type) {
  let columns = [
    {
      title: utils.intl('储能指令'), dataIndex: ['controlCommand', 'title'], width: 200
    },
    {
      title: utils.intl('执行时段'), width: 200, renderE: (_, record) => {
        return `${record.startTime}-${record.endTime}`
      }
    },
    {
      title: utils.intl('运行控制参数'), dataIndex: ['controlMode', 'id'], width: 200, renderE: (value, record) => {
        let controlName = controlTypeOptions.find(item => item.id == value)?.name
        let result, unit
        if (controlName == 'Power') {
          result = record.activePower
          unit = 'kW'
          return findTitle(controlTypeOptions, value) + (result ? '=' : '') + result + unit
        }
        if (controlName == 'Current/Voltage') {
          return `充电电流限值=${record.chargeCurrentLimit}C/AH` + `充电电压=${record.chargeVoltage}V/cell`
        }
        return null
      }
    },
    {
      title: utils.intl('阶段结束控制参数'), dataIndex: ['endControlParam', 'id'], width: 200, renderE: (value, record) => {
        let endControlName = endControlOptions.find(item => item.id == value)?.name
        let result, unit
        if (endControlName == 'SOC') {
          result = record.soc
          unit = '%'
          return findTitle(endControlOptions, value) + (result ? '=' : '') + result + unit
        }
        return utils.intl('无')
      }
    }
  ]
  if (type == 'csv') {
    exportCSV(columns, list, '')
  } else {
    exportExcel(columns, list)
  }
}

let monthDayMap = {
  1: 31,
  2: 29,
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 30,
  12: 31,
}

export function getCurveData(costPrice, generatePrice, commandList, dateRanges): any[] {
  if (!commandList || (!costPrice && !generatePrice)) {
    return []
  }

  function separateMonthDay(startMonthDay, endMonthDay) {
    let monthRange = [moment(startMonthDay, 'MM-DD').month() + 1, moment(endMonthDay, 'MM-DD').month() + 1]
    if (startMonthDay === '02-29') {
      monthRange[0] = 2
    }
    if (endMonthDay === '02-29') {
      monthRange[1] = 2
    }
    let costMonthRange = costPrice?.electricityPriceDetails?.map(item => {
      return item.months
    }) || []
    
    let priceMonthRange = generatePrice?.electricityPriceDetails?.map(item => {
      return item.months
    }) || []

    let start = monthRange[0]
    let end = monthRange[1]
    let cIndex = 0
    let pIndex = 0
    let cNextIndex = -1
    let pNextIndex = -1
    let result = []

    for (let i = start; i <= end; i++) {
      cNextIndex = costMonthRange.findIndex(item => item && item.indexOf(i) != -1)
      pNextIndex = priceMonthRange.findIndex(item => item && item.indexOf(i) != -1)
      if (i === start || (cNextIndex === cIndex && pNextIndex === pIndex)) {
        cIndex = cNextIndex
        pIndex = pNextIndex
        continue
      } else {
        if (start === monthRange[0]) {
          result.push([startMonthDay, `0${i - 1}-${monthDayMap[i - 1]}`, i - 1])
        } else {
          result.push([`0${start}-01`, `0${i - 1}-${monthDayMap[i - 1]}`, i - 1])
        }
        cIndex = cNextIndex
        pIndex = pNextIndex
        start = i
      }
    }
    result.push([start === monthRange[0] ? startMonthDay : `0${start}-01`, endMonthDay, monthRange[1]])

    return result
  }

  function findPrice(type, currentMonth, minutes) {
    let monthInfo
    if (type == 'Discharge') {
      if (!generatePrice.electricityPriceDetails) {
        return null
      }
      let monthIndex = generatePrice.electricityPriceDetails.findIndex(item => item.months && item.months.indexOf(currentMonth) != -1)
      monthInfo = generatePrice.electricityPriceDetails[monthIndex]?.priceDetails
    } else if (type == 'Charge') {
      if (!costPrice.electricityPriceDetails) {
        return null
      }
      let monthIndex = costPrice.electricityPriceDetails.findIndex(item => item.months && item.months.indexOf(currentMonth) != -1)
      monthInfo = costPrice.electricityPriceDetails[monthIndex]?.priceDetails
    } else {
      return null
    }
    if (!monthInfo) {
      return null
    }
    let priceTimeList = monthInfo.map(item => {
      return { timeRange: item.timeRange, price: item.price }
    })
    let match = priceTimeList.find(item => {
      return item.timeRange.find(range => {
        let parts = range.split('-')
        let sTime = parts[0]
        let eTime = parts[1] == '00:00:00' ? '23:59:00' : parts[1]
        let start = moment(sTime, 'HH:mm:ss').hour() * 60 + moment(sTime, 'HH:mm:ss').minute()
        let end = moment(eTime, 'HH:mm:ss').hour() * 60 + moment(eTime, 'HH:mm:ss').minute()
        if (minutes >= start && minutes < end) {
          return true
        }
      }) != undefined
    })
    if (match) {
      return match.price
    }
    // if (generatePrice.electricityPriceDetails[monthIndex].type != 'RealTime') {
    //   console.log(`未找到对应的：${minutes}`)
    // }
    return null
  }

  let results = []
  dateRanges.forEach(range => {
    let monthDayList = separateMonthDay(range[0], range[1])

    let rangeList = monthDayList.map(item => {
      let chartDataX = []
      let chartDataY = []
      for (let i = 0; i < 1440; i++) {
        let matchCommand = commandList.find(command => {
          let sTime = command.startTime
          let eTime = command.endTime == '00:00' ? '23:59' : command.endTime
          let start = moment(sTime, 'HH:mm').hour() * 60 + moment(sTime, 'HH:mm').minute()
          let end = moment(eTime, 'HH:mm').hour() * 60 + moment(eTime, 'HH:mm').minute()
          if (i >= start && i < end) {
            return true
          }
        })
        chartDataX.push(`2020-01-01 ${Math.floor(i / 60).toString().padStart(2, '0')}:${(i % 60).toString().padStart(2, '0')}:00`)
        if (matchCommand) {
          chartDataY.push(findPrice(matchCommand.controlCommand.name, item[2], i))
        } else {
          chartDataY.push(null)
        }
      }
      fillPrice(chartDataY)
      return {
        date: item,
        xData: chartDataX,
        yData: chartDataY
      }
    })
    results = results.concat(rangeList)
  })
  return results
}

// 获取15分钟功率曲线
export function getActivePowerData(dateStr, commandList) {
  let data = []

  for (let i = 0; i < 1440; i+=15) {
    let matchCommand = commandList?.find(command => {
      let sTime = command.startTime
      let eTime = command.endTime == '00:00' ? '23:59' : command.endTime
      let start = moment(sTime, 'HH:mm').hour() * 60 + moment(sTime, 'HH:mm').minute()
      let end = moment(eTime, 'HH:mm').hour() * 60 + moment(eTime, 'HH:mm').minute()
      if (i >= start && i < end) {
        return true
      }
    })
    const item = {
      dtime: `${dateStr} ${Math.floor(i / 60).toString().padStart(2, '0')}:${(i % 60).toString().padStart(2, '0')}:00`,
      val: null
    }
    if (matchCommand?.controlCommand?.name === 'Discharge') {
      item.val = matchCommand.activePower
    } else if(matchCommand?.controlCommand?.name === 'Charge') {
      item.val = -matchCommand.activePower
    } else if (commandList) {
      item.val = 0
    }
    data.push(item)
  }
  return data
}

export function getActivePowerChartData(startTime: Moment, endTime: Moment, runStrategiesArgumentList: any[] = [] ) {
  let data = []
  const start = moment(startTime)
  const addChartInfo = (chartInfo) => {
    data = data.concat(chartInfo)
  }
  while (endTime.isAfter(start)) {
    const dateStr = start.format('MM-DD')
    const Argument = runStrategiesArgumentList.find(item => {
      return item.applicableDate?.some(range => {
        const flag = range[0] <= dateStr && dateStr <= range[1]
        return flag
      })
    })
    const commandList = Argument?.commandList
    const chartInfo = getActivePowerData(start.format('YYYY-MM-DD'), commandList)
    addChartInfo(chartInfo)
    start.add(1, 'days')
  }

  return data
}

function fillPrice(list) {
  for (let i = 0; i < list.length; i++) {
    if (list[i] == null) {
      list[i] = list[i == 0 ? list.length - 1 : i - 1]
    }
  }
  for (let i = 0; i < list.length; i++) {
    if (list[i] == null) {
      list[i] = list[i == 0 ? list.length - 1 : i - 1]
    }
  }
}

export function getSocData(commandList, power: number, soh): any {
  if (commandList.length == 0) {
    return {
      xData: [],
      yData: []
    }
  }
  commandList = copy(commandList)
  if (commandList[0].startTime != '00:00') {
    commandList.unshift({
      startTime: '00:00',
      endTime: getHourMinuteStr(getMinutes(commandList[0].startTime) - 1)
    })
  }
  if (commandList[commandList.length - 1].endTime != '00:00') {
    commandList.push({
      startTime: getHourMinuteStr(getMinutes(commandList[commandList.length - 1].endTime) + 1),
      endTime: '00:00'
    })
  }

  commandList.sort((a, b) => {
    return a.startTime > b.startTime ? 1 : -1
  })

  let timeList = []
  commandList.forEach(command => {
    timeList.push([getMinutes(command.startTime), getMinutes(command.endTime)])
  })

  let results = []

  let startZeroCommand = commandList[0]

  let endZeroCommand = commandList[commandList.length - 1]

  let firstCommandIndex = null
  if (startZeroCommand.controlCommand?.name == endZeroCommand.controlCommand?.name) {
    firstCommandIndex = commandList.length - 1
  }
  if (!firstCommandIndex) {
    firstCommandIndex = 0
  }
  let beforeIndex = firstCommandIndex == 0 ? commandList.length - 1 : firstCommandIndex - 1
  let startTime, startSoc
  if (commandList[beforeIndex].soc != null) {
    startTime = commandList[beforeIndex].endTime
    startSoc = commandList[beforeIndex].soc / 100
  }
  if (!startTime) {
    while (beforeIndex >= 0) {
      let commandType = commandList[beforeIndex].controlCommand?.name
      if (commandList[beforeIndex].soc) {
        startTime = commandList[beforeIndex].endTime
        startSoc = commandList[beforeIndex].soc / 100
        break
      } else if (commandType == 'Charge') {
        startTime = commandList[beforeIndex].endTime
        startSoc = 0.99
        break
      }
      beforeIndex--
    }
  }

  let startMinutes = getMinutes(startTime)
  let currentSoc = startSoc
  results.push({
    x: startMinutes,
    soc: currentSoc
  })
  for (let i = 1; i < 1440; i++) {
    let currentMinute = (startMinutes + i) % 1440
    let matchIndex = timeList.findIndex(range => currentMinute >= range[0] && currentMinute < range[1])
    let command
    if (matchIndex != -1) {
      command = commandList[matchIndex]
    }
    if (command && command.controlMode?.name === 'Current/Voltage') {
      results.push({
        x: currentMinute,
        soc: null
      })
    } else if (command && command.activePower) {
      if (command.controlCommand?.name == 'Charge') {
        currentSoc += (command.activePower / 60) / (power * soh)
        if (command.soc && currentSoc > command.soc / 100) {
          currentSoc = command.soc / 100
        }
      } else if (command.controlCommand?.name == 'Discharge') {
        currentSoc += (-command.activePower / 60) / (power * soh)
        if (command.soc && currentSoc < command.soc / 100) {
          currentSoc = command.soc / 100
        }
      }
      if (currentSoc > 0.99) {
        currentSoc = 0.99
      }
      if (currentSoc < 0.01) {
        currentSoc = 0.01
      }
      results.push({
        x: currentMinute,
        soc: currentSoc
      })
    } else {
      results.push({
        x: currentMinute,
        soc: currentSoc
      })
    }
  }
  let chartData = { xData: [], yData: [] }
  results.sort((a, b) => {
    return a.x > b.x ? 1 : -1
  }).forEach(item => {
    chartData.xData.push(`2020-01-01 ${Math.floor(item.x / 60).toString().padStart(2, '0')}:${(item.x % 60).toString().padStart(2, '0')}:00`)
    chartData.yData.push(item.soc != null ? (item.soc * 100).toFixed(2) : null)
  })
  return chartData
}

function getMinutes(timeStr: string) {
  let time = moment(timeStr, 'HH:mm')
  return time.hour() * 60 + time.minute()
}

function getHourMinuteStr(v: number) {
  return (Math.floor(v / 60)).toString().padStart(2, '0') + ':' + (v % 60).toString().padStart(2, '0')
}

export function check24Hours(commandList) {
  let minutes = []

  for (let command of commandList) {
    let d = moment(command.startTime, 'HH:mm')
    let d1 = moment(command.endTime, 'HH:mm')
    let start1 = d.hours() * 60 + d.minutes()
    let end1 = d1.hours() * 60 + d1.minutes()
    if (end1 == 0) {
      end1 = 1441
    }
    for (let i = start1; i < end1; i++) {
      if (minutes.indexOf(i) == -1) {
        minutes.push(i)
      } else {
        return `执行时段存在交集，无法进行下发`
      }
    }
  }
}

export function isInRange(dateList, monthDay) {
  for (let item of dateList) {
    if (item[0] && item[1]) {
      if (item[0] <= monthDay && item[1] >= monthDay) {
        return true
      }
    }
  }
  return false
}

export function getLossDay(dateList) {
  let yearMonthDay = [
    [1, 31], [2, 29], [3, 31], [4, 30], [5, 31], [6, 30], [7, 31], [8, 31], [9, 30], [10, 31], [11, 30], [12, 31]
  ]
  let lossCount = 0
  for (let monthDay of yearMonthDay) {
    let [month, dayTotal] = monthDay
    for (let i = 1; i <= dayTotal; i++) {
      let str = month.toString().padStart(2, '0') + '-' + i.toString().padStart(2, '0')
      if (!isInRange(dateList, moment('2000-' + str).format('MM-DD'))) {
        lossCount++
      }
    }
  }
  return lossCount
}

export function getArgumentListLossDay(argumentList) {
  let dates = []
  for (let argument of argumentList) {
    dates = dates.concat(argument.applicableDate)
  }
  return getLossDay(dates)
}
