/**
 * Created by zhuweifeng on 2019/11/5.
 */
import { message } from 'wanke-gui';

export default {
    namespace: 'price',
    state: {
        TabNum:"1",
        id:'',
        priceType:''
    },
    reducers: {
        updateToView(state, { payload }) {
            return {
                ...state,
                ...payload,
            }
        },
        _updateState(state, {payload}) {
            return {
                ...state,
                ...payload
            }
        }
    },
    effects: {
        *updateState(action, { call, put }) {
            yield put({
                type: 'updateToView',
                payload: action.payload
            });
        },
    },
};