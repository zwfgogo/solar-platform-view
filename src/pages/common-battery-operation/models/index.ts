import services from '../services'
import { message } from 'wanke-gui'
import { globalNS, battery_operation, battery_cabin } from '../../constants'
import { makeModel } from '../../umi.helper'
import { GlobalState } from '../../../models/global'
import utils from '../../../public/js/utils'
import { history } from 'umi'
import { formatChartData, sortChartData } from '../../page.helper'
import moment from 'moment'

const electricChartSeries = [
  { name: utils.intl('平均满充电量'), unit: 'kWh' },
  { name: utils.intl('平均满放电量'), unit: 'kWh' },
];

export class BatteryOperationModel {
  electricChart = {
    xData: [],
    yData: [],
    series: [],
    records: [],
  }
  recordList = []
  operationPlan = {}
  capacityChart = {
    xData: [],
    yData: [],
    series: [],
  }
  batteryChart = {
    xData: [],
    yData: [],
    series: [],
  }
}

export default makeModel(battery_operation, new BatteryOperationModel(), (updateState, updateQuery, getState) => {
  return {
    *fetchElectricChart(action, { put, call, select }) {
      const { results } = yield call(
        services.getElectricChart,
        action.payload
      );
      let electricChart = sortChartData(formatChartData(
        {},
        formatDate(results, ['AvgFullCharge', 'AvgFullDischarge'], 'YYYY-MM-DD'),
        ['AvgFullCharge', 'AvgFullDischarge']
      ))
      if(!electricChart.series) electricChart.series = electricChartSeries
      electricChart.records = results.records
        .map(key => electricChart.xData.indexOf(moment(key).format('YYYY-MM-DD')))
        .filter(item => item > -1)
      yield put({ type: "updateToView", payload: { electricChart } })
    },
    *fetchRecordList(action, { put, call, select }) {
      const { results = [] } = yield call(
        services.getRecordList,
        action.payload
      );
      const recordList = results.map((item, index) => ({ ...item, num: index + 1 }))
      yield put({ type: "updateToView", payload: { recordList } })
    },
    *fetchOperationPlan(action, { put, call, select }) {
      const { results = {} } = yield call(
        services.getOperationPlan,
        action.payload
      );
      yield put({ type: "updateToView", payload: { operationPlan: results } })
    },
    *fetchCapacityOperationCalculate(action, { put, call, select }) {
      const results = yield call(
        services.getOperationCalculate,
        action.payload
      );

      const payload: any = {}
      payload.capacityChart = formatOperationCalculate(results || [])

      yield put({ type: "updateToView", payload })
    },
    *fetchBatteryOperationCalculate(action, { put, call, select }) {
      const results = yield call(
        services.getOperationCalculate,
        action.payload
      );

      const payload: any = {}
      payload.batteryChart = formatOperationCalculate(results || [])

      yield put({ type: "updateToView", payload })
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

function formatOperationCalculate(list) {
  const xData = []
  const yData = [[], []]
  const series = [{
    name: '提升电量',
    unit: 'kWh'
  }, {
    name: '提升收益',
    unit: utils.intl('元')
  }]
  list.forEach(item => {
    xData.push(item.val.toString())
    yData[0].push(formatValue(item.electricity))
    yData[1].push(formatValue(item.profit))
  })

  return { xData, yData, series }
}

function formatValue(value) {
  return value ? Number(value.toFixed(2)).toString() : value
}
