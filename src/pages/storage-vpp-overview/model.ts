import Service from "./service";
import SocketHelper from "../socket.helper";
import { Vpp_Socket_Port, globalNS, Socket_Port } from "../constants";
import _ from 'lodash'

const socket = new SocketHelper('overview', Socket_Port, '/vpp-overview')

class OverviewModal {
  summaryData = {}
  batteryData = {}
  generationChart = {}
  energyStoredChart = {}
  statisticalChartLlist = []
  generationEnergyData = {}
  profitData = {}
}

export default {
  namespace: "overview",
  state: new OverviewModal(),
  reducers: {
    updateToView(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    }
  },
  effects: {
    *init(action, { put, call }) {
      // yield put({ type: "getGenerationChart", payload: {} });
      // yield put({ type: "getEnergyStoredChart", payload: {} });
      // yield put({ type: "getBatteryStatus", payload: {} });
      yield put({ type: "getSummary", payload: {} });
      yield put({ type: "getGenerationEnergy", payload: {} });
      yield put({ type: "getProfit", payload: {} });
    },
    *resetSocketDate(action, { put, call }) {
        const newState = new OverviewModal()
        yield put({
        type: 'updateToView',
        payload: {
          batteryData: newState.batteryData,
          generationChart: newState.generationChart,
          energyStoredChart: newState.energyStoredChart,
        } 
      })
    },
    *initSocket(action, { put, call, select }) {
      const { time } = yield select(state => state[globalNS])
      const viewTime = `${time.year}-${time.month}-${time.day}`
      const { dispatch } = action.payload
      // 重置socket数据
      yield put({ type: "resetSocketDate" })
      socket.start(dispatch, {
        'pvPower': 'getPvPower',
        'batteryResidualEnergy': 'getBatteryResidualEnergy',
        'battery': 'getBattery',
      }, {
        'connect': () => {
          const firmId = sessionStorage.getItem('firm-id')
          socket.emit('pvPower', { firmId, viewTime })
          socket.emit('batteryResidualEnergy', { firmId, viewTime })
          socket.emit('battery', { firmId, viewTime })
        },
        'reconnect': (e) => {
          dispatch({ type: 'overview/resetSocketDate' })
        }
      })
    },
    *closeSocket() {
      socket.close()
    },
    *getPvPower(action, { put, call }) {
      const { result } = action.payload
      const { results = {} } = result
      let PvPower = {xData:[],yData:[[]],series:[{name: "光伏发电功率", unit: "kW"}]}
      
      if(results.pvPower && results.pvPower.length){
        let arr = _.clone(PvPower)
        for(let o of results.pvPower){
            if(arr.xData.indexOf(o.dtime) === -1){
                arr.xData = arr.xData.concat(o.dtime)
            }
            arr.yData[0] = arr.yData[0].concat(o.val)
        }
        PvPower = arr
        yield put({
            type: 'updateState',
            payload: {
              generationChart: PvPower
            },
        });
      }
    },
    *getBatteryResidualEnergy(action, { put, call }) {
      const { result } = action.payload
      const { results = {} } = result
      let BatteryResidualEnergy = {xData:[],yData:[[]],series:[{name: "电池剩余电量", unit: "kWh"}]}

      if(results.batteryResidualEnergy && results.batteryResidualEnergy.length){
        let arr = _.clone(BatteryResidualEnergy)
        for(let o of results.batteryResidualEnergy){
            if(arr.xData.indexOf(o.dtime) === -1){
                arr.xData = arr.xData.concat(o.dtime)
            }
            arr.yData[0] = arr.yData[0].concat(o.val)
        }
        BatteryResidualEnergy = arr
        yield put({
            type: 'updateState',
            payload: {
              energyStoredChart: BatteryResidualEnergy
            },
        });
      }  
    },
    *getBattery(action, { put, call, select }) {
      const { result } = action.payload
      const { results = {} } = result
      let { batteryData } = yield select(state => state.overview)

      yield put({
        type: 'updateState',
        payload: {
          batteryData: { ...batteryData, ...results }
        },
      });
    },
    *getGenerationChart(action, { put, call }) {
      const {} = action.payload;
      const params = { firmId: sessionStorage.getItem("firm-id") };
      const res = yield call(Service.getGenerationChart, params);
      const data = res.results || {};
      yield put({
        type: "updateToView",
        payload: { generationChart: data }
      });
    },
    *getEnergyStoredChart(action, { put, call }) {
      const {} = action.payload;
      const params = { firmId: sessionStorage.getItem("firm-id") };
      const res = yield call(Service.getEnergyStoredChart, params);
      const data = res.results || {};
      yield put({
        type: "updateToView",
        payload: { energyStoredChart: data }
      });
    },
    *getGenerationEnergy(action, { put, call }) {
      const {} = action.payload;
      const params = { firmId: sessionStorage.getItem("firm-id") };
      const res = yield call(Service.getGenerationEnergy, params);
      const data = res.results || {};
      yield put({
        type: "updateToView",
        payload: { generationEnergyData: data }
      });
    },
    *getProfit(action, { put, call }) {
      const {} = action.payload;
      const params = { firmId: sessionStorage.getItem("firm-id") };
      const res = yield call(Service.getProfit, params);
      const data = res.results || {};
      yield put({
        type: "updateToView",
        payload: { profitData: data }
      });
    },
    *getSummary(action, { put, call }) {
      const {} = action.payload;
      const params = { firmId: sessionStorage.getItem("firm-id") };
      const res = yield call(Service.getSummary, params);
      const data = res.results || {};
      yield put({
        type: "updateToView",
        payload: { summaryData: data }
      });
    },
    *getBatteryStatus(action, { put, call }) {
      const {} = action.payload;
      const params = { firmId: sessionStorage.getItem("firm-id") };
      const res = yield call(Service.getBatteryStatus, params);
      const data = res.results || {};
      yield put({
        type: "updateToView",
        payload: { batteryData: data }
      });
    },
    *updateState(action, { call, put }) {
      yield put({
          type: 'updateToView',
          payload: action.payload
      });
    },
  }
};
