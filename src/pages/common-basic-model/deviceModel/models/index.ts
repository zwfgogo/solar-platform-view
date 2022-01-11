/**
 * Created by zhuweifeng on 2019/11/5.
 */
import Service from '../services/index';
import { getUpdateQuery, makeModel } from "../../../umi.helper";
import { message } from 'wanke-gui';
import { ExportColumn } from '../../../../interfaces/CommonInterface'
import { exportFile } from '../../../../util/fileUtil'
import utils from '../../../../public/js/utils';

let d = new Date();
let date = d.getFullYear() + "-" + (d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1)) + "-" + (d.getDate() < 10 ? "0" + d.getDate() : d.getDate());

const terminalNumberList = []

for(let i = 2; i <= 35; i++) {
    terminalNumberList.push(
        { name: `${i}`, value: i }
    )
}

export class device {
    list = [];
    date = date;
    query = {
        page: 1,
        size: 20,
        queryStr: '',
    };
    addModal = false
    detailModal = false
    record = {};
    modalTitle = '';
    arr = [1, 1];
    typeId = '';
    terminalNumber = terminalNumberList;
    devProperties = [{ name: '电气设备', value: 1 }, { name: '发电设备', value: 2 }, { name: '用电设备', value: 3 }];
    yesOrNo = [{ name: utils.intl('是'), value: true }, { name: utils.intl('否'), value: false }]
    devicePropertiesArr = [];
    regionsArr = [];
    inputOutputTypesArr = [];
    deviceCategoriesArr = [];
    judgeinputOutput = [];
    judgeReverse = true
}
export default makeModel('deviceModel', new device(), (updateState, updateQuery, getState) => {
    return {
        *reset(action, { select, call, put }) {
            yield put({
                type: 'updateToView',
                payload: new device()
            });
        },
        *getList(action, { select, call, put }) {
            const res = yield Service.getList({});
            yield put({
                type: 'updateToView',
                payload: { list: res.results, operationIds: res.operationIds }
            });
        },
        *getTypeId (action, { select, call, put }) {
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
            const { modalTitle, record, judgeReverse, judgeinputOutput } = yield select(state => state.deviceModel);
            const { values } = action.payload;
            if (values.inputOutputEqual || values.inputOutputEqual === undefined) {
                let res;
                if (modalTitle === '新增设备类型') {
                    res = yield Service.addList({ ...values });
                    message.success(utils.intl('新增成功'))
                } else {
                    res = yield Service.editList({ ...values, id: record.id });
                    message.success(utils.intl('编辑成功'))
                }
                if (res.errorCode === 0) {
                    yield put({
                        type: 'updateToView',
                        payload: { addModal: false }
                    });
                    yield put({
                        type: 'getList',
                    });
                }
            } else {
                console.log(judgeinputOutput)
                if (judgeinputOutput.length === 2) {
                    let res;
                    if (modalTitle === '新增设备类型') {
                        res = yield Service.addList({ ...values });
                        message.success(utils.intl('新增成功'))
                    } else {
                        res = yield Service.editList({ ...values, id: record.id });
                        message.success(utils.intl('编辑成功'))
                    }
                    if (res.errorCode === 0) {
                        yield put({
                            type: 'updateToView',
                            payload: { addModal: false }
                        });
                        yield put({
                            type: 'getList',
                        });
                    }
                } else {
                    message.error(utils.intl('端子输入/输出标志至少均选择一次'))
                }
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
                resource: 'deviceProperties',
                hasAll: false
            })
            const res1 = yield Service.getSelect({
                resource: 'regions',
                hasAll: false
            })
            const res2 = yield Service.getinputOutputTypes({
                terminalNum: 2,
                inputOutputReverse: 'true'
            })
            const res3 = yield Service.getSelect({
                resource: 'deviceCategories',
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
            if (res1 && res1.results) {
                yield put({
                    type: 'updateToView',
                    payload: { devicePropertiesArr: res.results, regionsArr: res1.results, inputOutputTypesArr: res2.results, deviceCategoriesArr: res3.results }
                })
            }
        },
        * getinputOutputTypes(action, { select, call, put }) {
            const { inputOutputReverse, terminalNum } = action.payload;
            const res = yield Service.getinputOutputTypes({
                terminalNum: terminalNum,
                inputOutputReverse: inputOutputReverse
            })
            yield put({
                type: 'updateToView',
                payload: { inputOutputTypesArr: res.results }
            })
        },
        * onExport(action, { call, put, select }) {
            const res = yield Service.getList({});
            exportFile(getDeviceColumns(), res.results)
        }
    }
})

function getDeviceColumns() {
    const device_columns: ExportColumn[] = [
        {
            title: utils.intl('序号'), dataIndex: 'num'
        },
        {
            title: utils.intl('设备性质'), dataIndex: 'devicePropertyTitle'
        },
        {
            title: utils.intl('设备类型ID'), dataIndex: 'name'
        },
        {
            title: utils.intl('设备大类'), dataIndex: 'deviceCategoryTitle',
        },
        {
            title: utils.intl('设备类型'), dataIndex: 'title',
        },
        {
            title: utils.intl('输入/输出端'), dataIndex: 'terminalTitles'
        },
        {
            title: utils.intl('地区标识'),
            dataIndex: 'regionTitles',
        },
    ]
    return device_columns
}