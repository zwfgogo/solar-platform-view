/**
 * Created by zhuweifeng on 2019/11/5.
 */
import Service from '../services/index';
import moment from 'moment';
import { makeModel } from "../../../umi.helper";
import SocketHelper from '../../../socket.helper'
import { Socket_Port } from '../../../../pages/constants'
import { formatArrData, formatChartData, oldFormatChartData } from '../../../page.helper'
import _ from 'lodash'
import utils from '../../../../public/js/utils';

export class batteryUniformity {
    unitArr = []
    packArr = []
    batteryArr = []
    selectArr = [{ name: utils.intl('充电过程'), value: 'charge' }, { name: utils.intl('放电过程'), value: 'discharge' }]

    unitValue = null
    packValue = null
    batteryValue = null
    selectProcess = 'charge'

    uniformity = {
        xData: [], yData: [[]], series: [{
            name: "",
            unit: utils.intl('分')
        }]
    }
    uniformity2 = {
        xData: [], yData: [[], [], []], series: [{
            name: utils.intl('最大温升'),
            unit: '℃/min'
        }, {
            name: utils.intl('最小温升'),
            unit: '℃/min'
        }, {
            name: utils.intl('平均温升'),
            unit: '℃/min'
        }]
    }
    uniformity3 = {
        xData: [], yData: [], series: [{
            name: "",
            unit: '℃'
        }]
    }
    startDate = moment().subtract(3, 'day').format('YYYY-MM-DD')
    endDate = moment().subtract(1, 'day').format('YYYY-MM-DD')

    electricReFresh = true
    activeTab = 'temperature'
}

export default makeModel('batteryUniformity', new batteryUniformity(), (updateState, updateQuery, getState) => {
    return {
        * reset(action, { put, call }) {
            yield put({ type: 'updateToView', payload: new batteryUniformity() })
        },
        * init(action, { put, call, select }) {
            yield put({ type: 'getUniformityCurve' });
            yield put({ type: 'getDistributionCurve' });
            yield put({ type: 'getScattarCurve' });
        },
        * getUniformityCurve(action, { select, call, put }) {
            const { activeTab, batteryValue, packValue } = yield select(state => state.batteryUniformity)
            const res = yield Service.getUniformityCurve({ type: activeTab, deviceId: batteryValue ?? packValue });
            yield put({
                type: 'updateToView',
                payload: { uniformity: res.results }
            });
        },
        * getDistributionCurve(action, { select, call, put }) {
            const { uniformity3, startDate, endDate, packValue, batteryValue } = yield select(state => state.batteryUniformity)
            const res = yield Service.getDistributionCurve({ startDate, endDate, deviceId: batteryValue ?? packValue });
            yield put({
                type: 'updateToView',
                payload: { uniformity3: formatChartData(uniformity3, res.results, ['cellTempRange']) }
            });
        },
        * getSelect(action, { call, put, select }) {
            const { stationId } = yield select(state => state.global);
            const res = yield Service.getSelect({
                resource: 'energyUnits',
                stationId
            });
            const res1 = yield Service.getSelect({
                resource: 'batteryClusters',
                energyUnitId: res.results[0].value
            });
            let res2 = { results: [] }
            if (res1.results.length) {
                res2 = yield Service.getPacks({
                    deviceId: res1?.results[0]?.value
                });
            }
            if (res.results.length) {
                yield put({
                    type: 'updateToView',
                    payload: {
                        unitArr: res.results, unitValue: res?.results[0]?.value, packValue: res1?.results[0]?.value,
                        batteryValue: res2?.results[0]?.value, packArr: res1.results, batteryArr: res2.results
                    }
                });
            } else {
                yield put({
                    type: 'updateToView',
                    payload: { unitArr: [], unitValue: '' }
                });
            }
            if (res2.results.length || res.results[0].value) {
                yield put({
                    type: 'init'
                });
            }
        },
        * getPack(action, { call, put, select }) {
            const { unitValue } = yield select(state => state.batteryUniformity);
            const res = yield Service.getSelect({
                resource: 'batteryClusters',
                energyUnitId: unitValue
            });
            if (res.results.length) {
                yield put({
                    type: 'updateToView',
                    payload: { packArr: res.results, packValue: res?.results[0]?.value }
                });
            } else {
                yield put({
                    type: 'updateToView',
                    payload: { packArr: [], packValue: '' }
                });
            }
        },
        * getBattary(action, { call, put, select }) {
            const { packValue } = yield select(state => state.batteryUniformity);
            const res = yield Service.getPacks({
                deviceId: packValue
            });
            if (res.results.length) {
                yield put({
                    type: 'updateToView',
                    payload: { batteryArr: res.results, batteryValue: res?.results[0]?.value }
                });

            }
            // if (packValue || res.results.length) {
            //     yield put({
            //         type: 'init'
            //     });
            // }
        },
        * getStationInfo(action, { call, put, select }) {
            const res = yield Service.getStationInfo({
                id: sessionStorage.getItem('station-id')
            });
            yield put({
                type: 'updateToView',
                payload: {
                    startDate: moment().subtract(30, 'day').format('YYYY-MM-DD'),
                    endDate: moment().subtract(1, 'day').format('YYYY-MM-DD'),
                }
            });
        },
        * getScattarCurve(action, { call, put, select }) {
            const { selectProcess, batteryValue, packValue, uniformity2 } = yield select(state => state.batteryUniformity);
            const res = yield Service.getScattarCurve({
                type: selectProcess,
                deviceId: batteryValue ?? packValue
            });
            let xData = [];
            let newUniformity2 = JSON.parse(JSON.stringify(uniformity2));
            newUniformity2 = oldFormatChartData(uniformity2, res.results, ['maxTempRise', 'minTempRise', 'avgTempRise'])
            if (selectProcess === 'charge') {
                for (let i = 0; i <= 100; i++) {
                    xData.push(i + '%')
                }
            } else {
                for (let i = 100; i >= 0; i--) {
                    xData.push(i + '%')
                }
            }
            newUniformity2.xData = xData
            yield put({
                type: 'updateToView',
                payload: {
                    uniformity2: newUniformity2
                }
            });
        },
    }
})