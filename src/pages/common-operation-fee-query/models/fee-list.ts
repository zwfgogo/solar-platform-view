import { makeModel } from "../../umi.helper"
import { fee_query_fee_list, globalNS } from "../../constants"
import { fetchFeeList, fetchStationList } from '../fee-query.service'
import { exportFile } from "../../../util/fileUtil"
import { ExportColumn } from "../../../interfaces/CommonInterface"
import { renderTitle } from "../../page.helper"
import utils from "../../../public/js/utils"


export class FeeQueryListState {
  query = {
    page: 1,
    size: 20
  }
  list = []
  totalCount = 0
}

export default makeModel(fee_query_fee_list, new FeeQueryListState(), (updateState, updateQuery, getState) => {
  return {
    * fetchFeeList(action, {put, call, select}) {
      const {query} = yield getState(select)
      const {stationId} = action.payload
      const {results, totalCount} = yield call(fetchFeeList, {
        stationId, ...query
      })
      yield updateState(put, {list: results, totalCount})
    },
    * onExport(action, {call, put, select}) {
      const {stationId} = action.payload
      const {query} = yield getState(select)
      const {results, totalCount} = yield call(fetchFeeList, {stationId})
      exportFile(columns, results)
    }
  }
})

const columns: ExportColumn[] = [
  {title: utils.intl('序号'), width: 60, dataIndex: 'num'},
  {title: utils.intl('账单名称'), width: 220, dataIndex: 'billName'},
  {title: utils.intl('结算起始时间'), dataIndex: 'startTime'},
  {title: utils.intl('结算结束时间'), dataIndex: 'endTime'},
  {title: utils.intl('累计充电电量(kWh)'), dataIndex: 'totalCharge'},
  {title: utils.intl('充电电费(元)'), dataIndex: 'chargeCost'},
  {title: utils.intl('累计放电电量(kWh)'), dataIndex: 'totalDischarge', width: 180},
  {title: utils.intl('放电电费(元)'), dataIndex: 'dischargeCost', width: 120},
  {title: utils.intl('总收益(元)'), dataIndex: 'totalIncome', width: 120}
]
