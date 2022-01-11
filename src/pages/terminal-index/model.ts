import { message } from "wanke-gui";
import Service from "./service";
import moment from 'moment';
import {t_index} from '../constants'

export default {
  namespace: t_index,
  state: {
      stationOverviewInfo:{},
      abnormalCode:'',
      chargeDischargeCode:'',
      operationCode:'',
      abnormal:'',
      chargeDischarge:'',
      operation:'',
      monitorRecord:[],
      labelArr:[],
      nowCode:[],
      runStatus: [{ name: '工作状态', value: '' }, { name: '充放电功率', value: '' },
                    { name: '电池SOC', value: '' }, { name: '电池SOH', value: '' }],
      runEnvironment:[],
      index:0,
      zoom:'100%',
      svgData: [],
      electricalWarehouse:{series:[{name: "温度", unit: "℃"}, {name: "湿度", unit: "%"}],xData: [],yData: [[], []]},
      batteryWarehouse:{series:[{name: "温度", unit: "℃"}, {name: "湿度", unit: "%"}],xData: [],yData: [[], []]},
  },
  reducers: {
    updateToView(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    }
  },
  effects: {
      * stationOverviewInfo(action, {select ,call, put}) {
          const res = yield Service.stationOverviewInfo({});
          if(res.results){
              yield put({
                  type: 'updateToView',
                  payload: {
                      stationOverviewInfo: res.results?.activity ? res.results : {},
                      labelArr: res.results.label ? [res.results.label] : []
                  }
              });
          }
      },
      * getStoragesCodeAxios(action, {select ,call, put}) {
          const res = yield Service.getStoragesCodeAxios({});
          if(res.results) {
              yield put({
                  type: 'updateToView',
                  payload: {nowCode: res.results,statusCode:res.results[0].value}
              });
          }
      },
      * runStatusAxios(action, {select ,call, put}) {
          const res = yield Service.runStatusAxios({deviceId:action.payload.devCode});
          yield put({
              type: 'updateToView',
              payload: {runStatus: [{name:'工作状态',value:res.results.WorkStatus},{name:'充放电功率',value:res.results.Power},
                  {name:'电池SOC',value:res.results.SOC},{name:'电池SOH',value:res.results.SOH}]}
          });
      },
      * runEnvironmentAxios(action, {select ,call, put}) {
          const res = yield Service.runEnvironmentAxios({deviceId:action.payload.devCode});
          yield put({
              type: 'updateToView',
              payload: {runEnvironment: res.results || []}
          });
      },
      * getEcharts(action, {select ,call, put}) {
          const {nowCode} = yield select(state => state.indexPage)
          if(nowCode[0]) {
              const electricalWarehouse = yield Service.getEcharts({deviceId:nowCode[0].value,place:'electricalWarehouse',date:moment().format('YYYY-MM-DD')});
              const batteryWarehouse = yield Service.getEcharts({deviceId:nowCode[0].value,place:'batteryWarehouse',date:moment().format('YYYY-MM-DD')});
              yield put({
                  type: 'updateToView',
                  payload: {electricalWarehouse: electricalWarehouse.results,batteryWarehouse:batteryWarehouse.results}
              });
          }
      },
      * updateState(action, {call, put}) {
          yield put({
              type: 'updateToView',
              payload: action.payload
          });
      },
  }
};
