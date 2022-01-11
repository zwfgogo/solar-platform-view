import timeHandler from '../time_handler'

const echartDataGenerator = (results, startDate, endDate, timeType = 'minute', timeInterval = 15, key = 'val', isMix = false, dateVisible = false, sign = false) => {
  try {
    const startFlag = timeHandler.checkTimeFormat(startDate)
    const endFlag = timeHandler.checkTimeFormat(endDate)
    if (!startFlag || !endFlag) {
      return null
    }
    const startTimeObj = timeHandler.regTime(startDate)
    const endTimeObj = timeHandler.regTime(endDate)
    let obj = {}
    let xData = []
    let yData = []
    let yDataIndex = {}
    let startYear = startTimeObj.year
    let startMonth = startTimeObj.month
    let startDay = startTimeObj.day
    let endYear = endTimeObj.year
    let endMonth = endTimeObj.month
    let endDay = endTimeObj.day

    if (sign) {
      for (let j = 0; j < results.length; j++) {
        let _key = sign.indexOf(results[j].dtime)
        yData[j] = [_key, results[j][key]]
      }
    } else {
      if (timeType === 'second') {
        try {
          let _startDate = `${startTimeObj.year}-${startTimeObj.month}-${startTimeObj.day}`
          let hour = `${startTimeObj.hour}`
          let minute = `${startTimeObj.minute}`
          let second = `${startTimeObj.second}`
          let minuteInterval = timeHandler.compareTime(startDate, endDate, timeType)
          let flag = 0
          for (let j = 0; j < results.length; j++) {
            let _key = results[j].dtime.substr(11, 8)
            if (dateVisible) {
              _key = results[j].dtime
            }
            yData[j] = [_key, results[j][key]]
            yDataIndex[_key] = ''
          }
          let j = 0
          while (flag <= minuteInterval) {
            // 测试了跨年，跨月，当天，多天的情况
            // 防止开始时间大于23时
            if (hour === 24) {
              hour -= 24
              _startDate = timeHandler.getDateAfterCalculate(_startDate, 1)
            }
            if (hour < 10 && hour !== '00') {
              hour = '0' + parseInt(hour)
            }
            if (minute < 10 && minute !== '00') {
              minute = '0' + parseInt(minute)
            }
            if (second < 10 && second !== '00') {
              second = '0' + parseInt(second)
            }
            let itemItem = `${hour}:${minute}:${second}`
            if (dateVisible) {
              itemItem = _startDate + ' ' + itemItem
            }
            xData[xData.length] = itemItem
            if (typeof yDataIndex[itemItem] !== 'undefined') {
              yDataIndex[itemItem] = j
            }
            hour = parseInt(hour)
            minute = parseInt(minute)
            second = parseInt(second)
            second += timeInterval
            flag += timeInterval
            if (second >= 60) {
              second -= 60
              minute++
            }
            if (minute >= 60) {
              minute -= 60
              hour++
            }
            if (hour === 0) {
              hour = '00'
            }
            if (minute === 0) {
              minute = '00'
            }
            j = j + 1
          }
        } catch (e) {
          console.log(e)
        }
      } else if (timeType === 'month') {
        let _startYear = parseInt(startYear)
        let _startMonth = parseInt(startMonth)
        let _endYear = parseInt(endYear)
        let _endMonth = parseInt(endMonth)

        let monthInterval = (_endYear - _startYear) * 12 + (_endMonth - _startMonth)
        for (let i = 0; i <= monthInterval; i++) {
          if (parseInt(_startMonth) > 12) {
            _startMonth -= 12
            _startYear++
          }
          if (_startMonth < 10) {
            _startMonth = '0' + _startMonth
          }
          xData[xData.length] = _startYear + '-' + _startMonth
          _startMonth++
        }

        for (let n = 0; n < results.length; n++) {
          obj[results[n].dtime.substr(0, 7)] = results[n][key]
        }
        for (let item of results) {
          yData[yData.length] = [item.dtime, item.val]
        }
      } else if (timeType === 'day') {
        let _startTime = [startYear, startMonth, startDay].join('-')
        let _endTime = [endYear, endMonth, endDay].join('-')
        xData = timeHandler.getDaysByArgs(_startTime, _endTime)
        for (let z = 0; z < xData.length; z++) {
          xData[z] = xData[z].substr(0, 10)
        }
        for (let k = 0; k < results.length; k++) {
          obj[results[k].dtime.substr(0, 10)] = results[k][key]
        }
        for (let item of results) {
          yData[yData.length] = [item.dtime, item.val]
        }
      } else if (timeType === 'minute') {
        try {
          let _startDate = `${startTimeObj.year}-${startTimeObj.month}-${startTimeObj.day}`
          let hour = timeHandler.timeToMoment(startTimeObj.hour + ':' + startTimeObj.minute).hour
          let minute = timeHandler.timeToMoment(startTimeObj.hour + ':' + startTimeObj.minute).minute
          let minuteInterval = timeHandler.compareTime(startDate, endDate)
          let flag = 0
          for (let j = 0; j < results.length; j++) {
            let _key = results[j].dtime.substr(11, 8)
            if (dateVisible) {
              _key = results[j].dtime
            }
            yData[j] = [_key, results[j][key]]
            yDataIndex[_key] = ''
          }
          let j = 0
          while (flag <= minuteInterval) {
            if (hour === 24) {
              hour -= 24
              _startDate = timeHandler.getDateAfterCalculate(_startDate, 1)
            }
            if (hour < 10 && hour !== '00') {
              hour = '0' + hour
            }
            if (minute < 10 && minute !== '00') {
              minute = '0' + minute
            }
            let itemItem = hour + ':' + minute + ':' + '00'
            if (dateVisible) {
              itemItem = _startDate + ' ' + itemItem
            }
            xData[xData.length] = itemItem
            if (typeof yDataIndex[itemItem] !== 'undefined') {
              yDataIndex[itemItem] = j
            }
            hour = parseInt(hour)
            minute = parseInt(minute)
            minute += timeInterval
            flag += timeInterval
            if (minute >= 60) {
              minute -= 60
              hour++
            }
            if (hour === 0) {
              hour = '00'
            }
            if (minute === 0) {
              minute = '00'
            }
            j = j + 1
          }

          for (let j = 0; j < results.length; j++) {
            let _key = results[j].dtime.substr(11, 8)
            if (dateVisible) {
              _key = results[j].dtime
            }
            yData[j] = [_key, results[j][key]]
          }

        } catch (e) {
          console.log(e)
        }

      }
    }
    return {
      xData: xData,
      yData: yData,
      yDataIndex
    }
  } catch (e) {
    console.log(e)
  }
}

export default echartDataGenerator
