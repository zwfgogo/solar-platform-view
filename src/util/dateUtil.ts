import * as d3 from 'd3'
import moment, {Moment, unitOfTime} from 'moment'
import {range0} from '../pages/page.helper'

const locale = d3.timeFormatLocale({
  dateTime: '%Y %m %d %H %M %S',
  date: '%Y %m %d',
  time: '%H %M %S',
  periods: ['上午', '下午'],
  days: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  shortDays: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  shortMonths: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
})

const formatTime = locale.format('%H:%M:%S')
const formatDateTime = locale.format('%Y-%m-%d %H:%M:%S')
export const formatMonthDay = locale.format('%m月%d日')
export const formatYearMonth = locale.format('%Y年%m月')

/**
 * 时区时间转换
 * @param {Array} dtime 日期时间
 * @param {String} from 所属时区
 * @param {String} to 转换时区
 */
export function transfromZoneTime(dtime: string, from: string = 'Asia/Shanghai', to: string = 'Australia/Queensland') {
  let temp: Moment = moment(dtime)
  if (from !== to) {
    temp = from === 'Asia/Shanghai' ? moment(dtime).add(2, 'hour').add(0, 'minute') :
      moment(dtime).add(-2, 'hour').add(0, 'minute')
  }
  return temp
}

export const dateFormat = (isSingleDay: boolean) => (date) => {
  if (!date) {
    return ''
  }
  if (isSingleDay) {
    return formatTime(date)
  }
  return formatDateTime(date)
}

export function getSystemTime(): Moment {
  return moment(sessionStorage.getItem('timeDate') || undefined)
}

export function getTargetSystemTime(timeZone: string = 'Asia/Shanghai'): Moment {
  return transfromZoneTime(
    getSystemTime().format('YYYY/MM/DD HH:mm:ss'),
    sessionStorage.getItem('timeZone') || undefined,
    timeZone || 'Asia/Shanghai'
  )
}

export function getDate(str, format?) {
  return str ? moment(str, format) : null
}

export function getDateStr(date, format = 'YYYY-MM-DD') {
  return date ? date.format(format) : null
}

function getUnitOfTime(type) {
  const typeList = [
    'year', 'years', 'y',
    'month', 'months', 'M',
    'week', 'weeks', 'w',
    'day', 'days', 'd',
    'hour', 'hours', 'h',
    'minute', 'minutes', 'm',
    'second', 'seconds', 's',
    'millisecond', 'milliseconds', 'ms'
  ]
  return typeList.indexOf(type) > -1 ? type : 'day'
}

export function disabledDateBeforeToday(current, type: unitOfTime.StartOf = 'day') {
  return current && current < getSystemTime().startOf(getUnitOfTime(type))
}

export function disabledDateBeforeTomorrow(current, type: unitOfTime.StartOf = 'day') {
  return current && current < getSystemTime().add(1, 'day').startOf(getUnitOfTime(type))
}

export function disabledDateAfterToday(current, type: unitOfTime.StartOf = 'day') {
  return current && current > getSystemTime().endOf(getUnitOfTime(type))
}
export function disabledDateAfterNow(current, type: unitOfTime.StartOf = 'day') {
  return current && current > getSystemTime()
}

export function disabledDateAfterYesterday(current, type: unitOfTime.StartOf = 'day') {
  return current && current > getSystemTime().subtract(1, 'day').endOf(getUnitOfTime(type))
}

export const disabledDateByRange = (range: number, type: 'month' | 'day', firstDay?: Moment) => (current) => {
  if (!firstDay) return false
  const prevTime = moment(firstDay).subtract(range, type).endOf('day')
  const nextTime = moment(firstDay).add(range, type).startOf('day')
  return current && !current.isBetween(prevTime, nextTime)
}

export function getTimeStr(date, format = 'HH:mm') {
  if (format == 'HH:mm') {
    return date ? date.format('HH:mm') + ':00' : null
  }
  return date ? date.format('HH:mm:ss') : null
}

/**
 * 不能选择大于今天的时间
 */
export function isBigThanToday(date) {
  return date.format('YYYY-MM-DD') > getSystemTime().format('YYYY-MM-DD')
}

/**
 * 不能选择大于今天的时间
 */
export function isSmallThanToday(date, timeZone?) {
  const today = timeZone ? getTargetSystemTime(timeZone) : getSystemTime()
  return date.format('YYYY-MM-DD') < today.format('YYYY-MM-DD')
}

export function isBigThan(date, date2) {
  if (typeof date2 == 'string') {
    date2 = moment(date2)
  }
  return date.format('YYYY-MM-DD') > date2.format('YYYY-MM-DD')
}

export function isBigThanYesterday(date: Moment) {
  return date.format('YYYY-MM-DD') > moment().subtract(1, 'day').format('YYYY-MM-DD')
}

export function disabledTime(date: Moment) {
  if (!date) {
    return {
      disabledHours: () => [],
      disabledMinutes: () => []
    }
  }
  let current = getTargetSystemTime()
  if (date.isSame(current, 'day')) {
    return {
      disabledHours: () => range0(current.hours()),
      disabledMinutes: (hour) => {
        if (hour == current.hours()) {
          return range0(current.minutes())
        }
        return []
      }
    }
  } else {
    return {
      disabledHours: () => [],
      disabledMinutes: () => []
    }
  }
}

export const disabledEndTime = (start: Moment) => (date: Moment) => {
  if (!date) {
    return {
      disabledHours: () => [],
      disabledMinutes: () => []
    }
  }
  let current = start || moment()
  if (date.isSame(current, 'day')) {
    return {
      disabledHours: () => range0(current.hours()),
      disabledMinutes: (hour) => {
        if (hour == current.hours()) {
          return range0(current.minutes())
        }
        return []
      }
    }
  } else {
    return {
      disabledHours: () => [],
      disabledMinutes: () => []
    }
  }
}

type LimitType = 'hour' | 'minute' | 'second'

export function getDisabledTimeFn(targetTime, noLimitTypeList: LimitType[] = []) {
  const disabledTime = (date: Moment) => {
    if (!date || !targetTime) {
      return {
        disabledHours: () => [],
        disabledMinutes: () => [],
        disabledSeconds: () => []
      }
    }
    let startTimeReal = moment(targetTime)
    if (date.isSame(startTimeReal, 'day')) {
      return {
        disabledHours: () => {
          if (noLimitTypeList.indexOf('hour') > -1) return []
          return range0(startTimeReal.hours())
        },
        disabledMinutes: (hour) => {
          if (noLimitTypeList.indexOf('minute') > -1) return []
          if (hour == startTimeReal.hours()) {
            return range0(startTimeReal.minutes())
          }
          return []
        },
        disabledSeconds: (hour, min) => {
          if (noLimitTypeList.indexOf('second') > -1) return []
          if (hour == startTimeReal.hours() && min == startTimeReal.minutes()) {
            return range0(startTimeReal.seconds())
          }
          return []
        },
      }
    } else {
      return {
        disabledHours: () => [],
        disabledMinutes: () => [],
        disabledSeconds: () => []
      }
    }
  }

  return disabledTime
}
