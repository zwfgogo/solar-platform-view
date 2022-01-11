import services from "./services";
import { makeModel } from "../umi.helper";
import { message } from "wanke-gui";
import utils from "../../public/js/utils";

export const modelNamespace = "operationConfiguration";

export class OperationConfigurationModel {
  tableList: any[] = []; // 能量单元列表
  strategyList: any[] = []; // 策略列表
}

export default makeModel(
  modelNamespace,
  new OperationConfigurationModel(),
  (updateState, updateQuery, getState) => {
    return {
      // 查询数据
      *getTableList(action, { put, call, select }) {
        const { stationId } = action.payload;
        const result = yield call(services.getTableList, {
          stationId,
        });

        yield updateState(put, {
          tableList: result?.results?.energyUnitList || [],
          strategyList: result?.results?.strategyList || [],
        });
      },

      // 新增数据
      *addOperation(action, { put, call, select }) {
        const { stationId, values } = action.payload;
        const result = yield call(services.addOperation, values);
        yield put({ type: 'getTableList', payload: { stationId } })
        message.success(utils.intl('保存成功'))
      },

      // 编辑数据
      *updateOperation(action, { put, call, select }) {
        const { stationId, values } = action.payload;
        const result = yield call(services.updateOperation, values);
        yield put({ type: 'getTableList', payload: { stationId } })
        message.success(utils.intl('保存成功'))
      },

      // 编辑能量单元
      *updateEnergy(action, { put, call, select }) {
        const { stationId, values } = action.payload;
        const result = yield call(services.updateEnergy, values);
        yield put({ type: 'getTableList', payload: { stationId } })
        message.success(utils.intl('保存成功'))
      },
    };
  }
);