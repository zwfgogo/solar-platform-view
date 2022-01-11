import Service from './service'
import { getUpdateQuery, makeModel } from '../../../umi.helper'
import { exportFile } from '../../../../util/fileUtil'
import { ExportColumn } from '../../../../interfaces/CommonInterface'
import moment from 'moment';

export class onceDetailModal {
    list = []
    total = 0
    query = {
        page: 1,
        size: 20,
        queryStr: ''
    }
    stationId = null
    oldPowerUnitValue = null
}

export default makeModel('onceDetail', new onceDetailModal(), (updateState, updateQuery, getState) => {
    return {
        *reset(action, { select, call, put }) {
            yield put({
                type: 'updateToView',
                payload: new onceDetailModal()
            });
        },
        * getList(action, { select, call, put }) {
            const { startTime, endTime, powerUnitValue } = yield select(state => state.fmPerformance)
            const { query } = yield select(state => state.onceDetail)
            const res = yield Service.getList({ ...query, startTime: moment(startTime).format('YYYY-MM-DD HH:mm:ss'), endTime: moment(endTime).format('YYYY-MM-DD HH:mm:ss'), powerUnitIds: powerUnitValue })
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
        * onExport(action, { call, put, select }) {
            const { startTime, endTime, powerUnitValue } = yield select(state => state.fmPerformance)
            const { query } = yield select(state => state.onceDetail)
            const res = yield Service.getList({ ...query, startTime: moment(startTime).format('YYYY-MM-DD HH:mm:ss'), endTime: moment(endTime).format('YYYY-MM-DD HH:mm:ss'), powerUnitIds: powerUnitValue })
            exportFile(current_exception_columns, res.results?.results || [])
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
    }
})

export const current_exception_columns: ExportColumn[] = [
    { title: '编号', dataIndex: 'num', key: 'xh', width: '4%' },
    { title: '日期', align: 'center', dataIndex: 'date', key: 'date', width: '7%' },
    { title: '开始时间', align: 'center', dataIndex: 'startTime', key: 'kssj', width: '9%' },
    { title: 'AGC指令（MW）', align: 'right', dataIndex: 'agc', key: 'agczl', width: '10%' },
    { title: '结束时间', align: 'center', dataIndex: 'endTime', key: 'jssj', width: '9%' },
    { title: '开始出力（MW）', align: 'right', dataIndex: 'unitStartPower', key: 'kscl', width: '10%' },
    { title: '结束出力（MW）', align: 'right', dataIndex: 'unitEndPower', key: 'jscl', width: '10%' },
    { title: '合并出力（MW）', align: 'right', dataIndex: 'mergedPower', key: 'hbcl', width: '10%' },
    { title: 'K1', align: 'right', dataIndex: 'k1', key: 'k1', width: '5%' },
    { title: 'K2', align: 'right', dataIndex: 'k2', key: 'k2', width: '5%' },
    { title: 'K3', align: 'right', dataIndex: 'k3', key: 'k3', width: '5%' },
    { title: '单次Kp', align: 'right', dataIndex: 'kp', key: 'dckp', width: '6%' },
    { title: '参与的储能单元', dataIndex: 'energyStorageUnits', key: 'cydcndy', width: '16%' }
]