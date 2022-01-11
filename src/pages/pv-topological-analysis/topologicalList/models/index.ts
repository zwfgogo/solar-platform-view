/**
 * Created by zhuweifeng on 2019/11/5.
 */
import Service from '../services/index';
import moment from 'moment';
import { makeModel } from "../../../umi.helper";
import SocketHelper from '../../../socket.helper'
import { Socket_Port } from '../../../../pages/constants'
import { formatArrData } from '../../../page.helper'
import _ from 'lodash'
import utils from '../../../../public/js/utils';

const socket = new SocketHelper('topological', Socket_Port, '/topology-analysis')

// let d = new Date();
// let date = d.getFullYear() + "-" +(d.getMonth() + 1 < 10 ? "0"+(d.getMonth() + 1): (d.getMonth() + 1)) + "-" + (d.getDate() < 10 ? "0"+d.getDate() : d.getDate());
class Topological {
    list = [];
    query = {
        page: 1,
        size: 20,
        queryStr: '',
    };
    vppNameModal = false
    record = {};
    date = moment().format('YYYY-MM-DD')
    TabNum = '1'
    forecastType = [{ name: utils.intl('日前预测'), value: 1 }, { name: utils.intl('日内预测'), value: 2 }]
    forecastTypeValue = 1
    deviceArr = []
    deviceTabArr = []
    detail = {}
    abnormalChart = [
        { name: utils.intl('离线'), value: 0, unit: utils.intl('台') },
        { name: utils.intl('严重'), value: 0, unit: utils.intl('台') },
        { name: utils.intl('中度'), value: 0, unit: utils.intl('台') },
        { name: utils.intl('轻微'), value: 0, unit: utils.intl('台') },
        { name: utils.intl('正常'), value: 0, unit: utils.intl('台') },
    ]
    weather = {
        "1": utils.intl('晴'),
        "2": utils.intl('雾'),
        "3": utils.intl('雨'),
        "4": utils.intl('云'),
        "5": utils.intl('雪'),
    }
}

export default makeModel('topological', new Topological(), (updateState, updateQuery, getState) => {
    return {
        *reset(action, { select, call, put }) {
            yield put({
                type: 'updateToView',
                payload: new Topological()
            });
        },
        *init(action, { put, call, select, take }) {
            const { TabNum } = yield select(state => state.topological)
            let { stationDetail } = yield select(state => state.topological)
            const { dispatch } = action.payload
            if(JSON.stringify(stationDetail) === '{}'){
                stationDetail = JSON.parse(sessionStorage.getItem('stationActiveNode'))
            }
            socket.start(dispatch, {
                'device': 'getDevice',
                'base': 'getBase',
            }, {
                'connect': () => {
                    socket.emit('device', { stationId: stationDetail.id, typeId: TabNum })
                    socket.emit('base', { stationId: stationDetail.id })
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
        *getBase(action, { select, call, put }) {
            const { detail } = yield select(state => state.topological)
            const { result } = action.payload;
            yield put({
                type: 'updateToView',
                payload: {
                    detail: { ...detail, ...result.results }
                },
            });
        },
        *getDevice(action, { select, call, put }) {
            yield put({
                type: 'updateToView',
                payload: {
                    abnormalChart: [
                        { name: utils.intl('离线'), value: 0, unit: utils.intl('台') },
                        { name: utils.intl('严重'), value: 0, unit: utils.intl('台') },
                        { name: utils.intl('中度'), value: 0, unit: utils.intl('台') },
                        { name: utils.intl('轻微'), value: 0, unit: utils.intl('台') },
                        { name: utils.intl('正常'), value: 0, unit: utils.intl('台') },
                    ]
                }
            });
            let { deviceArr, abnormalChart } = yield select(state => state.topological)
            const { result } = action.payload;
            deviceArr = formatArrData(deviceArr, result.results.device, 'id')
            let abnormalArr = _.clone(abnormalChart)
            for (let i of deviceArr) {
                switch (i.WorkStatus) {
                    case 1:
                        abnormalArr[4].value += 1;
                        break;
                    case 2:
                        abnormalArr[3].value += 1;
                        break;
                    case 3:
                        abnormalArr[2].value += 1;
                        break;
                    case 4:
                        abnormalArr[1].value += 1;
                        break;
                    case 5:
                        abnormalArr[0].value += 1;
                        break;
                    default:
                        abnormalArr[4].value += 1;
                }

            }
            yield put({
                type: 'updateToView',
                payload: { deviceArr: deviceArr, abnormalChart: abnormalArr }
            });
        },
        * getDeviceTab(action, { select, call, put }) {
            let { stationDetail } = yield select(state => state.topological)
            if(JSON.stringify(stationDetail) === '{}'){
                stationDetail = JSON.parse(sessionStorage.getItem('stationActiveNode'))
            }
            const res = yield Service.getDeviceTab({ stationId: stationDetail.id });
            yield put({
                type: 'updateToView',
                payload: { deviceTabArr: res.results, TabNum: res.results.length ? res.results[0].id + '' : '' }
            });
            return res.results.length ? res.results[0].id + '' : ''
        },
        * updateState(action, { call, put }) {
            yield put({
                type: 'updateToView',
                payload: action.payload
            });
        },

    }
})