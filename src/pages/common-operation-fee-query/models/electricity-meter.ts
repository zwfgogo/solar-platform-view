import { makeModel } from "../../umi.helper"
import { fee_electricity_meter } from "../../constants"
import { fetchMeterList } from '../fee-query.service'

export class ElectricityMeterState {
  query = {
    dtime: ''
  }
  header = []
  list = []
}

export default makeModel(fee_electricity_meter, new ElectricityMeterState(), (updateState, updateQuery, getState) => {
  return {
    * fetchMeterList(action, {put, call, select}) {
      const {stationId} = action.payload
      const {query} = yield getState(select)
      const {results, header} = yield call(fetchMeterList, {stationId, dtime: query.dtime})
      yield updateState(put, {header, list: results})
    }
  }
})
