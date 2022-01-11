import { message } from "antd"
import utils from "../../../../util/utils"
import { power_management } from "../../../constants"
import { makeModel } from "../../../umi.helper"
import Service from "../services/power-management"

export class PowerManagementModal {
  query = {
    page: 1,
    size: 20,
  }
  list = []
  totalCount = 0
}

export default makeModel(power_management, new PowerManagementModal(), (updateState, updateQuery, getState) => {
  return {
    * fetchList(action, {put, call, select}) {
      const { stationId } = action.payload;
      const { results } = yield call(Service.getPowerList, {
        stationId
      });
      yield updateState(put, {
        list: results
      })
    },
    * putDeviceList(action, {put, call, select}) {
      const { stationId, deviceList } = action.payload;
      yield call(Service.putPowerList, {
        deviceList
      });
      yield put({type: 'fetchList', payload: { stationId }})
      message.success(utils.intl('操作成功'))
    },
  }
})
