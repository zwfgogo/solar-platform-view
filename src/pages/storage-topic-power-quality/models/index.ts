import { makeModel } from "../../umi.helper";
import { globalNS, power_quality } from "../../constants";
import Service from "../services/index";
import utils from "../../../public/js/utils";

function formatChartData(data: any) {
  const { xData = [], results = [], legend = [], unit = [] } = data;
  const yData = [];
  results.forEach(row => {
    const yRowData = [];
    xData.forEach(xItem => {
      const yItem = row.find(item => item.dtime === xItem);
      if (yItem === null || yItem === undefined || yItem === "") {
        yRowData.push("");
      } else {
        const value = Number(yItem.val);
        yRowData.push(isNaN(value) ? 0 : value);
      }
    });
    yData.push(yRowData);
  });
  const series = legend.map((item, index) => ({
    name: item,
    unit: utils.intl(unit[0]) || ""
  }));

  return {
    xData: xData.map(item => utils.intl(item)),
    yData,
    series
  };
}

function mergeChartData(data: any[]) {
  let xData = [],
    yData = [],
    series = [];
  data.forEach(item => {
    xData = xData.concat(item.xData);
    item.yData.forEach((yItem, index) => {
      yData[index] = yData[index]
        ? yData[index].concat(yItem)
        : [].concat(yItem);
    });
  });
  if (data[0]) {
    series = data[0].series;
  }

  return {
    xData,
    yData,
    series
  };
}

export class PowerQualityState {
  chartData = [];
  tableData = [];
}

export default makeModel(
  power_quality,
  new PowerQualityState(),
  (updateState, updateQuery, getState) => {
    return {
      *getData(action, { call, put }) {
        const { stationId, startTime, endTime } = action.payload;
        const params = {
          firmId: sessionStorage.getItem("firm-id"),
          stationId,
          startDate: startTime,
          endDate: endTime
        };
        const res = yield call(Service.getData, params);
        const data = res.results || [];
        let tableData = res.table || [];
        const chartData = data.map(formatChartData);
        tableData = tableData.map((item, index) => ({
          ...item,
          key: index + 1
        }));
        yield put({ type: "updateToView", payload: { tableData, chartData } });
      }
    };
  }
);
