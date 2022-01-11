import {makeModel} from '../../umi.helper'
import {Socket_Port, storage_run_strategy_socket} from '../../constants'
import SocketHelper from '../../socket.helper'
import {copy} from '../../../util/utils'

import utils from '../../../public/js/utils'
import { sortChartData } from '../../page.helper'

const socket = new SocketHelper(storage_run_strategy_socket, Socket_Port, '/run-strategy', { forceNew: true })

export class RunStrategyModelSocket {
  socketLoading = false
  chargeTotal = 0
  dischargeTotal = 0

  powerList = []
  units = []
}

export default makeModel(storage_run_strategy_socket, new RunStrategyModelSocket(), (updateState, updateQuery, getState) => {
  return {
    * init(action, {put, call, select}) {
      const {stationId, dispatch, date, runStrategyId} = action.payload
      yield updateState(put, {socketLoading: true})
      socket.start(dispatch, {
        'charge': 'getCharge',
        'power': 'getPower',
      }, {
        'connect': () => {
          socket.emit('charge', {stationId, date, runStrategyId})
          socket.emit('power', {stationId, date, frequency: 'original', runStrategyId})
        },
        'reconnect': (e) => {
          const newState = new RunStrategyModelSocket()
          dispatch({
            type: `${storage_run_strategy_socket}/updateToView`,
            payload: newState
          })
        }
      })
    },
    * getCharge(action, {call, put, select}) {
      const {results} = action.payload.result
      let {chargeTotal, dischargeTotal} = yield getState(select)
      chargeTotal = results.charge
      dischargeTotal = results.discharge
      yield updateState(put, {
        chargeTotal, dischargeTotal
      })
    },
    * getPower(action, {call, put, select}) {
      yield updateState(put, {socketLoading: false})
      const {results} = action.payload.result
      let {powerList, units} = yield getState(select)
      powerList = copy(powerList)
      units = results.units || units

      units.forEach(unit => {
        let match = powerList.find(item => item.unitId == unit.id)
        if (!match) {
          powerList.push({
            unitId: unit.id,
            xData: [],
            yData: [],
            series: {name: (unit.title || '') + utils.intl('有功功率'), unit: 'kW'}
          })
        }
      })

      results.power.forEach(powerItem => {
        let match = powerList.find(item => item.unitId == powerItem.unitId)
        let matchUnit = units.find(item => item.id == powerItem.unitId)
        if (!match) {
          match = {
            unitId: powerItem.unitId,
            xData: [],
            yData: [],
            series: {name: (matchUnit?.title || '') + utils.intl('有功功率'), unit: 'kW'}
          }
          powerList.push(match)
        }
        match.xData.push(powerItem.dtime)
        match.yData.push(powerItem.val)
      })

      yield updateState(put, {
        powerList, units
      })
    },
    * closeSocket(action, {put}) {
      socket.close()
      yield updateState(put, new RunStrategyModelSocket())
    }
  }
})
