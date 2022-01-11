import { makeModel } from '../pages/umi.helper'
import { enumsNS, firmEnumsNS, globalNS } from '../pages/constants'
import { enumsApi } from '../services/global2'

/**
 * firm相关枚举放这里
 */
export class FirmEnumState {
  userList = []
}

export default makeModel(firmEnumsNS, new FirmEnumState(), (updateState) => {
  return {
    * fetchUserList(action, {put, call, select}) {
      const {firmId} = yield select(state => state[globalNS])
      let data = yield call(enumsApi, {resource: 'users', firmId})
      yield updateState(put, {userList: data})
    }
  }
})
