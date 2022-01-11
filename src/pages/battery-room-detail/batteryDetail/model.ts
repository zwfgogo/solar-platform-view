/**
 * Created by zhuweifeng on 2019/11/5.
 */
import moment from 'moment';
import { makeModel } from "../../umi.helper";
import SocketHelper from '../../socket.helper'
import { Socket_Port } from '../../../pages/constants'
import { sortChartData, formatChartData, extractByKey } from '../../page.helper'
import _ from 'lodash'
import { history } from 'umi'
import { r_d_q, Tree_Type } from '../../../pages/constants';
import utils from '../../../public/js/utils';
import services from './service';
const socket = new SocketHelper('topological', Socket_Port, '/topology-analysis')

export class RoomDetail {
    treeList = []
    dataPointTypeList = []
    valueMap = {}
    pointDataTypeMap = {}
    currentSelectNode: {
        deviceId: null,
        deviceTypeId: null
    }
    selectedTags = []
    selectedValueTags = ['BatteryUnit', 'Cell']
    batteryLevel = [{ name: '电池单元', value: 'BatteryUnit' }, { name: '单体电池', value: 'Cell' }]
    scoreTags = []
    scoreLevel = [{ name: '50分以下', value: '0-50' }, { name: '50-60分', value: '50-60' },
    { name: '60-70分', value: '60-70' }, { name: '70-80分', value: '70-80' },
    { name: '80-90分', value: '80-90' }, { name: '90-100分', value: '90-100' }]
    sortTags = []
    sortLevel = [{ name: '评分从低到高', value: 'asc' }, { name: '评分从高到低', value: 'desc' }]
    batteryList = []
    query = {
        page: 1,
        size: 120,
    }
}

export default makeModel('roomDetail', new RoomDetail(), (updateState, updateQuery, getState) => {
    return {
        * reset(action, { put, call }) {
            yield put({ type: 'updateToView', payload: new RoomDetail() })
        },
        * init({ payload }, { put, call, select }) {

        },
        * fetchDeviceTree({ payload }, { put, call }) {
            const { stationId } = payload;
            const data = yield call(services.fetchDeviceTree, { stationId, activity: true, needCell: false });
            yield updateState(put, {
                treeList: formatTreeList([data.results]),
            });
        },
        * updateCurrentSelectNode({ payload }, { call, put }) {
            const { deviceId, deviceTypeId } = payload;
            yield updateState(put, {
                currentSelectNode: { deviceId, deviceTypeId }
            });
        },
        * getHealth(action, { select, call, put }) {
            const { stationId, deviceId, energyUnitId } = action.payload;
            let { selectedTags, scoreTags, sortTags, scoreLevel, batteryLevel, query } = yield select(state => state.roomDetail)
            const res = yield call(services.getInfoHealthScore, {
                stationId, deviceId, energyUnitId,
                sortType: extractByKey(sortTags || [], 'value'),
                deviceType: selectedTags.length > 0 ? selectedTags.join(',') : extractByKey(batteryLevel || [], 'value'),
                scoreType: scoreTags.length > 0 ? extractByKey(scoreTags || [], 'value') : extractByKey(scoreLevel || [], 'value'),
                ...query
            });
            //分数级别从低到高 例：six是50以下级别 one是90~100分
            yield put({
                type: 'updateToView',
                payload: { batteryList: res.results, total: res.totalCount }
            });
        },
    }
})

// 树格式化 key值格式化成 0-0-1
const formatTreeList = (treeList) => {
    if (!treeList || !treeList.length) {
        return []
    }

    return treeList.map((node, index) => {
        const { children, ...rest } = node
        const type = node.type

        return {
            ...rest,
            // disabled: type == Tree_Type.station || type == Tree_Type.energyUnit,
            children: formatTreeList(children)
        }
    })
}