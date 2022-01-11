import { getAction, makeModel } from "../../umi.helper"
import { day_report_diff, globalNS } from "../../constants"
import {
  addReason,
  deleteReason,
  deleteReasonConfig,
  fetchReasonList,
  reasonList,
  saveReasonConfig,
  updateReason, updateReasonConfig
} from '../../../services/operation-manage.service'
import { message } from 'wanke-gui'
import moment, { Moment } from 'moment'
import { exportFile } from "../../../util/fileUtil"
import { ExportColumn } from "../../../interfaces/CommonInterface"
import { getDate, getDateStr } from "../../../util/dateUtil"
import utils from "../../../public/js/utils"

export class DiffState {
  query = {
    startDate: moment().subtract(1, 'days').format('YYYY-MM-DD'),
    endDate: moment().subtract(1, 'days').format('YYYY-MM-DD')
  }
  reasonList = []

  showReason = false
  showConfigReason = false
  reasonConfigList = []
  editId = null
  editTitle = ''

  reasonId = null
  dtime: Moment = null
  dutyDept = null
  dutyUserTitle = null
  causeTitle = null
  planCompleteTime: Moment = null
  detail = null
  solution = null
}

export default makeModel(day_report_diff, new DiffState(), (updateState, updateQuery, getState) => {
  return {
    * fetchReasonConfigList(action, {put, call, select}) {
      const {firmId} = yield select(state => state[globalNS])
      const {query} = yield getState(select)
      const {results} = yield call(reasonList, {firmId})
      yield updateState(put, {reasonConfigList: results})
    },
    * saveReasonConfig(action, {put, call, select}) {
      let {id} = action.payload
      const {firmId} = yield select(state => state[globalNS])
      const {editTitle, editId} = yield getState(select)
      if (editId != -1) {
        yield call(updateReasonConfig, {id: editId, reasonTitle: editTitle})
        message.success(utils.intl('更新成功'))
      } else {
        yield call(saveReasonConfig, {firmId, reasonTitle: editTitle})
        message.success(utils.intl('新增成功'))
      }
      yield updateState(put, {editId: null, editTitle: ''})
      yield put(getAction(null, 'fetchReasonConfigList'))
    },
    * deleteReasonConfig(action, {put, call, select}) {
      let {id} = action.payload
      yield call(deleteReasonConfig, {id})
      message.success(utils.intl('删除成功'))
      yield put(getAction(null, 'fetchReasonConfigList'))
    },

    * fetchReasonList(action, {put, call, select}) {
      const {query} = yield getState(select)
      const results = yield call(fetchReasonList, {stationId: action.payload.stationId, ...query})
      yield updateState(put, {reasonList: results})
    },
    * addReason(action, {call, select, put}) {
      const {stationId} = action.payload
      const {dtime, dutyDept, dutyUserTitle, causeTitle, planCompleteTime, detail, solution} = yield getState(select)
      yield call(addReason, {
        dtime: getDateStr(dtime, 'YYYY-MM-DD 00:00:00'),
        dutyDept,
        dutyUserTitle,
        causeTitle,
        planCompleteTime: getDateStr(planCompleteTime, 'YYYY-MM-DD 00:00:00'),
        detail,
        solution,
        stationId
      })
      message.success(utils.intl('添加成功'))
      yield updateState(put, {showReason: false})
      yield put(getAction(null, 'fetchReasonList', {stationId}))
    },
    * deleteReason(action, {call, put}) {
      const {id, stationId} = action.payload
      yield call(deleteReason, {id})
      message.success(utils.intl('删除成功'))
      yield put(getAction(null, 'fetchReasonList', {stationId}))
    },
    * updateReason(action, {call, put, select}) {
      const {stationId} = action.payload
      const {reasonId, dtime, dutyDept, dutyUserTitle, causeTitle, planCompleteTime, detail, solution} = yield getState(select)
      yield call(updateReason, {
        id: reasonId,
        dtime: getDateStr(dtime, 'YYYY-MM-DD 00:00:00'),
        dutyDept,
        dutyUserTitle,
        causeTitle,
        planCompleteTime: getDateStr(planCompleteTime, 'YYYY-MM-DD 00:00:00'),
        detail,
        solution,
        stationId
      })
      message.success(utils.intl('更新成功'))
      yield updateState(put, {showReason: false})
      yield put(getAction(null, 'fetchReasonList', {stationId}))
    },
    * onExport(action, {call, put, select}) {
      const {reasonList} = yield getState(select)
      let exportData = []
      for (let item of reasonList) {
        if (item.differentRecord?.length > 0) {
          item.differentRecord[0].date = item.date
          exportData.push(...item.differentRecord)
        } else {
          exportData.push({date: item.date})
        }
      }
      exportFile(columns, exportData)
    }
  }
})

const columns: ExportColumn[] = [
  {title: utils.intl('日期'), dataIndex: 'date'},
  {title: utils.intl('序号'), dataIndex: 'num'},
  {title: utils.intl('原因标题'), dataIndex: 'causeTitle'},
  {title: utils.intl('详情'), dataIndex: 'detail'},
  {title: utils.intl('解决方案'), dataIndex: 'solution'},
  {title: utils.intl('计划完成时间'), dataIndex: 'planCompleteTime', renderE: text => text?.split(' ')[0]},
  {title: utils.intl('责任部门'), dataIndex: 'dutyDept'},
  {title: utils.intl('责任人'), dataIndex: 'dutyUserTitle'}
]
