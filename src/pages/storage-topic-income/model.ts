import { makeModel } from "../umi.helper";
import { income } from "../constants";
import Service from "./service";

function formatChartData(data: any) {
  const { results = [], legend = [], unit = [] } = data;
  const yData = results.map(row =>
    row.map(item => {
      if(item.val === null || item.val === undefined || item.val === "") return [item.dtime, ""];
      const value = Number(item.val);
      return [item.dtime, isNaN(value) ? 0 : value];
    })
  );
  const xData = (results[0] || []).map(item => item.dtime);
  const series = legend.map((item, index) => ({
    name: item,
    unit: unit[index] || ""
  }));

  return {
    xData,
    yData,
    series
  };
}

export class IncomeModal {
  tableData = [];
  chartData = {};
  energyList = [];
}

export default makeModel(
  income,
  new IncomeModal(),
  (updateState, updateQuery, getState) => {
    return {
      *resetData(action, { put, call, select }) {
        yield put({
          type: "updateToView",
          payload: { tableData: [], chartData: {} }
        });
      },
      *getData(action, { put, call, select }) {
        const {
          stationId,
          rangeType,
          rangeValue,
          energyUnitCode
        } = action.payload;
        const params: any = {
          firmId: sessionStorage.getItem("firm-id"),
          stationId,
          energyUnitId: energyUnitCode
        };
        let requestFn = Service.getDataByDay;
        if (rangeType === "day") {
          params.startDate = rangeValue[0].format("YYYY-MM-DD");
          params.endDate = rangeValue[1].format("YYYY-MM-DD");
        } else {
          params.startDate = rangeValue[0].format("YYYY-MM");
          params.endDate = rangeValue[1].format("YYYY-MM");
          requestFn = Service.getDataByMonth;
        }
        const res = yield call(requestFn, params) || {};

        const tableData = (res.table || []).map((item, index) => ({
          ...item,
          key: index + 1
        }));
        const chartData = formatChartData(res.results || {});

        yield put({ type: "updateToView", payload: { tableData, chartData } });
      },
      *getEnergyList(action, { put, call }) {
        const { stationId } = action.payload;
        const params = {
          resource: "energyUnits",
          firmId: sessionStorage.getItem("firm-id"),
          stationId
        };
        const res = yield call(Service.getEnergyList, params);
        const energyList = res.results || [];
        yield put({ type: "updateToView", payload: { energyList } });
      }
    };
  }
);
