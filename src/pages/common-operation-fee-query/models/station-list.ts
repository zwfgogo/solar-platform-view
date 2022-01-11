import { makeModel } from "../../umi.helper"
import { fee_query_station_list, globalNS } from "../../constants"
import { fetchStationList } from '../fee-query.service'
import { ExportColumn } from "../../../interfaces/CommonInterface"
import { exportFile } from "../../../util/fileUtil"
import { renderTitle } from "../../page.helper"
import utils from "../../../public/js/utils"

export class FeeQueryStationListState {
  query = {
    page: 1,
    size: 20,
    queryStr: ''
  }
  list = []
  totalCount = 0
}

export default makeModel(fee_query_station_list, new FeeQueryStationListState(), (updateState, updateQuery, getState) => {
  return {
    * fetchStationList(action, {put, call, select}) {
      const {query} = yield getState(select)
      const {userId, firmId} = yield select(state => state[globalNS])
      const {results, totalCount} = yield call(fetchStationList, {
        userId, firmId, ...query
      })
      yield updateState(put, {list: results, totalCount})
    },
    * onExport(action, {call, put, select}) {
      const {query} = yield getState(select)
      const {userId, firmId} = yield select(state => state[globalNS])
      const {results} = yield call(fetchStationList, {
        userId, firmId, queryStr: query.queryStr
      })
      exportFile(columns, results)
    }
  }
})

const columns: ExportColumn[] = [
  {title: utils.intl('序号'), width: 60, dataIndex: 'num'},
  {title: utils.intl('电站名称'), width: 250, dataIndex: 'title'},
  {title: utils.intl('电站类型'), width: 120, dataIndex: 'stationType', renderE: renderTitle},
  {title: utils.intl('建设规模'), width: 120, dataIndex: 'scaleDisplay'},
  {title: utils.intl('运行天数'), width: 120, dataIndex: 'runDays'},
  {title: utils.intl('累计收益(元)'), width: 150, dataIndex: 'profitAmount'},
  {title: utils.intl('平均日收益(元/日)'), dataIndex: 'profitDay', width: 180},
  {title: utils.intl('单位容量日均收益(元/MWh·日)'), dataIndex: 'profitDayScale', width: 250}
]
