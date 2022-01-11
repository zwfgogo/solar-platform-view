import { getLoadDetail, updateLoad, getBreaker } from './service';
import { load } from '_ssf@0.10.2@ssf/types';

export default {
  namespace: 'loadDetail',
  state: {
    curLoad: {},
    basicFormDisplay: false,
    controlFormDisplay: false,
    record: {},
    breaker: []
  },
  reducers: {
    updateToView(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },
  },
  effects: {
    *getLoadDetail(action, { put }) {
      const data = yield getLoadDetail({ ...action.payload });
      yield put({
        type: 'loadManagement/updateToView',
        payload: { selectKey: action.payload.id }
      });
      yield put({
        type: 'updateToView',
        payload: { curLoad: data.results }
      });
    },
    *updateBasic(action, { call, put, select }) {
      const { curLoad } = yield select(state => state.loadDetail);
      const { loadList } = yield select(state => state.loadManagement);
      yield call(updateLoad, { id: curLoad.id, ...action.payload });
      const temp = JSON.parse(JSON.stringify(loadList));
      temp.find(item => {
        if (item.id === curLoad.id) {
          item.title = action.payload.title;
        }
      });
      yield put({
        type: 'loadManagement/updateToView',
        payload: {
          loadList: temp
        }
      });
      yield put({
        type: 'getLoadDetail',
        payload: { id: curLoad.id }
      });
      yield put({
        type: 'updateToView',
        payload: {
          basicFormDisplay: false
        }
      });
    },
    *updateControl(action, { put, select }) {
      const { curLoad } = yield select(state => state.loadDetail);
      yield updateLoad({ id: curLoad.id, ...action.payload, });
      yield put({
        type: 'getLoadDetail',
        payload: { id: curLoad.id }
      });
      yield put({
        type: 'updateToView',
        payload: {
          controlFormDisplay: false
        }
      });
    },
    *getBreaker(action, { put }) {
      const data = yield getBreaker({ resource: 'devices', deviceTypeId: 908, ...action.payload });
      yield put({
        type: 'updateToView',
        payload: { breaker: data.results }
      });
    },
  }
}