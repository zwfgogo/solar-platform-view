import { history } from 'umi'
import moment, { Moment, DurationInputArg2 } from 'moment';
import { makeModel } from '../../umi.helper';
import { exportFile } from '../../../util/fileUtil';
import services from '../services/detail'
import { globalNS } from '../../constants';

const SERVICE_MAP = {}
const Service = {}

export class AnalysisDetailModel {
  efficiencySize = 1
  efficiencyPage = 20
  efficiencyListDetail = undefined
  efficiencyTotal = 0
  dateType = 'Day'
  efficiencyChartDetail = {
    xData: [], yData: [], series: []
  }
  unitType = ''
  reportLoading = true
  efficiencySummary = ''
  stackTotalEfficiencySummary = ''
  dateValue = [moment().subtract(30, 'days'), moment()]
}

export default makeModel('AnalysisDetail', new AnalysisDetailModel(), (updateState, updateQuery) => {
  return {
    *reset(action, { select, call, put }) {
      yield put({
        type: 'updateToView',
        payload: new AnalysisDetailModel()
      });
    },
    * getNearlyDate({ payload }: any, { call, put, select }: any) {
      const { energyUnitId } = payload
      const { selectedStationId: stationId } = yield select(state => state[globalNS])
      const { results } = yield call(services.getLast, {
        energyUnitId,
        stationId
      });
      return results.dtime
    },
    * getSummary({ payload }: any, { call, put, select }: any) {
      const { selectedStationId: stationId } = yield select(state => state[globalNS])
      const { dateType } = yield select(state => state['AnalysisDetail'])
      const { startTime, endTime, energyUnitId } = payload
      const { results } = yield call(services.getSummary, {
        dtime: [startTime, endTime], type: dateType, energyUnitId, stationId
      });
      if (results.length) {
        yield put({ type: 'updateToView', payload: { efficiencySummary: results[0].efficiency, stackTotalEfficiencySummary: results[0].stackTotalEfficiency } })
      } else {
        yield put({ type: 'updateToView', payload: { efficiencySummary: '', stackTotalEfficiencySummary: '' } })
      }
    },
    * getStrategyReportList({ payload }: any, { call, put, select }: any) {
      const { selectedStationId: stationId } = yield select(state => state[globalNS])
      const { dateType } = yield select(state => state['AnalysisDetail'])
      const { page, size, startTime, endTime, energyUnitId } = payload
      const { results, totalCount: total } = yield call(services.getDetail, {
        page, size, dtime: [startTime, endTime], type: dateType, energyUnitId,
        stationId
      });
      let chartData = {
        xData: [], yData: [], series: [{ name: '整体效率', unit: '%' }, { name: '电堆总效率', unit: '%' }]
      }
      let yData1 = [];
      let yData2 = [];
      let newxData = []
      results.map((o, i) => {
        yData1.push(o.efficiency)
        yData2.push(o.stackTotalEfficiency)
        newxData.push(o.dtime)
      })
      chartData.yData = [yData1, yData2]
      chartData.xData = newxData
      yield put({ type: 'updateToView', payload: { efficiencyListDetail: results, efficiencyPage: page, efficiencySize: size, efficiencyTotal: total, efficiencyChartDetail: chartData } })
    },
    * exportCsv({ payload }, { put, call, select }) {
      const { selectedStationId: stationId } = yield select(state => state[globalNS])
      const { dateType, efficiencyPage: page, efficiencySize: size, unitType: energyUnitId } = yield select(state => state['AnalysisDetail'])
      const { startTime, endTime } = payload
      const data = yield call(services.getDetail, {
        page, size , dtime: [startTime, endTime], type: dateType, energyUnitId, stationId
      });
      for (let i = 0, len = (data.results || []).length; i < len; i++) {
        data.results[i].num = i + 1;
      }
      exportFile(getColumns(), data.results || [], null, { filename: '效率分析' });
    }
  }
})


function getColumns() {
  const columns = [
    {
      title: '序号',
      dataIndex: 'num',
    },
    {
      title: '时间',
      dataIndex: 'dtime',
    },
    {
      title: '整体效率',
      dataIndex: 'efficiency',
    },
    {
      title: '电堆总效率',
      dataIndex: 'stackTotalEfficiency',
    }
  ]
  return columns
}