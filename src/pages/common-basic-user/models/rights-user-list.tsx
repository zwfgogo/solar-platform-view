import React from 'react'
import services from '../services'
import { message, Modal } from 'wanke-gui'
import { globalNS, r_u_user_list } from '../../constants'
import { enumsApi } from '../../../services/global2'
import { exportFile } from '../../../util/fileUtil'
import { makeModel } from '../../umi.helper'
import utils from '../../../public/js/utils'

const _expandedKeys = o => {
  let expandedKeys = []
  o.map((v, i) => {
    if (typeof v.children !== 'undefined' && v.children && v.children.length > 0) {
      _expandedKeys(v.children)
    }
    expandedKeys.push(v.key)
  })
  return expandedKeys
}

function formatUserTree(treeList = []) {
  let list = []
  treeList.forEach(node => {
    let item = { ...node }
    if (item.id === -1) {
      item.disabled = true
    }
    if (node.children) {
      item.children = formatUserTree(node.children)
    }
    list.push(item)
  })
  return list
}

export class RightsUserListState {
  defaultExpanded = []
  companyTree = []
  list = []
  stationDisplay = false
  query = {
    page: 1,
    size: 20,
    firmId: '',
    queryStr: ''
  }
  total = 0
  search = ''
  modal = false
  roles = []
  firmsIdAndType = []
  firmType = ''
  activity = true
  record: any = {}
  roleSelected = ''
  treeKey = null
  firmId = null
  modalTitle = ''
}

export default makeModel(r_u_user_list, new RightsUserListState(), (updateState, updateQuery, getState) => {
  return {
    * pageChange({ payload }, { select, put }) {
      yield updateQuery(select, put, payload)
      yield put({ type: '$getList' })
    },
    * $getList({ payload }, { call, put, select, take }) {
      const { query } = yield select(state => state[r_u_user_list])
      const { userId } = yield select(state => state[globalNS])
      const data = yield call(services.getUserInformation, { userId, ...query })
      yield updateState(put, {
        list: data.results,
        total: data.totalCount,
        stationDisplay: data.stationDisplay
      })
    },
    * $getTree({ payload }, { call, put, select, take }) {
      let data = yield call(services.getUserTree, { individual: true })
      const { activity, treeKey } = yield select(state => state[r_u_user_list])
      const defaultExpanded = _expandedKeys(data)
      data = formatUserTree(data)
      yield updateState(put, {
        companyTree: data,
        defaultExpanded: defaultExpanded,
        treeKey: treeKey !== '' ? treeKey : data[0].key
      })
      yield put({ type: 'getFirms', payload: { firmId: data[0].id } })

      // 从角色权限跳转过来
      if (payload.firmId) {
        yield put({
          type: 'selectTree',
          payload: { firmId: payload.firmId, activity }
        })
      } else {
        yield put({
          type: 'selectTree',
          payload: { firmId: data[0].id, activity: data[0].activity }
        })
      }
    },
    * selectTree({ payload: { firmId, activity } }, { call, put, select, take }) {
      yield updateState(put, {
        activity: activity,
        firmId: firmId
      })
      yield updateQuery(select, put, {
        firmId: firmId,
        page: 1
      })
      yield put({ type: 'getSelection', payload: { firmId } })
      yield put({ type: '$getList' })
    },
    * getSelection({ payload: { firmId } }, { call, put, select, take }) {
      const { firmsIdAndType } = yield select(state => state[r_u_user_list])
      for (let i = 0; i < firmsIdAndType.length; i++) {
        if (firmsIdAndType[i].value === firmId) {
          yield updateState(put, {
            firmType: firmsIdAndType[i].type.title
          })
        }
      }
      let rolesData = yield call(enumsApi, { resource: 'roles', firmId, activity: 'true' })
      yield updateState(put, {
        roles: rolesData
      })
      return rolesData
    },
    * getFirms({ payload: { firmId } }, { call, put, select, take }) {
      const firmsData = yield call(services.getFirmsIdAndType, { parentId: firmId })
      yield updateState(put, {
        firmsIdAndType: firmsData
      })
    },
    * editUser({ payload: { record } }, { call, put, select, take }) {
      yield put.resolve({ type: 'getFirms', payload: { firmId: record.firmId } })
      yield put.resolve({ type: 'getSelection', payload: { firmId: record.firmId } })
      yield updateState(put, {
        modal: true,
        record,
        modalTitle: '编辑用户'
      })
    },
    * $save({ payload: { values } }, { call, put, select, take }) {
      const { modalTitle, record } = yield select(state => state[r_u_user_list])
      if (modalTitle === '新增用户') {
        yield call(services.usersAdd, {
          ...values
        })
        Modal.success({
          title: utils.intl('新增成功'),
          content: (
            <span>
              {utils.intl('默认密码为')}{utils.intl('：')}<span style={{ color: 'red' }}>“abcd1234”</span>
            </span>
          )
        })
      } else {
        yield call(services.usersEdit, {
          ...values,
          id: record.id,
          activity: record.activity
        })
        message.success(utils.intl('编辑成功'))
      }
      yield updateState(put, {
        modal: false
      })
      yield put({ type: '$getList' })
    },
    * $del({ payload: { o } }, { call, put }) {
      yield call(services.usersDelete, { id: o.id })
      message.success(utils.intl('删除成功'))
      yield put({ type: 'afterListItemDelete' })
      yield put({ type: '$getList' })
    },
    * $reset({ payload: { o } }, { call, put, select, take }) {
      yield call(services.usersReset, { id: o.id })
      message.success(utils.intl('您的密码已重置为')+'"abcd1234"')
      yield put({ type: '$getList' })
    },
    * onExport(action, { call, put, select }) {
      const { userId } = yield select(state => state[globalNS])
      const { query } = yield getState(select)
      const data = yield call(services.getUserInformation, {
        userId,
        firmId: query.firmId,
        queryStr: query.queryStr
      })
      exportFile(columns, data.results)
    }
  }
})

const columns = [
  {
    title: utils.intl('账号'),
    dataIndex: 'name'
  },
  {
    title: utils.intl('姓名'),
    dataIndex: 'title'
  },
  {
    title: utils.intl('单位'),
    dataIndex: 'firmTitle'
  },
  {
    title: utils.intl('单位类型'),
    dataIndex: 'firmTypeTitle',
    renderE: (value) => {
      return value != utils.intl('平台') ? value : ''
    }
  },
  {
    title: utils.intl('角色'),
    dataIndex: 'roleTitle'
  },
  {
    title: utils.intl('手机号'),
    dataIndex: 'phone',
    renderE: (text, record) => {
      return `${record.internationalCode || ''}${record.phone || ''}`
    }
  },
  {
    title: utils.intl('电站权限'),
    dataIndex: 'view'
  }
]
