import { makeModel } from "../../umi.helper"
import { day_report_detail } from "../../constants"
import { operationReportDetail, operationReportChartsDetail } from '../../../services/operation-manage.service'
import { exportFile } from "../../../util/fileUtil"
import { ExportColumn } from "../../../interfaces/CommonInterface"
import utils from "../../../public/js/utils"

function formatChartData(data: any) {
  const {results = [], legend = [], unit = []} = data
  const yData = results.map(row =>
    row.map(item => {
      const value = Number(item.val)
      return isNaN(value) ? 0 : value
    })
  )
  const xData = (results[0] || []).map(item => item.dtime)
  const series = legend.map((item, index) => ({
    name: utils.intl(item),
    unit: unit[index] || '',
    type: index > 1 ? 'bar' : 'line'
  }))


  return {
    xData,
    yData,
    series
  }
}

export class DayReportDetailState {
  query = {
    startDate: null,
    endDate: null
  }
  list = []
  isExpanded = true
  chartInfo = {}
}

export default makeModel(day_report_detail, new DayReportDetailState(), (updateState, updateQuery, getState) => {
  return {
    * fetchList(action, {put, call, select}) {
      const {query} = yield getState(select)
      const results = yield call(operationReportDetail, {stationId: action.payload.stationId, ...query})
      yield updateState(put, {list: results})
    },
    * fetchCharts(action, {put, call, select}) {
      const {query} = yield getState(select)
      const results = yield call(operationReportChartsDetail, {
        stationId: action.payload.stationId,
        ...query
      })
      yield updateState(put, {chartInfo: formatChartData(results || {})})
    },
    * onExport(action, {call, put, select}) {
      const {query} = yield getState(select)
      const results = yield call(operationReportDetail, {stationId: action.payload.stationId, ...query})
      exportFile(columns, results)
    }
  }
})

const columns: ExportColumn[] = [
  {title: utils.intl('序号'), dataIndex: 'num'},
  {title: utils.intl('日期'), dataIndex: 'date'},
  {title: `${utils.intl('目标值')}/${utils.intl('充电电量')}(kWh)`, dataIndex: 'chargeTarget'},
  {title: `${utils.intl('实际值')}/${utils.intl('充电电量')}(kWh)`, dataIndex: 'chargeReal'},
  {title: `${utils.intl('偏差')}/${utils.intl('充电电量')}(kWh)`, dataIndex: 'chargeDeviation'},
  {title: `${utils.intl('目标值')}/${utils.intl('放电电量')}(kWh)`, dataIndex: 'dischargeTarget'},
  {title: `${utils.intl('实际值')}/${utils.intl('放电电量')}(kWh)`, dataIndex: 'dischargeReal'},
  {title: `${utils.intl('偏差')}/${utils.intl('放电电量')}(kWh)`, dataIndex: 'dischargeDeviation'},
  {title: `${utils.intl('目标值')}/${utils.intl('收益')}${utils.intl('(元)')}`, dataIndex: 'incomeTarget'},
  {title: `${utils.intl('实际值')}/${utils.intl('收益')}${utils.intl('(元)')}`, dataIndex: 'incomeReal'},
  {title: `${utils.intl('偏差')}/${utils.intl('收益')}${utils.intl('(元)')}`, dataIndex: 'incomeDeviation'},
  {title: utils.intl('收益偏差阈值(%)'), dataIndex: 'profitDeviationThreshold'},
  {
    title: utils.intl('偏差合理性'), dataIndex: 'rationality', renderE(value) {
      return value ? utils.intl('合理') : utils.intl('不合理')
    }
  }
]
