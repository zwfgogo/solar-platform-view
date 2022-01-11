import utils from '../../../../../public/js/utils'
import { message, Modal } from 'wanke-gui'
import services from '../services'

function beforeSaveForm(form) {
  return new Promise((resolve, reject) => {
    form.validateFields().then((values) => {
      resolve(values)
    }, () => {
      reject()
    })
  })
}

export default {
  * save(action, { call, put, select, take }) {
    // 头部数据

    // 季节电价
    const seasonData = []
    // 获取数据
    // 拼接数据 校验数据
    const { forms, id, editSeason } = yield select(state => state.priceEdit)
    const { base } = forms
    const headData = yield call(beforeSaveForm, base)
    // 地址
    const {
      area: { values }
    } = headData
    headData.country = { id: values[0] }
    if (values[1]) {
      headData.province = { id: values[1] }
    }
    if (values[2]) {
      headData.city = { id: values[2] }
    }
    if (values[3]) {
      headData.district = { id: values[3] }
    }
    // headData.provinceId = values[0]
    // headData.cityId = values[1]
    // headData.districtId = values[2]
    let flag = true
    let month = []
    let seasontitles = new Set()
    for (let season of editSeason) {
      let hour = []
      const seasondata = yield call(beforeSaveForm, (forms[season.id]))
      const title = seasondata.title
      if (seasontitles.has(title)) {
        let errorMsg = utils.intl(`季节电价名称重复`, `"${title}"`)
        Modal.error({
          title: utils.intl('提示'),
          content: errorMsg
        })
        flag = false
        break
      }
      seasontitles.add(title)
      month.push.apply(month, seasondata.runMonth)
      seasondata.runMonth = seasondata.runMonth.join(',')

      // 每个季节电价时间是否满足24小时
      seasondata.seasonPriceDetails = []
      // 电价费率有没有勾选
      if (!seasondata.priceRates.length) {
      } else {
        utils.each(seasondata.priceRates, k => {
          // 时段
          let temp = seasondata['seasonPriceDetails' + k]
          if (temp) {
            for (let item of temp) {
              let { startTime, endTime } = item
              // 时段不能重复
              // 都有填写
              // 开始不能大于结束时间

              if (endTime === '00:00') {
                endTime = '24:00'
              }
              // 逻辑应该走不到这里面 所以没国际化
              if (!startTime || !endTime) {
                utils.error('"' + title + '"' + utils.enumeration('priceType')[k].name + '的时段不能为空')
                flag = false
                break
              }
              if (!(startTime < endTime)) {
                utils.error('"' + title + '"' + utils.enumeration('priceType')[k].name + ` ${utils.intl('开始时间要小于结束时间')}（` + startTime + ' ' + endTime + '）')
                flag = false
                break
              }

              seasondata.seasonPriceDetails.push({ startTime, endTime, priceRateId: k, price: seasondata['price' + k] })
              hour.push([startTime, endTime])
            }
          }
          if (!flag) {
            return false
          }
        })
      }
      if (!flag) {
        return false
      }
      // 时间排序
      hour.sort((a, b) => {
        return a > b ? 1 : -1
      })

      if (hour[0][0] !== '00:00' || hour[hour.length - 1][1] !== '24:00') {
        let errorMsg = utils.intl('时段不满足24小时', `"${title}"`)
        utils.error(errorMsg)
        flag = false
        break
      }

      utils.each(hour, (item, k) => {
        if (hour[k + 1]) {
          if (hour[k + 1][0] > item[1]) {
            let errorMsg = utils.intl('之间有空档', `"${title}"`, `${item[1]} `, `${hour[k + 1][0]}`)
            utils.error(errorMsg)
            flag = false
            return false
          }
          if (hour[k + 1][0] < item[1]) {
            let errorMsg = utils.intl('之间时段重叠', `"${title}"`, `${hour[k + 1][0]} `, `${item[1]}`)
            utils.error(errorMsg)
            flag = false
            return false
          }
        }
      })
      // 季节名称不能重复

      if (!flag) {
        // 提示信息
        break
      }
      seasonData.push(seasondata)
    }
    // 不同季节电价月份总和月份是否满足12个月
    if (!flag) {
      return false
    }
    if (month.length < 12) {
      utils.error(utils.intl('适用月份不满足12个月'))
      return false
    }

    const saveData = {
      seasonPrices: seasonData,
      ...headData
    }
    let res = null
    // 保存数据
    if (!!id) {
      res = yield services.edit({ price: saveData, id })
    } else {
      res = yield services.add({ price: saveData })
    }
    if (res.errorCode === 0) {
      message.success(utils.intl('保存成功'))
      return true
    }
  }
}
