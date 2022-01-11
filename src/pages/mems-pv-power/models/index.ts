/**
 * Created by zhuweifeng on 2019/11/5.
 */
import Service from '../services/index';
import moment from 'moment';
import { makeModel, getCurve } from "../../umi.helper";
import SocketHelper from '../../socket.helper'
import { formatChartData, sortChartData } from '../../page.helper'
import { Socket_Port } from '../../constants'

import utils from "../../../public/js/utils";

const socket = new SocketHelper('awareness', Socket_Port, '/situational-awareness')

class PowerForecast {
    list = [];
    query = {
        page: 1,
        size: 20,
        queryStr: '',
    };
    vppNameModal = false
    record = {};
    date = (sessionStorage.getItem('timeDate') ? moment(sessionStorage.getItem('timeDate')) : moment()).format('YYYY-MM-DD')
    nowDate = (sessionStorage.getItem('timeDate') ? moment(sessionStorage.getItem('timeDate')) : moment()).format('YYYY-MM-DD')
    defineTomorrowDate = (sessionStorage.getItem('timeDate') ? moment(sessionStorage.getItem('timeDate')).add(1, 'day') : moment().add(1, 'day')).format('YYYY-MM-DD')
    echartList = {
        series: [
            {
                name: utils.intl("powerForecast.预测值"),
                unit: 'kW'
            }]
    }

    forecastType = [{ name: utils.intl("日前预测"), value: 1 }, { name: utils.intl("日内预测"), value: 2 }]
    forecastTypeValue = 1
}

export default makeModel('powerForecast', new PowerForecast(), (updateState, updateQuery, getState) => {
    return {
        *reset(action, { select, call, put }) {
            yield put({
                type: 'updateToView',
                payload: new PowerForecast()
            });
        },
        *init(action, { put, call, select }) {
            const { forecastTypeValue, date, tomorrowDate } = yield select(state => state.powerForecast)
            let { stationDetail } = yield select(state => state.powerForecast)
            const { dispatch } = action.payload
            if (JSON.stringify(stationDetail) === '{}') {
                stationDetail = JSON.parse(sessionStorage.getItem('stationActiveNode'))
            }
            socket.start(dispatch, {
                'message': 'getMessage',
            }, {
                'connect': () => {
                    socket.emit('message', { stationId: stationDetail?.id, predictType: forecastTypeValue, date: forecastTypeValue === 1 ? tomorrowDate : date, frequency: 'original' })
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
        *getMessage(action, { select, call, put }) {
            let { echartList, forecastTypeValue, nowDate, defineTomorrowDate } = yield select(state => state.powerForecast)
            const { results, result } = action.payload;
            if (forecastTypeValue === 1) {
                nowDate = (sessionStorage.getItem('timeDate') ? moment(sessionStorage.getItem('timeDate')).add(1, 'day') : moment().add(1, 'day')).format('YYYY-MM-DD')
            } else {
                nowDate = (sessionStorage.getItem('timeDate') ? moment(sessionStorage.getItem('timeDate')) : moment()).format('YYYY-MM-DD')
            }
            if (nowDate < defineTomorrowDate) {
                echartList = formatChartData(echartList, result.results, ['realValue', 'predictive'])
            } else {
                echartList = formatChartData(echartList, result.results, ['predictive'])
            }
            echartList = sortChartData(echartList)
            yield put({
                type: 'updateToView',
                payload: { echartList: echartList }
            });
        },
        *getCurve(action, { select, call, put }) {
            const { forecastTypeValue, echartList, stationDetail, nowDate, defineTomorrowDate } = yield select(state => state.powerForecast)
            const res = yield Service.getCurve({ predictType: forecastTypeValue, date: nowDate, stationId: stationDetail.id });
            if (nowDate < defineTomorrowDate) {
                yield put({
                    type: 'updateToView',
                    payload: { echartList: sortChartData(formatChartData(echartList, res.results, ['realValue', 'predictive'])) }
                });
            } else {
                yield put({
                    type: 'updateToView',
                    payload: { echartList: sortChartData(formatChartData(echartList, res.results, ['predictive'])) }
                });
            }
        },
        *updateState(action, { call, put }) {
            yield put({
                type: 'updateToView',
                payload: action.payload
            });
        },
    }
})
