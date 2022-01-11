/**
 * Created by zhuweifeng on 2019/11/5.
 */

import moment from 'moment';
import { makeModel } from "../../../umi.helper";
import SocketHelper from '../../../socket.helper'
import { Socket_Port } from '../../../constants'
import { formatChartData, formatArrData, formatAbnormalData, sortChartData } from '../../../page.helper'
import utils from '../../../../public/js/utils';
import { FREQUENCY_TYPE } from '../../../constants'

const socket = new SocketHelper('stationMonitor', Socket_Port, '/station-monitoring')

class StationMonitor {
    powerChart = {
        series: [{
            name: utils.intl('实时功率'),
            unit: 'kW'
        }, {
            name: utils.intl('辐照强度'),
            unit: 'W/㎡'
        }]
    }
    detail = {}
    electricAndProfitChart = {
        series: [{
            name: utils.intl('实际发电量'),
            unit: 'kWh'
        },
        {
            name: utils.intl('理论发电量'),
            unit: 'kWh'
        }]
    }
    profitChart = {
        series: [{
            name: utils.intl('电网售电收益'),
            unit: ''
        }]
    }
    CombinerArr = []
    CombinerAbnormal = {}
    InverterArr = []
    InverterAbnormal = {}
    DoubleWindingTransformerArr = []
    DoubleWindingTransformerAbnormal = {}
    electricOptions = 'HH:mm:ss'
    powerOptions = 'HH:mm:ss'
    profitOptions = 'HH:mm:ss'
    electricReFresh = true
    powerReFresh = true
    profitReFresh = true
    weather = {
        "1": utils.intl('晴'),
        "2": utils.intl('雾'),
        "3": utils.intl('雨'),
        "4": utils.intl('云'),
        "5": utils.intl('雪'),
    }
    abnormalObj = {}
    powerSelect = 'detail'
    profitSelect = 'detail'
    electricSelect = 'detail'
    abnormalSum = 0
    stationType = 0
    newStationDetail = {}
    weatherDetail = {}
    socketLoading = {}
}
export default makeModel('stationMonitor', new StationMonitor(), (updateState, updateQuery, getState) => {
    return {
        *reset(action, { select, call, put }) {
            yield put({
                type: 'updateToView',
                payload: new StationMonitor()
            });
        },
        *init(action, { put, call, select }) {
            const { profitSelect, electricSelect, powerSelect } = yield select(state => state.stationMonitor)
            let { stationDetail } = yield select(state => state.global)
            const { dispatch } = action.payload
            let stationType = parseInt(stationDetail?.properties?.FeedinMethod?.name, 10);
            socket.start(dispatch, {
                'summary': 'getSummary',
                'electric_and_profit': 'getElectricAndProfit',
                'power_and_irradiance': 'getPowerAndIrradiance',
                'weather': 'getWeather',
                'abnormal': 'getAbnormal',
                'profit': 'getProfit',
            }, {
                'connect': () => {
                    socket.emit('summary', { stationId: stationDetail?.id })
                    socket.emit('electric_and_profit', { stationId: stationDetail?.id, mod: electricSelect })
                    socket.emit('profit', { stationId: stationDetail?.id, mod: profitSelect })
                    socket.emit('power_and_irradiance', { stationId: stationDetail?.id, mod: powerSelect, frequency: FREQUENCY_TYPE.Original })
                    socket.emit('weather', { stationId: stationDetail?.id })
                    socket.emit('abnormal', { stationId: stationDetail?.id })
                },
                'socketLoadingChange': (socketLoading) => {
                  dispatch({ type: `stationMonitor/updateToView`, payload: { socketLoading } });
                }
            })

            yield put({
                type: 'updateToView',
                payload: {
                    stationType,
                    powerChart: stationType === 0 ?
                        { series: [{ name: utils.intl('实时功率'), unit: 'kW' }, { name: utils.intl('辐照强度'), unit: 'W/㎡' }] } :
                        { series: [{ name: utils.intl('上网功率'), unit: 'kW' }, { name: utils.intl('自发自用功率'), unit: 'kW' }, { name: utils.intl('辐照强度'), unit: 'W/㎡' }] },
                    electricAndProfitChart: stationType === 0 ?
                        { series: [{ name: utils.intl('实际发电量'), unit: 'kWh' }, { name: utils.intl('理论发电量'), unit: 'kWh' }] } :
                        { series: [{ name: utils.intl('上网电量'), unit: 'kWh', stack: true }, { name: utils.intl('自发自用电量'), unit: 'kWh', stack: true }, { name: utils.intl('理论发电量'), unit: 'kWh' }] },
                    profitChart: stationType === 0 ?
                        { series: [{ name: utils.intl('电网售电收益'), unit: utils.intl(stationDetail?.currency) }] } :
                        { series: [{ name: utils.intl('电网售电收益'), unit: utils.intl(stationDetail?.currency), stack: true }, { name: utils.intl('非电网售电收益'), unit: utils.intl(stationDetail?.currency), stack: true }] },
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
        *getDevice(action, { select, call, put }) {
            let { CombinerArr, InverterArr, DoubleWindingTransformerArr } = yield select(state => state.stationMonitor)
            const { result } = action.payload;
            CombinerArr = formatArrData(CombinerArr, result.results.Combiner, 'id')
            let CombinerAbnormal = formatAbnormalData(CombinerArr)
            yield put({
                type: 'updateToView',
                payload: { CombinerArr: CombinerArr, CombinerAbnormal: CombinerAbnormal }
            });
            InverterArr = formatArrData(InverterArr, result.results.Inverter, 'id')
            let InverterAbnormal = formatAbnormalData(InverterArr)
            yield put({
                type: 'updateToView',
                payload: { InverterArr: InverterArr, InverterAbnormal: InverterAbnormal }
            });
            DoubleWindingTransformerArr = formatArrData(DoubleWindingTransformerArr, result.results.SolarTransformer, 'id')
            let DoubleWindingTransformerAbnormal = formatAbnormalData(DoubleWindingTransformerArr)
            yield put({
                type: 'updateToView',
                payload: { DoubleWindingTransformerArr: DoubleWindingTransformerArr, DoubleWindingTransformerAbnormal: DoubleWindingTransformerAbnormal }
            });
        },
        *getSummary(action, { select, call, put }) {
            const { detail } = yield select(state => state.stationMonitor)
            const { result } = action.payload;
            yield put({
                type: 'updateToView',
                payload: {
                    detail: { ...detail, ...result.results }
                },
            });
        },
        *getWeather(action, { select, call, put }) {
            const { weatherDetail } = yield select(state => state.stationMonitor)
            const { result } = action.payload;
            yield put({
                type: 'updateToView',
                payload: {
                    weatherDetail: { ...weatherDetail, ...result.results }
                },
            });
        },
        *getElectricAndProfit(action, { select, call, put }) {
            let { electricAndProfitChart, electricSelect, stationType } = yield select(state => state.stationMonitor)
            const { result } = action.payload;
            if (electricSelect === 'day') {
                electricAndProfitChart = formatChartData(electricAndProfitChart, result.results, stationType === 0 ? ['ongridEnergy', 'electricTheory', 'pr'] : ['ongridEnergy', 'selfConsumptionEnergy', 'electricTheory', 'pr'])
            } else if (electricSelect === 'month') {
                electricAndProfitChart = formatChartData(electricAndProfitChart, result.results, stationType === 0 ? ['ongridEnergy', 'electricTheory', 'pr'] : ['ongridEnergy', 'selfConsumptionEnergy', 'electricTheory', 'pr'])
            } else {
                electricAndProfitChart = formatChartData(electricAndProfitChart, result.results, stationType === 0 ? ['ongridEnergy', 'electricTheory'] : ['ongridEnergy', 'selfConsumptionEnergy', 'electricTheory'])
            }
            electricAndProfitChart = sortChartData(electricAndProfitChart)
            yield put({
                type: 'updateToView',
                payload: { electricAndProfitChart }
            });
        },
        *getProfit(action, { select, call, put }) {
            let { profitChart, profitSelect, stationType } = yield select(state => state.stationMonitor)
            const { result } = action.payload;
            if (profitSelect === 'day') {
                // profitChart = formatChartData(profitChart, result.results, stationType === 0 ? ['ongridEnergy', 'ongridProfit'] : ['ongridEnergy', 'selfConsumptionEnergy', 'ongridProfit', 'nongridProfit'])
                profitChart = formatChartData(profitChart, result.results, stationType === 0 ? ['ongridProfit'] : ['ongridProfit', 'nongridProfit'])
            } else if (profitSelect === 'month') {
                // profitChart = formatChartData(profitChart, result.results, stationType === 0 ? ['ongridEnergy', 'lgcPrice', 'ongridProfit', 'lgcProfit'] : ['ongridEnergy', 'selfConsumptionEnergy', 'lgcPrice', 'ongridProfit', 'nongridProfit', 'lgcProfit'])
                profitChart = formatChartData(profitChart, result.results, stationType === 0 ? ['ongridProfit', 'lgcProfit'] : ['ongridProfit', 'nongridProfit', 'lgcProfit'])
            } else {
                profitChart = formatChartData(profitChart, result.results, stationType === 0 ? ['ongridProfit'] : ['ongridProfit', 'nongridProfit'])
            }
            profitChart = sortChartData(profitChart)
            yield put({
                type: 'updateToView',
                payload: { profitChart }
            });
        },
        *getPowerAndIrradiance(action, { select, call, put }) {
            let { powerChart, stationType } = yield select(state => state.stationMonitor)
            const { result } = action.payload;
            powerChart = formatChartData(powerChart, result.results, stationType === 0 ? ['PVPower', 'irradiance'] : ['PVPower', 'SCPower', 'irradiance'])
            powerChart = sortChartData(powerChart)
            yield put({
                type: 'updateToView',
                payload: { powerChart }
            });
        },
        *getAbnormal(action, { select, call, put }) {
            let { abnormalObj } = yield select(state => state.stationMonitor)
            const { result } = action.payload;
            abnormalObj = { ...abnormalObj, ...result.results }
            let abnormalSum = 0;
            for (let i in abnormalObj) {
                abnormalSum += abnormalObj[i]
            }
            yield put({
                type: 'updateToView',
                payload: { abnormalObj: abnormalObj, abnormalSum }
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
