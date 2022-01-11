/**
 * Created by zhuweifeng on 2019/11/5.
 */
import Service from '../services/index';
import { getUpdateQuery, makeModel } from "../../../umi.helper";
import { message } from 'wanke-gui';
import {ExportColumn} from '../../../../interfaces/CommonInterface'
import {exportFile} from '../../../../util/fileUtil'
import utils from '../../../../public/js/utils';

let d = new Date();
let date = d.getFullYear() + "-" + (d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1)) + "-" + (d.getDate() < 10 ? "0" + d.getDate() : d.getDate());

export class energyUnit {
    list = [];
    date = date;
    query = {
        page: 1,
        size: 20,
        queryStr: '',
    };
    addModal = false
    modalTitle = ''
    record = {};
    typeId = '';
    regionsArr = [];
    detailModal = false;
}
export default makeModel('energyUnitModel', new energyUnit(), (updateState, updateQuery, getState) => {
    return {
        *reset(action, { select, call, put }) {
            yield put({
                type: 'updateToView',
                payload: new energyUnit()
            });
        },
        *getList(action, { select, call, put }) {
            const res = yield Service.getList({});
            yield put({
                type: 'updateToView',
                payload: { list: res.results,operationIds:res.operationIds }
            });
        },
        *getTypeId(action, { select, call, put }) {
            const res = yield Service.getTypeId({ firmId: sessionStorage.getItem('firm-id') });
            yield put({
                type: 'updateToView',
                payload: { typeId: res.results }
            });
        },
        *deleteRecord(action, { select, call, put }) {
            const { id } = action.payload;
            const res = yield Service.deleteList({ id: id });
            message.success(utils.intl('删除成功'))
            yield put({
                type: 'getList',
            });
        },
        *save(action, { select, call, put }) {
            const { modalTitle, record } = yield select(state => state.energyUnitModel);
            const { values } = action.payload;
            let res;
            if (modalTitle === '新增能量单元模型') {
                res = yield Service.addList({ ...values });
                message.success(utils.intl('新增成功'))
            } else {
                res = yield Service.editList({ ...values, id: record.id });
                message.success(utils.intl('编辑成功'))
            }
            if(res.errorCode === 0){
                yield put({
                    type: 'updateToView',
                    payload: { addModal: false }
                });
                yield put({
                    type: 'getList',
                });
            }
        },
        *updateState(action, { call, put }) {
            yield put({
                type: 'updateToView',
                payload: action.payload
            });
        },
        * getEnums(action, { select, call, put }) {
            // const { record } = yield select(state => state.deviceModel)
            const res = yield Service.getSelect({
                resource: 'regions',
                hasAll: false
            })
            // const res2 = yield Service.getSelect({
            //     resource: 'workOrderTypes',
            //     hasAll: false
            // })
            // const res3 = yield Service.getSelect({
            //     resource: 'devices',
            //     hasAll: false,
            //     stationId: record.stationId
            // })
            yield put({
                type: 'updateToView',
                payload: { regionsArr: res.results }
            })
        },
        * onExport(action, { call, put, select }) {
            const res = yield Service.getList({});
            exportFile(getColmns(), res.results)
        }
    }
})

function getColmns() {
    const energyUnit_columns: ExportColumn[] = [
        {
            title: utils.intl('序号'), dataIndex: 'num',
        },
        {
            title: utils.intl('能量单元类型ID'), dataIndex: 'name'
        },
        {
            title: utils.intl('能量单元类型'), dataIndex: 'title'
        },
        {
            title: utils.intl('地区标识'),dataIndex: 'regionTitles'
        },
    ]
    return energyUnit_columns
}