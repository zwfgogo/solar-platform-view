import Service from './service'
import { getUpdateQuery, makeModel } from "../umi.helper"
import { exportFile } from "../../util/fileUtil"
import { ExportColumn } from "../../interfaces/CommonInterface"
import { message } from 'wanke-gui';

export class AlarmNotification {
  list = []
  total = 0
  query = {
    page: 1,
    size: 20,
    queryStr: ''
  }
  notificationModal = false
  modalTitle = ''
  time = [{ endTime: '00:00', startTime: '00:00' }]
}

export default makeModel('alarmNotification', new AlarmNotification(), (updateState, updateQuery, getState) => {
  return {
    * getList(action, { select, call, put }) {
      const { query } = yield select(state => state.alarmNotification)
      const res = yield Service.getList({ ...query })
      const {
        results: list = [],
        totalCount = 0,
        page = 1,
        size = 20
      } = res.results || {};
      yield put({
        type: 'updateToView',
        payload: { list, total: totalCount }
      })
      yield updateQuery(select, put, { page, size })
    },
    *save(action, { select, call, put }) {
      const { modalTitle, record } = yield select(state => state.vpp);
      const { values } = action.payload;
      if (modalTitle === '新增成员') {
        const res = yield Service.addList({ ...action.payload, dateTime: action.payload.dateTime })
        message.success('新增成功')
      } else {
        const res = yield Service.editList({ ...action.payload, dateTime: action.payload.dateTime })
        message.success('编辑成功')
      }
      yield put({
        type: 'updateToView',
        payload: { notificationModal: false }
      });
      yield put({
        type: 'getList',
      });
    },

    *deleteRecord(action, { select, call, put }) {
      const { id } = action.payload;
      const res = yield Service.deleteList({ id: id });
      message.success('删除成功')
      yield put({
        type: 'getList',
      });
    },
    * updateState(action, { call, put }) {
      yield put({
        type: 'updateToView',
        payload: action.payload
      })
    },
    * stringChange({ payload: { queryStr } }, { select, put }) {
      yield updateQuery(select, put, {
        queryStr
      })
    },
    * pageChange({ payload: { page, size, listType } }, { select, put }) {
      yield updateQuery(select, put, {
        page,
        size
      })
      yield put({
        type: 'stringChange',
        payload: { queryStr: '' }
      })
      yield put({
        type: 'getList'
      })
    },
    * onExport(action, { call, put, select }) {
      const { query } = yield select(state => state.alarmNotification)
      const res = yield Service.getList({ ...query })
      const { results } = yield Service.getList({ ...query })
      exportFile(current_exception_columns, results.results)
    }
  }
})
export const current_exception_columns: ExportColumn[] = [
  {
    title: '短信接收人姓名', dataIndex: 'receiveName',
  },
  {
    title: '手机号', dataIndex: 'phone',
  },
  {
    title: '短信接收时间', dataIndex: 'dtime',
  },
]