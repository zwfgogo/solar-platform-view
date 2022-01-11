import services from "../services/index";
import { makeModel } from "../../umi.helper";
import moment from "moment";

export const modelNamespace = "lgcManagement";

export class LgcManagement {
  lgcList = [];
  xData = [];
  sellNumList = [];
  earnNumList = [];
  profitList = []; // 收益
  sellCount = 0; //售出数
  earnCount = 0; //赚取数
}

export default makeModel(
  modelNamespace,
  new LgcManagement(),
  (updateState, updateQuery, getState) => {
    return {
      // 根据条件获得LGC
      *getLGC(action, { put, call, select }) {
        const { stationId, dtime } = action.payload;
        const result = yield call(services.getLGC, { stationId, dtime });
        // const xData = (result?.results || []).map(item => moment(item.dtime).format('YYYY-MM'))
        const xData = [];
        const sellNumList = [];
        const earnNumList = [];
        const profitList = [];
        (result?.results || []).forEach((item, index) => {
          if (index) {
            xData.push(moment(item.dtime).format("YYYY-MM"));
            sellNumList.push(item.sellCount);
            earnNumList.push(item.earnCount);
            profitList.push(item.profit);
          }
        });

        yield updateState(put, {
          lgcList: result?.results || [],
          xData,
          sellNumList,
          earnNumList,
          profitList,
        });
      },

      // 根据电站ID获得总累计售出/赚取数
      *getCountByStationId(action, { put, call, all }) {
        const { stationId } = action.payload;
        const [sellCount, earnCount] = yield all([
          services.getCountByStationId({ stationId, type: "Sell" }), // 售出
          services.getCountByStationId({ stationId, type: "Earn" }), // 赚取
        ]);
        yield updateState(put, {
          sellCount: sellCount?.results || 0,
          earnCount: earnCount?.results || 0,
        });
      },

      // 新增lgc
      *createLGC(action, { put, call, all }) {
        const { data, dtime } = action.payload;
        const result = yield call(services.createLGC, data);
        yield put({
          type: "getLGC",
          payload: { stationId: data.stationId, dtime },
        });
        yield put({
          type: "getCountByStationId",
          payload: { stationId: data.stationId },
        });
        return result;
      },

      // 编辑lgc
      *updateLGC(action, { put, call, all }) {
        const { data, dtime } = action.payload;
        const result = yield call(services.updateLGC, data);
        yield put({
          type: "getLGC",
          payload: { stationId: data.stationId, dtime },
        });
        yield put({
          type: "getCountByStationId",
          payload: { stationId: data.stationId },
        });
        return result;
      },

      // 删除lgc
      *deleteLGC(action, { put, call, all }) {
        const { data, dtime } = action.payload;
        const result = yield call(services.deleteLGC, {
          stationId: data.stationId,
          dtime: data.dtime,
        });
        yield put({
          type: "getLGC",
          payload: { stationId: data.stationId, dtime },
        });
        yield put({
          type: "getCountByStationId",
          payload: { stationId: data.stationId },
        });
        return result;
      },
    };
  }
);
