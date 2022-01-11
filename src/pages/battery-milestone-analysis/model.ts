import moment from "moment"
import utils from "../../public/js/utils"
import { battery_milestone_analysis } from "../constants"
import { formatChartData, sortChartData } from "../page.helper"
import { makeModel } from "../umi.helper"
import { changeUnit } from "../unit.helper"
import services from './service'

export class BatteryMilestoneAnalysisModel {
  summaryTotal = ''
  summaryRange = ''
  summaryChart = {
    xData: [],
    yData: [],
    series: [],
  }
  tendencyChart = {
    xData: [],
    yData: [],
    series: [],
  }
}
export default makeModel(battery_milestone_analysis, new BatteryMilestoneAnalysisModel(), (updateState, updateQuery, getState) => {
  return {
    *fetchSummaryChart(action, { put, call, select }) {
      const { results = {} } = yield call(
        services.getSummaryChart,
        action.payload
      );

      let summaryChart = {
        xData: results.xData || [],
        yData: results.yData || [],
        series: (results.series || []).map((item, index) => ({
          name: utils.intl(item.name),
          unit: item.unit,
          type: index === 0 ? 'bar' : 'line'
        })),
      }
      
      const summaryTotalObj = changeUnit({
        value: results.total,
        unit: 'MWh'
      }, localStorage.getItem('language') as any)

      const summaryRangeObj = changeUnit({
        value: results.range,
        unit: 'MWh'
      }, localStorage.getItem('language') as any)

      yield put({ type: "updateToView", payload: {
        summaryChart,
        summaryTotal: `${summaryTotalObj.value?.toFixed(2)}${summaryTotalObj.unit}`,
        summaryRange: `${summaryRangeObj.value?.toFixed(2)}${summaryRangeObj.unit}`,
      } })
    },
    *fetchTendencyChart(action, { put, call, select }) {
      const { results = {} } = yield call(
        services.getTendencyChart,
        action.payload
      );

      const keys = Object.keys(results).sort()
      const series = keys.map((key, index) => ({
        name: key,
        unit: 'kWh'
      }))

      let tendencyChart = sortChartData(formatChartData(
        {},
        formatDate(results, keys, 'YYYY-MM-DD'),
        keys
      ))
      tendencyChart.series = series;

      yield put({ type: "updateToView", payload: { tendencyChart } })
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
