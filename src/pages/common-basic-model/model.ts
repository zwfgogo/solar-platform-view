/**
 * Created by zhuweifeng on 2019/11/5.
 */
import { getUpdateQuery, makeModel } from "../umi.helper";
import { message } from 'wanke-gui';
import Service from './servicesGlobal';
import utils from "../../public/js/utils";

export class allDevice {
    TabNum = "1";
    id = '';
    modelType = '设备';
    record = {};
    publishRecord = {};
    addModal = false;
    publishModal = false;
    queryModal = false;
    drawerShow = false;
    arr = [{name:'',value:''}];
    yesOrNo = [{ name: utils.intl('是'), value: true }, { name: utils.intl('否'), value: false }];
    numberType = [{ name: 'int32(整数型)', value: 1 }, { name: 'double(双精度浮点型)', value: 2 }, { name: 'enum(枚举型)', value: 3 }, { name: 'bool(布尔型)', value: 4 }
        , { name: 'text(枚举型)', value: 5 }, { name: 'date(枚举型)', value: 6 }, { name: 'array(枚举型)', value: 7 }];
    numberTypeString = 1;
    elementType = [{ name: 'int32', value: 1 }, { name: 'double', value: 2 }, { name: 'float', value: 3 }, { name: 'text', value: 4 }];
    verList = [];
    verId = '';
    verName = '';
    defaultUnit = [];
    temporalPrecisionType = [];
    numList = [];
}
export default makeModel('modelConfig', new allDevice(), (updateState, updateQuery, getState) => {
    return {
        *reset(action, { select, call, put }) {
            yield put({
                type: 'updateToView',
                payload: new allDevice()
            });
        },
        *updateState(action, { call, put }) {
            yield put({
                type: 'updateToView',
                payload: action.payload
            });
        },
        *getVerList(action, { select, call, put,take }) {
            const { treeId } = yield select(state => state.deviceParameter);
            const res = yield Service.getVerList({ modelTypeId: treeId });
            if (res.results && res.results.length) {
                yield put({
                    type: 'updateToView',
                    payload: { verList: res.results, verId: res.results[0].id, verName: res.results[0].title }
                });
            } else {
                yield put({
                    type: 'updateToView',
                    payload: { verList: res.results, verId: '', verName: '' }
                });
            }
        },
        *publish(action, { select, call, put }) {
            const { treeId,modelVersionId } = yield select(state => state.deviceParameter);
            
            const { values } = action.payload;
            const res = yield Service.publish({ modelTypeId: treeId,draftVersionId:modelVersionId,...values });
            yield put({
                type: 'updateToView',
                payload: { publishModal: false }
            });
            message.success(utils.intl('发布成功'))
            return true
        },
        * getEnums(action, { select, call, put }) {
            // const { record } = yield select(state => state.deviceModel)
            const res = yield Service.getModelAttributeTypes({
                hasAll: false,
            })
            for (let item of res.results) {
                item.target = item.name;
                item.name = item.title;
            }
            const res1 = yield Service.getModelAttributeTypes({
                isBaseType: true,
                hasAll: false,
            })
            const res2 = yield Service.getSelect({
                resource: 'temporalPrecisionType',
                hasAll: false
            })
            let unitArr = [{ name: utils.intl('无'), value: null }]
            const res3 = yield Service.getSelect({
                resource: 'measurementUnit',
                hasAll: false
            })
            unitArr = unitArr.concat(res3.results);
            if (res && res.results) {
                yield put({
                    type: 'updateToView',
                    payload: { numberType: res.results, elementType: res1.results, numberTypeString: res.results[0].target, temporalPrecisionType: res2.results, defaultUnit: unitArr }
                })
            }
        },
    }
})