import { makeModel } from "../../umi.helper";
import { iot_index } from "../../constants";
import Service from "../services/iotIndex";
import { exportFile } from "../../../util/fileUtil";
import { ExportColumn } from "../../../interfaces/CommonInterface";
import utils from "../../../util/utils";

export class IotIndexModal {
  query = {
    page: 1,
    size: 20,
    queryStr: ""
  };
  totalCount = 0;
  list = [];
}

export default makeModel(
  iot_index,
  new IotIndexModal(),
  (updateState, updateQuery, getState) => {
    return {
      *getTableData(action, { put, call, select }) {
        const { query } = yield getState(select);
        const params = { ...query };
        delete params.page;
        delete params.size;
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
  { title: "序号", dataIndex: "num" },
  { title: "电站名称", dataIndex: "title" },
  { title: "电站类型", dataIndex: "stationType", renderE: (text) => text.title },
  { title: "建设规模", dataIndex: "scaleDisplay" },
  {
    title: "关联的控制器",
    dataIndex: "linkControllers",
    renderE: (text) => (text || []).map(item => item.title).join(",")
  }
];
