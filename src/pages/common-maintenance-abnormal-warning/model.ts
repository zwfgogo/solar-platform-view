import Service from './service'
import { getUpdateQuery, makeModel } from "../umi.helper"
import { exportFile } from "../../util/fileUtil"
import utils from "../../public/js/utils";

export class abnormalWarningModal {
    list = []
    total = 0
    radioArr = [{ title: '忽略(无法查询，不通知)', value: 'Ignore', name: 1 },
    { title: '轻微(可查询，不通知)', value: 'Slight', name: 2 },
    { title: '中度(可查询，系统消息通知)', value: 'Moderate', name: 3 },
    { title: '严重(可查询，系统通知+短信通知)', value: 'Serious', name: 4 }]
    query = {
        page: 1,
        size: 20,
        queryStr: ''
    }
    id = ''
    type = ''
    getAlarmLevel = 1
    selectedRowKeys = []
    alarmLevel = []
}

export default makeModel('abnormalWarning', new abnormalWarningModal(), (updateState, updateQuery, getState) => {
    return {
        * getList(action, { select, call, put }) {
            const { query } = yield select(state => state.abnormalWarning)
            const res = yield Service.getList({ ...query, stationId: sessionStorage.getItem('station-id') })
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
        *patchList(action, { call, put }) {
            const res = yield Service.patchList({ ...action.payload, stationId: sessionStorage.getItem('station-id') })
            yield put({
                type: 'updateToView',
                payload: { levelModal: false }
            });
            yield put({
                type: 'getList',
            });
        },
        *enumsAlarmLevel(action, { call, put }) {
            const res = yield Service.enumsAlarmLevel({
                resource: 'alarmLevels',
                hasAll: false,
                property: 'description',
                sort: 'id'
            })
            if (res.results) {
                yield put({
                    type: 'updateToView',
                    payload: { alarmLevel: res.results, getAlarmLevel: res.results[0].value }
                });
            }
            yield put({
                type: 'getList'
            });
        },
        *updateState(action, { call, put }) {
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
        * onExport(action, { call, put, select }) {
            const { query } = yield select(state => state.abnormalWarning)
            const res = yield Service.getList({ queryStr: query.queryStr, stationId: sessionStorage.getItem('station-id') })
            exportFile(getExceptionColumns(), res.results ?.results || [])
        }
    }
})

function getExceptionColumns() {
    return [
        {
            title: utils.intl('异常名称'), dataIndex: 'title', key: 'ycmc', width: '17%',
        },
        {
            title: utils.intl('设备对象'), dataIndex: 'devTitle', key: 'sb', width: '26%'
        },
        {
            title: utils.intl('判断条件'), dataIndex: 'condition', key: 'pdtj', width: '40%',
        },
        {
            title: utils.intl('告警级别'),
            dataIndex: 'alarmLevel',
            key: 'sfxsycgj',
            width: '17%',
            renderE: (text) => text ?.title || ""
        }
    ]
}