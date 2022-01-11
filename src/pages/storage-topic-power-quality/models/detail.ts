import { makeModel } from "../../umi.helper";
import { power_quality_common_detail } from "../../constants";
import Service from "../services/detail";
import { DetailPageType } from "../constant";

const RequestMap = {
  [DetailPageType.VOLTAGEHARMONIC]: Service.getVoltageHarmonicData,
  [DetailPageType.CURRENTHARMONIC]: Service.getCurrentHarmonicData,
  [DetailPageType.VOLTAGE]: Service.getVoltageData,
  [DetailPageType.THREEPHASEUNBALANCE]: Service.getThreePhaseUnbalanceData
};

function formatChartData(data: any) {
  const { results = [], legend = [], unit = [] } = data;
  const yData = results.map(row =>
    row.map(item => {
      const value = Number(item.val);
      return isNaN(value) ? 0 : value;
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

export interface UnitProp {
  tableData: any[];
}

export class PowerDetailModal {
  tableData = {
    list: [],
    page: 1,
    size: 20,
    totalCount: 0
  };
}

export default makeModel(
  power_quality_common_detail,
  new PowerDetailModal(),
  (updateState, updateQuery, getState) => {
    return {
      *getData(action, { put, call, select }) {
        const {
          type,
          page,
          size,
          energyUnitCode,
          startDate,
          endDate,
          stationId
        } = action.payload;

        const requestFn = RequestMap[type];

        const params = {
          firmId: sessionStorage.getItem("firm-id"),
          energyUnitId: energyUnitCode === "all" ? "" : energyUnitCode,
          startDate,
          endDate,
          page,
          size,
          stationId
        };
        const res = yield call(requestFn, params);
        const data = res.results || {};
        const {
          totalCount = 0,
          totalPages = 0,
          results: list = [],
          page: pageNum = 1,
          size: pageSize = 20
        } = data;
        const tableData = {
          list: list.map((item, index) => ({
            ...item,
            key: index + 1 + pageSize * (pageNum - 1)
          })),
          totalCount,
          totalPages,
          page: Number(pageNum),
          size: Number(pageSize)
        };
        yield put({ type: "updateToView", payload: { tableData } });
      },
      *exportTableData(action, { put, call, select }) {
        const {
          type,
          energyUnitCode,
          startDate,
          endDate,
          success,
          stationId
        } = action.payload;

        const requestFn = RequestMap[type];

        const params = {
          firmId: sessionStorage.getItem("firm-id"),
          energyUnitId: energyUnitCode === "all" ? "" : energyUnitCode,
          startDate,
          endDate,
          stationId
        };
        const res = yield call(requestFn, params);
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
      }
    };
  }
);
