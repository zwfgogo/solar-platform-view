import { message } from "wanke-gui";
import utils from "../util/utils";
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
    *getTreeData(action, { put, call, select }) {
      const { queryStr, showAllNode } = action.payload;
      const params = {
        userId: sessionStorage.getItem("user-id"),
        title: queryStr
      };
      const res = yield call(Service.getTreeData, params);
      const data = res.results || [];
      const pointList = [];
      let list = formatTree(
        data.filter(item => item.children && item.children.length > 0),
        pointList
      );
      if(showAllNode) {
        const allNode = {
          title: utils.intl('全部'),
          id: 'all',
          key: 'all',
          isClick: true
        }
        list = [{ ...allNode, children: list }];
        pointList.unshift(allNode);
      }
      yield put({
        type: "updateToView",
        payload: { treeData: { list, queryStr }, pointList }
      });
      const { activeKey } = yield select(state => state.stationTree);
      return { treeData: { list, queryStr }, pointList, activeKey };
    }
  }
};
