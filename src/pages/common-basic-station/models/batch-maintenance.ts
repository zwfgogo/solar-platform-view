/**
 * Created by zhuweifeng on 2019/11/5.
 */
import * as services from '../station.service'
import { getUpdateQuery, makeModel } from "../../umi.helper";
import { message } from 'wanke-gui';
import utils from '../../../public/js/utils';
import { mergeTreeList } from '../../page.helper'

class stationAcquisition {
    // query = {
    //     page: 1,
    //     size: 20,
    // }
    // total = ''
    // 采集设备
    allCollectDevices = [];
    bindCollectDevices = [];
    collectDevicesBatchList = [];
    analogsQuantityList = [];

    resTree = []
}
export default makeModel('batchMaintenance', new stationAcquisition(), (updateState, updateQuery, getState) => {
    return {
        *getCollectDevicesByDevices(action, { select, call, put }) {
            let res = yield services.getCollectDevices({ ...action.payload, type: "devices" });
            yield put({
                type: 'updateToView',
                payload: { bindCollectDevices: res.results }
            })
        },
        *getCollectDevicesByStation(action, { select, call, put }) {
            let res = yield services.getCollectDevices({ ...action.payload, type: "station" });
            yield put({
                type: 'updateToView',
                payload: { allCollectDevices: res.results }
            })
        },
        *postCollectDevices(action, { select, call, put }) {
            const { modalTitle, record } = yield select(state => state.stationModel);
            const { values } = action.payload;
            yield services.postCollectDevices({ ...values });
        },
        *getTreeTable(action, { select, call, put }) {
            const { deviceId, treeTable } = action.payload;
            let res = yield services.getAnalogsQuantity({ deviceId });
            let res1 = yield services.getCollectDevicesBatch({ deviceId, type: "devices" });
            // let list = {//设备Id:[采集设备]
            //     415715: [
            //         {
            //             "id": 19407,
            //             "name": "PCS07"
            //         },
            //         {
            //             "id": 19407,
            //             "name": "PCS08"
            //         },
            //     ],
            //     413632: [
            //         {
            //             "id": 19407,
            //             "name": "PCS09"
            //         },
            //     ],
            // }
            // let list2 = { //设备ID:采集信号数量
            //     415715: 1888,
            //     413632: 987
            // }
            let resTree = mergeTreeList(mergeTreeList(treeTable, res, 'signalsNum'), res1, 'titleList')
            yield put({
                type: 'updateToView',
                payload: { resTree }
            })
        },
    }
})