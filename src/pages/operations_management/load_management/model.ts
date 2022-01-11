import { getLoadList, deleteLoad, addLoad, getBreaker } from './service';
import { history } from 'umi';

export default {
  namespace: 'loadManagement',
  state: {
    loadList: [],
    selectKey: 0,
    page: 1,
    size: 20,
    totalCount: 20,
    addFormDisplay: false,
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
    *getLoadList(action, { put, select }) {
      const loadManagement = yield select(state => state.loadManagement);
      action.payload.page = action.payload.page ? action.payload.page : loadManagement.page;
      action.payload.size = action.payload.size ? action.payload.size : loadManagement.size;
      const data = yield getLoadList({ ...action.payload, stationId: sessionStorage.getItem('station-id') });
      yield put({
        type: 'updateToView',
        payload: {
          loadList: data.results.results,
          page: action.payload.page,
          size: action.payload.size,
          totalCount: data.results.totalCount
        }
      });
    },
    *deleteLoad(action, { put, select }) {
      yield deleteLoad({ id: action.payload.id });
      yield put({
        type: 'getLoadList',
        payload: {
          stationId: sessionStorage.getItem('station-id'),
          page: 1
        }
      });
    },
    *addLoad(action, { put, select }) {
      yield addLoad({ stationId: sessionStorage.getItem('station-id'), ...action.payload });
      yield put({
        type: 'getLoadList',
        payload: { stationId: sessionStorage.getItem('station-id') }
      });
      yield put({
        type: 'updateToView',
        payload: {
          addFormDisplay: false,
          page: 1
        }
      });
    },
    *jumpDetail(action, { put }) {
      yield put({
        type: 'updateToView',
        payload: { ...action.payload }
      });
      history.push('/operation/load_detail');
    },
    *getBreaker(action, { put }) {
      const data = yield getBreaker({ resource: 'devices', deviceTypeId: 908 });
      yield put({
        type: 'updateToView',
        payload: { breaker: data.results }
      });
    },
  }
}