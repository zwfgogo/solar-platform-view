import Service from './service'
import { getUpdateQuery, makeModel } from '../../../umi.helper'
import { exportFile } from '../../../../util/fileUtil'
import { ExportColumn } from '../../../../interfaces/CommonInterface'
import moment from 'moment';

export class hourDetailModal {
    list = []

    total = 0
    query = {
        page: 1,
        size: 20,
        queryStr: ''
    }
    detail = { adjustTimes: 111 }
    nowOption = {}
    stationId = null
    oldPowerUnitValue = null
}

export default makeModel('hourDetail', new hourDetailModal(), (updateState, updateQuery, getState) => {
    return {
        *reset(action, { select, call, put }) {
            yield put({
                type: 'updateToView',
                payload: new hourDetailModal()
            });
        },
        * getList(action, { select, call, put }) {
            const { date, powerUnitValue } = yield select(state => state.fmPerformance)
            const { query } = yield select(state => state.hourDetail)
            const res = yield Service.getList({ ...query, date: date, powerUnitIds: powerUnitValue })
            yield put({
                type: 'updateToView',
                payload: { list: res.results?.results || [], detail: res?.total }
            })
            if (res.results) {
                yield updateState(put, {
                    total: res.results?.totalCount
                })
                yield updateQuery(select, put, {
                    page: res.results?.page, size: res.results?.size
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
            const { date, powerUnitValue } = yield select(state => state.fmPerformance)
            const { query } = yield select(state => state.hourDetail)
            const res = yield Service.getList({ ...query, date: date, powerUnitIds: powerUnitValue })
            exportFile(current_exception_columns, res.results?.results || [])
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
    }
})

export const current_exception_columns: ExportColumn[] = [
    { title: '编号', dataIndex: 'num', key: 'xh', width: '6%' },
    { title: '日期', dataIndex: 'dtime', key: 'dtime', width: '12%', },
    { title: '调节次数', align: 'right', dataIndex: 'adjustTimes', key: 'adjustTimes', width: '10%' },
    { title: '折返次数', align: 'right', dataIndex: 'foldbackTimes', key: 'foldbackTimes', width: '10%' },
    { title: '调节性能Kpd', align: 'right', dataIndex: 'kp', key: 'kp', width: '14%' },
    { title: '调节深度D（MW）', align: 'right', dataIndex: 'adjustDeep', key: 'adjustDeep', width: '20%' },
    { title: '补偿电量（MWh）', align: 'right', dataIndex: 'compensatoryPower', key: 'compensatoryPower', width: '20%' },
]