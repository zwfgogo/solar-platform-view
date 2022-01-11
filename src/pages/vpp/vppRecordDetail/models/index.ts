/**
 * Created by zhuweifeng on 2019/11/5.
 */
import Service from '../services/index';
import {getUpdateQuery} from "../../../umi.helper";

let d = new Date();
let date = d.getFullYear() + "-" +(d.getMonth() + 1 < 10 ? "0"+(d.getMonth() + 1): (d.getMonth() + 1)) + "-" + (d.getDate() < 10 ? "0"+d.getDate() : d.getDate());
const updateQuery = getUpdateQuery('vppRecordDetail')

export default {
    namespace: 'vppRecordDetail',
    state: {
        list:[],
        date:date,
        query: {
            page: 1,
            size: 20,
            queryStr: '',
        },
        record:{},
        detail:{
            curPower: {
                value: '',
                unit: 'kW'
            },
            maxPower: {
                value: '',
                unit: 'kW'
            },
            avgPower: {
                value: '',
                unit: 'kW'
            },
            dispatchEnergy: {
                value: '',
                unit: 'kW'
            },
            revenue: {
                value: '',
                unit: 'kW'
            }
        },
        actionDetailNum:''
    },
    reducers: {
        updateToView(state, { payload }) {
            return {
                ...state,
                ...payload,
            }
        }
    },
    effects: {
        *getDetail(action, { select,call, put }) {
            const { id,vppId } = yield select(state => state.allVpp);
            const { actionDetailNum,record } = yield select(state => state.vppRecordDetail);
            const res = yield Service.getDetail({ recordId:record.id,id:actionDetailNum === 1 ?vppId :id,dataType:actionDetailNum });
            if (res.results){
                yield put({
                    type: 'updateToView',
                    payload: {detail:res.results}
                });
            }
        },
        *getCurve(action, { select,call, put }) {
            const { actionDetailNum,record } = yield select(state => state.vppRecordDetail);
            const { id,vppId } = yield select(state => state.allVpp);
            const res = yield Service.getCurve({ recordId:record.id,id:actionDetailNum === 1 ?vppId :id,dataType:actionDetailNum});
            yield put({
                type: 'updateToView',
                payload: {echartList:res.results}
            });
        },
        *updateState(action, { call, put }) {
            yield put({
                type: 'updateToView',
                payload: action.payload
            });
        },
    },
};