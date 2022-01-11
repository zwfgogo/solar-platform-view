import { message } from 'wanke-gui'
import Service from './service'
import { enumsApi } from '../../services/global2'
import SocketHelper from '../socket.helper'
import { Socket_Port, globalNS } from '../constants'
import { formatChartDataCumulative, sortChartData, formatChartData } from '../page.helper'
import { changeUnit, getUnitByCurrency } from '../unit.helper'
import moment from 'moment'

import utils from "../../public/js/utils";

export const tabList = [
  {
    key: "month",
    name: utils.intl("common.近12月"),
    value: "month"
  },
  {
    key: "day",
    name: utils.intl("common.近30天"),
    value: "day"
  },
  {
    key: "detail",
    name: utils.intl("common.今日"),
    value: "detail"
  }
]

const DateFormaterMap = {
  'detail': 'YYYY-MM-DD HH:00:00',
  'day': 'YYYY-MM-DD',
  'month': 'YYYY-MM',
}

function formatDate(data, attrList, formater) {
  const result = { ...data };
  attrList.forEach(key => {
    result[key] = result[key].map(item => ({
      ...item,
      dtime: item.dtime ? moment(item.dtime).format(formater) : item.dtime
    }))
  })
  return result
}

const socket = new SocketHelper('indexPage', Socket_Port, '/overview', { forceNew: true })

const overviewListKeyMap = ['generation', 'profit', 'CO2']
// const overviewListUnitTypeMap: UnitValueMapKey[] = ['power', 'moneyCN', 'weightCN']
const overviewListLastKeyMap = ['Amount', 'Day', 'Month', 'Year']
const overviewListNameMap = [utils.intl("index.累计"), utils.intl("index.今日"), utils.intl("index.本月"), utils.intl("index.本年")]
const overviewListLastNameMap = [utils.intl("index.发电量"), utils.intl("index.收益"), utils.intl("index.CO2减排")]
const overviewListUnitMap = ['kWh', utils.intl("common.元"), 'kg']
const statisticListKeyMap = ['station', 'capacity']

export const powerChartSeries = [
  { name: utils.intl("index.实际发电量"), unit: 'kWh' },
  { name: utils.intl("index.理论发电量"), unit: 'kWh' },
];

export const incomeChartSeries = [
  { name: utils.intl("index.收益"), unit: utils.intl("common.元") },
];

// 获取收益总额
function getRealValue(originValue, currencyMap) {
  const realValueCNY = Object.keys(originValue).reduce((total, currencyKey) => {
    return total + originValue[currencyKey] * currencyMap[currencyKey]
  }, 0)
  const targetCurrency = getTargetCurrency()
  return { value: realValueCNY / currencyMap[targetCurrency], unit: getUnitByCurrency(targetCurrency) }
}

function getTargetCurrency() {
  return sessionStorage.getItem('currency') || 'CNY'
}

class IndexPageModal {
  overviewList = [[], [], []]
  rankList = [[], []]
  powerChart = {
    series: powerChartSeries
  }
  incomeChart = {
    series: incomeChartSeries
  }
  incomeChartPointMap = {}
  stationList = []
  baseInfo = {}
  abnormalChart = [
    { name: utils.intl("index.严重"), value: 0, unit: utils.intl("index.条") },
    { name: utils.intl("index.中度"), value: 0, unit: utils.intl("index.条") },
    { name: utils.intl("index.轻微"), value: 0, unit: utils.intl("index.条") },
  ]
  incomeMode = tabList[2].key
  powerMode = tabList[2].key
  rankMods = ['day', 'day']
  currencyMap = {
    CNY: 1
  }
  socketLoading = {}
}

export default {
  namespace: 'indexPage',
  state: new IndexPageModal(),
  reducers: {
    updateToView(state, { payload }) {
      return {
        ...state,
        ...payload
      }
    }
  },
  effects: {
    *reset(action, { put, call }) {
      yield put({ type: 'updateToView', payload: new IndexPageModal() })
    },
    *resetSocketDate(action, { put, call }) {
        const newState = new IndexPageModal()
        yield put({
        type: 'updateToView',
        payload: {
          overviewList: newState.overviewList,
          rankList: newState.rankList,
          powerChart: newState.powerChart,
          incomeChart: newState.incomeChart,
          abnormalChart: newState.abnormalChart
        } 
      })
    },
    *init(action, { put, call, select }) {
      console.log('init')
      const { powerMode, incomeMode, rankMods } = yield select(state => state.indexPage)
      const { time } = yield select(state => state[globalNS])
      const viewTime = `${time.year}-${time.month}-${time.day}`;
      const { dispatch } = action.payload
      yield put({ type: 'getBaseInfo' })
      socket.start(dispatch, {
        'summary': 'getSummary',
        'electric': 'getElectric',
        'profit': 'getProfit',
        'PRRank': 'getPRRank',
        'timeRank': 'getTimeRank',
        'abnormal': 'getAbnormal',
        'currency': 'getCurrency'
      }, {
        'connect': () => {
          const userId = sessionStorage.getItem('user-id')
          socket.emit('summary', { userId, viewTime })
          socket.emit('electric', { mod: powerMode, userId, viewTime })
          socket.emit('profit', { mod: incomeMode, userId, viewTime })
          socket.emit('timeRank', { mod: rankMods[0], userId, viewTime })
          socket.emit('PRRank', { mod: rankMods[1], userId, viewTime })
          socket.emit('abnormal', { userId, viewTime })
        },
        'reconnect': (e) => {
          const newState = new IndexPageModal()
          dispatch({
            type: 'indexPage/updateToView',
            payload: {
              overviewList: newState.overviewList,
              rankList: newState.rankList,
              powerChart: newState.powerChart,
              incomeChart: newState.incomeChart,
              abnormalChart: newState.abnormalChart
            }
          })
        },
        'socketLoadingChange': (socketLoading) => {
          dispatch({ type: `indexPage/updateToView`, payload: { socketLoading } });
        }
      })
    },
    *closeSocket() {
      socket.close()
    },
    *emitSocket(action, { put, call }) {
      const { eventName, params = {} } = action.payload
      const userId = sessionStorage.getItem('user-id')
      socket.emit(eventName, { userId, ...params })
    },
    *getStationEnum(action, { put, call }) {
      const params = {
        firmId: sessionStorage.getItem('firm-id'),
        resource: 'stations',
        userId: sessionStorage.getItem('user-id')
      }
      let data = yield call(enumsApi, params)
      yield put({ type: 'updateToView', payload: { stationList: data || [] } })
    },
    *getBaseInfo(action, { put, call }) {
      const userId = sessionStorage.getItem('user-id')
      const params = { userId }
      let data = yield call(Service.getBaseInfo, params)
      yield put({ type: 'updateToView', payload: { baseInfo: data || {} } })
    },
    *changeCurrency(action, { put, call, select }) {
      yield put({ type: "refreshProfit" })
      yield put({ type: "refreshProfitChart" })
    },
    *refreshProfit(action, { put, call, select }) {
      let { newCurrencyMap } = action.payload || {}
      let { overviewList, currencyMap } = yield select(state => state.indexPage)
      overviewList = overviewList.slice()
      newCurrencyMap = newCurrencyMap || currencyMap
      const targetCurrency = getTargetCurrency()
      // 目标汇率不存在 则先获取汇率
      if (!newCurrencyMap[targetCurrency]) {
        yield put({ type: "emitSocket", payload: { eventName: 'currency', params: { currency: `${targetCurrency}` } } })
        return;
      }

      // 重新计算收益
      overviewListKeyMap.forEach((prevkey, prevIndex) => {
        overviewListLastKeyMap.forEach((lastkey, lastIndex) => {
          if (prevkey === 'profit' && overviewList[prevIndex][lastIndex]?.originValue) {
            const real = getRealValue(overviewList[prevIndex][lastIndex].originValue, newCurrencyMap)
            let unit = real.unit
            let realValue = real.value
            const formatValue = changeUnit({
              value: realValue,
              unit
            }, localStorage.getItem('language') as any)
            overviewList[prevIndex][lastIndex].value = (formatValue?.value)?.toFixed?.(2)
            overviewList[prevIndex][lastIndex].unit = formatValue?.unit
          }
        })
      })
      yield put({ type: "updateToView", payload: { overviewList } })
    },
    *getCurrency(action, { put, call, select }) {
      let { currencyMap } = yield select(state => state.indexPage)
      const newCurrencyMap = { ...currencyMap }
      const { result } = action.payload
      const { results = {} } = result
      Object.keys(results).map(currencyKey => {
        newCurrencyMap[currencyKey] = results[currencyKey]
      })
      yield put({ type: "updateToView", payload: { currencyMap: newCurrencyMap } })
      yield put({ type: "refreshProfit", payload: { newCurrencyMap } })
      yield put({ type: "refreshProfitChart" })
    },
    *getSummary(action, { put, call, select }) {
      let { overviewList, currencyMap } = yield select(state => state.indexPage)
      overviewList = overviewList.slice()
      const { result, count } = action.payload
      const { results = {} } = result
      let needUpdateCurrency = []

      overviewListKeyMap.forEach((prevkey, prevIndex) => {
        overviewListLastKeyMap.forEach((lastkey, lastIndex) => {
          const key = prevkey + lastkey
          if(results[key] || results[key] === 0) {
            let realValue // 记录总值
            let originValue = {} // 记录原始值总值
            let formatValue;
            let unit = overviewListUnitMap[prevIndex]
            // 针对收益特殊处理 返回数据结构不一样 { key: value } key是货币种类 value是值
            if (prevkey === 'profit') {
              let currencyList = Object.keys(results[key])
              if(currencyList.length !== 0) {
                currencyList.forEach(currencyKey => {
                  originValue[currencyKey] = (results[key][currencyKey] ?? 0) + (overviewList[prevIndex][lastIndex]?.originValue?.[currencyKey] ?? 0)
                })
  
                const targetCurrency = getTargetCurrency()
                // 如果存在不知道汇率的货币 先获取汇率
                if(currencyList.some(key => !currencyMap[key]) || !currencyMap[targetCurrency]) {
                  needUpdateCurrency = Array.from(new Set(currencyList.concat(targetCurrency)))
                } else {
                  const real = getRealValue(originValue, currencyMap)
                  realValue = real.value
                  unit = real.unit
                  formatValue = changeUnit({
                    value: realValue,
                    unit
                  }, localStorage.getItem('language') as any)
                }
              }
            } else {
              realValue = results[key] + (overviewList[prevIndex][lastIndex]?.realValue ?? 0)
              formatValue = changeUnit({
                value: realValue,
                unit
              }, localStorage.getItem('language') as any)
            }
            overviewList[prevIndex][lastIndex] = {
              name: overviewListNameMap[lastIndex] + overviewListLastNameMap[prevIndex],
              value: (formatValue?.value)?.toFixed?.(2) || overviewList[prevIndex][lastIndex]?.value,
              originValue,
              realValue,
              unit: formatValue?.unit || overviewList[prevIndex][lastIndex]?.unit
            }
          }
        })
      });
      // 如果需要更新汇率信息
      if (needUpdateCurrency.length > 0) {
        yield put({
          type: "emitSocket",
          payload: { eventName: 'currency', params: { currency: needUpdateCurrency.join(',') } }
        })
      }
      yield put({ type: "updateToView", payload: { overviewList } })
    },
    *getElectric(action, { put, call, select }) {
      const { result, count } = action.payload
      const { results = {} } = result
      let { powerChart, powerMode } = yield select(state => state.indexPage)
      if(powerMode === results.mod) {
        if(!powerChart.series) powerChart.series = powerChartSeries
        powerChart = sortChartData(formatChartDataCumulative(
          powerChart,
          formatDate(results, ['electricReal', 'electricTheory'], DateFormaterMap[results.mod]),
          ['electricReal', 'electricTheory']
        ))
        yield put({ type: "updateToView", payload: { powerChart } })
      }
    },
    *refreshProfitChart(action, { put, call, select }) {
      let { incomeChartPointMap, incomeMode, currencyMap } = yield select(state => state.indexPage)
      const targetCurrency = getTargetCurrency()
      let currencyList = [targetCurrency]
      const incomeChartPointMapKeys = Object.keys(incomeChartPointMap)
      incomeChartPointMapKeys.forEach(dtime => {
        currencyList = currencyList.concat(Object.keys(incomeChartPointMap[dtime]))
      })
      currencyList = Array.from(new Set(currencyList))
      // 目标汇率不存在 则先获取汇率
      if (currencyList.some(key => !currencyMap[key])) {
        yield put({
          type: "emitSocket",
          payload: { eventName: 'currency', params: { currency: currencyList.join(',') } }
        })
        return;
      }
      let incomeChart: any = {}
      if(!incomeChart.series) incomeChart.series = incomeChartSeries
      const results = {
        profit: []
      }
      incomeChartPointMapKeys.forEach(dtime => {
        const real = getRealValue(incomeChartPointMap[dtime], currencyMap)
        incomeChart.series[0].unit = real.unit
        results.profit.push({
          dtime,
          val: real.value?.toFixed?.(2)
        })
      })

      incomeChart = sortChartData(formatChartDataCumulative(
        incomeChart,
        formatDate(results, ['profit'], DateFormaterMap[incomeMode]),
        ['profit']
      ))
      yield put({ type: "updateToView", payload: { incomeChart } })
    },
    *getProfit(action, { put, call, select }) {
      const { result, count } = action.payload
      const { results = {} } = result
      let { incomeChart, incomeMode, incomeChartPointMap } = yield select(state => state.indexPage)
      if(incomeMode === results.mod) {
        results.profit.forEach(item => {
          if (!incomeChartPointMap[item.dtime]) incomeChartPointMap[item.dtime] = {}
          if (item.val || item.val === 0) {
            incomeChartPointMap[item.dtime][item.currency] = Number(item.val) + Number(incomeChartPointMap[item.dtime][item.currency] ?? 0)
          }
        })
        yield put({ type: "updateToView", payload: { incomeChartPointMap } })
        yield put({ type: "refreshProfitChart" })

        // if(!incomeChart.series) incomeChart.series = incomeChartSeries
        // incomeChart = sortChartData(formatChartDataCumulative(
        //   incomeChart,
        //   formatDate(results, ['profit'], DateFormaterMap[results.mod]),
        //   ['profit']
        // ))
        // yield put({ type: "updateToView", payload: { incomeChart } })
      }
    },
    *getPRRank(action, { put, call, select }) {
      let { rankList } = yield select(state => state.indexPage)
      const { result, count } = action.payload
      const { results = {} } = result
      const { PR = [], mod = [] } = results
      const PRList = rankList[1].slice()
      PR.forEach(item => {
        const target = PRList.find(pr => pr.title === item.title)
        if (!target) {
          PRList.push(item)
        } else {
          target.value = item.value
        }
      })
      rankList = [rankList[0], PRList]
      yield put({ type: "updateToView", payload: { rankList } })
    },
    *getTimeRank(action, { put, call, select }) {
      let { rankList } = yield select(state => state.indexPage)
      const { result, count } = action.payload
      const { results = {} } = result
      const { time = [], mod = [] } = results
      const timeList = rankList[0].slice()
      time.forEach(item => {
        const target = timeList.find(pr => pr.title === item.title)
        if (!target) {
          timeList.push(item)
        } else {
          target.value = item.value
        }
      })
      rankList = [timeList, rankList[1]]
      yield put({ type: "updateToView", payload: { rankList } })
    },
    *getAbnormal(action, { put, call }) {
      const { result, count } = action.payload
      const { results } = result
      const { Slight = 0, Moderate = 0, Serious = 0 } = results
      yield put({ type: "updateToView", payload: {
        abnormalChart: [
          { name: utils.intl("index.严重"), value: Serious, unit: utils.intl("index.条") },
          { name: utils.intl("index.中度"), value: Moderate, unit: utils.intl("index.条") },
          { name: utils.intl("index.轻微"), value: Slight, unit: utils.intl("index.条") },
        ]
      }})
    }
  }
};
