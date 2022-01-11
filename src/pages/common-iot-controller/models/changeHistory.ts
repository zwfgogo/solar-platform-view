import { makeModel } from "../../umi.helper";
import { iot_change_history } from "../../constants";
import Service from "../services/changeHistory";
import { exportFile } from "../../../util/fileUtil";
import { ExportColumn } from "../../../interfaces/CommonInterface";
import utils from "../../../util/utils";

export class ChangeHistoryModal {
  query = {
    page: 1,
    size: 20,
    queryStr: ""
  };
  totalCount = 0;
  list = [];
  editRecord: any = {};
  editModal = false;
}

export default makeModel(
  iot_change_history,
  new ChangeHistoryModal(),
  (updateState, updateQuery, getState) => {
    return {
      *getTableData(action, { put, call, select }) {
        const { controllerId } = action.payload;
        const { query } = yield getState(select);
        const params = { ...query, controllerId };
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
        const { query } = yield getState(select);
        const params = { ...query };
        delete params.page;
        delete params.size;
        const { results: list } = yield call(Service.getTable, params);
        exportFile(columns, list);
      }
    };
  }
);

const columns: ExportColumn[] = [
  { title: utils.intl('序号'), dataIndex: "num" },
  {
    title: utils.intl('原有设备名称'),
    dataIndex: "oldDevice",
    renderE: value => value && value.title
  },
  {
    title: utils.intl('替换设备名称'),
    dataIndex: "newDevice",
    renderE: value => value && value.title
  },
  { title: utils.intl('设备更换时间'), width: 170, dataIndex: "replaceTime" },
  { title: utils.intl('正向有功电能示数原有设备'), dataIndex: "OldPositive" },
  { title: utils.intl('正向有功电能示数替换设备'), dataIndex: "NewPositive" },
  { title: utils.intl('反向有功电能示数原有设备'), dataIndex: "OldNegative" },
  { title: utils.intl('反向有功电能示数替换设备'), dataIndex: "NewNegative" }
];
