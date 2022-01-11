import services from "./services";
import { makeModel } from "../umi.helper";
import moment from "moment";
import { exportFile } from "../../util/fileUtil";
import utils from "../../public/js/utils";
import { numberToFixed } from "../../util/utils";

export const modelNamespace = "electricityFormManagement";

export class ElectricityFormManagement {
  tableList: [];
  page: 1;
  size: 20;
  total: 0;
}

export default makeModel(
  modelNamespace,
  new ElectricityFormManagement(),
  (updateState, updateQuery, getState) => {
    return {
      // 查询数据
      *getTableList(action, { put, call, select }) {
        const { stationId, page, size } = action.payload;
        const result = yield call(services.getTableList, {
          stationId,
          page,
          size,
        });

        yield updateState(put, {
          tableList: result?.results || [],
          page,
          size,
          total: result.totalCount,
        });
      },

      *onExport(action, { call, put, select }) {
        const { stationId } = action;
        const data = yield call(services.getTableList, {
          stationId,
        });
        exportFile(getColumns(), data.results);
      },
    };
  }
);

function getColumns() {
  const columns = [
    {
      title: utils.intl("序号"),
      dataIndex: "num",
      width: 65,
    },
    {
      title: utils.intl("账单名称"),
      dataIndex: "billName",
      width: 250,
    },
    {
      title: utils.intl("开始时间"),
      dataIndex: "startTime",
      width: 180,
      renderE: (text) => moment(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: utils.intl("结束时间"),
      dataIndex: "endTime",
      width: 180,
      renderE: (text) => moment(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: utils.intl("储能充电量(kWh)"),
      dataIndex: "totalCharge",
      width: 135,
      align: "right",
      renderE: (text) => numberToFixed(text) ?? "--",
    },
    {
      title: utils.intl("储能放电量(kWh)"),
      dataIndex: "totalDischarge",
      width: 135,
      align: "right",
      renderE: (text) => numberToFixed(text) ?? "--",
    },
    {
      title: utils.intl("电源累计发电量(kWh)"),
      dataIndex: "totalGeneration",
      width: 135,
      align: "right",
      renderE: (text) => numberToFixed(text) ?? "--",
    },
    {
      title: utils.intl("电网用电量(kWh)"),
      dataIndex: "totalConsumption",
      width: 135,
      align: "right",
      renderE: (text) => numberToFixed(text) ?? "--",
    },
    {
      title: utils.intl("上网电量(kWh)"),
      dataIndex: "totalOngridEnergy",
      width: 135,
      align: "right",
      renderE: (text) => numberToFixed(text) ?? "--",
    },
  ];
  return columns;
}
