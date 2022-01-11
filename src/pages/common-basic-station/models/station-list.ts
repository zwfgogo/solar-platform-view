import * as services from '../station.service'
import { makeModel } from '../../umi.helper'
import { stationListNS } from '../../constants'
import { enumsApi, fetchStationPrice } from '../../../services/global2'
import { exportCSV } from '../../../util/fileUtil'
import { renderTitle } from '../../page.helper'
import { ExportColumn } from '../../../interfaces/CommonInterface'
import utils from '../../../public/js/utils'
import TimeZoneMap from '../../../components/time-zone-picker/locale/time-zone-map.json'
import { isBatterySystem } from '../../../core/env'

export class StationListState {
  list = []
  stationStatusOptions = []
  energyUnitStatusOptions = []
  periodEnumList = []
  rules1 = []
  rules2 = null
  total = 0
  stationStatusMap = {}
  nowPrice = {}
  priceChartData = []
  dealersEnums = []
  priceModalTabsVisible = [false, false]
}

// 设备台账管理
export default makeModel(stationListNS, new StationListState(), (updateState, updateQuery, getState) => {
  return {
    * fetchList(action, { select, put, call }) {
      const data = yield call(services.fetchStationList, action.payload)
      yield updateState(put, {
        list: data.results,
        total: data.totalCount
      })
    },
    * $getStationStatusOperationMap(param, { put, call }) {
      let data = yield call(services.stationStatusOperationMap, {})
      data = data || []
      const stationStatusMap: any = {}
      data.forEach(item => {
        stationStatusMap[item.id] = { ...item }
        stationStatusMap[item.id].options = (item.next || [])
          .map(id => {
            const match = data.find(target => target.id === id)
            return { name: match.title, value: id }
          })
        stationStatusMap[item.id].options.unshift({ name: item.title, value: item.id })
      })
      yield updateState(put, { stationStatusMap })
    },
    * statusChange({ payload: { stationId, status } }, { put }) {
      yield services.updateStatus({ id: stationId, stationStatusId: status })
    },
    * fetchStationStatus(param, { put, call }) {
      const data = yield call(enumsApi, { resource: 'stationStatus', property: 'code' })
      yield updateState(put, { stationStatusOptions: data })
    },
    * fetchEnergyUnitStatus(param, { put, call }) {
      const data = yield call(enumsApi, { resource: 'energyUnitStatus', property: 'code' })
      yield updateState(put, { energyUnitStatusOptions: data })
    },
    * fetchElectricityPeriodEnum(param, { put, call }) {
      const data = yield call(enumsApi, { resource: 'priceRate' })
      yield updateState(put, { periodEnumList: data })
    },
    * fetchStationDetail(action, { put }) {
      const { stationId } = action.payload
      const data = yield fetchStationPrice({ id: stationId })
      yield updateState(put, {
        rules1: data.cost ? data.cost.seasonPrices || [] : [],
        rules2: data.cost ? data.generator : null
      })
    },
    * onExport(action, { call, put, select }) {
      const { query } = yield getState(select)
      const data = yield call(services.fetchStationList, action.payload)
      exportCSV(columns, data.results)
    },
    *getNowCostPrice(action, { select, put, call, all }) {
      const { stationId } = action.payload;

      const result = yield call(services.getPricePool, { isFuture: 'false', stationId, type: "Cost" });
      yield updateState(put, { nowPrice: result });
    },
    *getNowGenerationPrice(action, { select, put, call, all }) {
      const { stationId } = action.payload;

      const result = yield call(services.getPricePool, { isFuture: 'false', stationId, type: "Generation" });
      yield updateState(put, { nowPrice: result });
    },
    *initPriceModal(action, { select, put, call, all }) {
      const { stationId } = action.payload;
      const gResult = yield call(services.getPricePool, { isFuture: 'false', stationId, type: "Generation" });
      const cResult = yield call(services.getPricePool, { isFuture: 'false', stationId, type: "Cost" });

      yield updateState(put, {
        nowPrice: gResult.id ? gResult : cResult,
        priceModalTabsVisible: [!!gResult.id, !!cResult.id]
      });
    },
    * fetchPriceChartData(action, { select, put, call, all }) {
      const { stationId, type, dtime } = action.payload
      const result = yield call(services.fetchPriceChartData, { stationId, type, dtime })
      yield updateState(put, { priceChartData: result })
    },
    *getSelect(action, { select, put, call, all }) {
      const result = yield call(services.realTimePriceMap, { resource: "dealers" });
      yield updateState(put, { dealersEnums: result });
    },
  }
})

let language: any = localStorage.getItem('language');
let _TimeZoneMap = {};
for (let key in TimeZoneMap[language]) {
  _TimeZoneMap[TimeZoneMap[language][key]] = key
}

let columns: ExportColumn[] = [{
  title: utils.intl('序号'),
  dataIndex: 'num'
}]

if (isBatterySystem()) {
  columns.push({
    title: utils.intl('station.电池健康平台'),
    dataIndex: 'hasBatteryHealthPlatform',
    renderE: (text, record) => text ? utils.intl('具有') : utils.intl('不具有')
  })
}

columns = columns.concat([
  {
    title: utils.intl('电站名称'),
    dataIndex: 'title'
  },
  {
    title: utils.intl('所处时区'),
    dataIndex: 'timeZone',
    renderE: (value) => {
      return _TimeZoneMap[value] ?? value
    }
  },
  {
    title: utils.intl('运营商'),
    dataIndex: 'operator',
    renderE: renderTitle
  },
  // {
  //   title: utils.intl('运维商'),
  //   dataIndex: 'maintenance',
  //   renderE: renderTitle
  // },
  // {
  //   title: utils.intl('终端用户'),
  //   dataIndex: 'finalUser',
  //   renderE: renderTitle
  // },
  {
    title: utils.intl('电站类型'),
    dataIndex: 'stationType',
    renderE: renderTitle
  },
  {
    title: utils.intl('额定功率'),
    dataIndex: 'ratedPowerDisplay'
  },
  {
    title: utils.intl('投产时间'),
    dataIndex: 'productionTime'
  },
  // {
  //   title: utils.intl('货币单位'),
  //   dataIndex: 'currency',
  // },
  {
    title: utils.intl('电站状态'),
    dataIndex: 'stationStatus',
    renderE: renderTitle
  },
  // {
  //   title: utils.intl('状态时间'),
  //   dataIndex: 'stationStatusTime'
  // }
])
