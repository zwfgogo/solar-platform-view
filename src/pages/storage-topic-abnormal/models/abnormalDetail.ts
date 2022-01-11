import Service from "../services/abnormalDetail";
import moment from "moment";

export class AbnormalDetailDvaModal {
  startDate = "";
  endDate = "";
  visible = false;
  queryStr = "";
  tableData = {
    list: [],
    page: 1,
    size: 20,
    totalCount: 0
  };
}

export default {
  namespace: "abnormalDetail",
  state: { ...new AbnormalDetailDvaModal() },
  reducers: {
    updateToView(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },
    reset(state, { payload }) {
      return new AbnormalDetailDvaModal();
    }
  },
  effects: {
    *getTableData(action, { put, call, select }) {
      const { page, size, stationId } = action.payload;
      const { startDate, endDate, queryStr } = yield select(
        state => state.abnormalDetail
      );
      const isMonth = startDate && /^\d{4}-\d{2}$/.test(startDate);
      const formatStr = isMonth ? "YYYY-MM" : "YYYY-MM-DD";
      const params = {
        firmId: sessionStorage.getItem("firm-id"),
        page,
        size,
        stationId,
        queryStr,
        startDate: moment(startDate).format(formatStr),
        endDate: moment(endDate).format(formatStr)
      };
      const res = yield call(Service.getTableData, params);
      const {
        totalCount = 0,
        totalPages = 0,
        results: list = [],
        page: pageNum = 1,
        size: pageSize = 20
      } = res?.results || {};
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
      console.log(tableData);
      yield put({ type: "updateToView", payload: { tableData } });
    },
    *exportTableData(action, { put, call, select }) {
      const { success, stationId } = action.payload;
      const { startDate, endDate, queryStr } = yield select(
        state => state.abnormalDetail
      );
      const isMonth = startDate && /^\d{4}-\d{2}$/.test(startDate);
      const formatStr = isMonth ? "YYYY-MM" : "YYYY-MM-DD";
      const params = {
        firmId: sessionStorage.getItem("firm-id"),
        stationId,
        queryStr,
        startDate: moment(startDate).format(formatStr),
        endDate: moment(endDate).format(formatStr)
      };
      const res = yield call(Service.getTableData, params);
      const {
        results: list = [],
        page: pageNum = 1,
        size: pageSize = 20
      } = res?.results || {};
      const tableData = list.map((item, index) => ({
        ...item,
        key: index + 1 + pageSize * (pageNum - 1)
      }));
      success && success(tableData);
    }
  }
};
