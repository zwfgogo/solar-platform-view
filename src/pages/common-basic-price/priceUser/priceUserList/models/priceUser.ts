/**
 * Created by zhuweifeng on 2019/11/5.
 */
import Service from '../services/index';
import {getUpdateQuery} from "../../../../umi.helper";

const updateQuery = getUpdateQuery('priceUser')

export default {
    namespace: 'priceUser',
    state: {
        list: [],
        total: 0,
        detailId: '', // lmm test
        query: {
            page: 1,
            size: 20,
            queryStr: '',
        },
    
    },
    reducers: {
        updateToView(state, { payload }) {
            return {
                ...state,
                ...payload,
            }
        },
        _updateState(state, {payload}) {
            return {
                ...state,
                ...payload
            }
        }
    },
    effects: {
        *reset(action, { select, call, put }) {
            yield put({
                type: 'updateToView',
                payload: {
                    query: {
                        page: 1,
                        size: 20,
                        queryStr: '',
                    },
                }
            });
        },
        *updateQuery({payload:{queryStr}}, {select, put}) {
            yield updateQuery(select, put, {
                queryStr
            });
        },
        *getList(action, { call, put, select }) {
            const { query } = yield select(state => state.priceUser);
            const res = yield Service.getList({ ...query });
            yield put({
                type: 'updateToView',
                payload: {list: res.results.results, total: res.results.totalCount}
            });
            yield updateQuery(select, put, {
                page: res.results.page,size: res.results.size
            });
        },
        *del(action, { call, put }) {
            const res = yield Service.del({ id: action.payload.id });
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
        *pageChange({payload:{page, size}}, {select, put}) {
            yield updateQuery(select, put, {
                page,
                size
            });
            yield put({
                type: 'getList',
            });
        },
    },
    subscriptions: {
        setup({ dispatch, history }) {
            return history.listen(({ pathname, query}) => {
                if (pathname === '/basic-data/electricity-price') {
                    dispatch({ type: 'getList', query:query });
                }
            });
        },
    },
};