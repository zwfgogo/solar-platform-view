import { makeModel } from '../pages/umi.helper'
import { enumsNS } from '../pages/constants'
import { enumsApi } from '../services/global-terminal'

/**
 * 后端返回的无参数枚举放这里
 */
export class EnumState {
  userList = []
}

export default makeModel(enumsNS, new EnumState(), (updateState) => {
  return {
    * fetchUserList(action, {put, call}) {
      let data = yield call(enumsApi, {resource: 'users'})
      yield updateState(put, {userList: data})
    }
  }
})
