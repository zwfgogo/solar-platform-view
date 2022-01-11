/**
 * Created by zhuweifeng on 2019/11/5.
 */
import Service from '../services/index';
import {getUpdateQuery,makeModel} from "../../../umi.helper";
import { message } from 'wanke-gui';
import utils from '../../../../public/js/utils';

let d = new Date();
let date = d.getFullYear() + "-" +(d.getMonth() + 1 < 10 ? "0"+(d.getMonth() + 1): (d.getMonth() + 1)) + "-" + (d.getDate() < 10 ? "0"+d.getDate() : d.getDate());

export class contentType{
    list=[];
    date=date;
    query = {
        page: 1,
        size: 20,
        queryStr: '',
    };
    chanceModal=false
    modalTitle=''
    selectId = '';
}
export default makeModel('contentType', new contentType(), (updateState, updateQuery, getState) => {
    return {
        *reset(action, { select,call, put }) {  
            yield put({
                type: 'updateToView',
                payload: new contentType()
            });
        },
        *getList(action, { select,call, put }) {
            const { modelType } = yield select(state => state.modelConfig);
            const { query,selectId } = yield select(state => state.contentType);
            let res;
            if(modelType === '能量单元'){
                res = yield Service.energyUnitDeviceType({ ...query,id:selectId });
            }else{
                res = yield Service.stationEnergyUnitType({ ...query,id:selectId });
            }
            yield put({
                type: 'updateToView',
                payload: {list: res.results}
            });
        },
        *editList(action, { select,call, put }) {
            const { modelType } = yield select(state => state.modelConfig);
            const { id,isUnique,isMustContain} = action.payload;
            const { selectId } = yield select(state => state.contentType);
            let res;
            if(modelType === '能量单元'){
                res = yield Service.editDeviceList({ isMustContain:isMustContain,id:selectId,isUnique:isUnique,deviceTypeId:id });
            }else{
                res = yield Service.editEnergyUnitList({ isMustContain:isMustContain,id:selectId,isUnique:isUnique,energyUnitTypeId:id });
            }
            message.success(utils.intl('修改成功'))
            yield put({
                type: 'getList',
                payload: {id:selectId}
            });
        },
        *getModalList(action, { select,call, put }) {
            const { modelType } = yield select(state => state.modelConfig);
            const { selectId } = yield select(state => state.contentType);
            const { id } = action.payload;
            let res;
            if(modelType === '能量单元'){
                res = yield Service.getDeviceList({isBind:false,energyUnitTypeId:selectId});
            }else{
                res = yield Service.getEnergyUnitList({isBind:false,stationTypeId:selectId});
            }
            yield put({
                type: 'updateToView',
                payload: {modalList: res.results}
            });
        },
        *deleteRecord(action, { select,call, put }) {
            const { selectId } = yield select(state => state.contentType);
            const { modelType } = yield select(state => state.modelConfig);
            const { contentId } = action.payload;
            let res;
            if(modelType === '能量单元'){
                res = yield Service.deleteDeviceType({ deviceTypeIds:contentId,id:selectId });
            }else{
                res = yield Service.deleteEnergyUnitType({ energyUnitTypeIds:contentId,id:selectId });
            }
            message.success(utils.intl('删除成功'))
            yield put({
                type: 'getList',
                payload: {id:selectId}
            });
        },
        *save(action, { select,call, put }) {
            const { selectId } = yield select(state => state.contentType);
            const { modelType } = yield select(state => state.modelConfig);
            const { selectedRowKeys } = action.payload;
            if (modelType === '能量单元'){
                const res = yield Service.addEnergyUnitList({ deviceTypeIds:selectedRowKeys,id:selectId});
                message.success(utils.intl('新增成功'))
            }else {
                const res = yield Service.addStationList({ energyUnitTypeIds:selectedRowKeys,id:selectId});
                message.success(utils.intl('新增成功'))
            }
            yield put({
                type: 'updateToView',
                payload: {chanceModal: false}
            });
            yield put({
                type: 'getList',
                payload: {id:selectId}
            });
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
    }
})
