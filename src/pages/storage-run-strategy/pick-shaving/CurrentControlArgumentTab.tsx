import React, { useEffect, useMemo, useRef, useState } from 'react'
import moment from 'moment'
import { Button, FullContainer, message, MultiLineChart, Select, Tabs } from 'wanke-gui'
import classnames from 'classnames'

import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import PageProps from '../../../interfaces/PageProps'
import LsControlArgument from '../item/LsControlArgument'
import { makeConnect } from '../../umi.helper'
import { globalNS, storage_run_strategy_shaving } from '../../constants'
import Label from 'wanke-gui/es/layout/Label'
import Header from '../../../components/Header'
import { RunStrategyShavingModel } from '../models/shaving'
import TempStrategy from './TempStrategy'
import { DateTypeOptions } from '../run-strategy.constants'
import { getCurveData, getSocData, isInRange } from '../run-strategy.helper'
import AuthDialog, { useAuthDialog } from '../dialog/AuthDialog'

import utils from '../../../public/js/utils'
import AbsoluteFullDiv from '../../../components/AbsoluteFullDiv'
import { StrategyStatus } from '../strategy.constant'
import ConfirmTip from '../../../components/ConfirmTip'
import EmptyData from '../../../components/EmptyData'

interface Props extends PageProps, MakeConnectProps<RunStrategyShavingModel>, RunStrategyShavingModel {
  username: string
  stationId: number
  strategyId: number
  strategyStatus: string
  serverDateTime: string
  sendTempCommandSuccess: boolean
  authSuccess: boolean
  stopTempCommandSuccess: boolean
  stopControlArgumentSuccess: boolean
  startControlArgumentSuccess: boolean
  fetchControlArgumentListSuccess: boolean
}

const CurrentControlArgumentTab: React.FC<Props> = function (this: null, props) {
  const [currentArgumentId, setCurrentArgumentId] = useState(null)
  const [currentUnitId, setCurrentUnitId] = useState(null)
  const [showTemp, setShowTemp] = useState(false)
  const authType = useRef<string>()
  const [showStopConfirm, setShowStopConfirm] = useState(false)
  const [showStartConfirm, setShowStartConfirm] = useState(false)

  const stop = () => {
    props.action('stopControlArgument', {
      stationId: props.stationId,
      runStrategyId: props.strategyId,
      controlParamIds: currentArgumentId
    })
  }

  const start = () => {
    props.action('startControlArgument', {
      stationId: props.stationId,
      runStrategyId: props.strategyId,
      controlParamIds: currentArgumentId
    })
  }

  const auth = (password) => {
    props.action('auth', { username: props.username, password })
  }

  useEffect(() => {
    props.action('fetchCurrentControlArgumentList', { stationId: props.stationId, runStrategyId: props.strategyId })
    return () => {
      props.updateState({
        currentControlArgumentList: []
      })
    }
  }, [])

  useEffect(() => {
    if (props.currentControlArgumentList.length) {
      if (!currentArgumentId || props.currentControlArgumentList.find(item => item.id == currentArgumentId) == undefined) {
        setCurrentArgumentId(props.currentControlArgumentList[0].id + '')
      }
    }
  }, [props.currentControlArgumentList])

  useEffect(() => {
    if (props.energyUnitList.length) {
      setCurrentUnitId(props.energyUnitList[0].value)
    }
  }, [props.energyUnitList])

  useEffect(() => {
    if (currentUnitId && currentArgumentId) {
      props.action('fetchCurrentCommandList', { controlParamId: currentArgumentId, energyUnitId: currentUnitId })
    }
  }, [currentUnitId, currentArgumentId])

  useEffect(() => {
    if (props.sendTempCommandSuccess || props.stopTempCommandSuccess) {
      props.action('fetchCurrentCommandList', { controlParamId: currentArgumentId, energyUnitId: currentUnitId })
    }
    if (props.fetchControlArgumentListSuccess) {
      setCurrentArgumentId(props.currentControlArgumentList[0].id)
    }
    if (props.stopControlArgumentSuccess) {
      message.success(utils.intl('暂停策略成功'))
      props.action('fetchCurrentControlArgumentList', { stationId: props.stationId, runStrategyId: props.strategyId })
    }
    if (props.startControlArgumentSuccess) {
      message.success(utils.intl('启动策略成功'))
      props.action('fetchCurrentControlArgumentList', { stationId: props.stationId, runStrategyId: props.strategyId })
    }
  }, [props.sendTempCommandSuccess, props.stopTempCommandSuccess, props.stopControlArgumentSuccess, props.startControlArgumentSuccess])

  useEffect(() => {
    if (props.authSuccess) {
      if (authType.current == 'stop') {
        setShowStopConfirm(false)
        stop()
      }
      if (authType.current == 'start') {
        setShowStartConfirm(false)
        start()
      }
    }
  }, [props.authSuccess])

  let currentArgument = props.currentControlArgumentList.find(item => item.id == currentArgumentId)

  // let chartData = getCurveData(props.priceInfo?.costPrice?.[0], props.priceInfo?.generatePrice?.[0], props.currentCommandList, currentArgument?.applicableDate || [])
  // let socData = getSocData(props.currentCommandList, scale, 1)
  const scale = props.energyUnitList.find(item => item.value == currentUnitId)?.scale
  let socData = useMemo(() => {
    return socData = getSocData(props.currentCommandList, scale, 1)
  }, [
    JSON.stringify(props.currentCommandList),
    scale
  ])
  let chartData = useMemo(() => {
    return getCurveData(
      props.priceInfo?.costPrice?.[0],
      props.priceInfo?.generatePrice?.[0],
      props.currentCommandList,
      currentArgument?.applicableDate || [])
  }, [
    JSON.stringify(props.priceInfo?.costPrice?.[0]),
    JSON.stringify(props.priceInfo?.generatePrice?.[0]),
    JSON.stringify(props.currentCommandList),
    JSON.stringify(currentArgument?.applicableDate || [])
  ])

  const isStarted = props.strategyStatus === StrategyStatus.started

  return (
    <FullContainer>
      {
        showStopConfirm && (
          <AuthDialog
            header={utils.intl('策略停用验证')}
            title={utils.intl('是否要暂停控制策略?')}
            desc={utils.intl('执行当前操作会长期停止"有功控制/削峰填谷"策略，停用操作需要您的账户登陆密码，请您输入正确的账户登陆密码。')}
            username={props.username}
            visible={showStopConfirm}
            onCancel={() => setShowStopConfirm(false)}
            onConfirm={(password) => {
              auth(password)
              authType.current = 'stop'
            }}
          />
        )
      }
      {
        showStartConfirm && (
          <AuthDialog
            header={utils.intl('策略启用验证')}
            title={utils.intl('是否要启用控制策略?')}
            desc={utils.intl('执行当前操作会立即执行当前控制策略，该操作需要您的账户登陆密码，请您输入正确的账户登陆密码。')}
            username={props.username}
            visible={showStartConfirm}
            onCancel={() => setShowStartConfirm(false)}
            onConfirm={(password) => {
              auth(password)
              authType.current = 'start'
            }}
          />
        )
      }
      <section className="current-control-argument-tab">
        <header>
          <Tabs type="card" activeKey={currentArgumentId} onChange={setCurrentArgumentId} className="origin-tab">
            {
              props.currentControlArgumentList.map((item) => {
                return (
                  <Tabs.TabPane key={item.id + ''} tab={item.title}>
                  </Tabs.TabPane>
                )
              })
            }
          </Tabs>
          {
            // props.currentControlArgumentList.map((item) => {
            //   return (
            //     <span
            //       className={classnames("control-argument-tab", {"active": currentArgumentId === item.id + ''})}
            //       onClick={() => setCurrentArgumentId(item.id + '')}
            //     >{item.title}</span>
            //   )
            // })
          }
          {
            !showTemp && currentArgument && (
              <div style={{ paddingTop: 16 }}>
                <div className="h-space" style={{ marginTop: 5 }}>
                  <div className="d-flex">
                    <Label style={{ flexShrink: 0 }}>{utils.intl('对象')}</Label>
                    <div style={{ marginLeft: 7, width: 200 }}>
                      <Select
                        style={{ width: 200 }}
                        dataSource={props.energyUnitList}
                        value={currentUnitId}
                        onChange={setCurrentUnitId}
                      />
                    </div>
                    <div className="v-center" style={{ marginLeft: 16, width: '65%', flexWrap: 'wrap' }}>
                      <Label>{utils.intl('执行时段')}</Label>
                      <span
                        style={{ color: 'orange' }}>（{DateTypeOptions.find(item => item.value == currentArgument.applicableDateType)?.name}）</span>
                      {currentArgument.applicableDate?.map((item, index) => {
                        return (
                          <span>
                            {index != 0 && (<span>, </span>)}
                            {moment('2000-' + item[0]).format(utils.intl('MM月DD日'))}
                            <span style={{ margin: 5 }}>-</span>
                            {moment('2000-' + item[1]).format(utils.intl('MM月DD日'))}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {isStarted && currentArgument.status == 0 && (
                      <ConfirmTip
                        tip={utils.intl('启动控制策略')}
                        contentTip={utils.intl('执行该操作将会立即开始执行当前控制策略，请确认！')}
                        onConfirm={() => setShowStartConfirm(true)}
                      >
                        <Button
                          type="primary"
                        >{utils.intl('启动控制策略')}</Button>
                      </ConfirmTip>
                    )}
                    {isStarted && currentArgument.status == 1 && (
                      <ConfirmTip
                        tip={utils.intl('暂停控制策略')}
                        contentTip={utils.intl(`执行该操作将会长期停止"有功控制/削峰填谷"策略，请确认！`)}
                        onConfirm={() => setShowStopConfirm(true)}
                      >
                        <Button
                          type="primary"
                        >{utils.intl('暂停控制策略')}</Button>
                      </ConfirmTip>
                    )}
                    {
                      isInRange(currentArgument.applicableDate, moment(props.serverDateTime).format('MM-DD')) && (
                        <Button
                          type="primary"
                          onClick={() => setShowTemp(true)}
                          style={{ marginLeft: 10 }}>{utils.intl('临时策略')}</Button>
                      )
                    }
                  </div>
                </div>
              </div>
            )
          }
        </header>
        {
          !showTemp && currentArgument && (
            <>
              <div className="current-card">
                <AbsoluteFullDiv className="current-card-absolute-div">
                  <Header title={utils.intl('控制参数')}></Header>
                  <div style={{ height: 180, padding: '0 16px', flexGrow: 1 }}>
                    <LsControlArgument
                      commandTypeOptions={props.commandTypeOptions}
                      controlTypeOptions={props.controlTypeOptions}
                      endControlOptions={props.endControlOptions}
                      dataSource={props.currentCommandList}
                    />
                  </div>
                </AbsoluteFullDiv>
              </div>
              <div className="current-card">
                <AbsoluteFullDiv className="current-card-absolute-div">
                  <Header title={utils.intl('策略模拟曲线')}></Header>
                  <div className="flex1" style={{ overflow: 'auto', padding: '0 16px', marginTop: -5 }}>
                    {
                      chartData.map((item, index) => {
                        return (
                          <div>
                            <div className="curve-date-range">
                              {moment('2000-' + item.date[0]).format(utils.intl('MM月DD日'))}
                              <span style={{ margin: 5 }}>-</span>
                              {moment('2000-' + item.date[1]).format(utils.intl('MM月DD日'))}
                            </div>
                            <div style={{ height: 236 }}>
                              <MultiLineChart
                                key={index}
                                xData={[item.xData, socData.xData]}
                                yData={[item.yData, socData.yData]}
                                series={[{ name: utils.intl('电价'), unit: utils.intl('元/kWh') }, { name: 'SOC', unit: '%' }]}
                                options={{
                                  tooltipDateFormat: 'HH:mm',
                                  step: 'left'
                                }}
                              />
                            </div>
                          </div>
                        )
                      })
                    }
                  </div>
                </AbsoluteFullDiv>
              </div>
            </>
          )
        }
        {
          !showTemp && !currentArgument && (
            <div className="vh-center card-border" style={{ width: 'calc(100% - 32px)', height: 'calc(100% - 16px)', margin: '0 16px 16px' }}>
              <EmptyData message={utils.intl('暂无当前控制参数')} />
            </div>
          )
        }
        {
          showTemp && (
            <TempStrategy
              username={props.username}
              argumentId={currentArgumentId}
              back={() => setShowTemp(false)}
            />
          )
        }
      </section>
      {
        !showTemp && currentArgument && (
          <>
          </>
        )
      }
    </FullContainer>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    username: state[globalNS].username,
    fetchControlArgumentListSuccess: isSuccess('fetchControlArgumentList'),
    sendTempCommandSuccess: isSuccess('sendTempCommand'),
    stopTempCommandSuccess: isSuccess('stopTempCommand'),
    stopControlArgumentSuccess: isSuccess('stopControlArgument'),
    startControlArgumentSuccess: isSuccess('startControlArgument'),
    authSuccess: isSuccess('auth'),
    serverDateTime: state[globalNS].timeDate
  }
}

export default makeConnect(storage_run_strategy_shaving, mapStateToProps)(CurrentControlArgumentTab)
