import { makeModel } from "../../umi.helper";
import { power_quality_energy_unit_detail } from "../../constants";
import Service from "../services/EnergyUnitDetail";
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

export interface UnitProp {
  tableData: any[];
  chartData: any;
}

export class EnergyDetailModal {
  tableData = [];
  chartData = {};
}

export default makeModel(
  power_quality_energy_unit_detail,
  new EnergyDetailModal(),
  (updateState, updateQuery, getState) => {
    return {
      *getData(action, { put, call, select }) {
        const { query } = yield getState(select);
        const { energyUnitCode, startDate, endDate, stationId } = action.payload;
        const params = {
          firmId: sessionStorage.getItem("firm-id"),
          energyUnitId: energyUnitCode,
          startDate,
          endDate,
          stationId,
          ...query
        };
        const res = yield call(Service.getData, params);
        const data = res.results || {};
        let tableData = res.table || [];
        const chartData = formatChartData(data);
        tableData = tableData.map((item, index) => ({
          ...item,
          key: index + 1
        }));
        yield put({ type: "updateToView", payload: { tableData, chartData } });
      }
    };
  }
);
