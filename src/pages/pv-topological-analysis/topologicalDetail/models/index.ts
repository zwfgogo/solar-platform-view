/**
 * Created by zhuweifeng on 2019/11/5.
 */
import Service from '../services/index';
import { message } from 'wanke-gui';
import moment from 'moment';
import { makeModel, getCurve } from "../../../umi.helper";
import SocketHelper from '../../../socket.helper'
import { Socket_Port } from '../../../../pages/constants'
import { formatArrData } from '../../../page.helper'
import _ from 'lodash'

const socket = new SocketHelper('topologicalDetail', Socket_Port, '/topology-analysis')

class TopologicalDetail {
    list = [];
    query = {
        page: 1,
        size: 20,
        queryStr: '',
    };
    vppNameModal = false
    record = {};
    date = moment().format('YYYY-MM-DD')
    forecastTypeValue = 1
    type = 0
    realArr = []
    electricArr = []
    abnormalArr = []
    deviceDetail = {}
    deviceArr = []
    deviceStatus = ''
    typeArr = []
}

export default makeModel('topologicalDetail', new TopologicalDetail(), (updateState, updateQuery, getState) => {
    return {
        *reset(action, { select, call, put }) {
            yield put({
                type: 'updateToView',
                payload: new TopologicalDetail()
            });
        },
        *init(action, { put, call, select }) {
            const { deviceId, date,type } = yield select(state => state.topologicalDetail)
            let { stationDetail } = yield select(state => state.topologicalDetail)
            const { dispatch } = action.payload
            if(JSON.stringify(stationDetail) === '{}'){
                stationDetail = JSON.parse(sessionStorage.getItem('stationActiveNode'))
            }
            socket.start(dispatch, {
                'electric_current': 'getElectricCurrent',
                'real_data':'getRealData',
                'status':'getStatus',
                'abnormal':'getAbnormal'
            }, {
                    'connect': () => {
                        socket.emit('electric_current', { deviceId: deviceId, stationId: stationDetail.id })
                        socket.emit('real_data', { deviceId: deviceId, type: type })
                        socket.emit('status', { deviceId: deviceId })
                        socket.emit('abnormal', { deviceId: deviceId, stationId: stationDetail.id })
                    }
                })
        },
        *closeSocket() {
            socket.close()
        },
        *emitSocket(action, { put, call }) {
            const { eventName, params = {} } = action.payload
            socket.emit(eventName, params)
        },
        *getElectricCurrent(action, { select, call, put }) {
            let { electricArr } = yield select(state => state.topologicalDetail)
            const { result } = action.payload;
            electricArr = formatArrData(electricArr,result.results.electric_current,'name')
            yield put({
                type: 'updateToView',
                payload: {
                    electricArr: electricArr
                },
            });
        },
        *getRealData(action, { select, call, put }) {
            let { realArr } = yield select(state => state.topologicalDetail)
            const { result } = action.payload;
            realArr = formatArrData(realArr,result.results.real_data,'name')
            yield put({
                type: 'updateToView',
                payload: {
                    realArr: realArr
                },
            });
        },
        *getStatus(action, { select, call, put }) {
            const { result } = action.payload;
            yield put({
                type: 'updateToView',
                payload: {
                    deviceStatus: result.results.status === 5? '离线':'在线'
                },
            });
        },
        *getAbnormal(action, { select, call, put }) {
            let { abnormalArr } = yield select(state => state.topologicalDetail)
            const { result } = action.payload;
            abnormalArr = formatArrData(abnormalArr,result.results,'name')
            yield put({
                type: 'updateToView',
                payload: {
                    abnormalArr: abnormalArr
                },
            });
        },
        *getSelect(action, { select, call, put }) {
            const { deviceTypeId } = yield select(state => state.topologicalDetail)
            const res = yield Service.getSelect({ resource:'terminalTypes',deviceTypeId:deviceTypeId });
            yield put({
                type: 'updateToView',
                payload: {
                    typeArr: res.results,type:res.results[0].value
                },
            });
        },
        *updateState(action, { call, put }) {
            yield put({
                type: 'updateToView',
                payload: action.payload
            });
        },
    }
})