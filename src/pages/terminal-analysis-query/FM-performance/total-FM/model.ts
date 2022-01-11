import Service from './service'
import { getUpdateQuery, makeModel } from '../../../umi.helper'
import { exportFile } from '../../../../util/fileUtil'
import { ExportColumn } from '../../../../interfaces/CommonInterface'
import moment from 'moment';

export class totalFMModal {
    conmandOutputChart = {
        series: [{
            name: '',
            unit: 'MW'
        }]
    }
    list = []
    stationId = null
}

export default makeModel('totalFM', new totalFMModal(), (updateState, updateQuery, getState) => {
    return {
        *reset(action, { select, call, put }) {
            yield put({
                type: 'updateToView',
                payload: new totalFMModal()
            });
        },
        * getList(action, { select, call, put }) {
            let { selectedStationId } = yield select(state => state.global)
            const { totalStartDate, totalEndDate } = yield select(state => state.fmPerformance)
            const { conmandOutputChart } = yield select(state => state.totalFM)
            const res = yield Service.getList({ stationId: selectedStationId, startDate: totalStartDate, endDate: totalEndDate })
            yield put({
                type: 'updateToView',
                payload: { list: res?.table || [], conmandOutputChart: res?.results || conmandOutputChart }
            })
        },
        *updateState(action, { call, put }) {
            yield put({
                type: 'updateToView',
                payload: action.payload
            });
        },

    }
})