/**
 * Created by zhuweifeng on 2019/11/5.
 */
import Service from '../services/index';
import { getUpdateQuery, makeModel } from "../../../umi.helper";
import { message } from 'wanke-gui';
import utils from '../../../../public/js/utils';
import { triggerEvent } from '../../../../util/utils';

let d = new Date();
let date = d.getFullYear() + "-" + (d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1)) + "-" + (d.getDate() < 10 ? "0" + d.getDate() : d.getDate());

const _expandedKeys = o => {
    let expandedKeys = []
    o.map((v, i) => {
        if (typeof v.children !== 'undefined' && v.children && v.children.length > 0) {
            _expandedKeys(v.children)
        }
        expandedKeys.push(v.key)
    })
    return expandedKeys
}

function formatTree(treeList = []) {
  let list = []
  treeList.forEach(node => {
    let item = { ...node }
    if(node.children) {
      item.disabled = true
      item.children = formatTree(node.children)
    }
    list.push(item)
  })
  return list
}

//定位树位置
let getKeys = '';
const getTreeKeys = (o, id, name) => {
    o.map((v, i) => {
        if (typeof v.children !== 'undefined' && v.children && v.children.length > 0) {
            getKeys = getTreeKeys(v.children,id,name)
        }
        if(v.id === id){
            getKeys = name !== ''?v[name]:v
        }
    })
    return getKeys;
}

export class deviceParameter {
    list = [];
    date = date;
    query = {
        page: 1,
        size: 20,
        queryStr: '',
    };
    canEdit = false;
    defaultExpanded = []
    companyTree = []
    modelId = '';
    treeRecord = {};
    modalTitle = '';
    isSameFirm = true;
    canPublish = true;
}
export default makeModel('deviceParameter', new deviceParameter(), (updateState, updateQuery, getState) => {
    return {
        *reset(action, { select, call, put }) {
            yield put({
                type: 'updateToView',
                payload: new deviceParameter()
            });
        },
        *getList(action, { select, call, put }) {
            const { treeId } = yield select(state => state.deviceParameter);
            const { verId } = yield select(state => state.modelConfig);
            let res;
            if(verId === ''){
                res = yield Service.getList({ modelTypeId: treeId, hasAll: false });
            }else{
                res = yield Service.getList({ modelTypeId: treeId, modelVersionId: verId, hasAll: false });
            }
            yield put({
                type: 'updateToView',
                payload: { list: res.results }
            });
        },
        *deleteRecord(action, { select, call, put }) {
            const { id } = action.payload;
            const res = yield Service.deleteList({ id: id });
            message.success(utils.intl('删除成功'))
            yield put({
                type: 'updateState',
                payload: { canPublish: false }
            });
            yield 
            yield put({
                type: 'getAddVersion',
            });
        },
        *save(action, { select, call, put }) {
            const { treeId,modelVersionId } = yield select(state => state.deviceParameter);
            const { modalTitle,arr,numberType,numberTypeString,record,type } = yield select(state => state.modelConfig);
            const { values } = action.payload;
            let res;
            if (modalTitle === '新增') {
                res = yield Service.addList({ ...values,modelVersionId:modelVersionId,enumValueNum:numberTypeString === 'enum'?arr.length:''});
                message.success(utils.intl('新增成功'))
            } else {
                res = yield Service.editList({ ...values, id: record.id,type:type,enumValueNum:numberTypeString === 'enum'?arr.length:'' });
                message.success(utils.intl('编辑成功'))
            }
            if(res.errorCode === 0){
                yield put({
                    type: 'modelConfig/updateState',
                    payload: { addModal: false, numberTypeString: numberType[0].target }
                });
                yield put({
                    type: 'updateState',
                    payload: { canPublish: false }
                });
                yield put({
                    type: 'getAddVersion',
                });
            }
        },
        *updateState(action, { call, put }) {
            yield put({
                type: 'updateToView',
                payload: action.payload
            });
        },
        *getTree({ payload }, { call, put, select, take }) {
            const { modelType } = yield select(state => state.modelConfig);
            const { modelId } = yield select(state => state.deviceParameter);
            const { queryStr } = payload;
            let type = '';
            if (modelType === '设备') {
                type = 'deviceType'
            } else if (modelType === '能量单元') {
                type = 'energyUnitType'
            } else {
                type = 'stationType'
            }
            const data = yield Service.getTree({ type: type,queryStr:queryStr });
            
            if (data.results && data.results.length) {
                const defaultExpanded = _expandedKeys(data.results)
                const defaultKey = getTreeKeys(data.results,modelId,'key')
                const defaultRecord = getTreeKeys(data.results,modelId,'')
                const defaultId = getTreeKeys(data.results,modelId,'id')
                const defaultIsSameFirm = getTreeKeys(data.results,modelId,'isSameFirm')
                getKeys = ''
                yield updateState(put, {
                    defaultExpanded: defaultExpanded,
                    treeKey: defaultKey,
                    treeRecord: defaultRecord,
                    treeId: defaultId,
                    canEdit: false,
                    isSameFirm: defaultIsSameFirm
                })
                yield put({
                    type: 'selectTree',
                })
            }
            yield updateState(put, {
                companyTree: formatTree(data.results),
            })
        },
        *selectTree(action, { call,select, put,take }) {
            const { treeId } = yield select(state => state.deviceParameter);
            if(treeId !== ''){
                yield put({
                    type: 'modelConfig/getVerList',
                })
                yield take('modelConfig/getVerList/@@end')
                yield put({
                    type: 'getList',
                })
                yield put({
                    type: 'addVersion',
                })
            }
            // 布局改变 触发resize事件 保证table高度正确
            setTimeout(() => {
              triggerEvent('resize', window)
            }, 40)
        },
        *moveRow(action, { call,select, put,take }) {
            const { listArr } = action.payload;
            const { treeId,modelVersionId } = yield select(state => state.deviceParameter);
            const res = yield Service.moveRow({ attribute: listArr,modelTypeId: treeId, modelVersionId: modelVersionId });
            if(res.errorCode === 0){
                yield put({
                    type: 'getAddVersion',
                });
            }
        },
        *addVersion(action, { call,select, put }) {
            const { verId } = yield select(state => state.modelConfig);
            const { treeId } = yield select(state => state.deviceParameter);
            const res = yield Service.addVersion({ modelTypeId: treeId,originalVersionId: verId });
            yield put({
                type: 'updateState',
                payload: { modelVersionId: res.results }
            });
            yield put({
                type: 'getAddVersion',
                payload: { modelVersionId: res.results }
            });
        },
        *getAddVersion(action, { call,select, put }) {
            const { modelVersionId } = yield select(state => state.deviceParameter);
            const res = yield Service.getDefaultList({ modelVersionId: modelVersionId, hasAll: false});
            yield put({
                type: 'updateToView',
                payload: { list: res.results }
            });
            yield put({
                type: 'modelConfig/updateToView',
                payload: { numList: res.results }
            });
        },
    }
})
