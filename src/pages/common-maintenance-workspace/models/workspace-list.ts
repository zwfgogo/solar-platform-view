import { getAction, makeModel } from "../../umi.helper"
import moment from 'moment'
import { globalNS, workspace_list, Socket_Port } from "../../constants"
import { addBug, addSwitchWork, fetchStationList, fetchSwitchWorkDetail, fetchWorkspaceList, fetchQrcode, editSwitchWork } from '../workspace.service'
import { getDateStr, getTimeStr } from "../../../util/dateUtil"
import { message } from 'wanke-gui'
import { enumsApi, getStationsBySystem } from "../../../services/global2"
import { exportFile } from "../../../util/fileUtil"
import { getExceptionColumns } from '../ListWorkspace'
import { GlobalState } from "../../../models/global"
import SocketHelper from "../../socket.helper"
import utils from "../../../public/js/utils";

const socket = new SocketHelper(workspace_list, Socket_Port, '/custom-stroe')

export class WorkSpaceListState {
  query = {
    page: 1,
    size: 20,
    startDate: moment().subtract(29, 'days'),
    endDate: moment().subtract(0, 'days')
  }
  list = []
  totalCount = 0

  stationList = []
  userList = []
  showSwitchWorkDetail = false
  showSwitchWork = false
  number = ''
  date = null
  time = null
  shiftDate = null
  shiftTime = null
  shiftId = ''
  shiftTitle = ''
  dutyId = ''
  dutyTitle = ''
  runningModel = []
  runningStatus = []
  systemAlarmSituation = ''
  systemAlarmProcess = ''
  systemControll = ''
  taskCompletion = ''

  showUpdateBug = false
  stationOptions = []
  bugStationId = null
  bugId = null
  bugDate = null
  discoverer = null
  bugContent = null

  detail: any = {
    runningModel: [],
    runningStatus: []
  }

  showQrcodeModal = false
  switchWorkType = 'add'
  qrcodeUniqueId = null
  curRecordId = null
  pageMounted = false
}

export default makeModel(workspace_list, new WorkSpaceListState(), (updateState, updateQuery, getState) => {
  return {
    *startQrcodSocket(action, { put, call, select }) {
      socket.close();
      const { dispatch, key } = action.payload
      socket.start(dispatch, {
        'getResult': 'fetchShiftingStatus',
      }, {
        'connect': () => {
          socket.emit('getResult', { key })
        }
      })
    },
    *closeSocket() {
      socket.close()
    },
    *emitSocket(action, { put, call }) {
      const { eventName, params = {} } = action.payload
      socket.emit(eventName, params)
    },
    * resetModal(action, {put, call, select}) {
      const newState = new WorkSpaceListState();
      delete newState.qrcodeUniqueId;
      yield updateState(put, newState)
    },
    * fetchList(action, {put, call, select}) {
      const {query} = yield getState(select)
      const {results, totalCount} = yield call(fetchWorkspaceList, {
        page: query.page,
        size: query.size,
        startDate: getDateStr(query.startDate),
        endDate: getDateStr(query.endDate)
      })
      yield updateState(put, {list: results, totalCount})
    },
    * fetchUserList(action, {call, put, select}) {
      let userList = yield call(enumsApi, {resource: 'users', property: 'title,name'})
      yield updateState(put, {userList})
    },
    * fetchStationList(action, {call, put, select}) {
      const {firmId, userId} = yield select(state => state[globalNS])
      let stationOptions = yield call(getStationsBySystem, {firmId, userId})
      yield updateState(put, {stationOptions})
    },
    * onAdd(action, {call, put, select}) {
      const {userId, firmId, showName, username} = yield select(state => state[globalNS])
      const { dutyStartTime, shiftId } = action.payload;
      yield updateState(put, {showSwitchWork: true});
      let data = yield call(fetchStationList, {
        userId, firmId
      })
      yield updateState(put, {
        switchWorkType: 'add',
        stationList: data,

        runningModel: data.map(item => {
          return {
            stationId: item.value,
            stationTitle: item.name,
            detail: ''
          }
        }),
        runningStatus: data.map(item => {
          return {
            stationId: item.value,
            stationTitle: item.name,
            detail: ''
          }
        }),
        number: '',
        shiftId: shiftId,
        date: moment(dutyStartTime),
        time: moment(dutyStartTime),
        shiftDate: moment(),
        shiftTime: moment(),
        systemAlarmSituation: '',
        systemAlarmProcess: '',
        systemControll: '',
        taskCompletion: ''
      })
    },
    * onChangeWork(action, {call, put, select}) {
      const {curRecordId} = yield getState(select);
      const {userId, firmId} = yield select(state => state[globalNS])
      const {switchWorkType} = action.payload
      const isEdit = switchWorkType === 'edit';
      let state = yield call(fetchSwitchWorkDetail, {id: curRecordId, userId});
      // 没有shiftId，代表第一次新增
      if(!state.shiftId) return;
      yield updateState(put, {
        showSwitchWork: true,
        switchWorkType,
        runningStatus: state.runningStatus,
        runningModel: state.runningModel,
        number: state.number,
        shiftId: state.shiftId,
        shiftTitle: state.shiftTitle,
        dutyId: state.dutyId,
        dutyTitle: state.dutyTitle,
        date: moment(state.date),
        time: moment(`${state.date} ${state.time}`),
        shiftDate: isEdit ? moment(state.shiftDate) : moment(),
        shiftTime: isEdit ? moment(`${state.shiftDate} ${state.shiftTime}`) : moment(),
        systemAlarmSituation: state.systemAlarmSituation,
        systemAlarmProcess: state.systemAlarmProcess,
        systemControll: state.systemControll,
        taskCompletion: state.taskCompletion
      })
    },
    * fetchSwitchWorkDetail(action, {put, call, select}) {
      const {id} = action.payload
      const {userId}: GlobalState = yield select(state => state[globalNS])
      let state = yield call(fetchSwitchWorkDetail, {id, userId})
      yield updateState(put, {
        detail: {
          number: state.number,
          date: state.date,
          time: state.time,
          dutyTitle: state.dutyTitle,
          runningStatus: state.runningStatus,
          runningModel: state.runningModel,
          shiftTitle: state.shiftTitle,
          shiftDate: state.shiftDate,
          shiftTime: state.shiftTime,
          systemAlarmSituation: state.systemAlarmSituation,
          systemAlarmProcess: state.systemAlarmProcess,
          systemControll: state.systemControll,
          taskCompletion: state.taskCompletion
        }
      })
    },
    * addSwitchWork(action, {put, call, select}) {
      const {userId}: GlobalState = yield select(state => state[globalNS])
      const state: WorkSpaceListState = yield getState(select)
      yield call(addSwitchWork, {
        number: state.number,
        date: getDateStr(state.date),
        time: getTimeStr(state.time),
        runningStatus: state.runningStatus,
        runningModel: state.runningModel,
        dutyId: userId,
        shiftId: state.shiftId,
        shiftDate: getDateStr(state.shiftDate),
        shiftTime: getTimeStr(state.shiftTime),
        systemAlarmSituation: state.systemAlarmSituation,
        systemAlarmProcess: state.systemAlarmProcess,
        systemControll: state.systemControll,
        taskCompletion: state.taskCompletion,

        saveUnit: utils.intl('监控中心'),
        saveTime: utils.intl('3年')
      })
      yield updateState(put, {showSwitchWork: false})
      yield put(getAction(null, 'fetchList'))
      message.success(utils.intl('更新交接班成功'))
    },
    * editSwitchWork(action, {put, call, select}) {
      const {userId}: GlobalState = yield select(state => state[globalNS])
      const state: WorkSpaceListState = yield getState(select)
      yield call(editSwitchWork, {
        id: state.curRecordId,
        number: state.number,
        date: getDateStr(state.date),
        time: getTimeStr(state.time),
        runningStatus: state.runningStatus,
        runningModel: state.runningModel,
        shiftId: state.shiftId,
        shiftTitle: state.shiftTitle,
        dutyId: state.dutyId,
        dutyTitle: state.dutyTitle,
        shiftDate: getDateStr(state.shiftDate),
        shiftTime: getTimeStr(state.shiftTime),
        systemAlarmSituation: state.systemAlarmSituation,
        systemAlarmProcess: state.systemAlarmProcess,
        systemControll: state.systemControll,
        taskCompletion: state.taskCompletion,

        saveUnit: utils.intl('监控中心'),
        saveTime: utils.intl('3年')
      })
      yield updateState(put, {showSwitchWork: false})
      yield put(getAction(null, 'fetchList'))
      message.success(utils.intl('更新交接班成功'))
    },
    * addBug(action, {call, put, select}) {
      const state = yield getState(select)
      yield call(addBug, {
        ...action.payload.values
      })
      message.success(utils.intl('新增缺陷成功'))
      yield updateState(put, {showUpdateBug: false})
    },
    * onExport(action, {call, put, select}) {
      const {query} = yield getState(select)
      const {results} = yield call(fetchWorkspaceList, {
        startDate: getDateStr(query.startDate),
        endDate: getDateStr(query.endDate)
      })
      exportFile(getExceptionColumns(), results)
    },
    * fetchShiftingStatus(action, {call, put, select}) {
      const { result } = action.payload
      const { results = {} } = result
      const keys = Object.keys(results)
      const statusResult = results[keys[0]]
      const {pageMounted} = yield getState(select);
      const { confirm, userId, recordId } = statusResult || {};
      if(confirm === 0) {
        yield put({ type: 'closeSocket' })
        message.error(utils.intl("交接班被取消"));
        yield put({ type: 'closeQrcodeModal' });
      } else if(confirm === 1) {
        yield put({ type: 'closeSocket' })
        message.success(utils.intl("交接班成功"));
        if(!pageMounted) {
          return;
        }
        yield updateState(put, { curRecordId: recordId });
        yield put({ type: 'fetchList' });
        yield put({ type: 'onChangeWork', payload: {shiftId: userId, switchWorkType: 'edit'} });
        yield put({ type: 'closeQrcodeModal' });
      } else if(confirm === -2) {
        yield put({ type: 'closeSocket' })
      }
    },
    * endLoop() {

    },
    * shiftingDuty(action, {call, put, select}) {

    },
    * closeQrcodeModal(action, {call, put, select}) {
      yield updateState(put, { showQrcodeModal: false })
    },
    * fetchQrcodeImg(action, {call, put, select}) {
      try {
        const { img, uniqueId } = yield call(fetchQrcode)
        yield updateState(put, { qrcodeUniqueId: uniqueId })
        return img;
      } catch (error) {
      }
    },
  }
})
