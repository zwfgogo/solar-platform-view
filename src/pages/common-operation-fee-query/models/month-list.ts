import { makeModel } from "../../umi.helper"
import { fee_query_month_list } from "../../constants"
import { fetchMonthList } from '../fee-query.service'
import { list_fee_columns } from '../month/ListFeeMonthDay'
import { exportFile } from "../../../util/fileUtil"

export class MonthListState {
  query = {
    dtime: ''
  }
  list = []
}

export default makeModel(fee_query_month_list, new MonthListState(), (updateState, updateQuery, getState) => {
  return {
    * fetchList(action, {put, call, select}) {
      const {stationId} = action.payload
      const {query} = yield getState(select)
      const results = yield call(fetchMonthList, {stationId, dtime: query.dtime})
      yield updateState(put, {list: results})
    },
    * onExport(action, {call, put, select}) {
      const {list} = yield getState(select)
      exportFile(list_fee_columns, list)
    }
  }
})
