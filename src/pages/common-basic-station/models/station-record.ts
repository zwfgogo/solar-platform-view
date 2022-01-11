/**
 * Created by zhuweifeng on 2019/11/5.
 */
import * as Service from '../station.service'
import { getUpdateQuery, makeModel } from "../../umi.helper";
import { message } from 'wanke-gui';
import utils from '../../../public/js/utils';

class stationRecord {

}
export default makeModel('stationRecordModel', new stationRecord(), (updateState, updateQuery, getState) => {
    return {
        *reset(action, { select, call, put }) {
            yield put({
                type: 'updateToView',
                payload: new stationRecord()
            });
        },
        * getEnums(action, { select, call, put }) {
            const res = yield Service.getSelect({
                resource: 'maintenanceTypes',
                hasAll: false,
                property: 'name,title'
            })
            let res1 = []
            res.map((o, i) => {
                res1.push({ name: o.title, value: o.name })
            })
            return res1
        },
        *getDeviceCategoriesByDeviceId(action, { select, put, call }) {
            const { deviceId } = action.payload;
            const res = yield Service.getDeviceCategoriesByDeviceId({ deviceId })
            return res
        },
    }
})