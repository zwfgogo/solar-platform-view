import * as services from '../customer.service'
import { c_station_list, globalNS } from '../../constants'

import { makeModel } from '../../umi.helper'
import { exportFile } from '../../../util/fileUtil'
import { GlobalState } from '../../../models/global'
import utils from '../../../public/js/utils'

export class CustomerStationState {
  list = []
  total = 0
  query = {
    page: 1,
    size: 20,
    queryStr: '',
    curFirmId: ''
  }
}

export default makeModel(c_station_list, new CustomerStationState(), (updateState, updateQuery, getState) => {
  return {
    * $getList({payload}, {call, put, select, take}) {
      const {firmId}: GlobalState = yield select(state => state[globalNS])
      const {query} = yield select(state => state[c_station_list])
      const data = yield call(services.getStationInfo, {
        ...query,
        firmId
      })
      yield updateState(put, {
        list: data.results,
        total: data.totalCount
      })
    },
    * onExport(action, {call, put, select}) {
      const {firmId}: GlobalState = yield select(state => state[globalNS])
      const {query} = yield getState(select)
      const data = yield call(services.getStationInfo, {
        queryStr: query.queryStr,
        curFirmId: query.curFirmId,
        firmId
      })
      exportFile(columns, data.results)
    }
  }
})

const columns = [
  {
    title: utils.intl('序号'),
    dataIndex: 'num'
  },
  {
    title: utils.intl('电站名称'),
    dataIndex: 'title'
  },
  {
    title: utils.intl('能量单元数量'),
    dataIndex: 'energyUnitCount'
  },
  {
    title: utils.intl('电站类型'),
    dataIndex: 'stationType',
    renderE: (value) => (value && value.title) || ''
  },
  {
    title: utils.intl('电站规模'),
    dataIndex: 'scaleDisplay'
  },
  {
    title: utils.intl('投产时间'),
    dataIndex: 'productionTime'
  },
  {
    title: utils.intl('运营商'),
    dataIndex: 'operator',
    renderE: (value) => (value && value.title) || ''
  },
  {
    title: utils.intl('运维商'),
    dataIndex: 'maintenance',
    renderE: (value) => (value && value.title) || ''
  },
  {
    title: utils.intl('终端用户'),
    dataIndex: 'finalUser',
    renderE: (value) => (value && value.title) || ''
  }
]