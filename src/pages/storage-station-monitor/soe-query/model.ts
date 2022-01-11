import { makeModel } from '../../../pages/umi.helper';
import { s_q } from '../../..//pages/constants';
import services from './service';
import { exportFile } from '../../..//util/fileUtil';
import utils from '../../..//public/js/utils';

export class SoeQueryState {
  list = []
  total = 0
}

export default makeModel(s_q, new SoeQueryState(), (updateState, updateQuery, getState) => {
  return {
    * fetchSoe({ payload }, { put, call }) {
      const { pageParam, startTime, endTime, stationId } = payload;
      const data = yield call(services.fetchSoe, { stationId, page: pageParam.page, size: pageParam.size, startTime, endTime });
      yield updateState(put, {
        list: data.results.results,
        total: data.results.totalCount
      });
    },
    * onExport({ payload }, { call, put, select }) {
      const { startTime, endTime, stationId } = payload;
      const data = yield call(services.fetchSoe, { stationId, startTime, endTime });
      for (let i = 0, len = data.results.results.length; i < len; i++) {
        data.results.results[i].dtime = `'${data.results.results[i].dtime}'`;
      }
      exportFile(getColumns(), data.results.results);
    }
  }
})

function getColumns() {
  const columns = [
    {
      title: utils.intl('序号'),
      width: 90,
      align: 'center',
      dataIndex: 'num'
    },
    {
      title: utils.intl('数据时间'),
      dataIndex: 'dtime',
      align: 'center'
    },
    {
      title: utils.intl('设备对象'),
      dataIndex: 'deviceTitle',
    },
    {
      title: utils.intl('所属单元'),
      dataIndex: 'energyUnitTitle',
    },
    {
      title: utils.intl('原始值'),
      dataIndex: 'previousVal',
      align: 'right'
    },
    {
      title: utils.intl('新值'),
      dataIndex: 'val',
      align: 'right'
    }
  ]
  return columns
}