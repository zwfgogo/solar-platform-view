import Service from './service'
import SocketHelper from '../socket.helper'
import { Socket_Screen } from '../constants'
import { sortChartData, formatChartDataCumulative } from '../page.helper'

const socket = new SocketHelper('screenPage', Socket_Screen, '/screen')

const sum = (value, sumValue) => {
  if (value) {
    return parseFloat(value) + parseFloat(sumValue)
  } else {
    return 0 + parseFloat(sumValue)
  }
}

class ScreenModal {
  electricAndProfitChart = {
    series: [{
      name: '实际发电量',
      unit: 'kWh'
    },
    {
      name: '理论发电量',
      unit: 'kWh'
    },
    {
      name: '收益情况',
      unit: '元'
    }]
  }
  generationChart = {
    series: [
      {
        name: '发电量',
        unit: 'kWh'
      }]
  }
  profitChart = {
    series: [{
      name: '收益',
      unit: '元'
    }]
  }
  storageElectricChart = {
    series: [{
      name: '充电量',
      unit: 'kWh'
    },
    {
      name: '放电量',
      unit: 'kWh'
    }]
  }
  solar = {}
  storage = {}
  stations = []
  stationDetail = {}
  generalSituation = { storageProfitDistribution: 0, solarProfitDistribution: 0, otherProfitDistribution: 0 }
  time = { year: '2020', month: '08', day: '14', time: '14:30' }
  stationOtherDetail = {}
}

export default {
  namespace: 'screenPage',
  state: new ScreenModal(),
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
      yield put({ type: 'updateToView', payload: new ScreenModal() })
    },
    *init(action, { put, call, select }) {
      const { powerMode, incomeMode, rankMods } = yield select(state => state.indexPage)
      const { dispatch } = action.payload
      let data = yield call(Service.getBaseInfo);
      yield put({ type: 'updateToView', payload: { solar: data.solar, storage: data.storage, stations: data.map || [] } })
      socket.start(dispatch, {
        'generalSituation': 'getGeneralSituation',
        'generation': 'getGeneration',
        'profit': 'getProfit',
        'storageElectric': 'getStorageElectric',
      }, {
          'connect': () => {
            const userId = sessionStorage.getItem('user-id')
            socket.emit('generalSituation', { userId })
            socket.emit('generation', { userId })
            socket.emit('profit', { userId })
            socket.emit('storageElectric', { userId })
          },
          'reconnect': (e) => {
            const newState = new ScreenModal()
            dispatch({
              type: 'indexPage/updateToView',
              payload: {
                storageElectricChart: newState.storageElectricChart,
                generationChart: newState.generationChart,
                electricAndProfitChart: newState.electricAndProfitChart,
                stationDetail: newState.stationDetail,
                generalSituation: newState.generalSituation,
              }
            })
          }
        })
    },
    *getProfit(action, { select, call, put }) {
      let { profitChart } = yield select(state => state.screenPage)
      const { result } = action.payload;
      profitChart = formatChartDataCumulative(profitChart, result.results, ['profit'])
      profitChart = sortChartData(profitChart)
      yield put({
        type: 'updateToView',
        payload: { profitChart: profitChart }
      });
    },
    *getGeneration(action, { select, call, put }) {
      let { generationChart } = yield select(state => state.screenPage)
      const { result } = action.payload;
      generationChart = formatChartDataCumulative(generationChart, result.results, ['generation'])
      generationChart = sortChartData(generationChart)
      yield put({
        type: 'updateToView',
        payload: { generationChart: generationChart }
      });
    },
    *getStorageElectric(action, { select, call, put }) {
      let { storageElectricChart } = yield select(state => state.screenPage)
      const { result } = action.payload;
      storageElectricChart = formatChartDataCumulative(storageElectricChart, result.results, ['charge', 'discharge'])
      storageElectricChart = sortChartData(storageElectricChart)
      yield put({
        type: 'updateToView',
        payload: { storageElectricChart: storageElectricChart }
      });
    },
    *getGeneralSituation(action, { select, call, put }) {
      const { generalSituation } = yield select(state => state.screenPage)
      const { result } = action.payload;

      const obj = {
        chargeDetail: () => {
          generalSituation['chargeDay'] = sum(generalSituation['chargeDay'], result.results.chargeDetail);
          generalSituation['chargeMonth'] = sum(generalSituation['chargeMonth'], result.results.chargeDetail);
          generalSituation['chargeAmount'] = sum(generalSituation['chargeAmount'], result.results.chargeDetail);
        },
        dischargeDetail: () => {
          generalSituation['dischargeDay'] = sum(generalSituation['dischargeDay'], result.results.dischargeDetail);
          generalSituation['dischargeMonth'] = sum(generalSituation['dischargeMonth'], result.results.dischargeDetail);
          generalSituation['dischargeAmount'] = sum(generalSituation['dischargeAmount'], result.results.dischargeDetail);
        },
        generationDetail: () => {
          generalSituation['generationDay'] = sum(generalSituation['generationDay'], result.results.generationDetail);
          generalSituation['generationMonth'] = sum(generalSituation['generationMonth'], result.results.generationDetail);
          generalSituation['generationAmount'] = sum(generalSituation['generationAmount'], result.results.generationDetail);
        },
        profitDetail: () => {
          generalSituation['profitDay'] = sum(generalSituation['profitDay'], result.results.profitDetail);
          generalSituation['profitMonth'] = sum(generalSituation['profitMonth'], result.results.profitDetail);
          generalSituation['profitAmount'] = sum(generalSituation['profitAmount'], result.results.profitDetail);
        },
        CO2ReductionDetail: () => {
          generalSituation['CO2ReductionAmount'] = sum(generalSituation['CO2ReductionAmount'], result.results.CO2ReductionDetail);
        },
        saveStandardCoalDetail: () => {
          generalSituation['saveStandardCoalAmount'] = sum(generalSituation['saveStandardCoalAmount'], result.results.saveStandardCoalDetail);
        },
        treePlantDetail: () => {
          generalSituation['treePlantAmount'] = sum(generalSituation['treePlantAmount'], result.results.treePlantDetail);
        },
        storageProfitDistributionDetail: () => {
          generalSituation['storageProfitDistribution'] = sum(generalSituation['storageProfitDistribution'], result.results.storageProfitDistributionDetail);
        },
        solarProfitDistributionDetail: () => {
          generalSituation['solarProfitDistribution'] = sum(generalSituation['solarProfitDistribution'], result.results.solarProfitDistributionDetail);
        },
        otherProfitDistributionDetail: () => {
          generalSituation['otherProfitDistribution'] = sum(generalSituation['otherProfitDistribution'], result.results.otherProfitDistributionDetail);
        },
      }
      for (let key in result.results) {
        if (obj[key] && result.results[key]) {
          obj[key]();
        }
      }

      yield put({
        type: 'updateToView',
        payload: {
          generalSituation: { ...generalSituation, ...result.results }
        },
      });
    },
    *getStationDetail(action, { select, call, put }) {
      const { stationDetail } = yield select(state => state.screenPage)
      const { result } = action.payload;
      let data = yield call(Service.getStationDetail, { stationTypeName: result.stationType, stationId: result.id });
      yield put({
        type: 'updateToView',
        payload: {
          stationDetail: data
        },
      });
    },
    *closeSocket() {
      socket.close()
    },
    *emitSocket(action, { put, call }) {
      const { eventName, params = {} } = action.payload
      const userId = sessionStorage.getItem('user-id')
      socket.emit(eventName, { userId, ...params })
    },
    * updateState(action, { call, put }) {
      yield put({
        type: 'updateToView',
        payload: action.payload
      })
    },
    * getTime(action, { call, put }) {
      const res = yield Service.getTime({})
      yield put({
        type: 'updateToView',
        payload: { time: res }
      })
    },
  }
};
