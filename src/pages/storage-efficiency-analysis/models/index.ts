import { history } from 'umi'
import { exportFile } from '../../../util/fileUtil'
import { globalNS } from '../../constants'
import { makeModel } from '../../umi.helper'
import services from '../services/index'

export class AnalysisModel {
  efficiencyPage = 1
  efficiencySize = 20
  efficiencyList = []
  efficiencyTotal = 0
  dateType = ''
  efficiencyChart = {}
}

export default makeModel('Analysis', new AnalysisModel(), (updateState, updateQuery) => {
  return {
    *reset(action, { select, call, put }) {
      yield put({
        type: 'updateToView',
        payload: new AnalysisModel()
      });
    },
    * getStrategyReportList({ payload }: any, { call, put, select }: any) {
      const { page, size } = payload
      const { selectedStationId: stationId } = yield select(state => state[globalNS])
      const { results, page: nowPage, size: nowSize, totalCount: total } = yield call(services.getSummary, {
        page, size, stationId
      });
      let chartData = {
        xData: ['整体效率', '电堆效率'], yData: [], series: []
      }
      let newYData = [];
      let newSeries = [];
      results.map((o, i) => {
        newYData.push(o.efficiency)
        newYData.push(o.stackTotalEfficiency)
        newSeries.push({ name: o.energyUnitTitle, unit: '%' })
        chartData.yData.push(newYData)
        newYData = []
      })
      chartData.series = newSeries
      yield put({ type: 'updateToView', payload: { efficiencyList: results, efficiencyPage: nowPage, efficiencySize: nowSize, efficiencyChart: chartData, efficiencyTotal: total } })
    },
    * exportCsv({ payload }, { put, call, select }) {
      const { selectedStationId: stationId } = yield select(state => state[globalNS])
      const { efficiencyPage, efficiencySize } = yield select(state => state['AnalysisDetail'])
      const data = yield call(services.getSummary, {
        page: efficiencyPage,
        size: efficiencySize,
        stationId,
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
      title: '储能单元',
      dataIndex: 'energyUnitTitle',
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