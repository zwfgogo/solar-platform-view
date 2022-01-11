import { makeModel } from '../../umi.helper'
import { benefit_monitor } from '../../constants'
import { fetchBenefitInfo, fetchChart } from './benefit-monitor.server'
import moment from 'moment'
import { Terminal_SocketUrl } from '../../constants'
import SocketHelper from '../../socket.helper'
import { formatChartData, sortChartData } from '../../page.helper'

const socket = new SocketHelper(benefit_monitor, Terminal_SocketUrl, '/income')

export class BenefitMonitorState {
  dateTime = moment().format('YYYY-MM-DD')
  info = {
    charge: '',
    discharge: '',
    profit: '',
    coal: '',
    co2: ''
  }
  dateSelected = 'day'
  xData = []
  yData = []
  series = []
  incomeType = 'detail'
  profitChart = {
    series: [
      {
        name: '收益情况',
        unit: '元'
      }]
  }
}

export default makeModel(benefit_monitor, new BenefitMonitorState(), (updateState, updateQuery, getState) => {
  return {
    *init(action, { put, call, select }) {
      const { incomeType, dateTime } = yield select(state => state.benefit_monitor)
      const { dispatch } = action.payload
      socket.start(dispatch, {
        'curve': 'fetchChart',
        'info': 'fetchBenefitInfo',
      }, {
        'connect': () => {
          socket.emit('curve', { stationId: sessionStorage.getItem('station-id'), mod: incomeType, dateTime })
          socket.emit('info', { stationId: sessionStorage.getItem('station-id') })
        }
      })
    },
    *closeSocket() {
      socket.close()
    },
    *emitSocket(action, { put, call }) {
      const { eventName, params = {} } = action.payload
      socket.emit(eventName, params)
    },
    *fetchBenefitInfo(action, { call, put, select }) {
      let { info } = yield select(state => state.benefit_monitor)
      const { result } = action.payload;
      yield updateState(put, { info: { ...info, ...result.results } })
    },
    *fetchChart(action, { put, call, select }) {
      // let { dateSelected, dateTime } = yield getState(select)
      // if (dateSelected == 'year') {
      //   dateTime = moment(dateTime).format('YYYY')
      // }
      // if (dateSelected == 'month') {
      //   dateTime = moment(dateTime).format('YYYY-MM')
      // }
      // let { xData, yData, series } = yield call(fetchChart, { type: dateSelected, dateTime: dateTime })
      // yield updateState(put, { xData: xData, yData, series })
      let { profitChart } = yield select(state => state.benefit_monitor)
      const { result } = action.payload;
      profitChart = formatChartData(profitChart, result?.results, ['profit'])
      profitChart = sortChartData(profitChart)
      yield updateState(put, { profitChart: profitChart })
    }
  }
})
