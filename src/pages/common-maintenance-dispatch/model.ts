import Service from './service'
import { makeModel } from "../umi.helper"
import { ExportColumn } from "../../interfaces/CommonInterface"
import { exportFile } from "../../util/fileUtil"
import { globalNS } from "../constants"
import { GlobalState } from "../../models/global"
import utils from "../../public/js/utils";

export class DispatchState {
    list = []
    total = 0
    selectStatus = []
    selectStatusValue = ''
    startDate = ''
    endDate = ''
    orderModal = false
    record: any = {}
    type = ''
    query = {
        page: 1,
        size: 20,
        queryStr: ''
    }
    usersArr = []
    stationArr = []
    devicesArr = []
    typeOptions = []

    id = null
    stationId = null
    devId = null
    typeId = null
    userNameProcess = null
    orderName = null
    description = ''

    showDetailDialog = false
}

export default makeModel('dispatch', new DispatchState(), (updateState, updateQuery, getState) => {
    return {
        * getList(action, { select, call, put }) {
            const { query, startDate, endDate, selectStatusValue } = yield select(state => state.dispatch)
            const res = yield Service.getList({
                ...query,
                startDate,
                endDate,
                typeId: selectStatusValue,
                userId: sessionStorage.getItem('user-id')
            })
            yield put({
                type: 'updateToView',
                payload: { list: res.results.results, total: res.results.totalCount }
            })
            yield updateQuery(select, put, {
                page: res.results.page, size: res.results.size
            })
        },
        * getDetail(action, { call, put }) {
            const res = yield Service.getDetail({
                id: action.payload.id
            })
            yield put({
                type: 'updateToView',
                payload: { showDetailDialog: true, record: res.results.results }
            })
        },
        * save(action, { select, call, put }) {
            const state = yield select(state => state.dispatch)
            if (!state.id) {
                yield Service.addOrder({
                    stationId: state.stationId,
                    devId: state.devId,
                    typeId: state.typeId,
                    userNameProcess: state.userNameProcess,
                    orderName: state.orderName,
                    description: state.description,
                    firmId: sessionStorage.getItem('firm-id')
                })
            } else {
                yield Service.editOrder({
                    id: state.id,
                    stationId: state.stationId,
                    devId: state.devId,
                    typeId: state.typeId,
                    userNameProcess: state.userNameProcess,
                    orderName: state.orderName,
                    description: state.description,
                    firmId: sessionStorage.getItem('firm-id')
                })
            }
            yield put({
                type: 'getList'
            })
            yield put({
                type: 'updateToView',
                payload: { orderModal: false }
            })
        },
        * getEnums(action, { call, put, select }) {
            const { firmId }: GlobalState = yield select(state => state[globalNS]);
            const state = yield select(state => state.dispatch)
            const res2 = yield Service.getStationList({
                firmId
            })
            if (res2.results.length) {
                const res = yield Service.usersByFirm({
                    stationId: state.stationId ? state.stationId : res2.results[0].value
                })
                yield put({
                    type: 'updateToView',
                    payload: { usersArr: res.results }
                })
            }
            yield put({
                type: 'updateToView',
                payload: { stationArr: res2.results }
            })
        },
        * getUsersEnums(action, { call, put, select }) {
            const state = yield select(state => state.dispatch)
            const res = yield Service.usersByFirm({
                stationId: state.stationId
            })
            yield put({
                type: 'updateToView',
                payload: { usersArr: res.results, userNameProcess: res?.results[0]?.value }
            })
        },

        * fetchDeviceType(action, { select, put }) {
            let { stationId } = action.payload
            yield updateState(put, { devicesArr: [], devId: null })
            const res = yield Service.getSelect({
                resource: 'devices',
                hasAll: false,
                stationId
            })
            yield updateState(put, { devicesArr: res.results })
            if (res.results.length > 0) {
                yield updateState(put, { devId: res.results[0].value })
            }
        },
        * getSelect(action, { call, put, select }) {
            const res = yield Service.getSelect({
                resource: 'workOrderTypes',
                hasAll: true
            })
            const res1 = yield Service.getSelect({
                resource: 'workOrderTypes',
                hasAll: false
            })
            if (res.results.length) {
                yield put({
                    type: 'updateToView',
                    payload: { selectStatus: res.results, selectStatusValue: res.results[0].value }
                })
                yield updateState(put, { typeOptions: res1.results })
                yield put({
                    type: 'getList'
                })
            }
        },
        * updateState(action, { call, put }) {
            yield put({
                type: 'updateToView',
                payload: action.payload
            })
        },
        * stringChange({ payload: { queryStr } }, { select, put }) {
            yield updateQuery(select, put, {
                queryStr
            })
        },
        * pageChange({ payload: { page, size } }, { select, put }) {
            yield updateQuery(select, put, {
                page,
                size
            })
            yield put({
                type: 'getList'
            })
        },
        * onExport(action, { call, put, select }) {
            const { query, startDate, endDate, selectStatusValue } = yield select(state => state.dispatch)
            const { results } = yield Service.getList({
                queryStr: query.queryStr,
                startDate,
                endDate,
                typeId: selectStatusValue,
                userId: sessionStorage.getItem('user-id')
            })
            exportFile(getExceptionColumns(), results.results)
        }
    }
})

function getExceptionColumns() {
    return [
        {
            title: utils.intl('工单名称'), dataIndex: 'orderName'
        },
        {
            title: utils.intl('工单类型'), dataIndex: 'typeTitle'
        },
        {
            title: utils.intl('电站名称'), dataIndex: 'stationTitle'
        },
        {
            title: utils.intl('设备对象'), dataIndex: 'devTitle'
        },
        {
            title: utils.intl('工单描述'), dataIndex: 'description'
        },
        {
            title: utils.intl('处理人员'), dataIndex: 'userTitleProcess'
        },
        {
            title: utils.intl('发起人'), dataIndex: 'userTitleCreate'
        },
        {
            title: utils.intl('工单状态'), dataIndex: 'statusTitle'
        },
        {
            title: utils.intl('操作时间'), dataIndex: 'latestProcessTime'
        }
    ]
} 
