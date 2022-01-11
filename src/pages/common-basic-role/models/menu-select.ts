import services from '../services'
import { message } from 'wanke-gui'
import { globalNS, r_o_menu_select } from '../../constants'
import utils from '../../../public/js/utils'

import { makeModel } from '../../umi.helper'
import { GlobalState } from '../../../models/global'
import { isBatterySystem } from '../../../core/env'


export class MenuSelectState {
  menuData: any = {}
  query = {
    terminalType: '',
    firmType: ''
  }
  menuTree = []
  exit = true
  selectMenu = []
}

export default makeModel(r_o_menu_select, new MenuSelectState(), (updateState, updateQuery, getState) => {
  return {
    * pageChange({ payload }, { select, put }) {
      yield updateQuery(select, put, payload)
      yield put({ type: '$getList' })
    },
    * $getList(action, { call, put, select, take }) {
      const globalState: GlobalState = yield select(state => state[globalNS])
      const loginRoleId = globalState.roleId;
      const { firmId, roleId } = action.payload
      const { query } = yield select(state => state[r_o_menu_select])
      console.log({ ...query, firmId, loginRoleId: roleId })
      const data = yield call(services.getRolesMenu, { ...query, firmId, loginRoleId, curRoleId: roleId })
      yield updateState(put, {
        menuData: data,
        selectMenu: data?.selected || []
        // tabChange: data?.value || ''
      })
    },
    * $save(action, { call, put, select, take }) {
      const { roleId, firmId } = action.payload
      const { selectMenu } = yield select(state => state[r_o_menu_select])
      let { query } = yield select(state => state[r_o_menu_select])
      const data: any = {
        menuIds: selectMenu,
        // stationTypeId: tabChange,
        terminalType: query.terminalType,
        roleId
      }
      // 告知后台设置的是电池健康的菜单权限
      if (isBatterySystem()) {
        data.categoryType = 'Battery'
      }
      yield call(services.rolesMenuEdit, data)
      message.success(utils.intl('保存成功'))
      yield updateState(put, {
        exit: true
      })
      yield put({ type: '$getList', payload: { firmId, roleId } })
    }
  }
})
