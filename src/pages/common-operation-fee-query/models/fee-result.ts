import { makeModel } from "../../umi.helper"
import { fee_query_fee_result } from "../../constants"
import { fetchFeeResult } from '../fee-query.service'

export class FeeQueryResultState {
  html = ''
}

export default makeModel(fee_query_fee_result, new FeeQueryResultState(), (updateState, updateQuery, getState) => {
  return {
    * fetchFeeResult(action, {put, call, select}) {
      const {recordId, stationId} = action.payload
      const data = yield call(fetchFeeResult, {
        format: 'html',
        reportName: 'report_electricity_bill',
        recordId,
        stationId
      })
      yield updateState(put, {html: data})
    }
  }
})
