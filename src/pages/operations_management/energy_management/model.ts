import { getEnergyList } from './service';
import { history } from 'umi';

export default {
  namespace: 'energyManagement',
  state: {
    energyList: [],
    selectKey: 0,
    page: 1,
    size: 20,
    totalCount: 0,
    totalPage: 0
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
    *getEnergyList(action, { put }) {
      const data = yield getEnergyList({ ...action.payload, stationId: sessionStorage.getItem('station-id') });
      yield put({
        type: 'updateToView',
        payload: {
          energyList: data.results.results,
          totalCount: data.results.totalCount,
          totalPage: data.results.totalPage,
          page: action.payload.page,
          size: action.payload.size
        }
      });
    },
    *jumpDetail(action, { put }) {
      yield put({
        type: 'updateToView',
        payload: { ...action.payload }
      });
      history.push('/operation/energy_detail');
    }
  }
}