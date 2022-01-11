import Service from './service'
import { getUpdateQuery, makeModel } from '../../umi.helper'
import { exportFile } from '../../../util/fileUtil'
import { ExportColumn } from '../../../interfaces/CommonInterface'
import moment from 'moment';
import utils from '../../../util/utils'
export class conmandOutputModal {
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
    list = []
    startTime = moment().add(-1, 'hour')
    endTime = moment()
    powerUnitValue = ''
    crews = []
    stationId = null
}

export default makeModel('conmandOutput', new conmandOutputModal(), (updateState, updateQuery, getState) => {
    return {
        *reset(action, { select, call, put }) {
            yield put({
                type: 'updateToView',
                payload: new conmandOutputModal()
            });
        },
        * getList(action, { select, call, put }) {
            const { startTime, endTime, powerUnitValue, conmandOutputChart, crews } = yield select(state => state.conmandOutput)
            let res;
            if (crews.length > 0) {
                res = yield Service.getOutAnaysis({ startTime: moment(startTime).format('YYYY-MM-DD HH:mm:00'), endTime: moment(endTime).format('YYYY-MM-DD HH:mm:00'), powerUnitIds: powerUnitValue, frequency: 'original' })
            }
            res?.results.yData.forEach((element, index) => {
                if (element.length > 0 && index === 0) {
                    element.forEach((o, i) => {
                        if (!o && i >= 1) {
                            element[i] = element[i - 1]
                        }
                    });

                } else if (element.length > 0 && index === 1) {
                    element.forEach((o, i) => {
                        if (!o && i >= 1) {
                            element[i] = element[i - 1]
                        }
                    });

                } else if (element.length > 0 && index === 2) {
                    element.forEach((o, i) => {
                        if (!o && i >= 1) {
                            element[i] = element[i - 1]
                        }
                    });
                }
            });
            yield put({
                type: 'updateToView',
                payload: { list: res?.table || [], conmandOutputChart: res?.results || conmandOutputChart }
            })
        },
        * getCrews(action, { select, call, put }) {
            let { selectedStationId } = yield select(state => state.global)
            const res = yield Service.getCrews({ stationId: selectedStationId })
            if (location.search.indexOf('?') !== -1) {
                yield put({
                    type: 'updateToView',
                    payload: { stationId: selectedStationId, crews: res.results }
                })
            } else {
                yield put({
                    type: 'updateToView',
                    payload: { stationId: selectedStationId, crews: res.results, powerUnitValue: res.results.length > 0 ? res.results[0].value : '' }
                })
            }

        },
        *updateState(action, { call, put }) {
            yield put({
                type: 'updateToView',
                payload: action.payload
            });
        },
        * onExport(action, { call, put, select }) {
            const { startTime, endTime, powerUnitValue } = yield select(state => state.conmandOutput)
            const res = yield Service.getOutAnaysis({ startTime: moment(startTime).format('YYYY-MM-DD HH:mm:00'), endTime: moment(endTime).format('YYYY-MM-DD HH:mm:00'), powerUnitIds: powerUnitValue, frequency: 'original' })
            exportFile(current_exception_columns, res?.table || [])
        }
    }
})

export const current_exception_columns: ExportColumn[] = [
    { title: utils.intl('编号'), dataIndex: 'num', key: 'xh', width: '6%' },
    { title: utils.intl('数据时间'), dataIndex: 'dtime', key: 'sjsj', width: '14%' },
    { title: utils.intl('AGC指令') + '（MW）', align: 'right', dataIndex: 'AGCInstruction', key: 'agczl', width: '20%' },
    { title: utils.intl('合并出力') + '（MW）', align: 'right', dataIndex: 'mergeOutput', key: 'hbcl', width: '20%' },
    { title: utils.intl('导出') + '（MW）', align: 'right', dataIndex: 'unitOutput', key: 'jzcl', width: '20%' },
    { title: utils.intl('机组储能出力出力') + '（MW）', align: 'right', dataIndex: 'energyStorageCapacity', key: 'cncl', width: '20%' }
]
