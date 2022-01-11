import { makeModel } from "../../umi.helper";
import Service, { getDeviceList } from "../services/collectingDevice";
import { exportFile } from "../../../util/fileUtil";
import { ExportColumn } from "../../../interfaces/CommonInterface";
import utils from "../../../util/utils";
import { iot_collecting_device } from "../../constants";
import { message } from "wanke-gui";
import { operationStatusMap, OPERATION_STATUS } from "../components/collectingDeviceList";

export class CollectingDeviceModal {
  query = {
    page: 1,
    size: 20,
    queryStr: ""
  };
  totalCount = 0;
  list = [];
  isDeviceConfirmModal = false;
  originalDeviceList = [];
  replaceDeviceList = [];
  confirmRecord: any = {};
  confirmType = "edit";
  confirmData: any = {};
  changeEnum = [];
}

export default makeModel(
  iot_collecting_device,
  new CollectingDeviceModal(),
  (updateState, updateQuery, getState) => {
    return {
      // 更换确认枚举
      *getChangeEnum(action, { put, call, select }) {
        const changeEnum = yield call(
          Service.getChangeEnum,
          { resource: "deviceReplaces", property: "name,title" }
        );
        yield updateState(put, {
          changeEnum: changeEnum || []
        });
      },
      *getTableData(action, { put, call, select }) {
        const { controllerId } = action.payload;
        const { query } = yield getState(select);
        const params = { ...query, id: controllerId };
        const { results: list, totalCount } = yield call(
          Service.getTable,
          params
        );
        yield updateState(put, {
          list,
          totalCount
        });
      },
      *onExport(action, { put, call, select }) {
        const { controllerId } = action.payload;
        const { query } = yield getState(select);
        const params = { ...query, id: controllerId };
        delete params.page;
        delete params.size;
        const { results: list } = yield call(Service.getTable, params);
        exportFile(columns, list);
      },
      *confirmDevice(action, { put, call, select }) {
        const { changeEnum } = yield getState(select);
        const {
          data = {},
          recordId,
          controllerId,
          isNewOrRemoved,
          deviceRecordId,
          type,
          prevConfirmType
        } = action.payload;
        const requestData = { ...data };
        // 标识用自定义参数 不需要上传
        delete requestData.measureFunc;
        requestData.replaceTime = requestData.replaceTime &&
          requestData.replaceTime.format("YYYY-MM-DD HH:mm:ss");
        const controlReplace: any = {
          name: type,
          title: type ? operationStatusMap[type] : ""
        }
        if(type) {
          changeEnum.forEach(item => {
            if(item.name === type) {
              controlReplace.id = item.value;
            }
          });
        }
        if(isNewOrRemoved || (!recordId && prevConfirmType)) {
          // 新增设备或已删除, 或者新增设备，已删除改成替换设备，已替换，重置
          yield call(Service.changeRecordType, {
            id: controllerId,
            recordId: deviceRecordId,
            controlReplace: type === OPERATION_STATUS.reset ? null : controlReplace,
            deviceReplace: isNewOrRemoved ? null : requestData
          });
        } else if(recordId) {
          // 编辑更换记录
          yield call(Service.editChangeRecord, { ...requestData, id: recordId });
        } else {
          // 新增更换记录
          yield call(Service.newChangeRecord, {
            ...requestData,
            recordId: deviceRecordId,
            controllerId,
            controlReplace
          });
        }
        message.success("操作成功");
        yield put({ type: "getTableData", payload: { controllerId } });
      },
      *getDeviceList(action, { put, call, select }) {
        const { controllerId } = action.payload;
        const params = { controllerId };
        const { originDevice = [], changeDevice = [] } = yield call(
          getDeviceList,
          params
        );
        yield updateState(put, {
          originalDeviceList: originDevice,
          replaceDeviceList: changeDevice
        });
      },
      *getChangeHistoryInfo(action, { put, call, select }) {
        const { id } = action.payload;
        const results = yield call(
          Service.getChangeHistoryByDeviceId,
          { recordId: id }
        );
        return results;
      },
    };
  }
);

const columns: ExportColumn[] = [
  { title: "序号", dataIndex: "num" },
  { title: "设备名称", dataIndex: "title" },
  { title: "设备型号", dataIndex: "name" },
  { title: "协议类型", dataIndex: "deviceModel" },
  { title: "状态", dataIndex: "controlState" },
  { title: "设备状态时间", dataIndex: "stateTime" },
  {
    title: "说明",
    dataIndex: "explain",
    renderE: value => value && value.title ? value.title : ""
  },
  {
    title: "更换确认",
    dataIndex: "controlReplace",
    renderE: value => value && value.title ? value.title : ""
  },
];
