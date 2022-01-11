import { makeModel } from "../../umi.helper";
import { device_management_twice_signal } from "../../constants";
import Service from "../services/signalList";
import utils from "../../../public/js/utils";
import { exportCSV, exportExcel } from "../../../util/fileUtil";

export class DeviceManagementTwiceSignalModal {
  dataSource = []
  total = 0
}

export default makeModel(
  device_management_twice_signal,
  new DeviceManagementTwiceSignalModal(),
  (updateState, updateQuery, getState) => {
    return {
      * fetchList(action, { select, call, put }) {
        const { deviceId, searchStr, pageSize } = action.payload
        let data = yield Service.getAnalogs({
          ...pageSize,
          queryStr: searchStr,
          deviceId,
        });
        yield put({
          type: 'updateToView',
          payload: {
            dataSource: data?.results || [],
            total: data?.totalCount || 0
          }
        })
      },
      * export(action, { select, call, put }) {
        const { deviceId, searchVal, deviceName } = action.payload
        let data = yield Service.getAnalogs({
          queryStr: searchVal,
          deviceId,
        });
        exportExcel(columns, data.results || [], deviceName + utils.intl('采集信号'))
      },
      * importData(action, { select, call, put }) {
        const { deviceId, list } = action.payload
        yield Service.postAnalogs({
          deviceId,
          list,
        });
      },
    };
  }
);

const columns: any = [
  {
    title: utils.intl('点号'),
    dataIndex: 'pointNumber',
  },
  {
    title: utils.intl('信号名称'),
    dataIndex: 'title',
  },
  {
    title: utils.intl('单位'),
    dataIndex: 'unit',
  },
]
