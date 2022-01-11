import Service from './service';
import { getUpdateQuery } from "../umi.helper";
import moment from 'moment';
import { exportFile } from "../../util/fileUtil"
import { ExportColumn } from "../../interfaces/CommonInterface"
import utils from '../../public/js/utils';

const updateQuery = getUpdateQuery('runRecord')
export default {
    namespace: 'runRecord',
    state: {
        list: [],
        selectStatus: [],
        selectStatusValue: '',
        loading: true,
        startDate: '',
        endDate: '',
        runModal: false,
        record: {},
        type: '',
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
                ...payload
            };
        },
        _updateState(state, { payload }) {
            return {
                ...state,
                ...payload
            }
        }
    },
    effects: {
        * getList(action, { select, call, put }) {
            const { query, startDate, endDate } = yield select(state => state.runRecord);
            const res = yield Service.getList({
                ...query,
                startDate,
                endDate,
                stationId: sessionStorage.getItem('station-id')
            });
            yield put({
                type: 'updateToView',
                payload: { list: res.results.results, total: res.results.totalCount }
            });
            yield updateQuery(select, put, {
                page: res.results.page, size: res.results.size
            });
        },
        * onExport(action, { call, put, select }) {
            const { query, startDate, endDate } = yield select(state => state.runRecord);
            const res = yield Service.getList({
                startDate, endDate, stationId: sessionStorage.getItem('station-id'), queryStr: query.queryStr
            });

            exportFile(runRecordColumn, res.results.results)
        },
        * save(action, { select, call, put }) {
            const { type, id } = yield select(state => state.runRecord);
            if (type === 'new') {
                const res = yield Service.addList({
                    ...action.payload.values, stationId: sessionStorage.getItem('station-id')
                });
            } else {
                const res = yield Service.editList({
                    ...action.payload.values, id: id, stationId: sessionStorage.getItem('station-id')
                });
            }
            yield put({
                type: 'getList',
            });
            yield put({
                type: 'updateToView',
                payload: { runModal: false }
            });
        },
        * getDetail(action, { call, put }) {
            const res = yield Service.getDetail({
                id: action.payload.id,
            });
            yield put({
                type: 'updateToView',
                payload: { record: res.results }
            });
        },
        * deleteRecord(action, { select, call, put }) {
            const { list } = yield select(state => state.runRecord);
            const res = yield Service.deleteList({
                id: action.payload.id,
            });
            if (list.length === 1) {
                yield updateQuery(select, put, {
                    page: 1, size: 20
                });
            }
            yield put({
                type: 'getList',
            });
        },
        * updateState(action, { call, put }) {
            yield put({
                type: 'updateToView',
                payload: action.payload
            });
        },
        * stringChange({ payload: { queryStr } }, { select, put }) {
            yield updateQuery(select, put, {
                queryStr
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
    },
    subscriptions: {
        setup({ dispatch, history }) {
            return history.listen(({ pathname, query }) => {
                if (pathname === '/operation-maintenance/run-analysis') {
                    dispatch({ type: 'getList', query: query });
                }
            });
        },
    },
};

const runRecordColumn: ExportColumn[] = [
    {
        title: utils.intl('日期'), dataIndex: 'date', key: 'date',
        renderE: (value) => value ? moment(value).format('YYYY-MM-DD') : value
    },
    {
        title: utils.intl('主持人'), dataIndex: 'presenter', key: 'presenter',
    },
    {
        title: utils.intl('参加人'), dataIndex: 'parter', key: 'parter',
    },
    {
        title: utils.intl('运行分析译文'), dataIndex: 'analysisTopic', key: 'analysisTopic',
    },
    {
        title: utils.intl('填写人'), dataIndex: 'writer', key: 'writer',
    },
    {
        title: utils.intl('审核人'), dataIndex: 'reviewer', key: 'reviewer',
    }
]