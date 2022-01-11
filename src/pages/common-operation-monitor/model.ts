import services from "./services";
import { makeModel } from "../umi.helper";

export const modelNamespace = "operationMonitorManagement";

export class OperationMonitorManagement {
  tableList: [];
  socketLoading = {};
}

export default makeModel(
  modelNamespace,
  new OperationMonitorManagement(),
  (updateState, updateQuery, getState) => {
    return {
      // 查询数据
      *getTableList(action, { put, call, select }) {
        const { stationId, page, size } = action.payload;
        const result = yield call(services.getTableList, {
          stationId,
        });

        yield updateState(put, {
          tableList: result?.results || [],
        });
      },
    };
  }
);