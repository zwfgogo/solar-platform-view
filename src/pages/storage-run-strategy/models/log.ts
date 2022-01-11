import {makeModel} from '../../umi.helper'
import {Socket_Port, storage_run_strategy_log} from '../../constants'
import {
  fetchStationStrategyList, fetchStrategyLogList,
} from '../run-strategy.service'
import utils from '../../../public/js/utils'
import { exportCSV } from '../../../util/fileUtil'

export class RunStrategyLogModel {
  total: 0
  list: any[] = []
}

export default makeModel(storage_run_strategy_log, new RunStrategyLogModel(), (updateState, updateQuery, getState) => {
  return {
    * fetchLogList(action, {put, call}) {
      const { page, size } = action.payload
      let result = yield call(fetchStrategyLogList, action.payload)
      result.list.forEach((item, index) => {
        item.num = (page - 1) * size + index + 1
      })
      yield updateState(put, {
        total: result.totalCount,
        list: result.list
      })
    },
    * exportLogList(action, {put, call}) {
      let result = yield call(fetchStrategyLogList, action.payload)
      exportCSV(columns, result.list || [], '执行日志')
    },
  }
})

const columns: any = [
  {
    title: utils.intl('时间'),
    dataIndex: 'dtime',
  },
  {
    title: utils.intl('日志记录'),
    dataIndex: 'log',
    renderE: (text, record) => `【${record.controlMode}】${record.content}`
  }
]
