import { makeModel } from '../../umi.helper'
import { optimize_running_list } from '../../constants'
import { fetchStationList } from '../optimize.service'

export class OptimizeRunningModel {
  list = []
  totalCount = 0
  query = {
    page: 1,
    size: 20,
    queryStr: '',
    queryFields: 'title,operatorTitle,stationTypeTitle',
    userId: sessionStorage.getItem('user-id')
  }
}

export default makeModel(optimize_running_list, new OptimizeRunningModel(), (updateState, updateQuery, getState) => {
  return {
    * fetchList(action, { call, put, select }) {
      const { query } = yield getState(select)
      const { results, totalCount } = yield call(fetchStationList, query)
      yield updateState(put, { list: results, totalCount })
    }
  }
})
