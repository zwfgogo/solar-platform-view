/**
 * Created by zhuweifeng on 2019/11/5.
 */
import Service from '../services/index';
import {getUpdateQuery} from "../../../umi.helper";
import { message } from 'wanke-gui';

let d = new Date();
let date = d.getFullYear() + "-" +(d.getMonth() + 1 < 10 ? "0"+(d.getMonth() + 1): (d.getMonth() + 1)) + "-" + (d.getDate() < 10 ? "0"+d.getDate() : d.getDate());
const updateQuery = getUpdateQuery('vpp')

class vppModal {
    list=[];
    date=date;
    query = {
        page: 1,
        size: 20,
        queryStr: '',
    };
    vppNameModal=false
    record={};
}

export default {
    namespace: 'vpp',
    state: new vppModal(),
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
        }
    },
    effects: {
        *reset(action, { select,call, put }) {
            yield put({
                type: 'updateToView',
                payload: new vppModal()
            });
        },
        *getList(action, { select,call, put }) {
            const { query } = yield select(state => state.vpp);
            const res = yield Service.getList({ firmId:sessionStorage.getItem('firm-id'),...query });
            yield put({
                type: 'updateToView',
                payload: {list: res.results.results,total: res.results.totalCount}
            });
            yield updateQuery(select, put, {
                page: res.results.page,size: res.results.size
            });
        },
        *deleteRecord(action, { select,call, put }) {
            const {id} = action.payload;
            const res = yield Service.deleteList({ id: id });
            message.success('删除成功')
            yield put({
                type: 'getList',
            });
        },
        *save(action, { select,call, put }) {
            const { modalTitle,record } = yield select(state => state.vpp);
            const {values} = action.payload;
            if (modalTitle === '新增VPP'){
                const res = yield Service.addList({ ...values});
                message.success('新增成功')
            }else {
                const res = yield Service.editList({ ...values,id:record.id});
                message.success('编辑成功')
            }
            yield put({
                type: 'updateToView',
                payload: {vppNameModal: false}
            });
            yield put({
                type: 'getList',
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
    subscriptions: {
        setup({ dispatch, history }) {
            return history.listen(({ pathname, query}) => {
                if (pathname === '/monographic-analysis/vpp') {
                    dispatch({ type: 'getList', query:query });
                }
            });
        },
    },
};