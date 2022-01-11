import Service from '../../services/global'
import { getAction, makeModel } from '../umi.helper'
import { history } from 'umi'
import { globalNS, loginNS, settingNS } from '../constants'
import utils from '../../public/js/utils'
import { isTerminalSystem, isBatterySystem } from '../../core/env'
import { message } from 'wanke-gui'

localStorage.setItem('language', localStorage.getItem('language') || 'zh')

export enum LoginStep {
  step_1,
  step_2
}

export class LoginModel {
  name = ''
  password = ''
  nameLoss = false
  passwordLoss = false
  errorTip = ''
  deadline = 0
  isClick = false
  isVerified = false
  loginStep = LoginStep.step_1
}

export default makeModel(loginNS, new LoginModel(), (updateState, updateQuery) => {
  return {
    * getVerifyStatus(action, { put, select }) {
      try {
        const { name } = yield select(state => state[loginNS])
        if (!name) {
          message.error(utils.intl('login.请输入用户名'))
          return
        }
        const { results } = yield Service.getUserStatus({ name })
        const { status } = results
        if (status === 0) {
          //正常登陆
          yield put({
            type: 'updateToView',
            payload: { isVerified: true }
          })
        } else if(status === 1 || status === 2) {
          // 滑块验证
          yield put({
            type: 'updateToView',
            payload: { loginStep: LoginStep.step_2 }
          })
        }
      } catch (e) {
        yield updateState(put, {
          errorTip: e.errorMsg
        })
      }
    },
    * getLogin(action, { put, select }) {
      try {
        const { name, password } = yield select(state => state[loginNS])
        const lossPayload = {}
        for (let key in action.payload) {
          if (!action.payload[key]) {
            lossPayload[`${key}Loss`] = true
          }
        }
        if (JSON.stringify(lossPayload) !== '{}') {
          yield put({
            type: 'updateToView',
            payload: lossPayload
          })
        }
        if (name && password) {
          yield put({
            type: 'updateToView',
            payload: { isClick: true }
          })
          const forge = require('node-forge')
          const md = forge.md.md5.create()
          md.update(password + '@wanke')

          const data = yield Service.getLogin({ name, password: md.digest().toHex() })
          if (data.errorCode !== 0) {
            throw data
          }
          let userInfo = data.results.user
          let timeZone = userInfo.timeZone ? userInfo.timeZone : ''
          // 电池系统默认国内时区
          if (isBatterySystem()) {
            timeZone = 'Asia/Shanghai'
          }

          sessionStorage.setItem('userInfo', JSON.stringify(userInfo))
          sessionStorage.setItem('station-id', JSON.stringify(data.results.stationId))
          sessionStorage.setItem('token', data.results.token)
          sessionStorage.setItem('firm-id', data.results.user.firm.id)
          sessionStorage.setItem('user-id', data.results.user.id)
          sessionStorage.setItem('timeZone', timeZone)
          localStorage.setItem('currency', userInfo.currency ? userInfo.currency : '')
          yield put({
            type: 'updateToView',
            payload: {
              deadline: 0,
              errorTip: '',
              isClick: false
            }
          })
          
          yield put({
            type: settingNS + '/updateToView',
            payload: {
              timeZoneId: timeZone || 'Asia/Shanghai',
            }
          })
          if (isTerminalSystem()) {
            if (data?.results?.stationId) {
              history.push('/index')
            } else {
              history.push('/no-station')
            }
          } else if(isBatterySystem()){
            history.push('/battery-cabin')
          }else {
            history.push('/index')
          }
        }
      } catch (e) {
        if (e.errorCode == 55) {
          yield updateState(put, { isVerified: false })
        }
        if (e.errorCode == 52) {
          yield updateState(put, { password: '', isVerified: false })
        }
        if (e.errorMsg === utils.intl("用户名或密码错误")) {
          let payload = {
            errorTip: e.errorMsg,
            isVerified: false,
            isClick: false
          }
          yield put({
            type: 'updateToView',
            payload: payload
          })
        } else {
          yield put({
            type: 'updateToView',
            payload: {
              isVerified: false,
              errorTip: e.errorMsg,
              isClick: false
            }
          })
        }
      }
    }
  }
})
