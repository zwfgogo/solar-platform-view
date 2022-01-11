import Service from './service'
import { getUpdateQuery, makeModel } from '../../../umi.helper'
import { exportFile } from '../../../../util/fileUtil'
import { ExportColumn } from '../../../../interfaces/CommonInterface'
import moment from 'moment';
import {current_exception_columns} from '../component/detialColums'
import utils from '../../../../public/js/utils'
export class investigationDetailModal {
    list = []
    total = 0
    query = {
        page: 1,
        size: 20,
        queryStr: ''
    }
    date = moment().subtract(1, 'day')
        .format('YYYY-MM-DD')
    detail = {}
    energyValue = ''
    powerUnitValue = ''
    pageName = 'index'
}

export default makeModel('investigationDetail', new investigationDetailModal(), (updateState, updateQuery, getState) => {
    return {
        *reset(action, { select, call, put }) {
            yield put({
                type: 'updateToView',
                payload: new investigationDetailModal()
            });
        },
        * getList(action, { select, call, put }) {
            const { query,date,powerUnitValue,energyValue } = yield select(state => state.investigationDetail)
            const res = yield Service.getDetailTableSourse({ ...query,powerUnitIds:powerUnitValue,energyUnitIds:energyValue,date:date })
            yield put({
                type: 'updateToView',
                payload: { list: res.results ?.results || []}
            })
            yield updateState(put, {
                total: res.results ?.totalCount
            })
            yield updateQuery(select, put, {
                page: res.results ?.page, size: res.results ?.size
            })
        },
        * getCrews(action, { select, call, put }) {
            const res = yield Service.getCrews({stationId:sessionStorage.getItem('station-id')})
            yield put({
                type: 'updateToView',
                payload: { crews: [{ name: utils.intl('全部'), value: '' }, ...res.results] }
            })

        },
        * getEnergyUnits(action, { select, call, put }) {
            const res = yield Service.getEnergyUnits({resource:'energyUnits',stationId:sessionStorage.getItem('station-id')})
            yield put({
                type: 'updateToView',
                payload: { energyList: [{ name: utils.intl('全部'), value: '' }, ...res.results] }
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
            const { query,date,powerUnitValue,energyValue } = yield select(state => state.investigationDetail)
            const res = yield Service.getDetailTableSourse({ ...query,powerUnitIds:powerUnitValue,energyUnitIds:energyValue,date:date })
            exportFile(current_exception_columns, res.results ?.results || [])
        }
    }
})