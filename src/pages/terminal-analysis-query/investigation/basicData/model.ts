import Service from './service'
import { getUpdateQuery, makeModel } from '../../../umi.helper'
import { exportFile } from '../../../../util/fileUtil'
import { ExportColumn } from '../../../../interfaces/CommonInterface'
import moment from 'moment';
import { current_exception_columns } from '../component/columns'
import utils from '../../../../public/js/utils'
export class investigationModal {
    list = []
    total = 0
    query = {
        page: 1,
        size: 20,
        queryStr: ''
    }
    startDate = moment().subtract(30, 'day')
        .format('YYYY-MM-DD')
    endDate = moment().subtract(1, 'day')
        .format('YYYY-MM-DD')
    date = moment().subtract(1, 'day')
        .format('YYYY-MM-DD')
    detail = {}
    energyValue = ''
    powerUnitValue = ''
    pageName = 'index'
    stationId = null
}

export default makeModel('investigation', new investigationModal(), (updateState, updateQuery, getState) => {
    return {
        *reset(action, { select, call, put }) {
            yield put({
                type: 'updateToView',
                payload: new investigationModal()
            });
        },
        * getList(action, { select, call, put }) {
            const { query, energyValue, startDate, endDate } = yield select(state => state.investigation)
            const res = yield Service.getTableSourse({ ...query, energyUnitIds: energyValue, startDate: startDate, endDate: endDate })
            yield put({
                type: 'updateToView',
                payload: { list: res.results?.results || [], detail: res?.total || [] }
            })
            yield updateState(put, {
                total: res.results?.totalCount
            })
            yield updateQuery(select, put, {
                page: res.results?.page, size: res.results?.size
            })
        },
        * getEnergyUnits(action, { select, call, put }) {
            let { selectedStationId } = yield select(state => state.global)
            const res = yield Service.getEnergyUnits({ resource: 'energyUnits', stationId: selectedStationId })
            yield put({
                type: 'updateToView',
                payload: { stationId: selectedStationId, energyList: [{ name: utils.intl('全部'), value: '' }, ...res.results] }
            })

        },

        *updateState(action, { call, put }) {
            yield put({
                type: 'updateToView',
                payload: action.payload
            });
        },
        *pageChange({ payload: { page, size } }, { select, put }) {
            yield updateQuery(select, put, {
                page,
                size,
            });
            yield put({
                type: 'getList',
            });
        },
        * onExport(action, { call, put, select }) {
            const { query, energyValue, startDate, endDate } = yield select(state => state.investigation)
            const res = yield Service.getTableSourse({ ...query, energyUnitIds: energyValue, startDate: startDate, endDate: endDate })
            exportFile(current_exception_columns, res.results?.results || [])
        }
    }
})