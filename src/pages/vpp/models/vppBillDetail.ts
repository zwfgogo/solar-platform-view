import { makeModel } from "../../umi.helper";
import { vpp_bill_detail } from "../../constants";
import Service from "../services/vppBillDetail";
import moment, { Moment } from "moment";
import { exportFile } from "../../../util/fileUtil";
import { ExportColumn } from "../../../interfaces/CommonInterface";

export enum DATE_TYPE {
  YEAR = "year",
  MONTH = "month",
  DAY = "day",
  EMPTY = ""
}

export const timeMap = {
  [DATE_TYPE.YEAR]: "月份",
  [DATE_TYPE.MONTH]: "日期",
  [DATE_TYPE.DAY]: "时间"
};

export function addUnit(title, unit) {
  return title + (unit ? `(${unit})` : "");
}

function getDate(date: Moment, dateType: DATE_TYPE) {
  let formatStr = "YYYY-MM-DD";
  if (dateType === DATE_TYPE.MONTH) {
    formatStr = "YYYY-MM";
  } else if (dateType === DATE_TYPE.YEAR) {
    formatStr = "YYYY";
  }
  return date.format(formatStr);
}

export class VppBillDetailModal {
  query = {
    page: 1,
    size: 20,
    dateType: DATE_TYPE.EMPTY,
    date: moment()
  };
  totalCount = 0;
  list = [];
  headerUnit = {};
}

export default makeModel(
  vpp_bill_detail,
  new VppBillDetailModal(),
  (updateState, updateQuery, getState) => {
    return {
      *getTableData(action, { put, call, select }) {
        const { query } = yield getState(select);
        const { vppId } = action.payload;
        const params = { vppId, ...query };
        params.date = getDate(params.date, query.dateType);
        const { results = {} } = yield call(Service.getTable, params);
        const { results: list, totalCount, header = {} } = results;
        yield updateState(put, {
          list,
          totalCount,
          headerUnit: header
        });
      },
      *onExport(action, { put, call, select }) {
        const { query } = yield getState(select);
        const { vppId } = action.payload;
        const params = { vppId, ...query };
        params.date = getDate(params.date, query.dateType);
        delete params.page;
        delete params.size;
        const { results = {} } = yield call(Service.getTable, params);
        const { results: list, header = {} } = results;
        exportFile(getColumns(query.dateType, header), list);
        console.log(list);
      }
    };
  }
);

function getColumns(dateType, headerUnit) {
  const columns: ExportColumn[] = [
    {
      title: dateType ? timeMap[dateType] : "",
      dataIndex: "date",
      renderE: text =>
        dateType === DATE_TYPE.YEAR && text !== "合计"
          ? moment(text).format("YYYY年MM月")
          : text
    },
    {
      title: addUnit("售电", headerUnit.energySold),
      dataIndex: "energySold"
    },
    {
      title: addUnit("收益", headerUnit.energySoldProfit),
      dataIndex: "energySoldProfit"
    },
    {
      title: addUnit("购电", headerUnit.energyBought),
      dataIndex: "energyBought"
    },
    {
      title: addUnit("收益", headerUnit.energyBoughtProfit) + " ",
      dataIndex: "energyBoughtProfit"
    },
    {
      title: addUnit("响应电量", headerUnit.demandResponse),
      dataIndex: "demandResponse"
    },
    {
      title: addUnit("收益", headerUnit.demandResponseProfit) + "  ",
      dataIndex: "demandResponseProfit"
    },
    { title: addUnit("总收益", headerUnit.profit), dataIndex: "profit" }
  ];
  return columns;
}
