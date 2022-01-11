import { makeModel } from "../../umi.helper"
import { day_report_list, globalNS } from "../../constants"
import { operationReport } from '../../../services/operation-manage.service'
import moment from 'moment'
import { exportFile } from "../../../util/fileUtil"
import { ExportColumn } from "../../../interfaces/CommonInterface"
import { renderTitle } from "../../page.helper"

export class DayReportListState {
  query = {
    page: 1,
    size: 20,
    queryStr: '',
    startDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    endDate: moment().subtract(1, 'days').format('YYYY-MM-DD')
  }
  list = []
  totalCount = 0
}

export default makeModel(day_report_list, new DayReportListState(), (updateState, updateQuery, getState) => {
  return {
    * fetchList(action, {put, call, select}) {
      const {query} = yield getState(select)
      const {userId, firmId} = yield select(state => state[globalNS])
      const {results, totalCount} = yield call(operationReport, {userId, firmId, ...query})
      yield updateState(put, {list: results, totalCount})
    },
    * onExport(action, {call, put, select}) {
      const {query} = yield getState(select)
      const {userId, firmId} = yield select(state => state[globalNS])
      const {results, totalCount} = yield call(operationReport, {
        userId,
        firmId,
        queryStr: query.queryStr,
        startDate: query.startDate,
        endDate: query.endDate
      })
      exportFile(columns, results)
    }
  }
})

const columns: ExportColumn[] = [
  {title: '序号', dataIndex: 'num'},
  {title: '电站名称', dataIndex: 'title'},
  {
    title: '电站类型', dataIndex: 'stationType', renderE: renderTitle
  },
  {
    title: '建设规模',
    dataIndex: 'scaleDisplay',
  },
  {title: '目标值', dataIndex: 'incomeTarget'},
  {title: '实际值', dataIndex: 'incomeReal'},
  {title: '偏差(%)', dataIndex: 'incomeDeviation'},
  {
    title: '偏差合理性', dataIndex: 'deviation', renderE(value) {
      return value ? '合理' : '不合理'
    }
  }
]
