/**
 * Created by zhuweifeng on 2019/11/5.
 */
import Service from '../services/index';
import moment from 'moment';
import { makeModel } from "../../../umi.helper";
import SocketHelper from '../../../socket.helper'
import { Socket_Port } from '../../../../pages/constants'
import { formatArrData, formatChartData, sortChartData } from '../../../page.helper'
import _ from 'lodash'
import utils from '../../../../public/js/utils';
const socket = new SocketHelper('topological', Socket_Port, '/topology-analysis')


let a = []
for (let i = 1; i < 25; i++) {
    a.push({ title: '爱搜覅', ActivePower: 100 })
}

export class problemBattery {
    selectArr = []
    unitChangeValue = ''
    unitDecayValue = ''
    batteryDecayValue = 'batteryUnit'

    uniformity = {}
    deviceArr = []
    unitRadioValue = 'kWh'

    startDate = moment().subtract(1, 'year').format('YYYY-MM-DD')
    endDate = moment().subtract(1, 'day').format('YYYY-MM-DD')
    topStartDate = moment().subtract(1, 'day').format('YYYY-MM-DD')
    topEndDate = moment().subtract(1, 'day').format('YYYY-MM-DD')
    scoreEvaluate = {}
    chargingAnalysis = {
        xData: [], yData: [[], [], []], series: [{
            name: utils.intl('电压差'),
            unit: 'V'
        },
        {
            name: utils.intl('SOC'),
            unit: '%'
        }, {
            name: utils.intl('偏离度'),
            unit: '%'
        }]
    }
    dischargingAnalysis = {
        xData: [], yData: [[], [], []], series: [{
            name: utils.intl('电压差'),
            unit: 'V'
        },
        {
            name: utils.intl('SOC'),
            unit: '%'
        }, {
            name: utils.intl('偏离度'),
            unit: '%'
        }]
    }
    typeChangeValue = 'voltage'
    _productionTime = ''
}
export default makeModel('problemBattery', new problemBattery(), (updateState, updateQuery, getState) => {
    return {
        * reset(action, { put, call }) {
            yield put({ type: 'updateToView', payload: new problemBattery() })
        },
        * init(action, { put, call, select }) {
            const { deviceId, type } = action.payload;
            let res;
            if (type === 'Cell') {
                yield put({
                    type: 'updateToView',
                    payload: {
                        topStartDate: moment().subtract(1, 'day').format('YYYY-MM-DD'),
                        topEndDate: moment().subtract(1, 'day').format('YYYY-MM-DD'),
                    }
                });
                res = yield Service.getBatteryInfoHealthScoreEvaluate({
                    deviceId,
                    type: 'Cell',
                });
            } else {
                yield put({
                    type: 'updateToView',
                    payload: {
                        topStartDate: moment().subtract(1, 'year').format('YYYY-MM-DD'),
                        topEndDate: moment().subtract(1, 'day').format('YYYY-MM-DD'),
                    }
                });
                res = yield Service.getBatteryInfoHealthScoreEvaluate({
                    deviceId,
                    type: 'BatteryUnit',
                });
            }
            yield put({
                type: 'updateToView',
                payload: { scoreEvaluate: res.results }
            });
        },
        * getUniformityCurve(action, { select, call, put }) {
            const { typeChangeValue, type, deviceId } = action.payload;
            const { uniformity, topStartDate, topEndDate, startDate, endDate } = yield select(state => state.problemBattery)
            if (type === 'Cell') {
                const res = yield Service.getCellHistory({ type: typeChangeValue, deviceId, startDate: topStartDate, endDate: topEndDate });
                yield put({
                    type: 'updateToView',
                    payload: { uniformity: sortChartData(formatChartData(uniformity, res.results, ['cellTempRange'])) }
                });
            } else {
                const res = yield Service.getUniformityCurve({ type: 'temperature', deviceId, startDate: topStartDate, endDate: topEndDate });
                yield put({
                    type: 'updateToView',
                    payload: { uniformity: sortChartData(formatChartData(uniformity, res.results, ['cellTempRange'])) }
                });
            }
        },
        * getVoltageAnalysis(action, { select, call, put }) {
            const { deviceId, type } = action.payload;
            const { startDate, endDate, chargingAnalysis, dischargingAnalysis } = yield select(state => state.problemBattery)
            const res = yield Service.getChargingEnd({ startDate, deviceId, endDate, type });
            const res1 = yield Service.getDischargeEnd({ startDate, deviceId, endDate, type });
            if (type === 'Cell') {
                yield put({
                    type: 'updateToView',
                    payload: {
                        chargingAnalysis: sortChartData(formatChartData(chargingAnalysis, res.results, ['chargeEndVoltageDiff', 'chargeEndSOC', 'chargeEndVoltageDeviation'])),
                        dischargingAnalysis: sortChartData(formatChartData(dischargingAnalysis, res1.results, ['dischargeEndVoltageDiff', 'dischargeEndSOC', 'dischargeEndVoltageDeviation']))
                    }
                });
            } else {
                yield put({
                    type: 'updateToView',
                    payload: {
                        chargingAnalysis: sortChartData(formatChartData(chargingAnalysis, res.results, ['chargeEndMaxVoltDiff', 'chargeEndVoltSTD', 'chargeEndSOC'])),
                        dischargingAnalysis: sortChartData(formatChartData(dischargingAnalysis, res1.results, ['dischargeEndMaxVoltDiff', 'dischargeEndVoltSTD', 'dischargeEndSOC']))
                    }
                });
            }
        },
        * getBatteryCapacity(action, { select, call, put }) {
            const { decayCapacity, batteryDecayValue, unitRadioValue, startDecayDate, endDecayDate, unitDecayValue } = yield select(state => state.problemBattery)
            const res = yield Service.getBatteryCapacity({
                type: unitRadioValue, deviceType: batteryDecayValue,
                startDate: startDecayDate, endDate: endDecayDate, deviceId: unitDecayValue
            });
            let lineArr = []
            let newDecayCapacity = JSON.parse(JSON.stringify(decayCapacity));
            for (let i = 0; i < res.results.series.length; i++) {
                lineArr.push('line' + i)
            }
            newDecayCapacity = sortChartData(formatChartData(decayCapacity, res.results.results, lineArr))
            newDecayCapacity.series = res.results.series
            yield put({
                type: 'updateToView',
                payload: { decayCapacity: newDecayCapacity }
            });
        },
        * getSelect(action, { call, put, select }) {
            const { stationId } = yield select(state => state.global);
            const res = yield Service.getSelect({
                resource: 'energyUnits',
                stationId
            });

            if (res.results.length) {
                yield put({
                    type: 'updateToView',
                    payload: { selectArr: res.results, unitChangeValue: res.results[0].value }
                });
            } else {
                yield put({
                    type: 'updateToView',
                    payload: { selectArr: [], unitChangeValue: '', echartData: {} }
                });
            }
        },
        * getEnergyUnitsInfo(action, { select, call, put }) {
            const { deviceId } = action.payload;
            const { startDate, topStartDate } = yield select(state => state.problemBattery)
            const res = yield Service.getEnergyUnitsInfo({
                deviceId
            });
            if (startDate < res.results.productionTime) {
                yield put({
                    type: 'updateToView',
                    payload: { startDate: moment(res.results.productionTime).format('YYYY-MM-DD') }
                });
            }
            if (topStartDate < res.results.productionTime) {
                yield put({
                    type: 'updateToView',
                    payload: { topStartDate: moment(res.results.productionTime).format('YYYY-MM-DD') }
                });
            }
            yield put({
                type: 'updateToView',
                payload: { _productionTime: moment(res.results.productionTime).format('YYYY-MM-DD') }
            });
        },
    }
})