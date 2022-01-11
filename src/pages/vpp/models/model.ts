/**
 * Created by zhuweifeng on 2019/11/5.
 */

export default {
    namespace: 'allVpp',
    state: {
        id:'',
        vppId:''
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
        *updateState(action, { call, put }) {
            yield put({
                type: 'updateToView',
                payload: action.payload
            });
        },
    },

};