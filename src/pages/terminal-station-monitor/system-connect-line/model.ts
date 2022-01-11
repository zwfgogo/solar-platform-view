import Service from './service'
import { makeModel } from "../../umi.helper"
import utils from '../../../public/js/utils';
import SocketHelper from '../../socket.helper'
import { Socket_Port } from '../../constants'
import _ from 'lodash'

const socket = new SocketHelper('connect-line', Socket_Port, '/system-wiring')

export class connectLineModal {
    parallelNetworkInfo = []
    lineChartOption = {
        legendShow: false,
        series: [{ type: 'line', smooth: false, color: '#56f2ca', name: '充放电功率' }],
        chartPostData: {},
    }
    chartCardVisual = false
    switchCardVisual = false
    dataCardVisual = false
    switchVisual = false
    circleMsg = '未执行'
    circlePercent = 0.01
    chartPostData = {}
    sbName = ''
    svgData = {}
    switchValue = 0
    fullScreen = false
    svgPath = ''
    pwd = ''
    dhdb = []//点号对比数组
    dhdbShow = false
    color = ['#08ba9e', '#0091d4', '#e84f68', '#c652cb', '#f29e79', '#7ff041']
    alarmArray = ''
    switchArray = ''
    spinning = false
    svgTime = false
    oldSvgPath = []
    colorArr = [{ name: utils.intl('默认'), value: '#cbe8cd', key: 0 }, { name: utils.intl('明黄'), value: '#feffed', key: 1 }, { name: utils.intl('雅蓝'), value: '#e9fcfe', key: 2 }
        , { name: utils.intl('深灰'), value: '#efefef', key: 3 }, { name: utils.intl('茶色'), value: '#d3b490', key: 4 }, { name: utils.intl('银色'), value: '#e5f5fd', key: 5 }]
    actionKey = 0
    actionColor = '#cbe8cd'
    echartList = { series: [], xData: [], yData: [] }
    valueGather = {}
    deviceDetailModal = false
    deviceCurveModal = false
    devInfo = {}
    alarmList = []
    query = {
        page: 1,
        size: 20,
        queryStr: ''
    }
    total = 0
    svgResult = {}
    pointTitle = ''
    pointValue = ''
    pointName = ''
}

export default makeModel('connect-line', new connectLineModal(), (updateState, updateQuery, getState) => {
    return {
        * analogMap(action, { select, call, put }) {
            const res = yield Service.analogMap({ _analogMap: action.payload._analogMap });
            return res
        },
        *init(action, { put, call, select }) {
            const { profitSelect, electricSelect, powerSelect } = yield select(state => state.stationMonitor)
            let { stationDetail } = yield select(state => state.global)
            const { dispatch, valueGather } = action.payload
            let stationType = parseInt(stationDetail?.properties?.FeedinMethod?.name, 10);
            socket.start(dispatch, {
                'realtime': 'getRealtime',

            }, {
                'connect': () => {
                    socket.emit('realtime', { pointNumberObj: valueGather })
                }
            })

            yield put({
                type: 'updateToView',
                payload: {
                }
            });
        },
        *getRealtime(action, { put, call, select }) {
            const { result } = action.payload;
            // let res = JSON.parse(result);
            for (let i in result) {
                if (i !== 'errorCode' && i !== 'errorMsg') {
                    if (JSON.stringify(result[i]) !== "{}") {
                        yield put({
                            type: 'objToArr',
                            payload: {
                                obj: result[i],
                                name: i
                            }
                        });
                    }
                }
            }
        },
        *objToArr(action, { put, call, select }) {
            const { name, obj } = action.payload;
            const { svgResult } = yield select(state => state['connect-line'])
            let svgResults = _.clone(svgResult)
            let arr = []
            let svgDataObj = { analogValueArr: {}, disconnectorsValueArr: {}, estimateValueArr: {}, timeStampValueArr: {} };
            Object.assign(svgDataObj[name], obj)
            for (let prop in svgDataObj[name]) {
                arr.push({
                    name: prop,
                    value: svgDataObj[name][prop]
                })
            }
            svgResults[name] = arr;
            yield put({
                type: 'updateToView',
                payload: {
                    svgResult: svgResults,
                    svgData: svgResults
                }
            });
        },
        *closeSocket() {
            socket.close()
        },
        *emitSocket(action, { put, call }) {
            const { eventName, params = {} } = action.payload
            socket.emit(eventName, params)
        },
        *getEchart(action, { call, put }) {
            const { analogArr, dateTime, fix } = action.payload;
            let analogArrRes = analogArr.map(obj => {
                return obj.value
            })
            const res = yield Service.getEchart({ analogArr: analogArr, dateTime: dateTime, frequency: 'original', fix });
            // const res = {results: {
            //         xData: ['2019-10-10 01:20:00', '2019-10-13 03:20:00', '2019-10-25 05:20:00'],
            //         yData: [[1, 5, 3], [2, 6, 9]],
            //         series: [{name: 'kk'}, {name: 'oo'}]
            // }}
            if (res.results) {
                yield put({
                    type: 'updateToView',
                    payload: { echartList: res.results }
                });
            }
        },
        *getTheDotName(action, { call, put }) {
            const { analog } = action.payload;
            const res = yield Service.getTheDotName({ analog: analog });
            // const res = {results:'正向有功总电能'}
            return res.results
        },
        *getRealData(action, { call, put }) {
            const { pointNumber } = action.payload;
            const res = yield Service.getRealData({ pointNumber });
            yield put({
                type: 'updateToView',
                payload: {
                    pointValue: res.results ? res.results.toFixed(2) : ''
                }
            });
        },
        *getDevInfo(action, { call, put }) {
            const { devId } = action.payload;
            const res = yield Service.getDevInfo({ id: devId });
            yield put({
                type: 'updateToView',
                payload: {
                    devInfo: res.results
                }
            });
        },
        *getList(action, { select, call, put }) {
            const { query } = yield select(state => state['connect-line'])
            const { devId } = action.payload;
            const res = yield Service.getList({ ...query, devId });
            const {
                totalCount = 0,
            } = res.results || {};
            yield put({
                type: 'updateToView',
                payload: {
                    alarmList: res.results.results,
                    total: totalCount
                }
            });
        },
        * topologicalRealData(action, { select, call, put }) {
            const { analogArr, breakerArr, switchArr, disconnectorsArr, estimateArr, timeStampArr } = action.payload.valueGather;
            const res = yield Service.topologicalRealData({ analogArr, breakerArr, switchArr, disconnectorsArr, estimateArr, timeStampArr });
            yield put({
                type: 'updateToView',
                payload: {
                    svgData: res
                    //     {analogValueArr:[{name:'10001001310024658',value:50},{name:'10001001310026706',value:1},{name:'10001001310032850',value:20}
                    // ,{name:'10001000310014435',value:-1},{name:'10001002310012304',value:-1}],
                    //     disconnectorsValueArr:[{name:'100090000046',value:1},{name:'100090000030',value:1}]
                    // }
                }
            });
        },
        * pageChange({ payload: { page, size } }, { select, put }) {
            const { devId } = yield select(state => state['connect-line'])
            yield updateQuery(select, put, {
                page,
                size
            })
            yield put({
                type: 'getList',
                payload: {
                    devId
                }
            })
        },
        * updateState(action, { call, put }) {
            yield put({
                type: 'updateToView',
                payload: action.payload
            });
        },
        * sendBreakerCommand(action, { call, put }) {
            console.log('sendBreakerCommand', action.payload)
        },
    }
})
