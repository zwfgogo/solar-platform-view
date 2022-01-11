/**
 * Created by zhuweifeng on 2019/11/5.
 */
import Service from '../services/index';
import {getUpdateQuery} from "../../../umi.helper";

let d = new Date();
let date = d.getFullYear() + "-" +(d.getMonth() + 1 < 10 ? "0"+(d.getMonth() + 1): (d.getMonth() + 1)) + "-" + (d.getDate() < 10 ? "0"+d.getDate() : d.getDate());
const updateQuery = getUpdateQuery('vppEchartDetail')

export default {
    namespace: 'vppEchartDetail',
    state: {
        list:[],
        date:date,
        query: {
            page: 1,
            size: 20,
            queryStr: '',
        },
        detail:{
            exportPower: {
                value: '',
                unit: 'kW'
            },
            importPower: {
                value: '',
                unit: 'kW'
            },
            dispatchPower: {
                value: '',
                unit: 'kW'
            },
            dispatchEnergy: {
                value: '',
                unit: 'kW'
            }
        },
        echartList:[]
    },
    reducers: {
        updateToView(state, { payload }) {
            return {
                ...state,
                ...payload,
            }
        },
        _updateState(state, { payload }) {
            return {
                ...state,
                ...payload,
            }
        }
    },
    effects: {
        *getDetail(action, { select,call, put }) {
            const { id } = yield select(state => state.allVpp);
            const res = yield Service.getDetail({ id:id,dataType:2});
            if (res.results){
                yield put({
                    type: 'updateToView',
                    payload: {detail:res.results}
                });
            }
        },
        *getCurve(action, { select,call, put }) {
            const { id } = yield select(state => state.allVpp);
            const res = yield Service.getCurve({ id:id,dataType:2});
            if(res.errorCode === 0){
                yield put({
                    type: 'updateToView',
                    payload: {echartList:res.results}
                });
            }else{
                yield put({
                    type: 'updateToView',
                    payload: {echartList:[]}
                });
            }
        },
        *updateState(action, { call, put }) {
            yield put({
                type: 'updateToView',
                payload: action.payload
            });
        },
    },
};