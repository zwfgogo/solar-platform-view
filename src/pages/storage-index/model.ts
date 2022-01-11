import Service from "./service";
import { enumsApi, getStationsBySystem } from "../../services/global2";
import {storage_index, Socket_Port, globalNS} from '../constants'
import SocketHelper from "../socket.helper";
import { getUnitByCurrency, changeUnit } from "../unit.helper";
import { sortChartData, formatChartDataCumulative } from "../page.helper";
import moment from "moment";
import utils from "../../public/js/utils";

const overviewListKeyMap = ["profit", "charge", "discharge"];
const statisticListKeyMap = ["station", "capacity"];

const socket = new SocketHelper(storage_index, Socket_Port, '/overview', { forceNew: true })

// const overviewListUnitTypeMap: UnitValueMapKey[] = ['power', 'moneyCN', 'weightCN']
const overviewListLastKeyMap = ['Amount', 'Day', 'Month', 'Year']
const overviewListNameMap = ['累计', '昨日', '本月', '本年']
const overviewListLastNameMap = ['收益', '充电量', '放电量']
const overviewListUnitMap = [utils.intl('元'), "kWh", 'kWh']

export const powerChartSeries = [
  { name: utils.intl('充电量'), unit: 'kWh' },
  { name: utils.intl('放电量'), unit: 'kWh' },
];

export const abnormalChartSeries = [
  { name: utils.intl('告警'), unit: utils.intl('次') },
];

const DateFormaterMap = {
  'day': 'YYYY-MM-DD',
  'month': 'YYYY-MM',
}

let reportMapList = {}

class IndexPageModal {
  overviewList = [[], [], []];
  statisticList = [{}, {}];
  reportList = [];
  powerChart = {};
  reportChart = {};
  stationList = [];
  currencyMap = {
    CNY: 1
  };
  abnormalMode = 'day'
  powerMode = 'day'
  socketLoading = {}
}

export default {
  namespace: storage_index,
  state: new IndexPageModal(),
  reducers: {
    updateToView(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    }
  },
  effects: {
    *reset(action, { put, call }) {
      reportMapList = {}
      yield put({ type: "updateToView", payload: new IndexPageModal() });
    },
    *resetSocketDate(action, { put, call }) {
        const newState = new IndexPageModal()
        yield put({
        type: 'updateToView',
        payload: {
          overviewList: newState.overviewList,
          reportList: newState.reportList,
          powerChart: newState.powerChart,
          reportChart: newState.reportChart,
        } 
      })
    },
    *init(action, { put, call, select }) {
      console.log('init')
      const { powerMode, abnormalMode } = yield select(state => state[storage_index])
      const { time } = yield select(state => state[globalNS])
      const viewTime = `${time.year}-${time.month}-${time.day}`;
      const { dispatch } = action.payload
      yield put({ type: 'getBaseInfo' })
      socket.start(dispatch, {
        'summary': 'summarySocket',
        'electric': 'electricSocket',
        'abnormalDetail': 'abnormalDetailSocket',
        'abnormalChart': 'abnormalChartSocket',
        'currency': 'currencySocket'
      }, {
        'connect': () => {
          const userId = sessionStorage.getItem('user-id')
          socket.emit('summary', { userId, viewTime })
          socket.emit('electric', { mod: powerMode, userId, viewTime })
          socket.emit('abnormalChart', { mod: abnormalMode, userId, viewTime })
          socket.emit('abnormalDetail', { userId, viewTime })
        },
        'reconnect': (e) => {
          dispatch({ type: 'indexPage/resetSocketDate' })
        },
        'socketLoadingChange': (socketLoading) => {
          dispatch({ type: `${storage_index}/updateToView`, payload: { socketLoading } });
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
    *electricSocket(action, { put, call, select }) {
      const { result, count } = action.payload
      const { results = {} } = result
      let { powerChart, powerMode } = yield select(state => state[storage_index])
      if(powerMode === results.mod) {
        if(!powerChart.series) powerChart.series = powerChartSeries
        powerChart = sortChartData(formatChartDataCumulative(
          powerChart,
          formatDate(results, ['electricCharge', 'electricDischarge'], DateFormaterMap[results.mod]),
          ['electricCharge', 'electricDischarge']
        ))
        yield put({ type: "updateToView", payload: { powerChart } })
      }
    },
    *abnormalChartSocket(action, { put, call, select }) {
      const { result, count } = action.payload
      const { results = {} } = result
      let { reportChart, abnormalMode } = yield select(state => state[storage_index])
      if(abnormalMode === results.mod) {
        if(!reportChart.series) reportChart.series = abnormalChartSeries
        reportChart = sortChartData(formatChartDataCumulative(
          reportChart,
          formatDate(results, ['alarmChart'], DateFormaterMap[results.mod]),
          ['alarmChart']
        ))
        yield put({ type: "updateToView", payload: { reportChart } })
      }
    },
    *abnormalDetailSocket(action, { put, call, select }) {
      const { result, count } = action.payload
      const { results = {} } = result
      Object.keys(results).forEach(key => {
        reportMapList[key] = results[key] || []
      })
      let list = []
      Object.keys(reportMapList).forEach(key => {
        list = list.concat(reportMapList[key])
      })
      list.sort((prev, next) => next.startRtime - prev.startRtime)

      yield put({ type: "updateToView", payload: { reportList: list } })
    },
    *summarySocket(action, { put, call, select }) {
      let { overviewList, currencyMap } = yield select(state => state[storage_index])
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
              name: utils.intl('index.' + overviewListNameMap[lastIndex] + overviewListLastNameMap[prevIndex]),
              title: utils.intl('index.' + overviewListLastNameMap[prevIndex]),
              prevTitle: utils.intl('index.' + overviewListNameMap[lastIndex]),
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
    *currencySocket(action, { put, call, select }) {
      let { currencyMap } = yield select(state => state[storage_index])
      const newCurrencyMap = { ...currencyMap }
      const { result } = action.payload
      const { results = {} } = result
      Object.keys(results).map(currencyKey => {
        newCurrencyMap[currencyKey] = results[currencyKey]
      })
      yield put({ type: "updateToView", payload: { currencyMap: newCurrencyMap } })
      yield put({ type: "refreshProfit", payload: { newCurrencyMap } })
      // yield put({ type: "refreshProfitChart" })
    },
    *changeCurrency(action, { put, call, select }) {
      yield put({ type: "refreshProfit" })
      // yield put({ type: "refreshProfitChart" })
    },
    *refreshProfit(action, { put, call, select }) {
      let { newCurrencyMap } = action.payload || {}
      let { overviewList, currencyMap } = yield select(state => state[storage_index])
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
    *getOverviewList(action, { put, call }) {
      const params = { firmId: sessionStorage.getItem("firm-id") };
      const res = yield call(Service.getOverviewList, params);
      const data = res.results || {};
      const overviewList = [];
      overviewListKeyMap.forEach(key => {
        const list = data[key] || [];
        overviewList.push(list);
      });
      yield put({ type: "updateToView", payload: { overviewList } });
    },
    *getStatisticList(action, { put, call }) {
      const params = { firmId: sessionStorage.getItem("firm-id") };
      const res = yield call(Service.getStatisticList, params);
      const data = res.results || {};
      const statisticList = [];
      statisticListKeyMap.forEach(key => {
        let list = data[key] || [];
        if(!Array.isArray(list)) {
          list = [];
        }
        if(list.length < 3) {
          list.push({});
          list.push({});
          list.push({});
        }
        statisticList.push({
          list,
          total: data?.total?.[key] || ''
        });
      });
      yield put({ type: "updateToView", payload: { statisticList } });
    },
    *getReportList(action, { put, call, select }) {
      const res = yield call(Service.getReportList, {});
      const reportList = res.results || [];
      yield put({
        type: "updateToView",
        payload: { reportList }
      });
    },
    *getPowerAnalysisChart(action, { put, call }) {
      const { mod } = action.payload;
      const params = { firmId: sessionStorage.getItem("firm-id"), mod };
      const res = yield call(Service.getPowerAnalysisChart, params);
      const data = res.results || {};
      yield put({ type: "updateToView", payload: { powerChart: data } });
    },
    *getReportAnalysisChart(action, { put, call }) {
      const { mod } = action.payload;
      const params = { firmId: sessionStorage.getItem("firm-id"), mod };
      const res = yield call(Service.getReportAnalysisChart, params);
      const data = res.results || {};
      yield put({ type: "updateToView", payload: { reportChart: data } });
    },
    *getStationEnum(action, { put, call }) {
      const params = {
        firmId: sessionStorage.getItem("firm-id"),
        // resource: 'stations',
        userId: sessionStorage.getItem("user-id")
      };
      // let data = yield call(enumsApi, params)
      let data = yield call(getStationsBySystem, params)
      yield put({ type: "updateToView", payload: { stationList: data || [] } });
    }
  }
};

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
