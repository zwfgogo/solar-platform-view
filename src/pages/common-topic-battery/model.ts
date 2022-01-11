/**
 * Created by zhuweifeng on 2019/11/5.
 */
import Service from './service';
import moment from 'moment';
import { exportFile } from "../../util/fileUtil"
import { common_battery_analyze } from '../constants';

let d = new Date();
let date = d.getFullYear() + "-" + (d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1)) + "-" + (d.getDate() < 10 ? "0" + d.getDate() : d.getDate());

/**
 * 遍历树结构函数
 */
function traverseTree(treeList, treeResult = [], name = '') {
    if (treeList[0]) {
        if (name) {
            treeResult.push(treeList[0]?.[name])
        } else {
            treeResult.push(treeList[0])
        }
    }
    if (treeList[0]?.children) {
        treeResult = traverseTree(treeList[0]?.children, treeResult, name)
    }
    return treeResult
}

class BatteryModal {
    list = [];
    date = date;
    query = {
        page: 1,
        size: 20,
        queryStr: '',
    };
    pageName = 'temperature';
    startDate = moment().startOf('day').format('YYYY-MM-DD HH:mm');
    endDate = moment().format('YYYY-MM-DD HH:mm');
    stationId = '';
    echartData = {};
    dataType = '';
    tableHeight = 0;
    cascaderStatusValue = []
    cascaderOption = []
    batteryTree = []
    selectStatusValue = ''
    selectOption = {}
    selectedStation = {}
}

export default {
    namespace: common_battery_analyze,
    state: new BatteryModal(),
    reducers: {
        updateToView(state, { payload }) {
            return {
                ...state,
                ...payload,
            }
        }
    },
    effects: {
        *reset(action, { select, call, put }) {
            yield put({
                type: 'updateToView',
                payload: new BatteryModal()
            });
        },
        *getList(action, { select, call, put }) {
            const { selectStatusValue, startDate, endDate, cascaderOption, selectOption } = yield select(state => state[common_battery_analyze]);
            let res;
            let deviceId = cascaderOption.length ? cascaderOption[cascaderOption.length - 1].id : ''
            let deviceType = cascaderOption.length ? cascaderOption[cascaderOption.length - 1].type : ''
            res = yield Service.getList({ extremumTypeId: selectStatusValue, startDate, endDate, deviceId, deviceType, extremumName: selectOption.enname });
            if (res.results) {
                yield put({
                    type: 'updateToView',
                    payload: { echartData: res.results, list: res.table }
                });
            }
        },
        * getSelect(action, { call, put, select }) {
            const res = yield Service.getSelect({
                resource: 'energyBatteryLimit',
                property: 'title,name'
            });
            res.results.forEach(element => {
                element.enname = element.name
                element.name = element.title
            });
            if (res.results.length) {
                yield put({
                    type: 'updateToView',
                    payload: { selectStatus: res.results, selectStatusValue: res.results[0].value, selectOption: res.results[0], pageName: res.results[0].enname }
                });
                yield put({
                    type: 'getCascader',
                    payload: { leafDevice: res.results[0].enname === 'SOC' ? 'BatteryUnit' : 'BatteryCluster' }
                });
            } else {
                yield put({
                    type: 'updateToView',
                    payload: { selectStatus: [], selectStatusValue: null, list: [], echartData: {}, selectOption: {} }
                });
            }
        },
        * getCascader(action, { call, put, select }) {
            const { selectedStationId: stationId } = yield select(state => state.global);
            const { leafDevice, axiosList } = action.payload;
            const res = yield Service.getBatteryTree({
                stationId,
                leafDevice
            });
            if (res.results.length) {
                yield put({
                    type: 'updateToView',
                    payload: { batteryTree: res.results, cascaderStatusValue: traverseTree(res.results, [], 'id'), cascaderOption: traverseTree(res.results) }
                });
                if (!axiosList) {
                    yield put({
                        type: 'getList',
                    });
                }
            } else {
                yield put({
                    type: 'updateToView',
                    payload: { batteryTree: [], cascaderStatusValue: [], list: [], echartData: {} }
                });
            }
        },
        *updateState(action, { call, put }) {
            yield put({
                type: 'updateToView',
                payload: action.payload
            });
        },
        * onExport(action, { call, put, select }) {
            const { selectStatusValue, startDate, endDate, cascaderOption, selectOption } = yield select(state => state[common_battery_analyze]);
            const { selectedStation, time } = yield select(state => state.global);
            let res;
            let timeArr = time.time.split(":");
            let deviceId = cascaderOption.length ? cascaderOption[cascaderOption.length - 1].id : ''
            let deviceType = cascaderOption.length ? cascaderOption[cascaderOption.length - 1].type : ''
            res = yield Service.getList({ extremumTypeId: selectStatusValue, startDate, endDate, deviceId, deviceType, extremumName: selectOption.enname });
            exportFile(action.payload.columns, res.table, [], { filename: selectedStation.title + '_电池分析_' + time.year + time.month + time.day + timeArr[0] + timeArr[1] })
        },
    },

};