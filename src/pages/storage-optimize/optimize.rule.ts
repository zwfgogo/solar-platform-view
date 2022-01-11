import {AutoMonthItemType, ManualMonthItemType, TimeItem, UnitType} from './models/update'
import {isAuto, isType1} from './optimize.helper'
import moment from 'moment'

import utils from '../../public/js/utils'

export const checkUnitRule = (modeList, typeList) => (rule, value: UnitType, callback) => {

  let monthItems: (AutoMonthItemType | ManualMonthItemType)[] = []
  if (isAuto(value.mode, modeList)) {
    monthItems = value.autoItems
  } else {
    monthItems = value.manualItems
  }

  let months = monthItems.reduce((result, item) => {
    return result.concat(item.months)
  }, [])
  if (months.length > 12) {
    return callback('当前策略适用月份重复')
  }
  for (let i = 1; i <= 12; i++) {
    if (months.indexOf(i) == -1) {
      return callback(`当前策略适用月份不完整，请补充`)
    }
  }

  for (let item of monthItems) {
    if (!isAuto(value.mode, modeList)) {
      let item1 = item as ManualMonthItemType
      let msg = check24HourRule(item1.chargeTimes, item1.dischargeTimes, item1.backupTimes)
      if (msg) {
        return callback(msg)
      }
    }
    if (isType1(item.chargeDischargeType, typeList)) {
      if (item.maxCharge == null) {
        return callback('请输入最大充电功率')
      }
      if (item.maxDisCharge == null) {
        return callback('请输入最大放电功率')
      }
      if (item.socMax == null) {
        return callback('请输入SOC上限')
      }
      if (item.socMin == null) {
        return callback('请输入SOC下限')
      }
      if (item.socMax < item.socMin) {
        return callback('SOC下限不能大于SOC上限')
      }
    } else {
      if (item.chargeV == null) {
        return callback('请输入充电电压')
      }
      if (item.dischargeA == null) {
        return callback('请输入放电电压')
      }
      if (item.chargeRateLimit == null) {
        return callback('请输入充电倍率限值')
      }
      if (item.dischargeEndVoltage == null) {
        return callback('请输入放电截止电压')
      }
    }
    if (item.backupMinutes == null) {
      return callback('请输入备电时长')
    }
    if (item.maxDischargeRate == null) {
      return callback('请输入最大放电功率允许占负荷比例')
    }

  }

  callback()
}

export const check24HourRule = (date1: TimeItem[], date2: TimeItem[], date3: TimeItem[]) => {
  let minutes = []

  function handle(date: TimeItem[], type: string): string {
    for (let timeInterval of date) {
      let {start, end} = timeInterval
      if (start == null) {
        return `${type}：请选择开始时段`
      }
      if (end == null) {
        return `${type}：请选择结束时段`
      }
      let d = moment(start, 'HH:mm')
      let d1 = moment(end, 'HH:mm')
      let start1 = d.hours() * 60 + d.minutes()
      let end1 = d1.hours() * 60 + d1.minutes()
      if (end1 == 0) {
        end1 = 1441
      }
      if (start1 >= end1) {
        return `${type}：开始时段大于结束时段`
      }
      for (let i = start1; i < end1; i++) {
        if (minutes.indexOf(i) == -1) {
          minutes.push(i)
        } else {
          return `${type}：时段重复`
        }
      }
    }
    return null
  }

  let msg = handle(date1, '充电时段')
  if (msg) return msg
  msg = handle(date2, '放电时段')
  if (msg) return msg
  msg = handle(date3, '蓄电时段')
  if (msg) return msg
  if (minutes.length != 1441) {
    return utils.intl('冲、放、蓄时段不满足24小时')
  }
  return null
}
