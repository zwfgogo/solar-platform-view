import * as services from '../customer.service'
import gdata from '../../../public/js/gdata'
import { message } from 'wanke-gui'
import { c_list, globalNS } from '../../constants'
import { makeModel } from '../../umi.helper'
import { exportFile } from '../../../util/fileUtil'
import { GlobalState } from '../../../models/global'
import { enumsApi } from '../../../services/global2'
import utils from '../../../public/js/utils'
import { getImageUrl } from '../../page.helper'

interface OperationRes {
  name?: string,
  password?: string,
  errorCode?: number,
  errorMsg?: string,
  firm?: string
}

export class CustomerListState {
  list = []
  modal = false
  query = {
    page: 1,
    size: 20,
    queryStr: '',
    firmId: ''
  }
  total = 0

  id = null
  title = ''
  firmTypeId = null
  firmTypeTitle = null
  abbreviation = ''
  contact = ''
  phone = { code: '+86', phone: '' }
  individual = 1
  activity = 1
  imageUrl = null
  logoUrl = null
  activityCanUpdate = true
  platformTitle = ''

  modalTitle = ''
  operationRes: OperationRes = {
    name: '',
    password: '',
    errorCode: 0,
    errorMsg: '',
    firm: ''
  }
  showRes = false
  customerType = []
  superiorUnits = ''
  stationList = []
  customerTypeSelected = ''

  lightLogoUrl = null
  darkLogoUrl = null
  editDetail = {}
}

export default makeModel(c_list, new CustomerListState(), (updateState, updateQuery, getState) => {
  return {
    * pageChange({ payload }, { select, put }) {
      yield updateQuery(select, put, payload)
      yield put({ type: '$getList' })
    },
    * getDetail(action, { select, call, put }) {
      const { id } = action.payload
      const res = yield services.getDetail({ id })
      yield put({
        type: 'updateToView',
        payload: { editDetail: res, lightLogoUrl: res.lightLogoUrl, darkLogoUrl: res.darkLogoUrl, modal: true }
      })
    },
    * $getList({ payload }, { call, put, select, take }) {
      yield updateQuery(select, put, {
        firmId: JSON.parse(sessionStorage.getItem('userInfo')).firm.id
      })
      const { query } = yield select(state => state[c_list])
      const data = yield call(services.getCustomerInformation, { ...query })
      yield updateState(put, {
        list: data.results,
        total: data.totalCount
      })
    },
    * $save(action, { call, put, select, take }) {
      const { firmId }: GlobalState = yield select(state => state[globalNS])
      const state: CustomerListState = yield select(state => state[c_list])
      const { modalTitle, id } = state
      let firm
      try {
        let logo = gdata('fileList') ? gdata('fileList').fileList : null || null
        let param = {
          ...state.editDetail,
          parentId: firmId,
          title: state.title,
          platformTitle: state.platformTitle,
          firmTypeId: state.firmTypeId,
          abbreviation: state.abbreviation,
          contact: state.contact,
          phone: state.phone.phone,
          internationalCode: state.phone.phone ? state.phone.code : '',
          individual: state.individual == 2,
          activity: state.activity == 1,
          darkLogoUrl: state.darkLogoUrl,
          lightLogoUrl: state.lightLogoUrl,
          platformTitleMap: { ...state.editDetail.platformTitleMap, [process.env.SYSTEM_PLATFORM]: state.platformTitle }
        }
        firm = state.title
        let data
        if (modalTitle === utils.intl('新增客户')) {
          data = yield call(services.getCustomerAdd, param)
          yield updateState(put, {
            showRes: true,
            operationRes: {
              ...data,
              errorCode: 0
            }
          })
          yield put({ type: '$getList' })
        } else {
          data = yield call(services.getCustomerRevise, {
            ...param,
            id
          })
          yield updateState(put, {
            modal: false
          })
          message.success(utils.intl('编辑成功'))
          yield put({ type: '$getList' })
        }
      } catch (res) {
        if (modalTitle === utils.intl('新增客户')) {
          yield updateState(put, {
            showRes: true,
            operationRes: { errorCode: 300, errorMsg: res.errorMsg, firm: firm }
          })
        } else {
          if (res.errorCode === 300) {
            message.error(res.errorMsg)
          }
        }
      }
    },
    * getSelection({ payload }, { call, put, select, take }) {
      const { userId }: GlobalState = yield select(state => state[globalNS])
      let customerType;
      if (payload.title === utils.intl('新增')) {
        customerType = yield call(services.firmsType, { userId })
        customerType = customerType.map(item => ({ value: item.id, name: item.title, codeName: item.name }))
      } else {
        customerType = yield call(enumsApi, { resource: 'firmTypes', property: '*' })
        customerType = customerType.map(item => ({ value: item.id, name: item.title, codeName: item.name }))
      }
      if (payload.title === utils.intl('新增')) {
        yield updateState(put, {
          customerType: customerType,
          customerTypeSelected: null
        })
      } else {
        yield updateState(put, {
          customerType: customerType,
          customerTypeSelected: null
        })
      }
    },
    * $del({ payload: { o } }, { call, put, select, take }) {
      yield call(services.customerDelete, { id: o.id })
      message.success(utils.intl('删除成功'))
      yield put({ type: 'afterListItemDelete' })
      yield put({ type: '$getList' })
    },
    * onEdit(action, { call, put, select, take }) {
      const { record } = action.payload
      if (record.logoUrl) {
        const imageUrl = getImageUrl(record.logoUrl)
        yield updateState(put, {
          imageUrl: imageUrl,
          logoUrl: record.logoUrl
        })
      } else {
        yield updateState(put, {
          imageUrl: '',
          logoUrl: ''
        })
      }
      yield updateState(put, {
        modalTitle: utils.intl('编辑客户'),
        id: record.id,
        title: record.title,
        firmTypeId: record.firmTypeId,
        firmTypeTitle: record.firmTypeTitle,
        abbreviation: record.abbreviation,
        contact: record.contact,
        phone: { phone: record.phone, code: record.internationalCode || '+86' },
        individual: record.individual ? 2 : 1,
        activity: record.activity ? 1 : -1,
        activityCanUpdate: record.activityCanUpdate,
        platformTitle: record.platformTitleMap?.[process.env.SYSTEM_PLATFORM]
      })
      yield put({ type: 'getDetail', payload: { id: record.id } })
    },
    * onExport(action, { call, put, select }) {
      const { query } = yield getState(select)
      const data = yield call(services.getCustomerInformation, {
        queryStr: query.queryStr,
        firmId: query.firmId
      })
      exportFile(getColumns(), data.results)
    }
  }
})
function getColumns() {
  const columns = [
    {
      title: utils.intl('序号'),
      dataIndex: 'num'
    },
    {
      title: utils.intl('客户名称'),
      dataIndex: 'title'
    },
    {
      title: utils.intl('客户性质'),
      dataIndex: 'individual',
      renderE(individual) {
        return individual ? utils.intl('个人') : utils.intl('单位')
      }
    },
    {
      title: utils.intl('客户类型'),
      dataIndex: 'firmTypeTitle'
    },
    {
      title: utils.intl('电站数量'),
      dataIndex: 'count'
    },
    {
      title: utils.intl('电站总规模'),
      dataIndex: 'scaleDisplay'
    },
    {
      title: utils.intl('联系人'),
      dataIndex: 'contact'
    },
    {
      title: utils.intl('联系电话'),
      dataIndex: 'phone'
    },
    {
      title: utils.intl('有效性'),
      dataIndex: 'activityTitle'
    }
  ]
  return columns
}