import services from '../services'
import { message } from 'wanke-gui'
import { globalNS, r_o_role_list } from '../../constants'

import { makeModel } from '../../umi.helper'
import { exportFile } from '../../../util/fileUtil'
import { GlobalState } from '../../../models/global'
import utils from '../../../public/js/utils'
import { isBatterySystem } from '../../../core/env'

const _expandedKeys = o => {
  const expandedKeys = []
  o.map((v, i) => {
    if (typeof v.children !== 'undefined' && v.children && v.children.length > 0) {
      _expandedKeys(v.children)
    }
    expandedKeys.push(v.key)
  })
  return expandedKeys
}
const availability = [{ name: utils.intl('有效'), value: 1 }, { name: utils.intl('无效'), value: -1 }]

function formatRoleTree(treeList = []) {
  let list = []
  treeList.forEach(node => {
    let item = { ...node }
    if (item.id === -1) {
      item.disabled = true
    }
    if (node.children) {
      item.children = formatRoleTree(node.children)
    }
    list.push(item)
  })
  return list
}

export class RightsRoleState {
  list = []
  menuDisplay = false
  query = {
    page: 1,
    size: 20,
    firmId: '',
    queryStr: ''
  }
  total = 0
  modal = false
  availability = availability
  companyTree = []
  defaultExpanded = []
  firmId = ''
  search = ''
  activity = true
  firmTypeName = ''
  firmTitle = ''
  treeKey = null
}

export default makeModel(r_o_role_list, new RightsRoleState(), (updateState, updateQuery, getState) => {
  return {
    * pageChange({ payload }, { select, put }) {
      yield updateQuery(select, put, payload)
      yield put({ type: '$getList' })
    },
    * $getList({ payload }, { call, put, select, take }) {
      const { query } = yield select(state => state[r_o_role_list])
      const data = yield call(services.getRolesInformation, { ...query })
      yield updateState(put, {
        list: data.results,
        total: data.totalCount,
        menuDisplay: data.menuDisplay
      })
    },
    * $getTree({ payload }, { call, put, select, take }) {
      const { query } = yield select(state => state[r_o_role_list])
      let data = yield call(services.getRolesTree, { individual: false })

      const defaultExpanded = _expandedKeys(data)
      data = formatRoleTree(data)
      yield updateState(put, {
        companyTree: data,
        defaultExpanded: defaultExpanded,
        firmTitle: data[0].title,
        treeKey: data[0].key,
        firmId: data[0].firmType.id,
        firmTypeName: isBatterySystem() ? 'Battery' : data[0]?.firmType?.name
      })
      yield updateQuery(select, put, {
        firmId: data[0].id
      })
      yield put({
        type: 'selectTree',
        payload: { activity: data[0].activity }
      })
    },
    * selectTree({ payload: { activity, firmId } }, { call, put, select, take }) {
      yield updateState(put, { activity: activity })
      yield updateQuery(select, put, { page: 1 })
      yield put({ type: '$getList' })
    },
    * $save({ payload: { values } }, { call, put, select, take }) {
      const {
        modalTitle,
        query,
        record
      } = yield select(state => state[r_o_role_list])
      if (modalTitle === '新增角色') {
        yield call(services.rolesAdd, {
          ...values,
          activity: values.activity == 1,
          firmId: query.firmId
        })
        message.success(utils.intl('新增成功'))
      } else {
        yield call(services.rolesEdit, {
          ...values,
          activity: values.activity == 1,
          firmId: query.firmId,
          id: record.id
        })
        message.success(utils.intl('编辑成功'))
      }
      yield updateState(put, {
        modal: false
      })
      yield put({ type: '$getList' })
    },
    * $del({ payload: { o } }, { call, put, select, take }) {
      yield call(services.rolesDelete, { id: o.id })
      message.success(utils.intl('删除成功'))
      yield put({ type: 'afterListItemDelete' })
      yield put({ type: '$getList' })
    },
    * onExport(action, { call, put, select }) {
      const { query } = yield getState(select)
      const data = yield call(services.getRolesInformation, {
        firmId: query.firmId,
        queryStr: query.queryStr
      })
      exportFile(columns, data.results)
    }
  }
})

const columns = [
  {
    title: utils.intl('角色名称'),
    dataIndex: 'title'
  },
  {
    title: utils.intl('有效性'),
    dataIndex: 'activityTitle'
  },
  {
    title: utils.intl('用户数量'),
    dataIndex: 'count'
  },
  {
    title: utils.intl('功能菜单'),
    dataIndex: 'age'
  }
]
