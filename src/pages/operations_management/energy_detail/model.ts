import {
  getEnergyDetail,
  updateEnergy,
  updateStatus,
  getPlan,
  addPlan,
  updatePlan,
  deletePlan
} from './service';

export default {
  namespace: 'energyDetail',
  state: {
    curEnergy: {},
    planList: [],
    curPlan: {},
    editDisplay: false,
    levelFormDisplay: false,
    formTitle: '',
    record: {},
    page: 1,
    size: 20,
    totalCount: 20,
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
    *getEnergyDetail(action, { put }) {
      const data = yield getEnergyDetail({ ...action.payload });
      yield put({
        type: 'energyManagement/updateToView',
        payload: {
          selectKey: action.payload.id
        }
      });
      yield put({
        type: 'updateToView',
        payload: {
          curEnergy: data.results
        }
      });
    },
    *updateEnergy(action, { put }) {
      yield updateEnergy({ ...action.payload });
      const data = yield getEnergyDetail({ id: action.payload.id });
      yield put({
        type: 'updateToView',
        payload: {
          curEnergy: data.results,
          levelFormDisplay: false
        }
      });
    },
    *updateStatus(action, { put, select }) {
      const { page, size } = yield select(state => state.energyDetail);
      yield updateStatus({ ...action.payload });
      const data = yield getEnergyDetail({ id: action.payload.id });
      yield put({
        type: 'updateToView',
        payload: {
          curEnergy: data.results,
          levelFormDisplay: false
        }
      });
      yield put({
        type: 'getPlan',
        payload: {
          page,
          size,
          deviceId: action.payload.id
        }
      });
    },
    *getPlan(action, { put }) {
      const data = yield getPlan({ ...action.payload });
      yield put({
        type: 'updateToView',
        payload: {
          planList: data.results.results,
          page: action.payload.page,
          size: action.payload.size,
          totalCount: data.results.totalCount
        }
      });
    },
    *addPlan(action, { put, select }) {
      const { selectKey } = yield select(state => state.energyManagement);
      const { page, size } = yield select(state => state.energyDetail);
      yield addPlan({ deviceId: selectKey, ...action.payload });
      yield put({
        type: 'updateToView',
        payload: { editDisplay: false }
      });
      yield put({
        type: 'getPlan',
        payload: {
          page,
          size,
          deviceId: selectKey
        }
      });
      yield put({
        type: 'getEnergyDetail',
        payload: { id: selectKey }
      });
    },
    *updatePlan(action, { put, select }) {
      const { selectKey } = yield select(state => state.energyManagement);
      const { page, size } = yield select(state => state.energyDetail);
      yield updatePlan({ deviceId: selectKey, ...action.payload });
      yield put({
        type: 'getPlan',
        payload: {
          page,
          size,
          deviceId: selectKey
        }
      });
      yield put({
        type: 'updateToView',
        payload: { editDisplay: false }
      });
      yield put({
        type: 'getEnergyDetail',
        payload: { id: selectKey }
      });
    },
    *deletePlan(action, { put, select }) {
      const { selectKey } = yield select(state => state.energyManagement);
      const { page, size } = yield select(state => state.energyDetail);
      yield deletePlan({ ...action.payload });
      yield put({
        type: 'getPlan',
        payload: {
          page,
          size,
          deviceId: selectKey
        }
      });
      yield put({
        type: 'getEnergyDetail',
        payload: { id: selectKey }
      });
    },
  }
}