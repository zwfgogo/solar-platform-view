import { makeModel } from "../../umi.helper";
import { strategySettingNS } from '../../constants'
import * as services from '../station.service'

export class StrategySettingModel {
  list = [];
  total = 0;
}

export default makeModel(strategySettingNS, new StrategySettingModel(), (updateState) => {
  return {
    * fetchStrategySetting({ payload }, { put, call }) {
      const { stationId, page, size } = payload;
      const results = yield call(services.fetchStrategySettingList, { stationId, page, size });
      yield updateState(put, {
        list: results.results,
        total: results.totalCount
      })
    },
    * updateStrategySetting({ payload }, { put, call }) {
      const { stationId, putBody } = payload;
      const checked = [];
      for (const item of putBody) {
        if (item.checked) {
          checked.push(item);
        }
      }
      yield call(services.putStrategySetting, { stationId, updateBody: checked });
      yield put({
        type: 'fetchStrategySetting',
        payload: { stationId }
      });
    }
  }
});