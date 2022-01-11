import { makeModel } from "../../umi.helper";
import { vpp_bill } from "../../constants";
import Service from "../services/vppBill";
import moment from "moment";

export enum BOARD_TYPE {
  MONTH = "month",
  YEAR = "year"
}

export class VppBillModal {
  boardType = BOARD_TYPE.MONTH;
  summaryData: any = {};
  profitData = {};
  query = {
    date: moment()
  };
}

export default makeModel(
  vpp_bill,
  new VppBillModal(),
  (updateState, updateQuery, getState) => {
    return {
      *getSummary(action, { put, call, select }) {
        const { query, boardType } = yield getState(select);
        const { vppId } = action.payload;
        const res = yield call(Service.getSummary, {
          vppId,
          dateType: boardType,
          date: query.date.format(
            boardType === BOARD_TYPE.MONTH ? "YYYY-MM" : "YYYY"
          )
        });
        const { results = {} } = res || {};
        yield updateState(put, { summaryData: results });
      },
      *getProfitChart(action, { put, call, select }) {
        const { query, boardType } = yield getState(select);
        const { vppId } = action.payload;
        const res = yield call(Service.getProfitChart, {
          vppId,
          dateType: boardType,
          date: query.date.format(
            boardType === BOARD_TYPE.MONTH ? "YYYY-MM" : "YYYY"
          )
        });
        const { results = {} } = res || {};
        yield updateState(put, { profitData: results });
      }
    };
  }
);
