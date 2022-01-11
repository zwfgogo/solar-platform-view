import moment from "moment"
import utils from "../../public/js/utils"
import { battery_capacity_analysis } from "../constants"
import { formatChartData, sortChartData } from "../page.helper"
import { makeModel } from "../umi.helper"
import { changeUnit } from "../unit.helper"
import services from './service'

export class BatteryCapacityAnalysisModel {
  sohChart = {
    xData: [],
    yData: [],
    series: [],
  }
  profitChart = {
    xData: [],
    yData: [],
    series: [],
  }
  predictedProfit = ''
}
export default makeModel(battery_capacity_analysis, new BatteryCapacityAnalysisModel(), (updateState, updateQuery, getState) => {
  return {
    *fetchSOHChart(action, { put, call, select }) {
      const { results = {} } = yield call(
        services.getSOHChart,
        action.payload
      );

      const series = [
        { name: '实际SOH', unit: '%' },
        { name: '量测SOH', unit: '%' },
        { name: '理论SOH', unit: '%' }
      ]

      let sohChart = sortChartData(formatChartData(
        {},
        formatDate(results, ['RealSOH', 'SOH', 'TheorySOH'], 'YYYY-MM-DD'),
        ['RealSOH', 'SOH', 'TheorySOH']
      ))
      sohChart.series = series;

      yield put({ type: "updateToView", payload: { sohChart }})
    },
    *fetchProfitChart(action, { put, call, select }) {
      const { results = {} } = yield call(
        services.getProfitChart,
        action.payload
      );

      const series = [
        { name: '每月收益', unit: '元' },
        { name: '累计收益', unit: '元', isUnique: true, type: 'line' }
      ]

      let profitChart = sortChartData(formatChartData(
        {},
        formatDate(results, ['profitMonth', 'profitAmount'], 'YYYY-MM'),
        ['profitMonth', 'profitAmount']
      ))
      profitChart.series = series;

      const cur = moment().format('YYYY-MM')
      let amount = 0;
      let yData = profitChart.yData
      profitChart.xData.forEach((key, index) => {
        if (key >= cur) {
          amount += Number(yData[0]?.[index]?.value ?? 0)
        }
      })

      const amountObj = changeUnit({
        value: amount,
        unit: utils.intl('元')
      }, localStorage.getItem('language') as any)

      yield put({ type: "updateToView", payload: { profitChart, predictedProfit: `${amountObj.value.toFixed(2)}${amountObj.unit}` } })
    },
  }
})

function formatDate(data, attrList, formater) {
  const result = { ...data };
  attrList.forEach(key => {
    result[key] = result[key].map(item => ({
      ...item,
      dtime: item.dtime ? moment(item.dtime).format(formater) : item.dtime
    }))
  })
  return result
}

