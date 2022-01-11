import { history } from 'umi'
import { exportFile } from '../../util/fileUtil'
import { globalNS } from '../constants'
import { makeModel } from '../umi.helper'
import services from './service'

const Service = {}
const SERVICE_MAP = {}

export class ReportModel {
  page = 1
  size = 20
  chargeList = []
  strategyTotal = 0
  enumsValue = ''
}

export default makeModel('ChargeAndDischarge', new ReportModel(), (updateState, updateQuery) => {
  return {
    // 按策略统计查询账单
    * getStrategyReportList({ payload }: any, { call, put, select }: any) {
      const { enumsValue } = yield select(state => state['ChargeAndDischarge'])
      const { selectedStationId: stationId } = yield select(state => state[globalNS])
      const { page, size, startTime, endTime } = payload
      const { results, totalCount: total, page: nowPage, size: nowSize } = yield call(services.getChargeDischargeList, {
        page,
        size,
        dtime: [startTime, endTime],
        type: enumsValue,
        stationId,
      })
      console.log(results)
      yield put({ type: 'updateToView', payload: { chargeList: results, page: nowPage, size: nowSize, strategyTotal: total } })
    },
    * exportCsv({ payload }, { put, select, call }) {
      const { startTime, endTime } = payload
      const { enumsValue, page, size } = yield select(state => state['ChargeAndDischarge'])
      const { selectedStationId: stationId } = yield select(state => state[globalNS])
      const data = yield call(services.getChargeDischargeList, {
        page,
        size,
        dtime: [startTime, endTime],
        type: enumsValue,
        stationId,
      })
      for (let i = 0, len = (data.results || []).length; i < len; i++) {
        data.results[i].num = i + 1;
        data.results[i].typeName = data.results[i].type === 'Charge' ? '充电' : '放电';
        data.results[i].electricity = data.results[i].electricity || data.results[i].electricity === 0 ? data.results[i].electricity + 'kWh' : '';
        data.results[i].startOcvExport = data.results[i].startOcv || data.results[i].startOcv === 0 ? data.results[i].startOcv + 'V' : '';
        data.results[i].endOcvExport = data.results[i].endOcv || data.results[i].endOcv === 0 ? data.results[i].endOcv + 'V' : '';
        data.results[i].startVoltageExport = data.results[i].startVoltage || data.results[i].startVoltage === 0 ? data.results[i].startVoltage + 'V' : '';
        data.results[i].endVoltageExport = data.results[i].endVoltage || data.results[i].endVoltage === 0 ? data.results[i].endVoltage + 'V' : '';
      }
      exportFile(getColumns(), data.results || [], null, { filename: '充放电记录' });
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
      title: '充电/放电',
      dataIndex: 'typeName',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
    },
    {
      title: '累计电量',
      dataIndex: 'electricity',
    },
    {
      title: '开始OCV',
      dataIndex: 'startOcvExport',
    },
    {
      title: '结束OCV',
      dataIndex: 'endOcvExport',
    },
    {
      title: '开始电堆总电压',
      dataIndex: 'startVoltageExport',
    },
    {
      title: '结束电堆总电压',
      dataIndex: 'endVoltageExport',
    },
  ]
  return columns
}