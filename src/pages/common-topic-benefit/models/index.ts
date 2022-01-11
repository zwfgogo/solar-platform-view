import Service from "../services/index";
import { common_benefit_analyze } from "../../constants";
import utils from "../../../public/js/utils";
import { isZh } from "../../../core/env";
import { enumsApi } from "../../../services/global2";

export const intlFormatEfficiency = (title) => {
  let str = utils.intl(title)
  if(!isZh()) {
    str = str.replace('效率', ' Efficiency')
  }
  return str
}

export class BenefitModal {
  energyUnits = []
  selectEnergyUnitId = null
  lossInfo = {}
}

export default {
  namespace: common_benefit_analyze,
  state: new BenefitModal(),
  reducers: {
    updateToView(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    }
  },
  effects: {
    *reset(action, { put, call }) {
      yield put({
        type: "updateToView",
        payload: {
          ...new BenefitModal()
        }
      });
    },
    *fetchEnergyUnits(action, { put, call }) {
      const { stationId } = action.payload;
      let energyUnits = yield enumsApi({
        resource: 'energyUnits',
        stationId,
        property: '*',
      })
      let selectEnergyUnitId = null
      if (energyUnits.length) {
        selectEnergyUnitId = energyUnits[0].id
      }
      yield put({ type: "updateToView", payload: { energyUnits: energyUnits || [], selectEnergyUnitId } });
    },
    *fetchEnergyUnitLoss(action, { put, call }) {
      const { energyUnitId } = action.payload;
      let { results: lossInfo } = yield Service.getEnergyUnitLoss({
        energyUnitId
      })
      yield put({ type: "updateToView", payload: { lossInfo: lossInfo || {} } });
    },
  }
};
