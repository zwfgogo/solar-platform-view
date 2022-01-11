/**
 * Created by zhuweifeng on 2019/11/5.
 */
import Service from '../services/index';
import {getUpdateQuery} from "../../../umi.helper";
import moment from 'moment';

let d = new Date();
let date = d.getFullYear() + "-" +(d.getMonth() + 1 < 10 ? "0"+(d.getMonth() + 1): (d.getMonth() + 1)) + "-" + (d.getDate() < 10 ? "0"+d.getDate() : d.getDate());
const updateQuery = getUpdateQuery('vppRecord')

class VppRecordModal {
    list = [];
    date = date;
    query = {
        page: 1,
        size: 20,
        queryStr: '',
    };
    startDate = moment().format('YYYY-MM-DD');
    endDate = moment().format('YYYY-MM-DD');
}

export default {
    namespace: 'vppRecord',
    state: new VppRecordModal(),
    reducers: {
        updateToView(state, { payload }) {
            return {
                ...state,
                ...payload,
            }
        },
        _updateState(state, { payload }) {
            return {
                ...state,
                ...payload,
            }
        },
        reset(state, { payload }) {
            return new VppRecordModal();
        }
    },
    effects: {
        *getList(action, { select,call, put }) {
            const { query,actionNum,startDate,endDate } = yield select(state => state.vppRecord);
            const { id,vppId } = yield select(state => state.allVpp);
            const res = yield Service.getList({ id:actionNum ===1 ?vppId:id,...query,dataType:actionNum,startDate:startDate,endDate:endDate });
            yield put({
                type: 'updateToView',
                payload: {list: res.results.results,total: res.results.totalCount}
            });
            yield updateQuery(select, put, {
                page: res.results.page,size: res.results.size
            });
        },
        *updateState(action, { call, put }) {
            yield put({
                type: 'updateToView',
                payload: action.payload
            });
        },
        * stringChange({payload:{queryStr}}, {select, put}) {
            yield updateQuery(select, put, {
                queryStr
            });
        },
        *pageChange({payload:{page, size}}, {select, put}) {
            yield updateQuery(select, put, {
                page,
                size,
            });
            yield put({
                type: 'getList',
            });
        },
    },
};