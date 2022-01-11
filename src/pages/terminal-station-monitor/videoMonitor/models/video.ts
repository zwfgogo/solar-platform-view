/**
 * Created by zhuweifeng on 2019/11/5.
 */
import router from 'umi/router';
import Service from '../services/video';

export default {
    namespace: 'videoMonitor',
    state: {
        videoArr: [
        ],
        videoNum: 4,
        videoWidth: '50%',
        videoHeight: '50%',
        page: 1,
        totalCount: 2,
        oldVideoArr: [
        ],
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
        *init(action, { put, call, select }) {
            const res = yield Service.getVideo({ stationId: sessionStorage.getItem('station-id') });
            yield put({
                type: 'updateToView',
                payload: { videoArr: res.results.results, oldVideoArr: res.results.results, totalCount: res.results.totalCount }
            });
        },
    }
};