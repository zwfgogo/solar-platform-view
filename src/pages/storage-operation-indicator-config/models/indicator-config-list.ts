import { getAction, makeModel } from "../../umi.helper"
import { globalNS, indicator_config } from "../../constants"
import { addIndexConfig, deleteIndexConfig, indexConfig, updateIndexConfig, getStationsBySystem } from '../../../services/operation-manage.service'
import { enumsApi, fetchStationBase } from "../../../services/global2"
import { message } from 'wanke-gui'
import { getDateStr } from "../../../util/dateUtil"
import { exportFile } from "../../../util/fileUtil"
import { ExportColumn } from "../../../interfaces/CommonInterface"
import utils from "../../../public/js/utils"
import moment from "moment"

export class IndicatorConfigState {
  query = {
    page: 1,
    size: 20,
    queryStr: ''
  }
  totalCount = 0
  list = []
  showAdd = false
  showUpdate = false

  configId = null
  stationList = []
  stationId = null
  stationScale = null
  scaleDisplay = ''
  scaleUnit = ''
  dailyChargeTarget = null
  dailyDischargeTarget = null
  dailyProfitTarget = null
  profitDeviationThreshold = null
  effectTime = null
}

export default makeModel(indicator_config, new IndicatorConfigState(), (updateState, updateQuery, getState) => {
  return {
    * fetchList(action, { put, call, select }) {
      const { query } = yield getState(select)
      const { userId } = yield select(state => state[globalNS])
      const { results, totalCount } = yield call(indexConfig, { userId, ...query })
      yield updateState(put, { list: results, totalCount })
    },
    * onExport(action, { call, put, select }) {
      const { query } = yield getState(select)
      const { userId } = yield select(state => state[globalNS])
      const { results, totalCount } = yield call(indexConfig, {
        userId,
        queryStr: query.queryStr
      })
      exportFile(columns, results)
    },
    * fetchStationList(action, { put, call, select }) {
      const { userId } = yield select(state => state[globalNS])
      let data = yield call(getStationsBySystem, { userId })
      yield updateState(put, { stationList: data })
    },
    * onStationChange(action, { call, put }) {
      const { stationId } = action.payload
      yield updateState(put, { stationId, stationScale: null })
      let data = yield call(fetchStationBase, { id: stationId })
      yield updateState(put, { scaleDisplay: `${data.ratedPowerDisplay}/${data.scaleDisplay}`, stationScale: data.scale || 0, scaleUnit: data.scaleUnit })
    },
    * addIndexConfig(action, { put, call, select }) {
      const { firmId, username } = yield select(state => state[globalNS])
      const { stationId, stationScale, dailyChargeTarget, dailyDischargeTarget, dailyProfitTarget, profitDeviationThreshold, effectTime } = yield getState(select)
      yield call(addIndexConfig, {
        updateUserName: username,
        firmId,
        stationId,
        stationScale,
        dailyChargeTarget,
        dailyDischargeTarget,
        dailyProfitTarget,
        profitDeviationThreshold,
        effectTime: getDateStr(effectTime, 'YYYY-MM-DD 00:00:00')
      })
      message.success(utils.intl('????????????'))
      yield updateState(put, { showAdd: false })
      yield put(getAction(null, 'fetchList'))
    },
    * updateIndexConfig(action, { put, call, select }) {
      const { firmId, username } = yield select(state => state[globalNS])
      const { configId, stationId, stationScale, dailyChargeTarget, dailyDischargeTarget, dailyProfitTarget, profitDeviationThreshold, effectTime } = yield getState(select)
      yield call(updateIndexConfig, {
        updateUserName: username,
        id: configId,
        firmId,
        stationId,
        stationScale,
        dailyChargeTarget,
        dailyDischargeTarget,
        dailyProfitTarget,
        profitDeviationThreshold,
        effectTime: getDateStr(effectTime, 'YYYY-MM-DD 00:00:00')
      })
      message.success(utils.intl('????????????'))
      yield updateState(put, { showAdd: false })
      yield put(getAction(null, 'fetchList'))
    },
    * deleteIndexConfig(action, { put, call }) {
      let { id } = action.payload
      yield call(deleteIndexConfig, { id })
      message.success(utils.intl('????????????'))
      yield put({ type: 'afterListItemDelete' })
      yield put(getAction(null, 'fetchList'))
    }
  }
})

const columns: ExportColumn[] = [
  { title: utils.intl('??????'), dataIndex: 'num' },
  { title: utils.intl('????????????'), width: 220, dataIndex: 'stationTitle' },
  { title: utils.intl('????????????'), dataIndex: 'stationScaleDisplay' },
  { title: utils.intl('??????????????????(kWh)'), dataIndex: 'dailyChargeTarget' },
  { title: utils.intl('??????????????????(kWh)'), dataIndex: 'dailyDischargeTarget' },
  { title: utils.intl('???????????????(???)'), dataIndex: 'dailyProfitTarget' },
  { title: utils.intl('??????????????????'), dataIndex: 'profitDeviationThresholdStr' },
  { title: utils.intl('????????????'), dataIndex: 'effectTime', renderE: (text) => text ? moment(text).format("YYYY-MM-DD") : '' },
  { title: utils.intl('????????????'), dataIndex: 'invalidTime', renderE: (text) => text ? moment(text).format("YYYY-MM-DD") : '' },
  { title: utils.intl('??????'), dataIndex: 'status' },
  { title: utils.intl('??????????????????'), dataIndex: 'updateTime' },
  { title: utils.intl('???????????????'), dataIndex: 'updateUserTitle' }
]
