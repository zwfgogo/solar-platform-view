import Service from "../services";
import { getDefaultTimeByMode } from "../components/commonAbnormalModal";
import utils from "../../../public/js/utils";

function formatChartData(data: any) {
  const { results = [], legend = [], unit = [] } = data;
  const yData = results.map(row =>
    row.map(item => {
      if(item.val === null || item.val === undefined || item.val === "") return "";
      const value = Number(item.val);
      return isNaN(value) ? 0 : value;
    })
  );
  const xData = (results[0] || []).map(item => item.dtime);
  const series = legend.map((item, index) => ({
    name: utils.intl(item),
    unit: utils.intl(unit[index]) || ""
  }));

  return {
    xData,
    yData,
    series
  };
}

function formatTableData(data: any) {
  const { results = [] } = data;
  const list = results[0] || [];
  return list.map((item, index) => ({
    ...item,
    key: index + 1
  }));
}

function* getChart({ action, requestFn, targetKey, put, call, limit }: any) {
  const { stationId, mode } = action.payload;
  const dateArr = getDefaultTimeByMode(mode);
  const params: any = {
    firmId: sessionStorage.getItem("firm-id"),
    stationId
  };
  if (/day/.test(mode)) {
    params.startDate = dateArr[0].format("YYYY-MM-DD");
    params.endDate = dateArr[1].format("YYYY-MM-DD");
  } else {
    params.startDate = dateArr[0].format("YYYY-MM");
    params.endDate = dateArr[1].format("YYYY-MM");
  }
  const res = yield call(requestFn, params);
  if (limit) {
    res.results = res.results.map(row => (
      row.sort((a, b) => b.val - a.val).slice(0, limit).sort((a, b) => a.val - b.val)
    ));
  }
  const chartData = formatChartData(res);
  yield put({
    type: "updateToView",
    payload: { [targetKey]: chartData }
  });
}

function* getTable({ action, requestFn, targetKey, put, call, limit }: any) {
  const { stationId, startTime: startDate, endTime: endDate } = action.payload;
  const params = {
    firmId: sessionStorage.getItem("firm-id"),
    stationId,
    startDate,
    endDate
  };
  const res = yield call(requestFn, params);
  if (limit) {
    res.results = res.results.map(row => (
      row.sort((a, b) => b.val - a.val).slice(0, limit)
    ));
  }
  const tableData = formatTableData(res);
  yield put({
    type: "updateToView",
    payload: { [targetKey]: tableData }
  });
}

function* exportTable({ action, requestFn, call }) {
  const { stationId, startTime, endTime, success } = action.payload;
  const params = {
    firmId: sessionStorage.getItem("firm-id"),
    stationId,
    startTime,
    endTime
  };
  const res = yield call(requestFn, params);
  const data = res.results || {};
  const { results: list = [] } = data;
  const tableData = list.map((item, index) => ({
    ...item,
    key: index + 1
  }));
  success && success(tableData);
}

class AbnormalModal {
  totalChart = {};
  totalTableList = [];
  deviceChart = {};
  deviceTableList = [];
  eventChart = {};
  eventTableList = [];
}

export default {
  namespace: "abnormal",
  state: { ...new AbnormalModal() },
  reducers: {
    updateToView(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    }
  },
  effects: {
    *reset(action, { put, call }) {
      yield put({
        type: "updateToView",
        payload: {
          ...new AbnormalModal()
        }
      });
    },
    *getTotalAbnormalChart(action, { put, call }) {
      const { mode } = action.payload;
      yield getChart({
        action,
        requestFn: /day/.test(mode)
          ? Service.getTotalAbnormalChartByDay
          : Service.getTotalAbnormalChartByMonth,
        targetKey: "totalChart",
        put,
        call
      });
    },
    *getTotalAbnormalTable(action, { put, call }) {
      yield getTable({
        action,
        requestFn: Service.getTotalAbnormalTable,
        targetKey: "totalTableList",
        put,
        call
      });
    },
    *getDeviceAbnormalChart(action, { put, call }) {
      yield getChart({
        action,
        requestFn: Service.getDeviceAbnormalChart,
        targetKey: "deviceChart",
        put,
        call,
        limit: 10
      });
    },
    *getDeviceAbnormalTable(action, { put, call }) {
      yield getTable({
        action,
        requestFn: Service.getDeviceAbnormalTable,
        targetKey: "deviceTableList",
        put,
        call,
        limit: 10
      });
    },
    *getEventAbnormalChart(action, { put, call }) {
      yield getChart({
        action,
        requestFn: Service.getEventAbnormalChart,
        targetKey: "eventChart",
        put,
        call,
        limit: 10
      });
    },
    *getEventAbnormalTable(action, { put, call }) {
      yield getTable({
        action,
        requestFn: Service.getEventAbnormalTable,
        targetKey: "eventTableList",
        put,
        call,
        limit: 10
      });
    }
  }
};
