import { message } from 'wanke-gui'
import moment from 'moment'
import { RepairStatus } from '../constant'
import { makeModel } from "../../../umi.helper"
import { globalNS, power_management_info } from '../../../constants'
import utils from '../../../../util/utils'
import Service from '../services/power-management-info'
import { getTargetSystemTime } from '../../../../util/dateUtil'

export class PowerManagementInfoModal {
  detail: any = {}
  powerTypeList = [] // 投入优先级
  overhaulConfirmModalVisible = false
  overhaulConfirmType = 'hangUp' // 挂牌 hangUP 摘牌 pickOff
  overhaulModalMode = 'new'
  overhaulModalVisible = false
  overhaulPlanList = [] // 检修计划列表
  overhaulPlanRecord: any = {}  // 检修计划编辑详情
  overhaulPlanStatus = {
    status: RepairStatus.NONE,
    startTimeReal: null
  }
}

export default makeModel(power_management_info, new PowerManagementInfoModal(), (updateState, updateQuery, getState) => {
  return {
    * fetchDetail(action, {put, call, select}) {
      const { id } = action.payload
      const { results } = yield call(Service.getPowerDetail, {
        id
      });
      const { overhaulPlanStatus } = yield getState(select)
      overhaulPlanStatus.status = results.maintenanceStatus?.name ?? RepairStatus.NONE
      yield updateState(put, {
        detail: results,
        overhaulPlanStatus
      })
      return results
    },
    * fetchOverhaulPlanList(action, {put, call, select}) {
      const { id, timeZone } = action.payload
      const { results } = yield call(Service.getOverhaulPlanList, {
        powerDeviceId: id
      });
      const time = getTargetSystemTime(timeZone).format("YYYY-MM-DD HH:mm:00")
      const overhaulPlanList = utils.addTableNum(filterOverhaulPlanList(results, time))
      const { overhaulPlanStatus } = yield getState(select)
      overhaulPlanStatus.startTimeReal = getStartTimeReal(overhaulPlanList)
      yield updateState(put, {
        overhaulPlanList,
        overhaulPlanStatus
      })
    },
    *changeMaintenance(action, {put, call, select}) {
      const { id, isStart, dtime } = action.payload
      yield call(isStart ? Service.maintenanceStart : Service.maintenanceFinish, {
        id, dtime
      });
      yield put({ type: 'fetchDetail', payload: { id } })
      yield put({ type: 'fetchOverhaulPlanList', payload: { id } })
      message.success(utils.intl('操作成功'))
    },
    *saveOverhaul(action, {put, call, select}) {
      const { powerDeviceId, values, isNew, id } = action.payload
      const maintenancePlan = { powerDeviceId, ...formatData(values) }
      if (!isNew) maintenancePlan.id = id

      yield call(isNew ? Service.newMaintenance : Service.editMaintenance, {
        maintenancePlan
      });
      yield put({ type: 'fetchDetail', payload: { id: powerDeviceId } })
      yield put({ type: 'fetchOverhaulPlanList', payload: { id: powerDeviceId } })
      message.success(utils.intl('操作成功'))
    },
    *delete(action, {put, call, select}) {
      const { id, powerDeviceId } = action.payload
      yield call(Service.deleteMaintenance, {
        id
      });
      yield put({ type: 'fetchDetail', payload: { id: powerDeviceId } })
      yield put({ type: 'fetchOverhaulPlanList', payload: { id: powerDeviceId } })
      message.success(utils.intl('操作成功'))
    },
  }
})

function formatData(values) {
  const data = { ...values }
  delete data.deviceType
  delete data.num
  data.startTimePlan = data.startTimePlan?.format('YYYY-MM-DD HH:mm:00')
  data.endTimePlan = data.endTimePlan?.format('YYYY-MM-DD HH:mm:00')
  return data
}

// 过滤计划结束时间在今天之前，且没有挂牌的检修计划
function filterOverhaulPlanList(list = [], time) {
  const now = moment(time)
  return list.filter(item => !(now.isAfter(item.endTimePlan) && !item.startTimeReal))
}

// 获取检修状态
function getStartTimeReal(list) {
  let startTimeReal = null
  for (let i = 0, len = list.length; i < len; i++) {
    if (list[i].startTimeReal && list[i].endTimeReal) break
    if (list[i].startTimeReal) {
      startTimeReal = list[i].startTimeReal
    }
  }
  return startTimeReal
}
