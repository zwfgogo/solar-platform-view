// 时间处理模块
const timeHandler = {
  /**
   * 得到某天的查询时间字符串
   *
   * @param {String} certianDay 某天  例: 2018-01-01
   */
  getSelectStrByDay: function (certianDay) {
    let startTime = certianDay + ' 00:00:00';
    let endTime = certianDay + ' 23:59:59';
    return startTime + ',' + endTime;
  },

  /**
   * 得到格式化后的时间对象
   *
   */
  getFormatTimeObj: function () {
    const date = new Date();
    const dateObj = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds()
    };
    return timeHandler.dateFormat(dateObj);
  },

  /**
   * 日期格式数据填充0
   *
   * @param {Object} obj 时间对象
   */
  dateFormat: function (obj) {
    for (let key in obj) {
      if (obj[key] < 10) {
        obj[key] = '0' + obj[key];
      }
    }
    return obj;
  },

  /**
   * 在基础时间上增加或减少一个时间间隔(以天为单位)
   *
   * @param {String} baseTime 例: 2018-01-01
   * @param {Number} timeInterval 例: 往前推3天,-3;往后推3天,3
   *
   */
  getDateAfterCalculate: function (baseTime, timeInterval) {
    let fullDate = baseTime.split('-');
    let date = new Date(fullDate[0], fullDate[1] - 1, fullDate[2], 0, 0, 0);
    // 得到那一天的日期
    date.setDate(date.getDate() + timeInterval);
    let year = date.getFullYear();
    let month = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
    let day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
    return (year + '-' + month + '-' + day);
  },

  /**
   * 得到某月的日期列表
   *
   * @param {String} certainMonth 某月 例: 2018-01
   *
   */
  getCertainMonthDays: function (certainMonth) {
    const dateArr = certainMonth.split('-');
    const startYear = parseInt(dateArr[0]);
    let startMonth = parseInt(dateArr[1]);
    // const date = new Date();
    // const currentYear = date.getFullYear();
    // const currentMonth = date.getMonth() + 1;
    // const currentDay = date.getDate();
    let monthDays = new Date(startYear, startMonth, 0).getDate();
    // 若是查询当月的数据，则到当日为止
    // if (startYear === parseInt(currentYear) && startMonth === parseInt(currentMonth)) {
    //     monthDays = new Date(startYear, startMonth - 1, currentDay).getDate();
    // }
    if (startMonth < 10) {
      startMonth = '0' + startMonth;
    }
    const countDay = monthDays;
    let days = [];
    for (let i = 1; i <= countDay; i++) {
      if (i < 10) {
        i = '0' + i;
      }
      days[days.length] = startYear + '-' + startMonth + '-' + i;
    }
    return days;
  },

  /**
   * 得到两个日期之间的日期
   *
   * @param {String} startDate 开始时间 例: 2018-01-01
   * @param {String} endDate 结束时间 例: 2018-02-01
   *
   */
  getDaysByArgs: function (startDate, endDate) {
    const startArr = startDate.split('-');
    const endArr = endDate.split('-');
    const startYear = parseInt(startArr[0]);
    const startMonth = parseInt(startArr[1]);
    const startDay = parseInt(startArr[2]);
    const endYear = parseInt(endArr[0]);
    const endMonth = parseInt(endArr[1]);
    const endDay = parseInt(endArr[2]);
    const oneDayMilliseconds = 1000 * 60 * 60 * 24;
    const _startDate = new Date(startYear, startMonth - 1, startDay);
    const _endDate = new Date(endYear, endMonth - 1, endDay);
    const dayInterval = (_endDate - _startDate) / oneDayMilliseconds;
    let _days = [];
    let _year = startYear;
    let _month = startMonth;
    let _incremental = startDay;
    for (let j = 0; j <= dayInterval; j++) {
      let temp = [_year, _month].join('-');
      let currentMonthLength = timeHandler.getCertainMonthDays(temp).length;
      let _day = _incremental;
      // 当增量超过当月长度时,月份增加,天数减去当月天数,增量重置
      if (_incremental > currentMonthLength) {
        _month = parseInt(_month) + 1;
        _day = _incremental - currentMonthLength;
        _incremental = _day;
      }
      if (_day < 10) {
        _day = '0' + _day
      }
      if (_month < 10) {
        _month = '0' + parseInt(_month)
      };
      if (_month > 12) {
        _month = parseInt(_month) - 12;
        if (_month < 10) {
          _month = '0' + parseInt(_month)
        };
        _year++;
      }
      _days[_days.length] = [_year, _month, _day].join('-');
      _incremental++;
    }
    return _days;
  },

  /**
   * 比较时间的大小
   *
   * @param {String} time1 例: 2018-01-01 00:00:00
   * @param {String} time2 两种类型 一种是分钟级别 一种是秒级别
   */
  compareTime: function (time1, time2, timeType = 'minute') {
    let dayInterval = parseInt(timeHandler.getDaysByArgs(time1.substr(0, 10), time2.substr(0, 10)).length) - 1;
    let hour = time1.substr(11, 2);
    let hour2 = time2.substr(11, 2);
    let minute = time1.substr(14, 2);
    let minute2 = time2.substr(14, 2);
    let second = time1.substr(17, 2);
    let second2 = time2.substr(17, 2);
    let time1ToMinute;
    let time2ToMinute;
    let results;
    if (timeType === 'minute') {
      time1ToMinute = parseInt(hour * 60 + parseInt(minute));
      time2ToMinute = parseInt(hour2 * 60 + parseInt(minute2));
      results = parseInt(dayInterval) * 24 * 60 + time2ToMinute - time1ToMinute;

    } else {
      time1ToMinute = parseInt(hour * 60 * 60 + parseInt(minute) * 60 + parseInt(second));
      time2ToMinute = parseInt(hour2 * 60 * 60 + parseInt(minute2) * 60 + parseInt(second2));
      results = parseInt(dayInterval) * 24 * 60 * 60 + time2ToMinute - time1ToMinute;
    }
    if (results < 0) {
      // 如果小于0则加上一天的秒数
      results += 24 * 60 * 60;
    }
    return results;
  },

  /**
   * 将输入的时间变为整点时间(0,15,30,45)
   */
  timeToMoment: function (time) {
    let hour = parseInt(time.substr(0, 2));
    let minute = parseInt(time.substr(3, 2));
    if (minute > 0 && minute < 7.5) {
      minute = 0
    }
    if (minute > 7.5 && minute < 15) {
      minute = 15
    }
    if (minute > 15 && minute < 22.5) {
      minute = 15
    }
    if (minute > 22.5 && minute < 30) {
      minute = 30
    }
    if (minute > 30 && minute < 37.5) {
      minute = 30
    }
    if (minute > 37.5 && minute < 45) {
      minute = 45
    }
    if (minute > 45 && minute < 52.5) {
      minute = 45
    }
    if (minute > 52.5 && minute < 60) {
      minute = 0;
      hour++;
    }
    if (hour === 0) {
      hour = '00';
    }
    if (minute === 0) {
      minute = '00';
    }
    return {
      hour: hour,
      minute: minute
    };
  },


  /**
   * 验证时间格式
   *
   * @param {String} time 待验证的时间字符串 例: 2018-01-01 00:00:00
   *
   */
  checkTimeFormat: function (time) {
    let check = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
    let flag = true;
    if (time.search(check) !== 0) {
      flag = false;
    }
    return flag;
  },

  /**
   * 匹配时间格式，返回年月日时分秒的对象
   *
   * @param {String} time 时间字符串 例: 2018-01-01 00:00:00
   */
  regTime: function (time) {
    let reg = /^(\d+)-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
    let regResults = time.match(reg);
    let timeObj = {};
    timeObj.year = regResults[1];
    timeObj.month = regResults[2];
    timeObj.day = regResults[3];
    timeObj.hour = regResults[4];
    timeObj.minute = regResults[5];
    timeObj.second = regResults[6];
    return timeObj;
  },

  /**
   * 分钟转小时
   *
   * @param {Number} hour 时
   * @param {Number} minute 分
   * @param {Number} second 秒
   *
   */
  minuteToHour: function (hour, minute, second) {
    while (minute > 60) {
      hour++;
      minute -= 60;
    }
    if (hour < 10) {
      hour = '0' + hour;
    }
    if (minute < 10) {
      minute = '0' + minute;
    }
    if (second < 10) {
      second = '0' + second;
    }
    return hour + ':' + minute + ':' + second;
  },

  /**
   * 毫秒转时分秒的显示
   *
   * @param {String} msd 毫秒值字符串
   *
   */
  msToDate: function (msd) {
    let time = parseFloat(msd) / 1000;
    if (time) {
      if (time > 60 && time < 60 * 60) {
        let item = time / 60.0;
        let hour = parseInt(item);
        let second = parseInt((parseFloat(item) - hour) * 60);
        time = `0时${hour}分${second}秒`;
      } else if (time >= 60 * 60 && time < 60 * 60 * 24) {
        let item = time / 3600.0;
        let hour = parseInt(time / 3600.0);
        let minute = parseInt((parseFloat(item) - hour) * 60);
        let second = parseInt((parseFloat((parseFloat(item) - hour) * 60) - minute) * 60);
        time = `${hour}小时${minute}分${second}秒`;
      } else if (time >= 60 * 60 * 24 && time < 60 * 60 * 24 * 30) {
        let item = time / (86400.0);
        let day = parseInt(item);
        let hour = parseInt((parseFloat(item) - day) * 24);
        let minute = parseInt(((parseFloat((parseFloat(item) - day) * 24) - hour)).toFixed(2) * 60);
        time = `${day}天${hour}时${minute}分`;
      } else {
        time = `0时0分${parseInt(time)}秒`;
      }
    } else {
      time = `0时0分0秒`;
    }
    return time;
  },

  /**
   * 增加时间间隔
   *
   * @param {String} baseTime 基础时间
   * @param {Number} timeInterval 时间间隔
   *
   */
  getAddTimeIntervalTime: function (baseTime, timeInterval) {
    let date = new Date();
    let nowTime = '';

    // 如果baseTime为空则取当前值
    baseTime !== '' ? nowTime = baseTime : nowTime = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    let nowHour = parseInt(nowTime.substr(0, 2));
    let nowMinute = parseInt(nowTime.substr(3, 2));
    let nowSecond = parseInt(nowTime.substr(6, 2));
    let time = {
      BeforeTime: '',
      HappenTime: '',
      AfterTime: ''
    }

    // 将分钟表示的时间间隔转成小时+时间的格式
    let singleHourInterval = 0;
    let singleMinuteInterval = timeInterval;
    while (singleMinuteInterval > 60) {
      singleHourInterval++;
      singleMinuteInterval = singleMinuteInterval - 60;
    }

    // 一个时间间隔
    let faultBeforeHour = nowHour + singleHourInterval;
    let faultBeforeMinute = nowMinute + singleMinuteInterval;
    if (faultBeforeMinute >= 60) {
      faultBeforeMinute -= 60;
      faultBeforeHour++;
    }
    if (faultBeforeMinute < 0) {
      faultBeforeMinute += 60;
      faultBeforeHour--;
    }
    if (faultBeforeHour < 0) {
      faultBeforeHour += 24;
    }

    // 两个时间间隔
    let faultHappenHour = nowHour + singleHourInterval * 2;
    let faultHappenMinute = nowMinute + singleMinuteInterval * 2;
    if (faultHappenMinute >= 60) {
      faultHappenMinute -= 60;
      faultHappenHour++;
    }
    if (faultHappenMinute < 0) {
      faultHappenMinute += 60;
      faultHappenHour--;
    }
    if (faultHappenHour < 0) {
      faultHappenHour += 24;
    }

    // 三个时间间隔
    let faultAfterHour = nowHour + singleHourInterval * 3;
    let faultAfterMinute = nowMinute + singleMinuteInterval * 3;
    if (faultAfterMinute >= 60) {
      faultAfterMinute -= 60;
      faultAfterHour++;
    }
    if (faultAfterMinute < 0) {
      faultAfterMinute += 60;
      faultAfterHour--;
    }
    if (faultAfterHour < 0) {
      faultAfterHour += 24;
    }

    time.BeforeTime = timeHandler.minuteToHour(faultBeforeHour, faultBeforeMinute, nowSecond);
    if (time.BeforeTime === '24:00:00') {
      time.BeforeTime = '00:00:00';
    }
    time.HappenTime = timeHandler.minuteToHour(faultHappenHour, faultHappenMinute, nowSecond);
    if (time.HappenTime === '24:00:00') {
      time.HappenTime = '00:00:00';
    }
    time.AfterTime = timeHandler.minuteToHour(faultAfterHour, faultAfterMinute, nowSecond);
    if (time.AfterTime === '24:00:00') {
      time.AfterTime = '00:00:00';
    }
    return time;
  },

  getWeekDay: function (day) {
    let weekDay = '';
    let _day = new Date().getDay();
    if (day) {
      let myDay = new Date(day);
      myDay = myDay.getDay();
      _day = myDay;
    }
    switch (_day) {
      case 0:
        weekDay = '星期日';
        break;
      case 1:
        weekDay = '星期一';
        break;
      case 2:
        weekDay = '星期二';
        break;
      case 3:
        weekDay = '星期三';
        break;
      case 4:
        weekDay = '星期四';
        break;
      case 5:
        weekDay = '星期五';
        break;
      case 6:
        weekDay = '星期六';
        break;
    }
    return weekDay;
  }
};

module.exports = timeHandler;