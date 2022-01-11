import Service from './service'
import { getUpdateQuery, makeModel } from '../umi.helper'
import { exportFile } from '../../util/fileUtil'
import { ExportColumn } from '../../interfaces/CommonInterface'
import moment from 'moment';
import SocketHelper from '../socket.helper'
import { Terminal_SocketUrl } from '../../pages/constants'
import { formatArrData, formatAbnormalData, formatChartData, sortChartData } from '../page.helper'
import utils from '../../public/js/utils';
const socket = new SocketHelper('fmMonitoring', Terminal_SocketUrl, '/station-monitoring')

export class fmMonitoringModal {
    conmandOutputChart = {
        series: [{
            name: utils.intl('AGC指令'),
            unit: 'MW'
        },
        {
            name: utils.intl('合并出力'),
            unit: 'MW'
        },
        {
            name: utils.intl('机组出力'),
            unit: 'MW'
        }]
    }
    energyStorageData = []//储能单元状态
    energyStorageStation = []//储能单元数组
    devName = ''
    devCode = ''
    devId = ''
    AGCInstructionData = []
    mergeOutputData = []
    unitOutputData = []
    storageOutput = ''
    open = false
    index: 0
    startTime = moment().add(-25, 'minute')
        .format('HH:mm:ss')
    endTime = moment().add(5, 'minute')
        .format('HH:mm:ss')
    data = []
    powerUnitValue = ''
    stationId = null
    mergeOutput = null
    AGCInstruction = null
    unitOutput = null
    socketLoading = {}
}

export default makeModel('fmMonitoring', new fmMonitoringModal(), (updateState, updateQuery, getState) => {
    return {
        *reset(action, { select, call, put }) {
            yield put({
                type: 'updateToView',
                payload: new fmMonitoringModal()
            });
        },
        *init(action, { put, call, select }) {
            const { dispatch } = action.payload
            const { devId } = yield select(state => state.fmMonitoring)
            const { selectedStation } = yield select(state => state.global)
            socket.start(dispatch, {
                'cruve': 'getCruve',
                'energyUnit-crew': 'getEnergyUnitCrew',
                // 'realtime': 'getRealtime',
                // 'energyUnit-all': 'getEnergyUnitAll',
            }, {
                'connect': () => {
                    socket.emit('cruve', { powerUnitIds: devId, timeZone: selectedStation.timeZone, frequency: 'original' })
                    socket.emit('energyUnit-crew', { powerUnitIds: devId })
                    // socket.emit('energyUnit-all', { stationId: sessionStorage.getItem('station-id') })
                },
                'socketLoadingChange': (socketLoading) => {
                  dispatch({ type: `fmMonitoring/updateToView`, payload: { socketLoading } });
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
        * getCruve(action, { select, call, put }) {
            let { conmandOutputChart, mergeOutput, AGCInstruction, unitOutput } = yield select(state => state.fmMonitoring)
            const { result } = action.payload;
            conmandOutputChart = formatChartData(conmandOutputChart, result.results, ['AGCInstruction', 'mergeOutput', 'unitOutput'])
            let conmandOutput = sortChartData(conmandOutputChart)
            conmandOutput.yData.forEach((element, index) => {
                if (element.length > 0 && index === 0) {
                    element.forEach((o, i) => {
                        if (!o && i > 1) {
                            element[i] = element[i - 1]
                        }
                    });
                    if (element[element.length - 1]) {
                        AGCInstruction = element[element.length - 1].value
                    }
                } else if (element.length > 0 && index === 1) {
                    element.forEach((o, i) => {
                        if (!o && i > 1) {
                            element[i] = element[i - 1]
                        }
                    });
                    if (element[element.length - 1]) {
                        mergeOutput = element[element.length - 1].value
                    }
                } else if (element.length > 0 && index === 2) {
                    element.forEach((o, i) => {
                        if (!o && i > 1) {
                            element[i] = element[i - 1]
                        }
                    });
                    if (element[element.length - 1]) {
                        unitOutput = element[element.length - 1].value
                    }
                }
            });
            yield put({
                type: 'updateToView',
                payload: { conmandOutputChart: conmandOutput, AGCInstruction: AGCInstruction, mergeOutput: mergeOutput, unitOutput: unitOutput }
            });
        },
        * getRealtime(action, { select, call, put }) {
            // let { conmandOutputChart } = yield select(state => state.fmMonitoring)
            const { result } = action.payload;
            // conmandOutputChart = formatChartData(conmandOutputChart, result.results, ['AGCInstruction', 'mergeOutput', 'unitOutput'])
            // let conmandOutput = sortChartData(conmandOutputChart)
            // let mergeOutput, AGCInstruction, unitOutput;
            // conmandOutput.yData.forEach((element, index) => {
            //     if (element.length > 0 && index === 0) {
            //         AGCInstruction = element[element.length - 1]
            //     } else if (element.length > 0 && index === 1) {
            //         mergeOutput = element[element.length - 1]
            //     } else if (element.length > 0 && index === 2) {
            //         unitOutput = element[element.length - 1]
            //     }
            // });
            // yield put({
            //     type: 'updateToView',
            //     payload: { conmandOutputChart: conmandOutput, AGCInstruction: AGCInstruction, mergeOutput: mergeOutput, unitOutput: unitOutput }
            // });
        },
        * getEnergyUnitAll(action, { select, call, put }) {
            let { selectedStationId } = yield select(state => state.global)
            const res = yield Service.getEnergyUnitAll({ stationId: selectedStationId })
            yield put({
                type: 'updateToView',
                payload: { energyStorageData: res?.results || [] }
            });
        },
        * getEnergyUnitCrew(action, { select, call, put }) {
            const { result } = action.payload;
            let { data } = yield select(state => state.fmMonitoring)
            data = formatArrData(data, result.results.energyUnit, 'id')
            yield put({
                type: 'updateToView',
                payload: { data: data }
            });
        },
        * getCrews(action, { select, call, put }) {
            let { selectedStationId } = yield select(state => state.global)
            const res = yield Service.getCrews({ stationId: selectedStationId })
            yield put({
                type: 'updateToView',
                payload: { stationId: selectedStationId, energyStorageStation: res.results, devName: res.results.length > 0 ? res.results[0].name : '', devId: res.results.length > 0 ? res.results[0].value : '' }
            })
            return res.results.length > 0 ? res.results[0].value : ''
        },
        *updateState(action, { call, put }) {
            yield put({
                type: 'updateToView',
                payload: action.payload
            });
        },
    }
})