import * as services from "./service";
import { message } from "wanke-gui";
import { globalNS, alarm_config, Tree_Type } from "../constants";

import { makeModel } from "../umi.helper";
import { GlobalState } from "umi";
import utils from "../../public/js/utils";
import { exportFile } from "../../util/fileUtil";
import moment from "moment";

export class AlarmState {
  levelConfigList: any[] = []; // 管理员
  userLevelConfigList: any[] = []; // 普通用户
  userList: any[] = [];
  smsList: any[] = [];
  alarmTypesList: any[] = []; // 异常类型配置数据
  alarmTypesPage: number = 1;
  alarmTypesSize: number = 20;
  alarmTypesTotal: number = 0;
  alarmRulesEnums: any = {}; // 相关枚举集合
  alarmRulesList: any[] = []; // 异常类型配置数据
  alarmRulesPage: number = 1;
  alarmRulesSize: number = 20;
  alarmRulesTotal: number = 0;
  pointDataTypesList: any[] = [];
  deviceList: any[] = [];
  exportModalVisible = false;
  syncModalVisible = false;
  syncResults = [];
  alarmTree = [];
  deviceTypeTree = []; // 设备类型时展示的树
  // 设备类型
  terminalList = []; // 当前端子列表
  pointDataTypeList = []; // 当前数据项列表
  allPointDataTypeList = {}; // 所有数据项列表枚举
  pointDataModalVisible = false; // 选择数据项弹窗
  pointTreeData = []; // 选择数据项弹窗左侧树
  pointDataList = [] // 选择数据项弹窗数据项
  techPointDataList = []  // 选择数据项弹窗技术参数数据项
  stationList = [];
  stationType = {}
}

export default makeModel(
  alarm_config,
  new AlarmState(),
  (updateState, updateQuery, getState) => {
    return {
      // 获得当前各异常级别通知配置
      *getLevelConfig({ payload }, { select, put }) {
        const globalState: GlobalState = yield select(
          (state) => state[globalNS]
        );
        const { firmId } = globalState;
        const { results: levelConfigList } = yield services.getLevelConfig({
          firmId,
          type: 0,
        });
        yield updateState(put, {
          levelConfigList: transformLevelConfig(levelConfigList),
        });
      },

      // 修改状态 | 修改电站
      *changeStatus({ payload }, { select, put }) {
        yield services.changeStatus(payload);
        yield put({ type: "getLevelConfig" });
      },

      // 获得系统中所有用户列表
      *getUser({ payload }, { select, put }) {
        const globalState: GlobalState = yield select(
          (state) => state[globalNS]
        );
        const { firmId } = globalState;
        const { results: userList } = yield services.getUser({
          firmId,
        });
        yield updateState(put, { userList });
      },

      // 获得已经绑定的短信接收人
      *getAlarmSmsConfig({ payload }, { select, put }) {
        const { results: smsList } = yield services.getAlarmSmsConfig(payload);
        yield updateState(put, { smsList: transformSmsList(smsList) });
      },

      // 短信接收人保存
      *putAlarmReceiver({ payload }, { select, put }) {
        const { body } = payload;
        // console.log('body', body)
        const { errorCode } = yield services.putAlarmReceiver({
          // alarmNotifyConfigId,
          body: transformSmsListToServer(body),
        });
        if (errorCode === 0) message.success(utils.intl("保存成功"));
        yield put({ type: "getUser" });
        yield put({
          type: "getAlarmSmsConfig",
          // payload: { alarmNotifyConfigId },
        });
      },

      // 获得当前各异常级别通知配置-普通用户
      *getLevelConfigUser({ payload }, { select, put }) {
        const globalState: GlobalState = yield select(
          (state) => state[globalNS]
        );
        const { userId } = globalState;
        const { results: userLevelConfigList } = yield services.getLevelConfig({
          userId,
          type: 1,
        });
        yield updateState(put, {
          userLevelConfigList: transformLevelConfig(userLevelConfigList),
        });
      },

      // 修改状态
      *changeStatusUser({ payload }, { select, put }) {
        yield services.changeStatus(payload);
        yield put({ type: "getLevelConfigUser" });
      },

      // 获得所有异常类型配置列表
      *getAlarmTypesList({ payload }, { select, put }) {
        const { page, size } = payload;
        const { results: alarmTypesResults } = yield services.getAlarmTypesList(
          payload
        );
        yield updateState(put, {
          alarmTypesList: alarmTypesResults.results,
          alarmTypesPage: page,
          alarmTypesSize: size,
          alarmTypesTotal: alarmTypesResults.totalCount,
        });
      },

      // 删除异常类型
      *deleteAlarmTypes({ payload }, { select, put }) {
        const { id, searchObj } = payload;
        const { errorCode } = yield services.deleteAlarmTypes({ id });
        if (errorCode === 0) message.success(utils.intl("删除成功"));
        yield put({
          type: "getAlarmTypesList",
          payload: { page: 1, size: 20, ...searchObj },
        });
      },

      // 批量删除异常类型
      *deleteAllAlarmTypes({ payload }, { select, put }) {
        const { ids, searchObj } = payload;
        const { errorCode } = yield services.deleteAllAlarmTypes({ ids });
        if (errorCode === 0) message.success(utils.intl("删除成功"));
        yield put({
          type: "getAlarmTypesList",
          payload: { page: 1, size: 20, ...searchObj },
        });
      },

      // 新增异常类型
      *postAlarmTypes({ payload }, { select, put }) {
        const { body, searchObj } = payload;
        const { errorCode } = yield services.postAlarmTypes(body);
        yield put({
          type: "getAlarmTypesList",
          payload: { page: 1, size: 20, ...searchObj },
        });
        return errorCode;
      },
      // 修改异常类型
      *putAlarmTypes({ payload }, { select, put }) {
        const { body, searchObj } = payload;
        const { errorCode } = yield services.putAlarmTypes(body);
        yield put({
          type: "getAlarmTypesList",
          payload: { page: 1, size: 20, ...searchObj },
        });
        return errorCode;
      },

      // 获取相关枚举集合
      *getAllEnums({ payload }, { select, put }) {
        const { results: alarmRulesEnums } = yield services.getAllEnums();
        const deviceTypeTree = alarmRulesEnums.deviceTypes
        yield updateState(put, { alarmRulesEnums, deviceTypeTree: transformDeviceTypeTree(deviceTypeTree) });
      },
      // 获得异常规则对象
      *getAlarmRulesList({ payload }, { select, put }) {
        const { page, size } = payload;
        const { stationType } = yield select(state => state[alarm_config])
        const { results: alarmRulesResults } = yield services.getAlarmRulesList(
          { ...payload, stationType: stationType.id }
        );
        // console.log('alarmRulesResults', alarmRulesResults)
        yield updateState(put, {
          alarmRulesList: alarmRulesResults.results,
          alarmRulesPage: page,
          alarmRulesSize: size,
          alarmRulesTotal: alarmRulesResults.totalCount,
        });
      },
      // 删除异常类型
      *deleteAlarmRules({ payload }, { select, put }) {
        const { id, searchObj } = payload;
        const { errorCode } = yield services.deleteAlarmRules({ id });
        if (errorCode === 0) message.success(utils.intl("删除成功"));
        yield put({
          type: "getAlarmRulesList",
          payload: { page: 1, size: 20, ...searchObj },
        });
      },

      // 批量删除异常类型
      *deleteAllAlarmRules({ payload }, { select, put }) {
        const { ids, searchObj } = payload;
        const { errorCode } = yield services.deleteAllAlarmRules({ ids });
        if (errorCode === 0) message.success(utils.intl("删除成功"));
        yield put({
          type: "getAlarmRulesList",
          payload: { page: 1, size: 20, ...searchObj },
        });
      },
      // 批量修改级别
      *patchAlarmRulesLevel({ payload }, { select, put }) {
        const { ids, alarmLevelId, searchObj } = payload;
        const { errorCode } = yield services.patchAlarmRulesLevel({
          ids,
          alarmLevelId,
        });
        if (errorCode === 0) message.success(utils.intl("修改成功"));
        yield put({
          type: "getAlarmRulesList",
          payload: { page: 1, size: 20, ...searchObj },
        });
      },

      // 获得设备大类/电站类型对应的点号数据类型列表(数据项)
      *getPointDataTypes({ payload }, { select, put }) {
        const {
          results: pointDataTypesList,
        } = yield services.getPointDataTypes({ isBind: true, ...payload });
        pointDataTypesList.forEach((item, index) => {
          item.num = index + 1;
        });
        yield updateState(put, { pointDataTypesList });
      },

      *getDeviceList({ payload }, { select, put }) {
        const { results: deviceList } = yield services.getDeviceList({
          ...payload,
        });
        // console.log('deviceList', deviceList)
        yield updateState(put, {
          deviceList: transformDeviceOption(deviceList),
        });
      },

      // 新增异常规则
      *postAlarmRules({ payload }, { select, put }) {
        const { body, searchObj } = payload;
        const { stationType } = yield select(state => state[alarm_config])
        const { errorCode } = yield services.postAlarmRules(body.map(item => ({ ...item, stationType: { id: stationType.id } })));
        yield put({
          type: "getAlarmRulesList",
          payload: { page: 1, size: 20, ...searchObj },
        });
        yield put({
          type: "getAlarmTypesList",
          payload: {},
        });
        return errorCode;
      },
      // 修改异常规则
      *putAlarmRules({ payload }, { select, put }) {
        const { body, searchObj, id } = payload;
        const { errorCode } = yield services.putAlarmRules({ id, body });
        yield put({
          type: "getAlarmRulesList",
          payload: { page: 1, size: 20, ...searchObj },
        });
        yield put({
          type: "getAlarmTypesList",
          payload: {},
        });
        const { results: record } = yield services.getAlarmRuleById({ id });
        return { errorCode, record };
      },

      // 导出
      *onExport({ payload }, { call, put, select }) {
        const { searchObj, tabsKey } = payload;

        const columns =
          tabsKey === "station"
            ? [
                {
                  title: "ID",
                  dataIndex: "id",
                  key: "id",
                  width: 160,
                },
                {
                  title: utils.intl("适用电站"),
                  dataIndex: "stations",
                  key: "stations",
                  renderE: (obj) =>
                    obj && obj.length
                      ? obj.map((item) => item.title).join()
                      : utils.intl("全部"),
                },
                {
                  title: utils.intl("异常类型"),
                  dataIndex: "alarmType",
                  key: "alarmType",
                  width: 120,
                  renderE: (obj) => obj?.title || "",
                },
                {
                  title: utils.intl("异常详情"),
                  dataIndex: "desc",
                  key: "desc",
                },
                {
                  title: utils.intl("异常级别"),
                  dataIndex: "alarmLevel",
                  key: "alarmLevel",
                  width: 120,
                  renderE: (obj) => obj?.title || "",
                },
                {
                  title: utils.intl("维护时间"),
                  dataIndex: "dtime",
                  key: "dtime",
                  width: 180,
                },
                {
                  title: utils.intl("维护人"),
                  dataIndex: "userTitle",
                  key: "userTitle",
                  width: 180,
                },
              ]
            : [
                {
                  title: "ID",
                  dataIndex: "id",
                  key: "id",
                  width: 180,
                },
                {
                  title: utils.intl("设备类型"),
                  dataIndex: "deviceType",
                  key: "deviceType",
                  width: 160,
                  renderE: (obj) => obj?.title || "",
                },
                {
                  title: utils.intl("适用范围"),
                  dataIndex: "devices",
                  key: "devices",
                  renderE: (obj) =>
                    obj && obj.length > 0
                      ? (obj || []).map((i) => i.title).join()
                      : utils.intl("全部"),
                },
                {
                  title: utils.intl("异常类型"),
                  dataIndex: "alarmType",
                  key: "alarmType",
                  width: 180,
                  renderE: (obj) => obj?.title || "",
                },
                {
                  title: utils.intl("异常详情"),
                  dataIndex: "desc",
                  key: "desc",
                  width: 180,
                },
                {
                  title: utils.intl("异常级别"),
                  dataIndex: "alarmLevel",
                  key: "alarmLevel",
                  width: 120,
                  renderE: (obj) => obj?.title,
                },
                {
                  title: utils.intl("维护时间"),
                  dataIndex: "dtime",
                  key: "dtime",
                  width: 180,
                },
                {
                  title: utils.intl("维护人"),
                  dataIndex: "userTitle",
                  key: "userTitle",
                  width: 180,
                },
              ];

        const { results: alarmRulesResults } = yield services.getAlarmRulesList(
          searchObj
        );
        // console.log("alarmRulesResults", alarmRulesResults);
        exportFile(columns, alarmRulesResults.results, [], {
          filename: `${utils.intl("异常规则")} ${moment().format(
            "YYYY-MM-DD HH:mm:ss"
          )}`,
        });
      },

      // 导出
      *onExportNew({ payload }, { call, put, select }) {
        const { stationIds } = payload;
        yield call(services.exportSync, { stationIds: stationIds.join(",") });
        yield put({
          type: "updateToView",
          payload: { exportModalVisible: false },
        });
      },

      // 同步
      *onSync({ payload }, { call, put, select }) {
        const { stationIds } = payload;
        yield put({
          type: "updateToView",
          payload: { syncResults: [] },
        });
        const { results: syncResults } = yield call(services.syncAlarmRules, {
          stationIds: stationIds.join(","),
        });
        yield put({
          type: "updateToView",
          payload: { syncResults },
        });
      },

      // 全部电站开关
      *putIsAllStation({ payload }, { select, put }) {
        yield services.putIsAllStation(payload);
        yield put({ type: "getLevelConfig" });
      },

      // 获得适用对象树
      *getAlarmObjectsTree({ payload }, { select, put }) {
        const { results: alarmTree } = yield services.getAlarmObjectsTree();
        // yield put({ type: "getLevelConfig" });
        // const alarmTree = [{
        //   id: 1,
        //   title: '电站',
        //   type: 'Station',
        //   children: [{
        //     id: 11,
        //     title: '设备类型',
        //     type: 'deviceType',
        //     children: [{
        //       id: 111,
        //       title: '设备',
        //       type: 'device',
        //     }]
        //   }]
        // }]
        yield updateState(put, { alarmTree: transformAlarmTree(alarmTree) });
      },

      // 查询适用对象（拼接到树上deviceTypeTree）
      *getDeviceTypeTreeChildren({ payload }, { select, put }) {
        const { deviceTypeName, firmId } = payload
        const { results: alarmTree } = yield services.getDeviceTypeTreeChildren({ deviceTypeName, firmId });
        const { deviceTypeTree } = yield select(state => state[alarm_config])

        if(!alarmTree?.length || !alarmTree.find(i => i.children?.length)) message.warn(utils.intl('暂无数据'))

        const newDeviceTypeTree = deviceTypeTree.map(item => {
          if(item.type === deviceTypeName){
            item.children = transformDeviceTypeTreeChildren(alarmTree);
          }
          return item
        })
        yield updateState(put, { deviceTypeTree: newDeviceTypeTree });
      },

      // 根据设备类型查询端子
      *getTerminalsByDeviceTypeId({ payload }, { select, put }) {
        const { deviceTypeId } = payload
        const { results } = yield services.getTerminalsByDeviceTypeId({ deviceTypeId });
        const terminalList = results?.length ? results : [{ id: -1, name: 'default', title: '默认端子' }];
        yield updateState(put, { terminalList });
        return terminalList
      },

      // 获得数据点号枚举
      *getPointDataTypesByTerminals({ payload }, { select, put }) {
        const { deviceTypeId, queryStr, terminal } = payload
        const { allPointDataTypeList } = yield select(state => state[alarm_config]);
        const { results: pointDataTypeList } = yield services.getPointDataTypes({ isBind: true, deviceTypeId, queryStr, terminal });
        allPointDataTypeList[terminal] = pointDataTypeList; // 拼接数据
        yield updateState(put, { pointDataTypeList: pointDataTypeList.map((item, index) => {
          item.num = index + 1;
          return item
        }), allPointDataTypeList });
      },

      // 选择数据项-----获取设备树
      *getPointDataTree({ payload }, { select, put }) {
        const { id, isStation } = payload
        const result = yield services.getPointDataTree({
          id,
          isStation
        });

        yield updateState(put, {
          pointTreeData: formatTreeList(result?.results || []),
        });
      },
      // 选择数据项-----获取数据项
      *getPointData({ payload }, { select, put }) {
        const { deviceId, isOther } = payload
        const result = yield services.getPointData({
          deviceId,
          isOther,
        });

        yield updateState(put, {
          pointDataList: formatPointData(result?.results || []),
        });
      },
      // 选择数据项-----获取数据项
      *getTechPointData({ payload }, { select, put }) {
        const { deviceId } = payload
        const result = yield services.getTechPointData({
          modId: deviceId,
        });

        yield updateState(put, {
          techPointDataList: filterTechPointDataList(result?.results || []),
        });
      },

      // 获取电站列表
      *getStationList({ payload }, { select, put }){
        // const { firmId } = payload
        const result = yield services.getStationList({
          firmId: payload?.firmId,
        });

        yield updateState(put, {
          stationList: result?.results?.results || [],
        });
      },

      // 获取电站类型的id 
      *getStationTypeByName({ payload }, { select, put }){
        const result = yield services.getStationTypeByName();

        yield updateState(put, {
          stationType: result?.results || {},
        });
      }
    };
  }
);

function formatPointData(list) {
  return list.map(item => {
    return {
      ...item,
      points: item.points?.map(point => ({
        id: point.typeId,
        title: point.typeTitle,
      }))
    }
  })
}

function isNumber(name) {
  const numberList = ['int32', 'double', 'float']
  return name && numberList.indexOf(name) > -1
}

function filterPointDataList(list) {
  return list.filter(item => item.title)
}

function filterTechPointDataList(list) {
  return list.filter(item => isNumber(item.dataType?.name))
}

// 转换级别配置数据格式
function transformLevelConfig(originLevelCofig: any[] = []): any[] {
  const results = [];
  for (let i = 0; i < originLevelCofig.length; i++) {
    const {
      alarmLevel: originAlarmLevel,
      alarmNotifyType,
      stations,
      ...restObj
    } = originLevelCofig[i];
    const alarmLevelIndex = results.findIndex(
      (item) => item.id === originAlarmLevel?.id
    );
    if (alarmLevelIndex >= 0) {
      results[alarmLevelIndex].alarmNotifyType.push({
        ...alarmNotifyType,
        stations,
        ...restObj,
      });
    } else {
      results.push({
        ...(originAlarmLevel || {}),
        alarmNotifyType: [
          {
            ...alarmNotifyType,
            stations,
            ...restObj,
          },
        ],
      });
    }
  }

  return results;
}

// 转换短信接收人数据格式
function transformSmsList(originSmsList: any[] = []): any[] {
  return originSmsList.map((item) => ({
    ...(item.user || {}),
    timeRange: item.timeRange,
    key: item.user?.id,
  }));
}

// 将前端表格数据转换成服务器需要的数据
function transformSmsListToServer(originSmsList: any[] = []): any[] {
  return originSmsList.map((item) => {
    const { key, timeRange, ...user } = item;
    return { user, timeRange };
  });
}

// 将device数据转换成下拉数据
function transformDeviceOption(deviceList: any[] = []): any[] {
  return deviceList.map((item) => {
    const { children, ...restItem } = item;
    if (children) item.children = transformDeviceOption(children);
    item.value = restItem.id;
    item.name = restItem.title;
    return item;
  });
}

// 适用对象树数据格式转换
function transformAlarmTree(alarmTree: any[] = [], superId?): any[] {
  const results = [];
  for (let i = 0; i < alarmTree.length; i++) {
    const { children, id, type, title, hasChild } = alarmTree[i];
    const item: any = {};
    item.value = id ?? (superId ? `${superId}_${i}` : i);
    item.key = id ?? (superId ? `${superId}_${i}` : i);
    item.id = id;
    item.title = title;
    item.disabled = type === 'VirtualNode';
    item.selectable = type !== 'VirtualNode';
    item.hasChild = hasChild
    if(children?.length){
      item.children = transformAlarmTree(children, i);
    }else if(!hasChild){
      item.isLeaf = true
    }
    results.push(item);
  }
  return results;
}

// 适用对象树数据格式转换（设备类型）
function transformDeviceTypeTree(deviceTypes: any[] = []): any[]{
  const results = [];
  for (let i = 0; i < deviceTypes.length; i++) {
    const { id, name, title, children } = deviceTypes[i];
    const item: any = {};
    item.value = id;
    item.name = title;
    item.type = name;
    item.hasChild = true;
    // if(children?.length){
    //   item.children = transformDeviceTypeTree(children);
    // }
    results.push(item);
  }
  return results;
}

function transformDeviceTypeTreeChildren(deviceTypes: any[] = []): any[]{
  const results = [];
  for (let i = 0; i < deviceTypes.length; i++) {
    const { id, type, title, children } = deviceTypes[i];
    if(children?.length){
      for (let j = 0; j < children.length; j++){
        const { id: cId, type: cType, title: cTitle } = children[j];
        const item: any = {};
        item.groupName = title;
        item.value = cId;
        item.name = cTitle;
        item.type = cType;
        results.push(item);
      }
    }
    // 没有设备的电站过滤掉
    // else{
    //   const item: any = {};
    //   item.value = id;
    //   item.name = title;
    //   item.type = type;
    //   results.push(item);
    // }
  }
  return results;
}

// 树格式化 key值格式化成 0-0-1
const formatTreeList = (treeList, superKey?) => {
  if (!treeList || !treeList.length) {
    return [];
  }

  return treeList.map((node, index) => {
    const { children } = node;
    const type = node.type;
    const key = superKey ? `${superKey}-${index}` : `${index}`;
    node.key = key;
    node.disabled = node.name === 'GridConnectedUnit' || node.type === Tree_Type.virtualNode;
    if (children && children.length) {
      node.children = formatTreeList(children, key);
    }
    return node;
  });
};
