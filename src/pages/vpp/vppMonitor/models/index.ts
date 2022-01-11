/**
 * Created by zhuweifeng on 2019/11/5.
 */
import Service from '../services/index';
import {getUpdateQuery} from "../../../umi.helper";
import SocketHelper from '../../../socket.helper';
import { Vpp_Socket_Port, globalNS, Socket_Port } from '../../../constants';
import _ from 'lodash'

let d = new Date();
let date = d.getFullYear() + "-" +(d.getMonth() + 1 < 10 ? "0"+(d.getMonth() + 1): (d.getMonth() + 1)) + "-" + (d.getDate() < 10 ? "0"+d.getDate() : d.getDate());
const updateQuery = getUpdateQuery('vppMonitor')

const socket = new SocketHelper('vppMonitor', Socket_Port, '/vpp-detail')

class EchartListTemp{
    xData = []
    yData = [[],[],[]]
    series = [{
        name: '可用输出功率',
        unit: 'kW'
    },
    {
        name: '可用输入功率',
        unit: 'kW'
    },
    {
        name: '调度功率',
        unit: 'kW'
    }]
};

let echartListTemp = new EchartListTemp()

export default {
    namespace: 'vppMonitor',
    state: {
        list:[],
        date:date,
        query: {
            page: 1,
            size: 20,
            queryStr: '',
        },
        vppModal:false,
        record:{},
        outType:'',
        inType:'',
        modalTitle:'',
        houseArr:['黑房子','黑房子','黑房子','黑房子','黑房子'],
        detail:{
            exportPower: {
                value: '',
                unit: 'kW'
            },
            importPower: {
                value: '',
                unit: 'kW'
            },
            dispatchPower: {
                value: '',
                unit: 'kW'
            },
            dispatchEnergy: {
                value: '',
                unit: 'kW'
            }
        },
        site:[],
        echartList:{xData:[],yData:[[],[],[]],series:[{
            name: '可用输出功率',
            unit: 'kW'
           },
           {
            name: '可用输入功率',
            unit: 'kW'
           },
           {
            name: '调度功率',
            unit: 'kW'
           }]}
    },
    reducers: {
        updateToView(state, { payload }) {
            return {
                ...state,
                ...payload,
            }
        }
    },
    effects: {
        *initSocket(action, { put, call, select }) {
          const { time } = yield select(state => state[globalNS])
          const viewTime = `${time.year}-${time.month}-${time.day}`
          const { site } = yield select(state => state.vppMonitor)
          const { dispatch, id } = action.payload
          socket.start(dispatch, {
            'summary': 'summarySocket',
            'siteRunning': 'siteRunningSocket',
            'powerCurve': 'powerCurveSocket',
          }, {
            'connect': () => {
                socket.emit('summary', { id, viewTime })
                for(let i of site){
                    socket.emit('siteRunning', { stationId: i.id, viewTime });
                }
                socket.emit('powerCurve', { id, viewTime });
            },
            'reconnect': (e) => {
            }
          })
        },
        *closeSocket() {
            echartListTemp = new EchartListTemp()
            socket.close()
        },
        *summarySocket(action, { put, call, select }) {
          const { detail } = yield select(state => state.vppMonitor)
          const { result } = action.payload
          const { results = {} } = result

          yield put({
              type: 'updateState',
              payload: {
                  detail: { ...detail, ...results }
              },
          });
        },
        *siteRunningSocket(action, { put, call, select }) {
            const { site } = yield select(state => state.vppMonitor)
            const { result } = action.payload
            const { results = {} } = result

            for (let i = 0; i < site.length; i++) {
                if (site[i].id === results.stationId) {
                    if (results.data && results.data.length) {
                        let data = _.clone(site)
                        for (let o of results.data) {
                            if (data[i].xData.indexOf(o.dtime) === -1) {
                                data[i].xData = data[i].xData.concat(o.dtime);
                                data[i].yData[0] = data[i].yData[0].concat(o.val);
                            }
                        }
                        yield put({ type: 'updateState', payload: { site: data } });
                    } else {
                        let arr = _.clone(site)
                        arr[i] = { ...arr[i], ...results }
                        yield put({ type: 'updateState', payload: { site: arr } });
                    }
                }
            }
        },
        *powerCurveSocket(action, { put, call }) {
          const { result } = action.payload
          const { results = {} } = result

          if (results.activePower && results.activePower.length) {
              let arr = _.clone(echartListTemp)
              for (let o of results.activePower) {
                  if(arr.xData.indexOf(o.dtime) === -1) {
                      arr.xData = arr.xData.concat(o.dtime)
                  }
                  arr.yData[2] = arr.yData[2].concat(o.val)
              }
              echartListTemp = arr;
              yield put({ type: 'updateState', payload: { echartList: echartListTemp } });
          } else if (results.avlInputPower && results.avlInputPower.length) {
              let arr = _.clone(echartListTemp)
              for (let o of results.avlInputPower) {
                  if(arr.xData.indexOf(o.dtime) === -1) {
                      arr.xData = arr.xData.concat(o.dtime)
                  }
                  arr.yData[1] = arr.yData[1].concat(o.val)
              }
              echartListTemp = arr;
              yield put({ type: 'updateState', payload: { echartList: echartListTemp } });
          } else if (results.avlOutputPower && results.avlOutputPower.length) {
              let arr = _.clone(echartListTemp)
              for (let o of results.avlOutputPower) {
                  if (arr.xData.indexOf(o.dtime) === -1) {
                      arr.xData = arr.xData.concat(o.dtime)
                  }
                  arr.yData[0] = arr.yData[0].concat(o.val)
              }
              echartListTemp = arr;
              yield put({ type: 'updateState', payload: { echartList: echartListTemp } });
          } else if (results.action) {
              switch(results.action) {
                  case 0:
                      yield put({ type: 'updateState', payload: { outType:'', inType:'' } });
                      break;
                  case 1:
                      yield put({ type: 'updateState', payload: {inType:'停止'} });
                      break;
                  case 2:
                      yield put({ type: 'updateState', payload: {outType:'停止'} });
                      break;
                  default:
                      break;
              }
          }
        },
        *getDetail(action, { select,call, put }) {
            const { vppId } = yield select(state => state.allVpp);
            const res = yield Service.getDetail({ id:vppId,dataType:1});
            if (res.results){
                yield put({
                    type: 'updateToView',
                    payload: {detail:res.results}
                });
            }else{
                yield put({
                    type: 'updateToView',
                    payload: {detail:{
                        exportPower: {
                            value: '',
                            unit: 'kW'
                        },
                        importPower: {
                            value: '',
                            unit: 'kW'
                        },
                        dispatchPower: {
                            value: '',
                            unit: 'kW'
                        },
                        dispatchEnergy: {
                            value: '',
                            unit: 'kW'
                        }
                    },}
                });
            }
        },
        *getSite(action, { select,call, put }) {
            const { vppId } = yield select(state => state.allVpp);
            const res = yield Service.getSite({ vppId:vppId});
            for(let o in res.results){
                res.results[o].xData = []
                res.results[o].yData = [[]]
            }
            yield put({
                type: 'updateToView',
                payload: {site:res.results}
            });
        },
        *getCurve(action, { select,call, put }) {
            const { vppId } = yield select(state => state.allVpp);
            const res = yield Service.getCurve({ id:vppId,dataType:1});
            if(res.errorCode === 0){
                switch(res.results.action){
                    case 0:
                        yield put({
                            type: 'updateToView',
                            payload: {outType:'', inType:''}
                        });
                        break;
                    case 1:
                        yield put({
                            type: 'updateToView',
                            payload: {inType:'停止'}
                        });
                        break;
                    case 2:
                        yield put({
                            type: 'updateToView',
                            payload: {outType:'停止'}
                        });
                        break;
                    default:
                        break;
                }
                yield put({
                    type: 'updateToView',
                    payload: {echartList:res.results}
                });
            }else{
                yield put({
                    type: 'updateToView',
                    payload: {echartList:{xData:[],yData:[[],[],[]],series:[{
                        name: '可用输出功率',
                        unit: 'kW'
                       },
                       {
                        name: '可用输入功率',
                        unit: 'kW'
                       },
                       {
                        name: '调度功率',
                        unit: 'kW'
                       }]}}
                });
            }
        },
        *dispatchVpp(action, { select,call, put }) {
            const { vppId } = yield select(state => state.allVpp);
            const {values,actionNumber} = action.payload;
            const res = yield Service.dispatchVpp({ vppId:vppId ,...values, action:actionNumber});
            yield put({
                type: 'updateState',
                payload: {
                    vppModal: false
                },
            });
            yield put({
                type: 'getCurve',
            });
        },
        *deleteVpp(action, { select,call, put }) {
            const { vppId } = yield select(state => state.allVpp);
            const res = yield Service.deleteVpp({ vppId:vppId});
            yield put({
                type: 'getCurve',
            });
        },
        *updateState(action, { call, put }) {
            yield put({
                type: 'updateToView',
                payload: action.payload
            });
        },
    },
};