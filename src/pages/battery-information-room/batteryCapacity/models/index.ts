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

export class batteryCapacity {
    selectArr = []
    batteryArr = [{ name: utils.intl('按电池单元'), value: 'batteryUnit' }, { name: utils.intl('按电池包'), value: 'batteryPack' }, { name: utils.intl('按电池组/簇/串'), value: 'batteryModule' }]
    unitChangeValue = ''
    unitDecayValue = ''
    batteryDecayValue = 'batteryUnit'

    batteryCapacity = {
        xData: [], yData: [[], []], series: [{
            name: utils.intl('平均满充电量'),
            unit: 'kWh'
        },
        {
            name: utils.intl('平均满放电量'),
            unit: 'kWh'
        }]
    }
    decayCapacity = {
        xData: [], yData: [[]], series: [{
            name: " ",
            unit: 'kWh'
        }]
    }
    deviceArr = []
    unitRadioValue = 'kWh'

    startDate = moment().subtract(1, 'year').format('YYYY-MM-DD')
    endDate = moment().subtract(1, 'day').format('YYYY-MM-DD')
    startDecayDate = moment().subtract(1, 'year').format('YYYY-MM-DD')
    endDecayDate = moment().subtract(1, 'day').format('YYYY-MM-DD')

}
export default makeModel('batteryCapacity', new batteryCapacity(), (updateState, updateQuery, getState) => {
    return {
        * reset(action, { put, call }) {
            yield put({ type: 'updateToView', payload: new batteryCapacity() })
        },
        * init(action, { put, call, select }) {

        },
        * getCapacity(action, { select, call, put }) {
            const { unitChangeValue, batteryCapacity, startDate, endDate } = yield select(state => state.batteryCapacity)
            const res = yield Service.getCapacity({ startDate, deviceId: unitChangeValue, endDate });
            yield put({
                type: 'updateToView',
                payload: { batteryCapacity: sortChartData(formatChartData(batteryCapacity, res.results, ['realChargeCapacity', 'realDischargeCapacity'])) }
            });
        },
        * getBatteryCapacity(action, { select, call, put }) {
            const { decayCapacity, batteryDecayValue, unitRadioValue, startDecayDate, endDecayDate, unitDecayValue } = yield select(state => state.batteryCapacity)
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
                    payload: { selectArr: res.results, unitChangeValue: res.results[0].value, unitDecayValue: res.results[0].value }
                });
            } else {
                yield put({
                    type: 'updateToView',
                    payload: { selectArr: [], unitChangeValue: '', unitDecayValue: '', echartData: {} }
                });
            }
        },
        * getStationInfo(action, { call, put, select }) {
            const res = yield Service.getStationInfo({
                id: sessionStorage.getItem('station-id')
            });
            yield put({
                type: 'updateToView',
                payload: {
                    startDate: moment().subtract(30, 'day').format('YYYY-MM-DD'), startDecayDate: moment().subtract(30, 'day').format('YYYY-MM-DD'),
                    endDate: moment().subtract(1, 'day').format('YYYY-MM-DD'), endDecayDate: moment().subtract(1, 'day').format('YYYY-MM-DD')
                }
            });
        },
    }
})