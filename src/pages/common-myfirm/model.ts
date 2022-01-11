import Service from './service'
import { makeModel } from "../umi.helper"
import { ExportColumn } from "../../interfaces/CommonInterface"
import { exportFile } from "../../util/fileUtil"
import { globalNS } from "../constants"
import { GlobalState } from "../../models/global"
import utils from "../../public/js/utils";

export class MyFirmState {
    firmDetail = {}
}

export default makeModel('myFirm', new MyFirmState(), (updateState, updateQuery, getState) => {
    return {
        * getDetail(action, { select, call, put }) {
            const res = yield Service.getDetail({})
            yield put({
                type: 'updateToView',
                payload: { firmDetail: res.results, lightLogoUrl: res.results.lightLogoUrl, darkLogoUrl: res.results.darkLogoUrl }
            })
            yield put({
                type: 'global/updateToView',
                payload: { firm: res.results }
            })
        },
        * save(action, { select, call, put }) {
            yield Service.putDetail({ id: action.payload.id, ...action.payload })
        },
        *reset(action, { select, call, put }) {
            yield put({
                type: 'updateToView',
                payload: new MyFirmState()
            });
        },
    }
})
