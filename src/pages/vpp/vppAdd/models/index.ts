/**
 * Created by zhuweifeng on 2019/11/5.
 */
import Service from '../services/index';
import {getUpdateQuery} from "../../../umi.helper";
import _ from 'lodash';
let d = new Date();
let date = d.getFullYear() + "-" +(d.getMonth() + 1 < 10 ? "0"+(d.getMonth() + 1): (d.getMonth() + 1)) + "-" + (d.getDate() < 10 ? "0"+d.getDate() : d.getDate());
const updateQuery = getUpdateQuery('vppAdd')

class VppAddModal {
    list = [];
    date = date;
    query = {
        // page: 1,
        // size: 20,
        queryStr: '',
    };
    type = '';
    record = {};
    selectedRowKeys = [];
    page = 'addList';
    selectedRows = [];
    title = '';
    siteStatusId = '';
}

export default {
    namespace: 'vppAdd',
    state: new VppAddModal(),
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
                payload: new VppAddModal()
            });
        },
        *getList(action, { select,call, put }) {
            const { selectStatusValue,query } = yield select(state => state.vppAdd);
            const { vppId } = yield select(state => state.allVpp);
            const res = yield Service.getList({ isBind:true,...query,
                vppId:vppId,stationId:sessionStorage.getItem('station-id'),siteStatusId:selectStatusValue });
            yield put({
                type: 'updateToView',
                payload: {list:res.results.results}
            });
        },
        *getAddList(action, { select,call, put }) {
            const { selectStatusValue,query } = yield select(state => state.vppAdd);
            const res = yield Service.getAddList({ isBind:false,stationId:sessionStorage.getItem('station-id'),
                siteStatusId:selectStatusValue,...query });
            yield put({
                type: 'updateToView',
                payload: {list1:res.results.results}
            });
        },
        *save(action, { select,call, put }) {
            const { vppId } = yield select(state => state.allVpp);
            const {stationIdList} = action.payload;
            const res = yield Service.addList({ vppId:vppId,stationIdList:stationIdList,stationId:sessionStorage.getItem('station-id') });
            yield put({
                type: 'updateState',
                payload: {selectedRowKeys:[]}
            });
        },
        *deleteList(action, { select,call, put }) {
            const { vppId } = yield select(state => state.allVpp);
            const {stationIdList} = action.payload;
            const res = yield Service.deleteList({ vppId:vppId,stationIdList:stationIdList.join(','),stationId:sessionStorage.getItem('station-id') });
            yield put({
                type: 'getList',
            });
            yield put({
                type: 'updateState',
                payload: {selectedRowKeys:[]}
            });
        },
        * getSelect(action, {call, put, select}) {
            const { page } = yield select(state => state.vppAdd);
            const res = yield Service.getSelect({
                hasAll: true,
                filter:action.payload.filter
            });
            let hasAll = [{name:'全部',value:''}];
            let resArr = hasAll.concat(res.results)
            yield put({
                type: 'updateToView',
                payload: {selectStatus: resArr, selectStatusValue: resArr[0].value}
            });
            if (page === 'addList'){
                yield put({
                    type: 'getList',
                });
            }else{
                yield put({
                    type: 'getAddList',
                });
            }
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