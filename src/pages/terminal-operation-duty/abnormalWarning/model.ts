import Service from './service'
import { makeModel } from '../../umi.helper'
import { exportFile } from '../../../util/fileUtil'
import { ExportColumn } from '../../../interfaces/CommonInterface'
import {t_abnormal_warning} from '../../constants'

export class abnormalWarningModal {
  list = []
  total = 0
    radioArr=[{title:'忽略(无法查询，不通知)',value:'Ignore',name:1},
        {title:'轻微(可查询，不通知)',value:'Slight',name:2},
        {title:'中度(可查询，系统消息通知)',value:'Moderate',name:3},
        {title:'严重(可查询，系统通知+短信通知)',value:'Serious',name:4}]
  query = {
    page: 1,
    size: 20,
    queryStr: ''
  }
  id = ''
  type = ''
    getAlarmLevel= 1
    selectedRowKeys = []
    alarmLevel=[]
}

export default makeModel(t_abnormal_warning, new abnormalWarningModal(), (updateState, updateQuery, getState) => {
  return {
    * getList(action, {select, call, put}) {
      const {query} = yield select(state => state.t_abnormal_warning)
      const res = yield Service.getList({...query})
      yield put({
        type: 'updateToView',
        payload: {list: res.results?.results || []}
      })
      yield updateState(put, {
        total: res.results?.totalCount
      })
      yield updateQuery(select, put, {
        page: res.results?.page, size: res.results?.size
      })
    },
      *patchList(action, { call, put }) {
          const res = yield Service.patchList({...action.payload})
          yield put({
              type: 'updateToView',
              payload: {levelModal: false}
          });
          yield put({
              type: 'getList',
          });
      },
      *enumsAlarmLevel(action, { call, put }) {
          const res = yield Service.enumsAlarmLevel({
              resource: 'alarmLevels',
              hasAll: false,
              property:'description',
              sort:'id'
          })
          if(res.results){
              yield put({
                  type: 'updateToView',
                  payload: {alarmLevel: res.results,getAlarmLevel:res.results[0].value}
              });
          }
          yield put({
            type: 'getList'
        });
      },
      *updateState(action, { call, put }) {
          yield put({
              type: 'updateToView',
              payload: action.payload
          });
      },
      * stringChange({payload:{queryStr}}, {select, put}) {
          yield updateQuery(select, put, {
              queryStr
          });
      },
      *pageChange({payload:{page, size}}, {select, put}) {
          yield updateQuery(select, put, {
              page,
              size,
          });
          yield put({
              type: 'getList',
          });
      },
    * onExport(action, {call, put, select}) {
        const {query} = yield select(state => state.t_abnormal_warning)
        const res = yield Service.getList({queryStr:query.queryStr,stationId:sessionStorage.getItem('station-id')})
        exportFile(current_exception_columns, res.results?.results || [])
    }
  }
})

export const current_exception_columns: ExportColumn[] = [
    {
        title: '异常名称', dataIndex: 'title', key: 'ycmc', width: '17%',
    },
    {
        title: '设备对象', dataIndex: 'devTitle', key: 'sb', width: '26%'
    },
    {
        title: '判断条件', dataIndex: 'condition', key: 'pdtj', width: '40%',
    },
    {
        title: '告警级别',
        dataIndex: 'alarmLevel',
        key: 'sfxsycgj',
        width: '17%',
        renderE: (text) => text?.title || ""
    }
]
