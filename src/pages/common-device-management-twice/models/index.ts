import { makeModel } from "../../umi.helper";
import { device_management_twice, Mode } from "../../constants";
import Service from "../services/index";
import { message } from "antd";
import utils from "../../../public/js/utils";

export enum ModalMode {
  add,
  edit,
}

export class DeviceManagementTwiceModal {
  treeList = []
  selectedKey = undefined
  stationDetail: any = {}
  deviceList = []
  mode = ModalMode.add
  modalVisible = false
  record: any = {}
}

export default makeModel(
  device_management_twice,
  new DeviceManagementTwiceModal(),
  (updateState, updateQuery, getState) => {
    return {
      * fetchStationsTree(action, { select, call, put }) {
        let data = yield Service.getTree({});
        let selectedKey = undefined
        data.forEach(item => {
          item.key = item.id.toString()
          item.selectable = false
          item.children?.forEach(child => {
            child.key = child.id.toString()
            child.selectable = true
            if (!selectedKey) {
              selectedKey = child.key
            }
          })
        })
        yield put({
          type: 'updateToView',
          payload: {
            treeList: data,
            selectedKey
          }
        })
      },
      * fetchStationDetail(action, { select, call, put }) {
        const { id } = action.payload
        let data = yield Service.fetchStationManageInfo({ id });
        yield put({
          type: 'updateToView',
          payload: {
            stationDetail: data || {},
          }
        })
      },
      * editStationDetail(action, { select, call, put }) {
        const id = action.payload.id
        yield Service.patchStationManageInfo(action.payload);
        message.success(utils.intl('操作成功'))
        yield put({ type: 'fetchStationDetail', payload: { id } })
      },
      * fetchDeviceList(action, { select, call, put }) {
        const { stationId } = action.payload
        let data = yield Service.getDevices({ stationId });
        const list = (data || []).map((item, index) => ({ ...item, num: index + 1 }))
        yield put({
          type: 'updateToView',
          payload: {
            deviceList: list,
          }
        })
      },
      * addOrEditDevice(action, { select, call, put }) {
        const { mode, ...other } = action.payload
        const { selectedKey } = yield select(state => state[device_management_twice])
        if (mode === ModalMode.add) {
          yield Service.postDevice(other);
        } else {
          yield Service.putDevice(other);
        }
        message.success(utils.intl('操作成功'))
        yield put({ type: 'fetchDeviceList', payload: { stationId: selectedKey } })
      },
      * deleteDevice(action, { select, call, put }) {
        const { id } = action.payload
        const { selectedKey } = yield select(state => state[device_management_twice])
        try {
          yield Service.deleteDevice({ id });
          message.success(utils.intl('操作成功'))
          yield put({ type: 'fetchDeviceList', payload: { stationId: selectedKey } })
        } catch (error) {
          console.log(error)
        }
      },
    };
  }
);
