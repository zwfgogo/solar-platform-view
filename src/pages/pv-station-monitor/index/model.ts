import { message } from "wanke-gui";
import { BoardType } from "./contant";
import Service from "./service";
import SocketHelper from "../../socket.helper";
import { Socket_Port } from "../../constants";
import { formatChartData, sortChartData } from "../../page.helper";
import Util from '../../../public/js/utils';
import utils from "../../../public/js/utils";

const socket = new SocketHelper('powerStationPv', Socket_Port, '/station-monitoring', {}, {
  mergeTimeInterval: 600,
  mergeConfig: {
    'microgridCurve': {
      mergeFn: mergeCurve,
      defaultValue: {}
    },
    'storageCurve': {
      mergeFn: mergeStorageCurve,
      defaultValue: {}
    },
  }
})

function mergeCurve(prevRes, nextRes) {
  const { results: prevResults = {} } = prevRes
  const { results: nextResults = {} } = nextRes
  
  Object.keys(nextResults).forEach(key => {
    if (prevResults[key]) {
      prevResults[key] = prevResults[key].concat(nextResults[key])
    } else {
      prevResults[key] = nextResults[key]
    }
  })
  return { results: prevResults }
}

function mergeStorageCurve(prevRes, nextRes) {
  const { results: prevResults = {} } = prevRes
  const { results: nextResults = {} } = nextRes

  if (prevResults.stationId && prevResults.stationId !== nextResults.stationId) {
    return { results: nextResults }
  }
  
  Object.keys(nextResults).forEach(key => {
    if (key === 'stationId') {
      prevResults[key] = nextResults[key]
      return
    }
    if (prevResults[key]) {
      prevResults[key] = prevResults[key].concat(nextResults[key])
    } else {
      prevResults[key] = nextResults[key]
    }
  })
  return { results: prevResults }
}

export function chartSeries(){
  return ([
    { name: Util.intl('发电功率'), unit: 'kW' },
    { name: Util.intl('辐照强度'), unit: 'kW/㎡' },
  ])
} 

let realStationMapTemp = {}

export default {
  namespace: "powerStationPv",
  state: {
    boardType: BoardType.Map,
    queryStr: "",
    tableData: {
      list: [],
      page: 1,
      size: 20,
      totalCount: 0
    },
    matrixList: [],
    mapStationList: [],
    chartData: {
      series: chartSeries()
    },
    microgridChartData: {},
    storageChartData: {},
    realStationMap: {},
    socketLoading: {},
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
    *init(action, { put, call, select }) {
      const { dispatch } = action.payload
      socket.start(dispatch, {
        'real': 'getReal',
        'curve': 'getCurve',
        'microgridCurve': 'getMicrogridCurve',
        'storageCurve': 'getStorageCurve',
      }, {
        'connect': () => {
        },
        'socketLoadingChange': (socketLoading) => {
          dispatch({ type: `powerStationPv/updateToView`, payload: { socketLoading } });
        }
      })
    },
    *closeSocket() {
      socket.close()
    },
    *emitSocket(action, { put, call }) {
      const { eventName, params = {} } = action.payload
      socket.emit(eventName, params)
    },
    *getReal(action, { put, call, select }) {
      const { result, count } = action.payload
      const { results = {} } = result
      // let { realStationMap } = yield select(state => state.powerStationPv)
      const newRealStationMap = { ...realStationMapTemp };
      Object.keys(results).forEach(key => {
        newRealStationMap[key] = {
          ...(newRealStationMap[key] || {}),
          ...(results[key] || {}),
        }
      })
      realStationMapTemp = newRealStationMap;
      yield put({ type: "updateToView", payload: { realStationMap: newRealStationMap } })
    },
    *getCurve(action, { put, call, select }) {
      const { result, count } = action.payload
      const { results = {} } = result
      let { chartData } = yield select(state => state.powerStationPv)
      chartData = sortChartData(formatChartData(chartData, results, ['power', 'irradiance']))
      yield put({ type: "updateToView", payload: { chartData } })
    },
    *getMicrogridCurve(action, { put, call, select }) {
      const { result, count } = action.payload
      const { results = {} } = result
      let { microgridChartData } = yield select(state => state.powerStationPv)
      let series = (microgridChartData.series || []).slice()
      const lastKeys = series.map(item => item.originKey)
      Object.keys(results).forEach(key => {
        if (lastKeys.indexOf(key) === -1) {
          const [title] = key.split('_')
          lastKeys.push(key)
          series.push({
            name: utils.intl(title),
            unit: 'kW',
            originKey: key, // 记录数据key值 数据结构: title_id
          })
        }
      })
      const data1 = formatChartData(microgridChartData, results, lastKeys)
      microgridChartData = sortChartData(data1, { fillPoint: true })
      microgridChartData.series = series
      yield put({ type: "updateToView", payload: { microgridChartData } })
    },
    *getStorageCurve(action, { put, call, select }) {
      const { result, count } = action.payload
      const { results = {} } = result
      let { storageChartData } = yield select(state => state.powerStationPv)
      let series = (storageChartData.series || []).slice()
      const lastKeys = series.map(item => item.originKey)
      Object.keys(results).forEach(key => {
        if (key === 'stationId') {
          return
        }
        if (lastKeys.indexOf(key) === -1) {
          const [title, typeName] = key.split('_')
          lastKeys.push(key)
          series.push({
            name: utils.intl(title) + utils.intl(`storageCurve.${typeName}`),
            unit: 'kW',
            originKey: key, // 记录数据key值 数据结构: title_id
          })
        }
      })
      const data1 = formatChartData(storageChartData, results, lastKeys)
      storageChartData = sortChartData(data1, { fillPoint: true })
      storageChartData.series = series
      yield put({ type: "updateToView", payload: { storageChartData } })
    },
    *getTableData(action, { put, call }) {
      const { queryStr, page, size } = action.payload;
      const params = {
        userId: sessionStorage.getItem("user-id"),
        title: queryStr,
        page,
        size
      };
      const res = yield call(Service.getTableData, params);
      const data = res.results || {};
      const {
        totalCount = 0,
        totalPages = 0,
        results: list = [],
        page: pageNum = 1,
        size: pageSize = 20
      } = data;
      const tableData = {
        queryStr,
        list: list.map((item, index) => ({
          ...item,
          key: index + 1 + pageSize * (pageNum - 1)
        })),
        totalCount,
        totalPages,
        page: Number(pageNum),
        size: Number(pageSize)
      };
      yield put({ type: "updateToView", payload: { tableData, queryStr } });
      if(list.length) {
        yield put({ type: "emitSocket", payload: {
          eventName: 'real',
          params: { stationIds: list.map(item => item.id).join(',') } 
        }});
      }
    },
    *exportTableData(action, { put, call }) {
      const { queryStr, success } = action.payload;
      const params = {
        userId: sessionStorage.getItem("user-id"),
        title: queryStr
      };
      const res = yield call(Service.getTableData, params);
      const data = res.results || {};
      const {
        results: list = [],
        page: pageNum = 1,
        size: pageSize = 20
      } = data;
      const tableData = list.map((item, index) => ({
        ...item,
        key: index + 1 + pageSize * (pageNum - 1)
      }));
      success && success(tableData);
    },
    *getMatrixData(action, { put, call }) {
      const { queryStr } = action.payload;
      const params = {
        userId: sessionStorage.getItem("user-id"),
        title: queryStr
      };
      const res = yield call(Service.getTableData, params);
      const data = res.results || {};
      const { results: list = [] } = data;
      const matrixList = list.map((item, index) => ({
        ...item,
        key: index
      }));
      yield put({ type: "updateToView", payload: { matrixList, queryStr } });
      if(list.length) {
        yield put({ type: "emitSocket", payload: {
          eventName: 'real',
          params: { stationIds: list.map(item => item.id).join(',') } 
        }});
      }
    },
    *getMapStationList(action, { put, call }) {
      const { queryStr } = action.payload;
      const params = {
        userId: sessionStorage.getItem("user-id"),
        title: queryStr
      };
      const res = yield call(Service.getTableData, params);
      const data = res.results || {};
      const { results: list = [] } = data;
      const mapStationList = list.map((item, index) => ({
        ...item,
        key: index
      }));
      yield put({ type: "updateToView", payload: { mapStationList } });
      return mapStationList
    }
  }
};
