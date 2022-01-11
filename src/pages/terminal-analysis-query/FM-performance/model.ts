import Service from './service'
import { getUpdateQuery, makeModel } from '../../umi.helper'
import { exportFile } from '../../../util/fileUtil'
import { ExportColumn } from '../../../interfaces/CommonInterface'
import moment from 'moment'
import utils from '../../../public/js/utils'
export class fmPerformanceModal {
    list = []
    typeTabArr = [{ title: utils.intl('调频性能统计'), id: '1' }, { title: utils.intl('日维度详细数据'), id: '2' }, { title: utils.intl('小时维度详细数据'), id: '3' }, { title: utils.intl('单次调节详细数据'), id: '4' }]
    TabNum = '1'
    powerUnitValue = ''
    crews = []
    totalStartDate = moment().subtract(29, 'day').format('YYYY-MM-DD')
    totalEndDate = moment().format('YYYY-MM-DD')
    startDate = moment().subtract(29, 'day').format('YYYY-MM-DD')
    endDate = moment().format('YYYY-MM-DD')
    date = moment().format('YYYY-MM-DD')
    startTime = moment(moment().format('YYYY-MM-DD 00:00:00'), 'YYYY-MM-DD HH:mm:ss')
    endTime = moment(moment().format('YYYY-MM-DD 02:00:00'), 'YYYY-MM-DD HH:mm:ss')
    stationId = null
}

export default makeModel('fmPerformance', new fmPerformanceModal(), (updateState, updateQuery, getState) => {
    return {
        *reset(action, { select, call, put }) {
            yield put({
                type: 'updateToView',
                payload: new fmPerformanceModal()
            });
        },
        *updateState(action, { call, put }) {
            yield put({
                type: 'updateToView',
                payload: action.payload
            });
        },
        * getCrews(action, { select, call, put }) {
            let { selectedStationId } = yield select(state => state.global)
            const res = yield Service.getCrews({ stationId: selectedStationId })
            yield put({
                type: 'updateToView',
                payload: { stationId: selectedStationId, crews: res.results, powerUnitValue: res.results.length > 0 ? res.results[0].value : '' }
            })
        },
        *tabChange(action, { call, put, select }) {
            const { params, tabNum, page } = action.payload;
            // const { crews } = yield select(state => state.fmPerformance)
            // if(page === 'day'){
            //     // yield put({
            //     //     type: 'hourDetail/updateToView',
            //     //     payload: {date:params.date}
            //     // });
            // }else if(page === 'total'){
            //     yield put({
            //         type: 'updateToView',
            //         payload: {powerUnitValue:params.id}
            //     });
            // }else if(page === 'hour'){
            //     // yield put({
            //     //     type: 'updateToView',
            //     //     payload: {startTime:moment(moment(params.date).format('YYYY-MM-DD 00:00:00'), 'YYYY-MM-DD HH:mm:ss'),
            //     //     endTime:moment(moment(params.date).format('YYYY-MM-DD 02:00:00'), 'YYYY-MM-DD HH:mm:ss')}
            //     // });
            // }
            yield put({
                type: 'updateToView',
                payload: { TabNum: tabNum, powerUnitValue: params.id, ...params }
            });
        },
    }
})