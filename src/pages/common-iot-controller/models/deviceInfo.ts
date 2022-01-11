import { makeModel } from "../../umi.helper";
import { iot_device_info } from "../../constants";
import Service from "../services/deviceInfo";
import { exportFile } from "../../../util/fileUtil";
import { ExportColumn } from "../../../interfaces/CommonInterface";
import utils from "../../../util/utils";

export class DeviceInfoModal {
  query = {
    page: 1,
    size: 20,
    queryStr: ""
  };
  totalCount = 0;
  list = [];
}

export default makeModel(
  iot_device_info,
  new DeviceInfoModal(),
  (updateState, updateQuery, getState) => {
    return {
      *getTableData(action, { put, call, select }) {
        const { query } = yield getState(select);
        const { stationId } = action.payload;
        const params = { ...query };
        if(stationId) params.id = stationId;
        const { results: list, totalCount } = yield call(
          stationId ? Service.getTable : Service.getTableWithoutId,
          params
        );
        yield updateState(put, {
          list,
          totalCount
        });
      },
      *onExport(action, { put, call, select }) {
        const { query } = yield getState(select);
        const { stationId } = action.payload;
        const params = { ...query };
        if(stationId) params.id = stationId;
        delete params.page;
        delete params.size;
        const { results: list } = yield call(
          stationId ? Service.getTable : Service.getTableWithoutId,
          params
        );
        exportFile(columns, list);
      }
    };
  }
);

const columns: ExportColumn[] = [
  { title: "序号", dataIndex: "num" },
  { title: "控制器名称", dataIndex: "title" },
  { title: "控制器型号", dataIndex: "model" },
  { title: "SN码", dataIndex: "name" },
  { title: "配置文件", dataIndex: "configFile" },
  { title: "配置时间", dataIndex: "configTime" },
  { title: "所属工程名称", dataIndex: "project" },
];
