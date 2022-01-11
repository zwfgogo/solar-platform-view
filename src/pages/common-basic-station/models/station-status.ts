import { makeModel } from "../../umi.helper"
import { stationStatusListNS } from "../../constants"
import { exportFile } from "../../../util/fileUtil"
import { ExportColumn } from "../../../interfaces/CommonInterface"
import * as Service from "../station.service"
import utils from "../../../public/js/utils"

export class StationStatusModal {
  totalCount = 0
  list = []
}

export default makeModel(
  stationStatusListNS,
  new StationStatusModal(),
  (updateState, updateQuery, getState) => {
    return {
      * getTableData(action, { put, call, select }) {
        const { stationId } = action.payload
        const params = { id: stationId }
        const { results: list, totalCount } = yield call(
          Service.getStationListByStatus,
          params
        )
        yield updateState(put, {
          list,
          totalCount
        })
      },
      * onExport(action, { put, call, select }) {
        const { stationId } = action.payload
        const params = { id: stationId }
        const { results: list } = yield call(
          Service.getStationListByStatus,
          params
        )
        exportFile(columns, list)
      }
    }
  }
)

const columns: ExportColumn[] = [
  { title: utils.intl('电站名称'), dataIndex: "stationTitle" },
  { title: utils.intl('电站状态'), dataIndex: "stationStatusTitle" },
  { title: utils.intl('状态开始时间'), dataIndex: "startTime" },
  { title: utils.intl('持续时间'), dataIndex: "continueTime", renderE: text => text ? `${text}小时` : '' },
  { title: utils.intl('操作人'), dataIndex: "userTitle" }
]
