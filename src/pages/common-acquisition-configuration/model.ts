import services from "./services";
import { makeModel } from "../umi.helper";
import utils from "../../public/js/utils";
import { exportExcel } from "../../util/fileUtil";
import { Tree_Type } from "../constants";
import { createCancelSource } from "../../util/myAxios";
import { isBatterySystem, isPvSystem, isStorageSystem } from "../../core/env";

export const modelNamespace = "AcquisitionManagement";

let pointNumberSource

export class AcquisitionManagement {
  treeData: any[] = [];
  defaultExpandedKeys: string[] = [];
  unitList: any[] = [];
  accuracyList: any[] = [];
  terminalList: any[] = []; // 端子数据
  secondaryDevicesList: any[] = []; // 二次设备数据
  measurePointList: any[] = []; // 测量点信息
  PointsList: any[] = []; // 点号列表
  PointsPage: number = 1;
  PointsSize: number = 20;
  PointsTotal: number = 0;
  countPointList: any[] = []; // 点号汇总表
  otherPointList: any[] = []; // 其他数据
  otherPointPage: number = 1;
  otherPointSize: number = 20;
  otherPointTotal: number = 1;
  remotePulseList: any[] = []; // 换表记录
  endVal: any = null; // 原点号结束示数
  startVal: any = null; // 新点号开始示数
  pointNumberTitle: string = null; // 点号名称
}

const defaultExpandedKeys = [];

export default makeModel(
  modelNamespace,
  new AcquisitionManagement(),
  (updateState, updateQuery, getState) => {
    return {
      // 查询数据
      *getTreeList(action, { put, call, select }) {
        const { userId } = action.payload;
        const result = yield call(services.getTreeList, {
          userId,
          stationTypeName: isStorageSystem() || isBatterySystem() ? 'Storage' : isPvSystem() ? 'Solar' : 'Microgrid', // 只能是储能电站
        });

        yield updateState(put, {
          treeData: formatTreeList(result?.results || []),
        });
      },

      // 获取相关枚举
      *getEnums(action, { put, call, select }) {
        const result1 = yield call(services.getUnit);
        const result2 = yield call(services.getAccuracy);

        yield updateState(put, {
          unitList: (result1?.results || []).map(i => ({ value: i.name, name: i.title })),
          accuracyList: (result2?.results || []).map(i => ({ value: i.name, name: i.title })),
        });
      },

      // 根据设备ID查询测量点信息
      *getMeasurePointsByDeviceId(action, { put, call, select }) {
        yield updateState(put, {
          measurePointList: [],
        });
        const { deviceId } = action.payload;
        const result = yield call(services.getMeasurePointsByDeviceId, {
          deviceId,
        });

        yield updateState(put, {
          measurePointList: (result?.results || []).map((item, index) => ({ ...item, num: index + 1 })),
        });
      },

      // 根据设备ID、端子name查询点号列表
      *getPointsByDeviceIdAndTerminal(action, { put, call, select }) {
        const { deviceId, terminal, page, size } = action.payload;
        const result = yield call(services.getPointsByDeviceIdAndTerminal, {
          deviceId,
          terminal,
          page,
          size,
        });
        yield updateState(put, {
          PointsList: result?.results || [],
          PointsPage: page,
          PointsSize: size,
          PointsTotal: result?.total || 0,
        });
      },

      // 新增测点
      *addMeasurePoints(action, { put, call, select }) {
        const { deviceId, value } = action.payload;
        const result = yield call(services.addMeasurePoints, {
          deviceId,
          value,
        });
        yield put({
          type: "getMeasurePointsByDeviceId",
          payload: { deviceId },
        });
        return result.errorCode;
      },

      // 编辑测点
      *updateMeasurePoints(action, { put, call, select }) {
        const { deviceId, value } = action.payload;
        const result = yield call(services.updateMeasurePoints, {
          id: value.id,
          value,
        });
        yield put({
          type: "getMeasurePointsByDeviceId",
          payload: { deviceId },
        });
        return result.errorCode;
      },

      // 删除测量点信息
      *deleteMeasurePoints(action, { put, call, select }) {
        const { id, deviceId } = action.payload;
        const result = yield call(services.deleteMeasurePoints, { id });
        yield put({
          type: "getMeasurePointsByDeviceId",
          payload: { deviceId },
        });
        return result.errorCode;
      },

      // 获取点号汇总表
      *getPointListByDeviceId(action, { put, call, select }) {
        const { deviceId } = action.payload;
        yield updateState(put, {
          countPointList: [],
        });
        const result = yield call(services.getPointListByDeviceId, {
          deviceId,
        });
        yield updateState(put, {
          countPointList: result?.results || [],
        });
      },

      // 批量点号汇总表明细
      *addPointListPoints(action, { put, call, select }) {
        const { deviceId, value } = action.payload;
        const result = yield call(services.addAllPoints, {
          deviceId,
          ...value,
        });
        yield put({
          type: "getPointListByDeviceId",
          payload: { deviceId },
        });
        return result.errorCode;
      },

      // 查询其他数据
      *getOtherPointsByDevIdList(action, { put, call, select }) {
        const { devIdList, type, page, size } = action.payload;
        const result = yield call(services.getOtherPointsByDevIdList, {
          devIdList,
          type,
          page,
          size,
        });
        yield updateState(put, {
          otherPointList: result?.results || [],
          otherPointPage: page,
          otherPointSize: size,
          otherPointTotal: result?.total || 0,
        });
      },

      //新增其他数据
      *addOtherPoints(action, { put, call, select }) {
        const { devIdList, type, value } = action.payload;
        const result = yield call(services.addOtherPoints, {
          ...value,
          type,
          deviceId: devIdList,
        });
        const { otherPointPage, otherPointSize } = yield select(
          (state) => state[modelNamespace]
        );
        yield put({
          type: "getOtherPointsByDevIdList",
          payload: {
            devIdList,
            type,
            page: otherPointPage,
            size: otherPointSize,
          },
        });
        return result.errorCode;
      },

      // 批量新增其他数据
      *addAllOtherPoints(action, { put, call, select }) {
        const { devIdList, type, value } = action.payload;
        const { otherPointPage, otherPointSize } = yield select(
          (state) => state[modelNamespace]
        );
        const result = yield call(services.addAllOtherPoints, {
          deviceId: devIdList,
          ...value,
        });
        yield put({
          type: "getOtherPointsByDevIdList",
          payload: {
            devIdList,
            type,
            page: otherPointPage,
            size: otherPointSize,
          },
        });
        return result.errorCode;
      },

      //编辑其他数据
      *updateOtherPoints(action, { put, call, select }) {
        const { devIdList, type, value } = action.payload;
        const result = yield call(services.updateOtherPoints, {
          value: { ...value, type },
          id: value.id,
          deviceId: devIdList,
        });
        const { otherPointPage, otherPointSize } = yield select(
          (state) => state[modelNamespace]
        );
        yield put({
          type: "getOtherPointsByDevIdList",
          payload: {
            devIdList,
            type,
            page: otherPointPage,
            size: otherPointSize,
          },
        });
        return result.errorCode;
      },

      // 删除其他数据
      *deleteOtherPoints(action, { put, call, select }) {
        const { devIdList, type, id } = action.payload;
        const result = yield call(services.deleteOtherPoints, { id });
        const { otherPointSize } = yield select(
          (state) => state[modelNamespace]
        );
        yield put({
          type: "getOtherPointsByDevIdList",
          payload: { devIdList, type, page: 1, size: otherPointSize },
        });
        return result.errorCode;
      },

      // 查询换表记录
      *getRemotePulse(action, { put, call, select }) {
        const { deviceId, pointNumber } = action.payload;
        const result = yield call(services.getRemotePulse, {
          deviceId,
          pointNumber,
        });
        yield updateState(put, {
          remotePulseList: result?.results || [],
        });
      },

      // 新增换表记录
      *addRemotePulse(action, { put, call, select }) {
        const { deviceId, pointNumber, value } = action.payload;
        const result = yield call(services.addRemotePulse, value);
        yield put({ type: "getRemotePulse", payload: { deviceId, pointNumber } });
        return result.errorCode;
      },

      // 编辑换表记录
      *updateRemotePulse(action, { put, call, select }) {
        const { deviceId, pointNumber, value } = action.payload;
        const result = yield call(services.updateRemotePulse, {
          value,
          id: value.id,
        });
        yield put({ type: "getRemotePulse", payload: { deviceId, pointNumber } });
        return result.errorCode;
      },

      // 删除换表记录
      *deleteRemotePulse(action, { put, call, select }) {
        const { deviceId, pointNumber, id } = action.payload;
        const result = yield call(services.deleteRemotePulse, { id });
        yield put({ type: "getRemotePulse", payload: { deviceId, pointNumber } });
        return result.errorCode;
      },

      // 查询端子列表
      *getTerminals(action, { put, call, select }) {
        const { deviceId } = action.payload;
        const result = yield call(services.getTerminals, {
          deviceId,
        });
        yield updateState(put, {
          terminalList: (result?.results || []).map((i) => ({
            value: i.id,
            name: i.title,
            sname: i.name,
          })),
        });
      },

      // 获取二次设备数据
      *getSecondaryDevicesList(action, { put, call, select }) {
        const { stationId } = action.payload;
        const result = yield call(services.getSecondaryDevicesList, {
          stationId,
        });
        yield updateState(put, {
          secondaryDevicesList: (result?.results || []).map((i) => ({
            value: i.id,
            name: i.title,
          })),
        });
      },

      // 新增点号
      *addPoints(action, { put, call, select }) {
        const { deviceId, terminal, value } = action.payload;
        const { PointsPage, PointsSize } = yield select(
          (state) => state[modelNamespace]
        );
        const result = yield call(services.addPoints, value);
        yield put({
          type: "getPointsByDeviceIdAndTerminal",
          payload: {
            deviceId,
            terminal: terminal ?? "default",
            page: PointsPage,
            size: PointsSize,
          },
        });
        return result.errorCode;
      },

      // 修改点号
      *updatePoints(action, { put, call, select }) {
        const { deviceId, terminal, value } = action.payload;
        const { PointsPage, PointsSize } = yield select(
          (state) => state[modelNamespace]
        );
        const result = yield call(services.updatePoints, value);
        yield put({
          type: "getPointsByDeviceIdAndTerminal",
          payload: {
            deviceId,
            terminal: terminal ?? "default",
            page: PointsPage,
            size: PointsSize,
          },
        });
        return result.errorCode;
      },

      // 删除点号
      *deletePoints(action, { put, call, select }) {
        const { deviceId, terminal, id } = action.payload;
        // const { PointsPage, PointsSize } = yield select(
        //   (state) => state[modelNamespace]
        // );
        const result = yield call(services.deletePoints, { id, deviceId, terminal });
        yield put({
          type: "getPointsByDeviceIdAndTerminal",
          payload: {
            deviceId,
            terminal: terminal ?? "default",
            page: 1,
            size: 20,
          },
        });
        return result.errorCode;
      },

      // 批量新增点号
      *addAllPoints(action, { put, call, select }) {
        const { deviceId, terminal, value } = action.payload;
        const { PointsPage, PointsSize } = yield select(
          (state) => state[modelNamespace]
        );
        const result = yield call(services.addAllPoints, {
          deviceId,
          terminal,
          ...value,
        });
        yield put({
          type: "getPointsByDeviceIdAndTerminal",
          payload: {
            deviceId,
            terminal: terminal ?? "default",
            page: PointsPage,
            size: PointsSize,
          },
        });
        return result.errorCode;
      },

      // 查询原点号结束示数
      *getEndMeasure(action, { put, call, select }) {
        const { pointNumber, endTime } = action.payload;
        const result = yield call(services.getEndMeasure, {
          pointNumber,
          endTime,
        });
        yield updateState(put, {
          endVal: result?.results || null,
        });
      },

      // 查询新点号开始示数
      *getStartMeasure(action, { put, call, select }) {
        const { pointNumber, startTime } = action.payload;
        const result = yield call(services.getStartMeasure, {
          pointNumber,
          startTime,
        });
        yield updateState(put, {
          startVal: result?.results || null,
        });
      },

      // 获取当前点号名称
      *getPointNumber(action, { put, call, select }) {
        yield updateState(put, {
          pointNumberTitle: null,
        });
        if (pointNumberSource) {
          pointNumberSource.cancel('cancel')
        }
        pointNumberSource = createCancelSource()
        const { pointNumber, measurePointId } = action.payload;
        const result = yield call(services.getPointNumber, { pointNumber, measurePointId }, pointNumberSource.token);
        yield updateState(put, {
          pointNumberTitle: result?.title ?? null,
        });
      },

      // 换表导出
      *onRemotePulseExport(action, { call, put, select }) {
        const { deviceId, pointNumber } = action.payload;
        const result = yield call(services.getRemotePulse, {
          deviceId,
          pointNumber,
        });

        exportExcel(remotePulseColumns, result?.results || []);
      },

      // 其他数据项导出
      *onOtherPointsExport(action, { call, put, select }) {
        // const { otherPointPage, otherPointSize } = yield select(
        //   (state) => state[modelNamespace]
        // );
        const { devIdList, type } = action.payload;
        const result = yield call(services.getOtherPointsByDevIdList, {
          devIdList,
          type,
          // page: otherPointPage,
          // size: otherPointSize,
        });
        exportExcel(otherPointsColumns, result?.results || []);
      },

      // 导出点表数据
      *onPointsExport(action, { call, put, select }) {
        const { countPointList, unitList, accuracyList } = yield select(
          (state) => state[modelNamespace]
        );

        const unitMap = unitList.reduce((pre, item) => {
          pre[item.value] = item.name;
          return pre;
        }, {});
        const accuracyMap = accuracyList.reduce((pre, item) => {
          pre[item.value] = item.name;
          return pre;
        }, {});
        const { deviceId, terminal } = action.payload;
        const result = yield call(services.getPointsByDeviceIdAndTerminal, {
          deviceId,
          terminal,
          // page: PointsPage,
          // size: PointsSize,
        });
        exportExcel(pointsColumns, (result?.results || []).map((i) => {
          // i.device = pointMap[i.deviceId];
          i.unit = unitMap[i.unit] ?? utils.intl('point.无');
          i.accuracy = accuracyMap[i.accuracy];
          return i;
        }));
      },

      // 导出批量维护点表汇总表
      *onPointListExport(action, { call, put, select }) {
        const { deviceId } = action.payload;
        const result = yield call(services.getPointListByDeviceId, {
          deviceId,
        });
        exportExcel(pointListColumns, result?.results || []);
      },

      // 导出批量维护点表明细
      *onPointDetailExport(action, { call, put, select }) {
        const { countPointList, unitList, accuracyList } = yield select(
          (state) => state[modelNamespace]
        );
        const { deviceId } = action.payload;
        const { results: terminal } = yield call(services.getTerminals, {
          deviceId,
        });
        const result = yield call(services.getPointsByDeviceIdAndTerminal, {
          deviceId,
          terminal: terminal?.length
            ? terminal.map((i) => i.name).join()
            : "default",
        });
        // const { result: terminal } = yield call(services.getTerminals, {});

        const pointMap = countPointList
          .filter((i) => i.id)
          .reduce((pre, item) => {
            pre[item.id] = item.deviceName;
            return pre;
          }, {});
        const unitMap = unitList.reduce((pre, item) => {
          pre[item.value] = item.name;
          return pre;
        }, {});
        const accuracyMap = accuracyList.reduce((pre, item) => {
          pre[item.value] = item.name;
          return pre;
        }, {});

        exportExcel(
          pointDetailColumns,
          (result?.results || []).map((i) => {
            i.device = pointMap[i.deviceId];
            i.unit = unitMap[i.unit] ?? utils.intl('point.无');
            i.accuracy = accuracyMap[i.accuracy];
            i.terminalTitle = i.terminalTitle ?? utils.intl('默认端子')
            return i;
          })
        );
      },
    };
  }
);

// 树格式化 key值格式化成 0-0-1
const formatTreeList = (treeList, superKey?, stationId?) => {
  if (!treeList || !treeList.length) {
    return [];
  }

  return treeList.map((node, index) => {
    const { children } = node;
    const type = node.type;
    const key = superKey ? `${superKey}-${index}` : `${index}`;
    node.stationId = stationId ?? node.id;
    node.key = key;
    node.disabled = node.name === 'GridConnectedUnit';
    if (children && children.length) {
      node.children = formatTreeList(children, key, node.stationId);
    }
    return node;
  });
};

// 换表导出表头
const remotePulseColumns = [
  {
    title: utils.intl("序号"),
    dataIndex: "num",
    width: 65,
    renderE: (text, record, index) => index + 1,
  },
  {
    title: utils.intl("原点号"),
    dataIndex: "originalPid",
    width: 135,
  },
  {
    title: utils.intl("原点号停用时间"),
    dataIndex: "stopTime",
    width: 180,
  },
  {
    title: utils.intl("原点号结束示值"),
    dataIndex: "stopValue",
    width: 180,
  },
  {
    title: utils.intl("新点号"),
    dataIndex: "currentPid",
    width: 135,
  },
  {
    title: utils.intl("新点号启用时间"),
    dataIndex: "startTime",
    width: 180,
  },
  {
    title: utils.intl("新点号起始示值"),
    dataIndex: "startValue",
    width: 180,
  },
];

// 其他数据项导出表头
const otherPointsColumns = [
  {
    title: utils.intl("序号"),
    dataIndex: "num",
    width: 65,
    renderE: (text, record, index) => index + 1,
  },
  {
    title: utils.intl("数据项名称"),
    dataIndex: "typeTitle",
    width: 160,
  },
  {
    title: utils.intl("点号"),
    dataIndex: "pointNumber",
    width: 140,
  },
  {
    title: utils.intl("描述"),
    dataIndex: "desc",
    width: 200,
  },
];

// 批量维护点表汇总表表头
const pointListColumns = [
  {
    title: utils.intl("设备对象"),
    dataIndex: "deviceName",
    width: 135,
  },
  {
    title: utils.intl("输入/输出端"),
    dataIndex: "terminal",
    width: 180,
  },
  {
    title: utils.intl("点号数量"),
    dataIndex: "num",
    width: 100,
  },
];

// 批量维护点表明细表头
const pointDetailColumns = [
  {
    title: utils.intl("序号"),
    dataIndex: "num",
    width: 65,
    renderE: (text, record, index) => index + 1,
  },
  {
    title: utils.intl("数据项名称"),
    dataIndex: "typeTitle",
    width: 160,
  },
  {
    title: utils.intl("缩写/简写"),
    dataIndex: "name",
    width: 120,
  },
  {
    title: utils.intl("初始单位"),
    dataIndex: "unit",
    width: 100,
  },
  {
    title: utils.intl("数据精度"),
    dataIndex: "accuracy",
    width: 100,
  },
  {
    title: utils.intl("点号"),
    dataIndex: "pointNumber",
    width: 120,
  },
  {
    title: utils.intl("点号名称"),
    dataIndex: "title",
    width: 140,
  },
  {
    title: utils.intl("所属设备"),
    dataIndex: "device",
    width: 160,
  },
  {
    title: utils.intl("所属输入输出端"),
    dataIndex: "terminalTitle",
    width: 160,
  },
];

// 点表数据导出
const pointsColumns = [
  {
    title: utils.intl("序号"),
    dataIndex: "num",
    width: 65,
    renderE: (text, record, index) => index + 1,
  },
  {
    title: utils.intl("数据项名称"),
    dataIndex: "typeTitle",
    width: 160,
  },
  {
    title: utils.intl("缩写/简写"),
    dataIndex: "name",
    width: 120,
  },
  {
    title: utils.intl("初始单位"),
    dataIndex: "unit",
    width: 100,
  },
  {
    title: utils.intl("数据精度"),
    dataIndex: "accuracy",
    width: 100,
  },
  {
    title: utils.intl("点号"),
    dataIndex: "pointNumber",
    width: 120,
  },
  {
    title: utils.intl("点号名称"),
    dataIndex: "title",
    width: 140,
  },
];
