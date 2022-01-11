import { makeModel } from "../../umi.helper";
import { iot_select_controller, iot_index } from "../../constants";
import Service from "../services/selectController";
import { ExportColumn } from "../../../interfaces/CommonInterface";
import { message } from "wanke-gui";
import { triggerEvent } from "../../../util/utils";

export class SelectControllerModal {
  query = {
    page: 1,
    size: 20,
    queryStr: ""
  };
  totalCount = 0;
  list = [];
  selectedList = [];// 原始勾选项
  checkedList = [];// 现在勾选项
  visible = false;
  stationId;
}

export default makeModel(
  iot_select_controller,
  new SelectControllerModal(),
  (updateState, updateQuery, getState) => {
    return {
      *getTableData(action, { put, call, select }) {
        let { query, stationId, checkedList, selectedList } = yield getState(select);
        const params = { ...query, isBind: false, stationId };
        const { results: list = [], totalCount, selected = [] } = yield call(
          Service.getTable,
          params
        );
        checkedList = checkedList.slice();
        selectedList = selectedList.slice();
        selected.forEach(item => {
          const target = item?.toString()
          // 如果是新获取到的勾选项，添加到现有勾选中
          if (selectedList.indexOf(target) === -1) {
            selectedList.push(target);
            checkedList.push(target);
          }
        });

        yield updateState(put, {
          list: list.map(item => ({
            ...item,
            key: item.id?.toString()
          })),
          totalCount,
          selectedList,
          checkedList
        });
        // setTimeout(() => {
        //   triggerEvent('resize', window);
        // }, 300);
      },
      *save(action, { put, call, select }) {
        const { checkedList, stationId } = yield getState(select);
        yield call(Service.bindController, { id: stationId, controllerIds: checkedList.map(item => Number(item)) });
        message.success('操作成功');
        yield put({ type: `${iot_index}/getTableData` });
      }
    };
  }
);

const columns: ExportColumn[] = [];
