/**
 * Created by zhuweifeng on 2019/11/5.
 */
import Service from '../services/index';
import moment from 'moment';
import { makeModel } from "../../../umi.helper";
import { sortChartData, formatChartData } from '../../../page.helper'
import _ from 'lodash'

import utils from '../../../../public/js/utils';
export class roomIndex {
    batteryCapacity1 = {
        xData: ['90~100' + utils.intl('分'), '80~89' + utils.intl('分'), '70~79' + utils.intl('分'), '60~69' + utils.intl('分'), '50~59' + utils.intl('分'), utils.intl('50分以下')], yData: [], series: [{
            name: "",
            unit: utils.intl('battery.个')
        }]
    }
    batteryCapacity2 = [{ name: '90~100' + utils.intl('分'), value: 0 },
    { name: '80~89' + utils.intl('分'), value: 0 }, { name: '70~79' + utils.intl('分'), value: 0 },
    { name: '60~69' + utils.intl('分'), value: 0 }, { name: '50~59' + utils.intl('分'), value: 0 }, { name: utils.intl('50分以下'), value: 0 }]
    batteryCapacity3 = [{ name: '90~100' + utils.intl('分'), value: 0 },
    { name: '80~89' + utils.intl('分'), value: 0 }, { name: '70~79' + utils.intl('分'), value: 0 },
    { name: '60~69' + utils.intl('分'), value: 0 }, { name: '50~59' + utils.intl('分'), value: 0 }, { name: utils.intl('50分以下'), value: 0 }]
    deviceArr = []
    unitArr = []
    selectArr = []
    selectUnit = ''
    batteryUnitArr = []
    selectUnitName = ''
}
export default makeModel('roomIndex', new roomIndex(), (updateState, updateQuery, getState) => {
    return {
        * reset(action, { put, call }) {
            yield put({ type: 'updateToView', payload: new roomIndex() })
        },
        * init(action, { put, call, select }) {
            const { energyUnitId, deviceTypeName } = action.payload;
            const res = yield Service.getParentOptions({ energyUnitId, deviceTypeName });
            if (res.results && res.results.length) {
                yield put({
                    type: 'updateToView',
                    payload: { selectArr: res.results, selectUnit: res.results[0].value, selectUnitName: res.results[0].name }
                });
            }
        },
        * getHealth(action, { select, call, put }) {
            const { selectedEnergyUnitId, batteryUnitId } = action.payload;
            let { batteryCapacity3 } = yield select(state => state.roomIndex)
            const resArr = yield Service.getInfoHealthScore({ deviceId: batteryUnitId, energyUnitId: selectedEnergyUnitId, sortType: 'asc', deviceType: 'Cell' });
            //分数级别从低到高 例：six是50以下级别 one是90~100分
            let oneBattery = 0;
            let twoBattery = 0;
            let threeBattery = 0;
            let fourBattery = 0;
            let fiveBattery = 0;
            let sixBattery = 0;
            for (let i = 0; i < resArr.results.length; i++) {
                if (resArr.results[i].healthScore < 50) {
                    sixBattery += 1;
                } else if (resArr.results[i].healthScore >= 50 && resArr.results[i].healthScore < 60) {
                    fiveBattery += 1;
                } else if (resArr.results[i].healthScore >= 60 && resArr.results[i].healthScore < 70) {
                    fourBattery += 1;
                } else if (resArr.results[i].healthScore >= 70 && resArr.results[i].healthScore < 80) {
                    threeBattery += 1;
                } else if (resArr.results[i].healthScore >= 80 && resArr.results[i].healthScore < 90) {
                    twoBattery += 1;
                } else if (resArr.results[i].healthScore >= 90 && resArr.results[i].healthScore <= 100) {
                    oneBattery += 1;
                }
            }
            batteryCapacity3 = [{ name: utils.intl('50分以下'), value: sixBattery }, { name: '50~59' + utils.intl('分'), value: fiveBattery },
            { name: '60~69' + utils.intl('分'), value: fourBattery }, { name: '70~79' + utils.intl('分'), value: threeBattery },
            { name: '80~89' + utils.intl('分'), value: twoBattery }, { name: '90~100' + utils.intl('分'), value: oneBattery }]
            batteryCapacity3 = batteryCapacity3.reverse()
            yield put({
                type: 'updateToView',
                payload: { batteryUnitArr: resArr.results, batteryCapacity3: batteryCapacity3 }
            });
        },
        * getHealthArr(action, { select, call, put }) {
            const { selectedEnergyUnitId } = action.payload;
            const resArr = yield Service.getInfoHealthScore({ energyUnitId: selectedEnergyUnitId, sortType: 'asc', deviceType: 'BatteryUnit' });
            let { batteryCapacity1 } = yield select(state => state.roomIndex)
            //分数级别从低到高 例：six是50以下级别 one是90~100分
            let oneBattery = 0;
            let twoBattery = 0;
            let threeBattery = 0;
            let fourBattery = 0;
            let fiveBattery = 0;
            let sixBattery = 0;
            for (let i = 0; i < resArr.results.length; i++) {
                if (resArr.results[i].healthScore < 50) {
                    sixBattery += 1;
                } else if (resArr.results[i].healthScore >= 50 && resArr.results[i].healthScore < 60) {
                    fiveBattery += 1;
                } else if (resArr.results[i].healthScore >= 60 && resArr.results[i].healthScore < 70) {
                    fourBattery += 1;
                } else if (resArr.results[i].healthScore >= 70 && resArr.results[i].healthScore < 80) {
                    threeBattery += 1;
                } else if (resArr.results[i].healthScore >= 80 && resArr.results[i].healthScore < 90) {
                    twoBattery += 1;
                } else if (resArr.results[i].healthScore >= 90 && resArr.results[i].healthScore <= 100) {
                    oneBattery += 1;
                }
            }
            batteryCapacity1.yData = [[oneBattery, twoBattery, threeBattery, fourBattery, fiveBattery, sixBattery]]
            yield put({
                type: 'updateToView',
                payload: { deviceArr: resArr.results, batteryCapacity1: batteryCapacity1 }
            });
        },
        * getAllUnitHealth(action, { select, call, put }) {
            const { selectedEnergyUnitId } = action.payload;
            const resArr = yield Service.getInfoHealthScore({ energyUnitId: selectedEnergyUnitId, sortType: 'asc', deviceType: 'Cell' });
            let { batteryCapacity2 } = yield select(state => state.roomIndex)
            //分数级别从低到高 例：six是50以下级别 one是90~100分
            let oneBattery = 0;
            let twoBattery = 0;
            let threeBattery = 0;
            let fourBattery = 0;
            let fiveBattery = 0;
            let sixBattery = 0;
            for (let i = 0; i < resArr.results.length; i++) {
                if (resArr.results[i].healthScore < 50) {
                    sixBattery += 1;
                } else if (resArr.results[i].healthScore >= 50 && resArr.results[i].healthScore < 60) {
                    fiveBattery += 1;
                } else if (resArr.results[i].healthScore >= 60 && resArr.results[i].healthScore < 70) {
                    fourBattery += 1;
                } else if (resArr.results[i].healthScore >= 70 && resArr.results[i].healthScore < 80) {
                    threeBattery += 1;
                } else if (resArr.results[i].healthScore >= 80 && resArr.results[i].healthScore < 90) {
                    twoBattery += 1;
                } else if (resArr.results[i].healthScore >= 90 && resArr.results[i].healthScore <= 100) {
                    oneBattery += 1;
                }
            }
            batteryCapacity2 = [{ name: utils.intl('50分以下'), value: sixBattery }, { name: '50~59' + utils.intl('分'), value: fiveBattery },
            { name: '60~69' + utils.intl('分'), value: fourBattery }, { name: '70~79' + utils.intl('分'), value: threeBattery },
            { name: '80~89' + utils.intl('分'), value: twoBattery }, { name: '90~100' + utils.intl('分'), value: oneBattery }]
            batteryCapacity2 = batteryCapacity2.reverse()
            yield put({
                type: 'updateToView',
                payload: { unitArr: resArr.results, batteryCapacity2: batteryCapacity2 }
            });
        },
    }
})
