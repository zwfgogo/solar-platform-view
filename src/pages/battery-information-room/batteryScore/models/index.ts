/**
 * Created by zhuweifeng on 2019/11/5.
 */
import Service from '../services/index';
import moment from 'moment';
import { makeModel } from "../../../umi.helper";
import SocketHelper from '../../../socket.helper'
import { Socket_Port } from '../../../../pages/constants'
import { formatArrData, formatChartData } from '../../../page.helper'
import _ from 'lodash'
import utils from '../../../../public/js/utils';
const socket = new SocketHelper('topological', Socket_Port, '/topology-analysis')


export class batteryScore {
    selectArr = []
    selectValue = ''
    scoreArr = [{ name: utils.intl('从低到高'), value: 'asc' }, { name: utils.intl('从高到低'), value: 'desc' }]
    scoreValue = 'asc'

    deviceArr = []

    min = null
    max = null
    queryStr = ''
}
export default makeModel('batteryScore', new batteryScore(), (updateState, updateQuery, getState) => {
    return {
        * reset(action, { put, call }) {
            yield put({ type: 'updateToView', payload: new batteryScore() })
        },

        * init(action, { put, call, select }) {

        },

        * getSelect(action, { call, put, select }) {
            const { stationId } = yield select(state => state.global);
            const res = yield Service.getSelect({
                resource: 'energyUnits',
                stationId
            });
            if (res.results.length) {
                yield put({
                    type: 'updateToView',
                    payload: { selectArr: res.results, selectValue: res.results[0].value }
                });
            } else {
                yield put({
                    type: 'updateToView',
                    payload: { selectArr: [], selectValue: '', list: [], echartData: {} }
                });
            }
        },

        * getHealth(action, { select, call, put }) {
            let { selectValue, min, max, scoreValue } = yield select(state => state.batteryScore)
            //分数级别从低到高 例：one是50以下级别 six是90~100分
            const res = yield Service.getHealth({ energyUnitId: selectValue, min, max, sortType: scoreValue });
            let deviceRes = res.results;
            let replenishNum = 8 - deviceRes.length % 8;
            if (deviceRes.length % 8 !== 0) {
                for (let i = 1; i <= replenishNum; i++) {
                    deviceRes.push({ deviceTitle: 'hide' })
                }
            }
            yield put({
                type: 'updateToView',
                payload: { deviceArr: deviceRes }
            });
        },

        * getSingelHealth(action, { select, call, put }) {
            let { queryStr, selectValue } = yield select(state => state.batteryScore)
            const res = yield Service.getSingelHealth({ title: queryStr.replace(/#/g, "\#"), energyUnitId: selectValue });
            yield put({
                type: 'updateToView',
                payload: { deviceArr: res.results }
            });
        },
    }
})