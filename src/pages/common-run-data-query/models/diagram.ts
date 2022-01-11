/**
 * Created by zhuweifeng on 2019/11/5.
 */
import Service from "../services/diagram";
import {t_diagram} from '../../constants'
let d = new Date();
let date =
  d.getFullYear() +
  "-" +
  (d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1) +
  "-" +
  (d.getDate() < 10 ? "0" + d.getDate() : d.getDate());

const getTreeSearchList = (tree: any[]) => {
  let searchList = [];
  tree.forEach(item => {
    const newItem = {
      key: item.key,
      id: item.id,
      typeId: item.typeId,
      activity: item.activity,
      title: item.title
    }
    if(newItem.activity && newItem.typeId) {
      searchList.push(newItem);
    }
    if(item.children) {
      searchList = searchList.concat(getTreeSearchList(item.children));
    }
  });
  return searchList;
}

const treeListAddKey = (tree: any[], parentKey?: string) => {
  tree.forEach((item, index) => {
    item.key = parentKey ? `${parentKey}-${index}` : `${index}`;
    if(!item.typeId || !item.activity) {
      item.selectable = false;
      item.disabled = true;
    }
    if(item.children) {
      treeListAddKey(item.children, item.key);
    }
  });
  return tree;
}

class DiagramModal {
  equipmentTree = [];
  selectKey = "";
  activeKey = "";
  // defaultExpanded = [];
  chartDate = "";
  deviceTypeArr = [];
  date = date;
  echartList = {};
  startDate = date;
  endDate = date;
  queryStr = "";
  treeSearchList = []
}

export default {
  namespace: t_diagram,
  state: {
    ...new DiagramModal()
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
    *reset(action, { call, put, select }) {
      yield put({ type: "updateToView", payload: new DiagramModal() });
    },
    *getTree(action, { call, put, select }) {
      const { queryStr, selectKey, activeKey } = yield select(state => state[t_diagram]);
      const res = yield Service.getTree({
        firmId: sessionStorage.getItem("firm-id"),
        title: queryStr
      });
      const expandedKeys = [];
      let typeId = [];
      let deviceId = [];
      const _expandedKeys = o => {
        o.map((v, i) => {
          if (
            typeof v.children !== "undefined" &&
            v.children &&
            v.children.length > 0
          ) {
            _expandedKeys(v.children);
          }
          expandedKeys.push(v.key);
        });
        return expandedKeys;
      };
      const firstKeys = o => {
        o.map((v, i) => {
          if (
            typeof v.children !== "undefined" &&
            v.children &&
            v.children.length > 0
          ) {
            firstKeys(v.children);
          }
          if (v.typeId) {
            typeId.push(v.typeId);
            deviceId.push(v.id);
          }
        });
        return typeId;
      };
      // const defaultExpanded = _expandedKeys(res.results);
      // const firstDeviceId = firstKeys(res.results);
      // 中间层没有返回key 自行添加key
      const equipmentTree = treeListAddKey(res.results || []);
      const treeSearchList = getTreeSearchList(equipmentTree);
      yield put({
        type: "updateToView",
        payload: {
          equipmentTree,
          selectKey: selectKey || treeSearchList[0]?.id,
          activeKey: activeKey || treeSearchList[0]?.key,
          // defaultExpanded: defaultExpanded,
          treeSearchList
        }
      });
      return { typeId: treeSearchList[0]?.typeId, id: treeSearchList[0]?.id };
    },
    *clickTree(action, { call, put }) {
      const { id, key } = action.payload;
      yield put({
        type: "updateToView",
        payload: { selectKey: id, activeKey: key, echartList: {} }
      });
    },
    *getDeviceType(action, { call, put }) {
      const res = yield Service.getDeviceType({
        deviceId: action.payload.deviceId
      });
      yield put({
        type: "updateToView",
        payload: {
          deviceTypeArr: res.results,
          deviceId: action.payload.deviceId,
          dataTypeId: res.results[0]?.value
        }
      });
      return res.results[0]?.value;
    },
    *getChart(action, { call, put, select }) {
      const { deviceTypeArr } = yield select(state => state[t_diagram]);
      const target = deviceTypeArr.find(item => item.value === action.payload.dataTypeId);
      const res = yield Service.getChart({
        frequency: target?.frequency,
        deviceId: action.payload.deviceId,
        dataTypeId: action.payload.dataTypeId,
        startDate: action.payload.startDate,
        endDate: action.payload.endDate
      });
      yield put({
        type: "updateToView",
        payload: {
          echartList: res.results || {},
          dataTypeId: action.payload.dataTypeId
        }
      });
    },
    *updateState(action, { call, put }) {
      yield put({
        type: "updateToView",
        payload: action.payload
      });
    }
  }
};
