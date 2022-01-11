import { message } from "wanke-gui";
import { formatTree } from "../components/common-station-tree/CommonTree";
import Service from "../services/stationTree";

export default {
  namespace: "stationTree",
  state: {
    treeData: {
      queryStr: "",
      list: []
    },
    pointList: [],
    activeKey: null
  },
  reducers: {
    updateToView(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    }
  },
  effects: {
    *reset(action, { put, call, select }) {
      const { treeData } = yield select(state => state.stationTree);
      yield put({
        type: "updateToView",
        payload: { treeData: { ...treeData, queryStr: "" }, activeKey: null }
      });
    },
    *getTreeData(action, { put, call }) {
      const { queryStr } = action.payload;
      const params = {
        firmId: sessionStorage.getItem("firm-id"),
        title: queryStr
      };
      const res = yield call(Service.getTreeData, params);
      const data = res.results || [];
      const pointList = [];
      const list = formatTree(data.filter(item => item.children && item.children.length > 0), pointList);
      yield put({
        type: "updateToView",
        payload: { treeData: { list, queryStr }, pointList }
      });
      return { treeData: { list, queryStr }, pointList };
    }
  }
};
