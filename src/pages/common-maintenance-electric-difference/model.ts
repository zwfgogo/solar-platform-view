import Service from './service'
import { makeModel } from "../umi.helper"
import moment from 'moment'
import { exportFile } from "../../util/fileUtil"
import { ExportColumn } from "../../interfaces/CommonInterface"
import utils from '../../public/js/utils'

let date = moment().subtract(1, 'day').format('YYYY-MM-DD')

function formatReasonListData(data: any[] = []) {
  return data.reduce((list, curItem) => {
    return list.concat(curItem.differentRecord || [])
  }, [])
}

function formatChartData(data: any) {
  const { results = [], legend = [], unit = [] } = data;
  const yData = results.map(row =>
    row.map(item => {
      if(item.val === null || item.val === undefined || item.val === "") return "";
      const value = Number(item.val);
      return isNaN(value) ? 0 : value;
    })
  );
  const xData = (results[0] || []).map(item => {
    return item.dtime?.slice(0, 10)
  });
  const series = legend.map((item, index) => ({
    name: utils.intl(item),
    unit: unit[index] || "",
    type: index > 1 ? 'bar' : 'line'
  }));

  return {
    xData,
    yData,
    series
  };
}

export class ElectricDiffState {
  list = []
  ElectricCompareList = []
  reasonTable = []
  loading = true
  compareLoading = true
  runModal = false
  resModal = false
  record = {}
  type = ''
  query = {
    page: 1,
    size: 20,
    queryStr: ''
  }
  stationId = null
  electricCompareDate = date
  compareResDate = date
    rangeDate = date
  radioType = 'charge'
  reasonTitle = []
  startDate = moment().subtract(7, 'day').format('YYYY-MM-DD')
  endDate = moment().subtract(1, 'day').format('YYYY-MM-DD')
  electricChart = {
    xData: [],
    yData: [],
    series: [],
  }
}

export default makeModel('electricDifference', new ElectricDiffState(), (updateState, updateQuery, getState) => {
  return {
    * getList(action, {select, call, put}) {
      const {compareResDate, stationId} = yield select(state => state.electricDifference)
      const res = yield Service.getList({
        startDate: compareResDate,
        endDate: compareResDate,
        stationId
      })
      const { results: tableList = [] } = res;
      yield put({
        type: 'updateToView',
        payload: {list: formatReasonListData(tableList)/* , total: res.results.totalCount */}
      })
      // yield updateQuery(select, put, {
      //   page: res.results.page, size: res.results.size
      // })
    },
    * getElectricCompare(action, {select, call, put}) {
      const {radioType, electricCompareDate, stationId} = yield select(state => state.electricDifference)
      const res = yield Service.getElectricCompare({
        date: electricCompareDate, stationId: stationId, type: radioType
      })
      yield put({
        type: 'updateToView',
        payload: {ElectricCompareList: res.results}
      })
    },
    * getResList(action, {select, call, put}) {
      const res = yield Service.getResList({
        firmId: sessionStorage.getItem('firm-id')
      })
      yield put({
        type: 'updateToView',
        payload: {reasonTable: res.results.results, reasonTitle: res.results.results, button: true}
      })
    },
    * addResList(action, {select, call, put}) {
      const res = yield Service.addResList({
        firmId: sessionStorage.getItem('firm-id'), reasonTitle: action.payload.reasonTitle
      })
      yield put({
        type: 'getResList'
      })
    },
    * editResList(action, {select, call, put}) {
      const res = yield Service.editResList({
        firmId: sessionStorage.getItem('firm-id'), reasonTitle: action.payload.reasonTitle, id: action.payload.id
      })
      yield put({
        type: 'getResList'
      })
    },
    * deleteResList(action, {select, call, put}) {
      const res = yield Service.deleteResList({
        id: action.payload.id
      })
      yield put({
        type: 'getResList'
      })
    },
    * deleteList(action, {select, call, put}) {
      const res = yield Service.deleteList({
        id: action.payload.id
      })
      yield put({
        type: 'getList'
      })
    },
    * save(action, {select, call, put}) {
      const {type, id, stationId} = yield select(state => state.electricDifference)
      // const {activeKey: stationId} = yield select(state => state.stationTree)
      if (type === 'new') {
        const res = yield Service.addList({
          ...action.payload.values, stationId
        })
      } else {
        const res = yield Service.editList({
          ...action.payload.values, id: id, stationId
        })
      }
      yield put({
        type: 'getList'
      })
      yield put({
        type: 'updateToView',
        payload: {runModal: false}
      })
    },
    * updateState(action, {call, put}) {
      yield put({
        type: 'updateToView',
        payload: action.payload
      })
    },
    * stringChange({payload: {queryStr}}, {select, put}) {
      yield updateQuery(select, put, {
        queryStr
      })
    },
    * pageChange({payload: {page, size}}, {select, put}) {
      yield updateQuery(select, put, {
        page,
        size
      })
      yield put({
        type: 'getList'
      })
    },
      * onExport(action, {call, put, select}) {
          const {compareResDate, stationId} = yield select(state => state.electricDifference)
          const res = yield Service.getList({
              startDate: compareResDate,
              endDate: compareResDate,
              stationId
          })
          const { results: tableList = [] } = res;
          exportFile(query_columns, formatReasonListData(tableList))
      },
      * onExport2(action, {call, put, select}) {
          const {radioType, electricCompareDate, stationId} = yield select(state => state.electricDifference)
          const res = yield Service.getElectricCompare({
              date: electricCompareDate, stationId: stationId, type: radioType
          })
          exportFile(stage_columns, res.results)
      },
      * getElectricChart(action, {call, put, select}) {
          const res = yield Service.getChartAxios(action.payload)
          const chartInfo = formatChartData(res || {})
          yield put({
            type: 'updateToView',
            payload: {
              electricChart: chartInfo
            }
          })
      }
  }
}, {}, {
  setup({dispatch, history}) {
    return history.listen(({pathname, query}) => {
      if (pathname === '/operation-maintenance/electricity-difference') {
        // dispatch({type: 'getList', query: query})
        dispatch({type: 'reset'})
      }
    })
  }
})
const stage_columns: ExportColumn[] = [
    {
        title: utils.intl('运行阶段'), dataIndex: 'title', key: 'runPhase'
    },
    {
        title: utils.intl('费率'), dataIndex: 'rate', key: 'rate'
    },
    {
        title: utils.intl('电量(kWh)'), dataIndex: 'value', key: 'ele'
    },
    {
        title: utils.intl('目标偏差(%)'), dataIndex: 'bias', key: 'bias'
    }
]
const query_columns: ExportColumn[] = [
    {
        title: utils.intl('编号'), dataIndex: 'num', key: 'number'
    },
    {
        title: utils.intl('原因标题'), dataIndex: 'causeTitle', key: 'causeTitle'
    },
    {
        title: utils.intl('详情'), dataIndex: 'detail', key: 'detail'
    },
    {
        title: utils.intl('解决方案'), dataIndex: 'solution', key: 'solution'
    },
    {
        title: utils.intl('计划完成时间'),
        dataIndex: 'planCompleteTime',
        key: 'planCompleteTime',
        renderE: text => text?.split(' ')[0]
    },
    {
        title: utils.intl('责任部门'), dataIndex: 'dutyDept', key: 'dutyDept'
    },
    {
        title: utils.intl('责任人'), dataIndex: 'dutyUserTitle', key: 'dutyUserTitle'
    },
]
