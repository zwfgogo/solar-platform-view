/**
 * Created by zhuweifeng on 2019/11/5.
 */
import Service from '../services/index';
import { getUpdateQuery } from "../../../umi.helper";
import { message } from 'wanke-gui';
import utils from '../../../../public/js/utils';

let d = new Date();
let date = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();

const updateQuery = getUpdateQuery('pricePower')
export default {
    namespace: 'pricePower',
    state: {
        // page:
        active: 'list',
        list: [],
        query: {
            page: 1,
            size: 20,
            queryStr: '',
        },
        total: 0,
        visible: false,
        detailId: '',
        record: {}, // 编辑的行数据
        pricesBind: false
    },
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
        *updateQuery({ payload: { queryStr } }, { select, put }) {
            yield updateQuery(select, put, {
                queryStr
            });
        },
        *getList(action, { call, put, select }) {
            const { query } = yield select(state => state.pricePower);
            const res = yield Service.getList({ ...query });
            yield put({
                type: 'updateToView',
                payload: { list: res.results, total: res.totalCount }
            });
            yield updateQuery(select, put, {
                page: res.page, size: res.size
            });
        },
        *$delete(action, { call, put }) {
            const res = yield Service.delPrice({ id: action.payload.id });
            message.success(utils.intl('删除成功'));
            yield put({
                type: 'getList',
            });
        },
        *getIsbind(action, { call, put }) {
            const res = yield Service.getIsbind({ id: action.payload.id, pricesType: '1' });
            yield put({
                type: 'updateToView',
                payload: { pricesBind: res }
            });
        },
        *save(action, { call, put, select, take }) {
            const data = action.payload.values;
            const { values } = data.area;
            data.country = { id: values[0] }
            if (values[1]) {
                data.province = { id: values[1] }
            }
            if (values[2]) {
                data.city = { id: values[2] }
            }
            if (values[3]) {
                data.district = { id: values[3] }
            }
            if (data.id) {
                yield Service.editPrice(data);
            } else {
                yield Service.addPrice(data);
                updateQuery(select, put, {
                    page: 1
                });
            }
            yield put({
                type: 'updateState',
                payload: { visible: false, }
            });
            message.success(utils.intl('保存成功'));
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
        *pageChange({ payload: { page, size } }, { select, put }) {
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
            return history.listen(({ pathname, query }) => {
                if (pathname === '/basic-data/electricity-price') {
                    dispatch({ type: 'getList', payload: { query: '' } });
                }
            });
        },
    },
};