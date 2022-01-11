import { message } from 'wanke-gui'
import { makeModel } from "../umi.helper";
import { data_mock } from "../constants";
import Service from "./service";
import utils from '../../util/utils';
import util from '../../public/js/utils'

export class DataMockModal {
  query = {
    page: 1,
    size: 20
  };
  total = 0;
  list = [];
}

export default makeModel(
  data_mock,
  new DataMockModal(),
  (updateState, updateQuery, getState) => {
    return {
      *getTableData(action, { put, call, select }) {
        const { query } = yield getState(select);
        const { stationId } = action.payload;
        const params = { stationId, ...query };
        if(params.stationId === 'all') delete params.stationId;
        const { results: list = [], page = 1, size = 20, totalCount = 0 } = yield call(Service.getTable, params);
        yield updateQuery(select, put, { page, size });
        yield updateState(put, {
          list,
          total: totalCount
        });
      },
      *deleteTemplate(action, { put, call, select }) {
        const { stationId, templateId } = action.payload;
        yield call(Service.deleteTemplate, { templateId });
        message.success(utils.intl('操作成功'))
        yield put({ type: 'getTableData', payload: { stationId } });
      },
      *export(action, { put, call, select }) {
        const { stationId, startTime, endTime, id, filename } = action.payload;
        const params = { stationId, startTime, endTime, id };
        if(params.stationId === 'all') delete params.stationId;
        if(params.stationId) params.stationId = Number(params.stationId);
        const { results = "" } = yield call(Service.export, params);
        utils.downloadFileByBlob(new Blob([results], { type: 'application/ms-txt.numberformat' }), `${filename}.csv`);
      },
      *import(action, { put, call, select }) {
        const { stationId, file } = action.payload;
        const formData = new FormData();
        formData.append('template', file)
        if(stationId !== 'all') {
          formData.append('stationId', stationId)
        }
        const results = yield call(Service.import, formData);
        yield updateQuery(select, put, { page: 1 })
        yield put({ type: 'getTableData', payload: { stationId } });
        message.success(util.intl('导入成功'));
      },
      *operateTemplate(action, { put, call, select }) {
        const { stationId, type, templateId } = action.payload;
        const params = {
          templateId,
          stationId
        };
        let serviceFn = type === 'start' ? Service.startTemplate : Service.stopTemplate;
        const results = yield call(serviceFn, params);
        yield put({ type: 'getTableData', payload: { stationId } });
        message.success(util.intl('操作成功'));
      },
      *supplementTemplate(action, { put, call, select }) {
        const { stationId, templateId, startTime, endTime } = action.payload;
        const params = {
          templateId,
          startTime,
          endTime,
          stationId
        };
        const results = yield call(Service.startTemplate, params);
        yield put({ type: 'getTableData', payload: { stationId } });
        message.success(util.intl('操作成功'));
      },
    };
  }
);
