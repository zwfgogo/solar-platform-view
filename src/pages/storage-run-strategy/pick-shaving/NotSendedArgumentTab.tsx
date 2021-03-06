import React, { useEffect, useRef, useState } from 'react'
import { Button, Confirm, FullLoading, message, Modal } from 'wanke-gui'

import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import PageProps from '../../../interfaces/PageProps'
import { makeConnect } from '../../umi.helper'
import { globalNS, storage_run_strategy_shaving } from '../../constants'
import { RunStrategyShavingModel } from '../models/shaving'
import ArgumentItem from '../item/ArgumentItem'
import ArgumentItemLook from '../item/ArgumentItemLook'
import ConfirmTip from '../../../components/ConfirmTip'
import AuthDialog from '../dialog/AuthDialog'
import { getArgumentListLossDay } from '../run-strategy.helper'
import LossMonthDayDialog from '../dialog/LossMonthDayDialog'

import utils from '../../../public/js/utils'
import { PlusOutlined } from 'wanke-icon'
import EmptyData from '../../../components/EmptyData'

interface Props extends PageProps, MakeConnectProps<RunStrategyShavingModel>, RunStrategyShavingModel {
  stationId: number
  strategyId: number
  username: string
  addArgumentLoading: boolean
  updateArgumentLoading: boolean
  addArgumentSuccess: boolean
  updateArgumentSuccess: boolean
  deleteArgumentSuccess: boolean
  resetArgumentSuccess: boolean
  authSuccess: boolean
  sendSuccess: boolean
}

const NotSendedArgumentTab: React.FC<Props> = function (this: null, props) {
  const [argumentList, setArgumentList] = useState([])
  const [currentEditId, setCurrentEditId] = useState(null)
  const [showAddArgument, setShowAddArgument] = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [showSendConfirm, setShowSendConfirm] = useState(false)
  const [showLossConfirm, setShowLossConfirm] = useState(false)
  const callbackRef = useRef<any>()
  const isLocalMode = useRef(false)

  const fetchLocalArgument = () => {
    props.action('fetchLocalArgument', { stationId: props.stationId, runStrategyId: props.strategyId })
  }

  const resetArgument = () => {
    props.action('resetArgument', { controlParamId: argumentList.map(item => item.id) })
  }

  const handleDeleteArgument = (id) => {
    props.action('deleteArgument', { controlParamId: [id] })
  }

  const saveArgument = (data) => {
    props.action('addArgument', { stationId: props.stationId, runStrategyId: props.strategyId, detail: data })
  }

  const updateArgument = (data) => {
    props.action('updateArgument', data)
  }

  const checkValid = () => {
    let ranges = []
    for (let item of argumentList) {
      ranges = ranges.concat(item.applicableDate)
    }
    for (let i = 0; i < ranges.length; i++) {
      for (let j = 0; j < i; j++) {
        if (ranges[i][0] >= ranges[j][0] && ranges[i][0] <= ranges[j][1]) {
          message.error(utils.intl('????????????'))
          return
        }
        if (ranges[i][1] >= ranges[j][0] && ranges[i][1] <= ranges[j][1]) {
          message.error(utils.intl('????????????'))
          return
        }
      }
    }
    if (getArgumentListLossDay(argumentList) != 0) {
      setShowLossConfirm(true)
      return
    }
    setShowSendConfirm(true)
  }

  const ignoreLossInfo = () => {
    setShowLossConfirm(false)
    setShowSendConfirm(true)
  }

  const auth = (password) => {
    props.action('auth', { username: props.username, password })
  }

  const send = () => {
    props.action('send', {
      runStrategyId: props.strategyId,
      stationId: props.stationId,
      controlParamIds: argumentList.map(item => item.id)
    })
  }

  const onAdd = () => {
    if (currentEditId || isLocalMode.current) {
      Modal.info({
        title: utils.intl('??????'),
        content: (
          <div>
            <span>{utils.intl('????????????????????????')}</span>
          </div>
        ),
        onOk() {},
      })
      callbackRef.current = () => {
        setShowAddArgument(true)
        setCurrentEditId(null)
      }
    } else {
      setShowAddArgument(true)
      setCurrentEditId(null)
    }
  }

  const onEdit = (id) => {
    if (showAddArgument) {
      Modal.info({
        title: utils.intl('??????'),
        content: (
          <div>
            <span>{utils.intl('????????????????????????')}</span>
          </div>
        ),
        onOk() {},
      })
      callbackRef.current = () => {
        setShowAddArgument(false)
        setCurrentEditId(id)
      }
    } else {
      setShowAddArgument(false)
      setCurrentEditId(id)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const fetchList = () => {
    props.action('fetchNotSendArgumentList', { stationId: props.stationId, runStrategyId: props.strategyId })
  }

  useEffect(() => {
    if (props.notSendArgumentList) {
      isLocalMode.current = false
      setArgumentList(props.notSendArgumentList)
    }
  }, [props.notSendArgumentList])

  useEffect(() => {
    if (props.localArgument && props.localArgument.length) {
      isLocalMode.current = true
      setArgumentList(props.localArgument)
    }
  }, [props.localArgument])

  useEffect(() => {
    if (props.addArgumentSuccess) {
      isLocalMode.current = false
      message.success(utils.intl('????????????'))
      setShowAddArgument(false)
      fetchList()
    }
    if (props.updateArgumentSuccess) {
      setCurrentEditId(null)
      fetchList()
      message.success(utils.intl('????????????'))
    }
    if (props.deleteArgumentSuccess) {
      fetchList()
      message.success(utils.intl('????????????'))
    }
    if (props.resetArgumentSuccess) {
      fetchList()
      message.success(utils.intl('????????????'))
    }
    if (props.authSuccess) {
      setShowSendConfirm(false)
      send()
    }
    if (props.sendSuccess) {
      message.success(utils.intl('????????????'))
      fetchList()
    }
  }, [props.addArgumentSuccess, props.updateArgumentSuccess,
  props.deleteArgumentSuccess, props.resetArgumentSuccess, props.authSuccess,
  props.sendSuccess
  ])

  return (
    <div className="not-send-argument-tab">
      {
        (props.addArgumentLoading || props.updateArgumentLoading) && (
          <FullLoading />
        )
      }
      {/* {
        showEditConfirm && (
          Modal.info({
            title: utils.intl('??????'),
            content: (
              <div>
                <p>{utils.intl('????????????????????????')}</p>
              </div>
            ),
            onOk() {
              setShowEditConfirm(false)
            },
          })
        )
      } */}
      {
        showSendConfirm && (
          <AuthDialog
            header={utils.intl('????????????')}
            title={utils.intl('????????????????????????????')}
            desc={utils.intl('???????????????????????????????????????????????????????????????????????????????????????????????????')}
            username={props.username}
            visible={showSendConfirm}
            onCancel={() => setShowSendConfirm(false)}
            onConfirm={auth}
          />
        )
      }
      {
        showLossConfirm && (
          <LossMonthDayDialog
            lossCount={getArgumentListLossDay(argumentList)}
            onConfirm={ignoreLossInfo}
            visible={showLossConfirm}
            onCancel={() => setShowLossConfirm(false)}
          />
        )
      }
      <div className="h-space" style={{ marginBottom: 5 }}>
        <div>
          <ConfirmTip placement="bottomLeft" tip={utils.intl('???????????????')}
            contentTip={utils.intl('????????????????????????????????????????????????????????????????????????????????????????????????')}
            onConfirm={resetArgument}>
            <Button disabled={argumentList.length == 0 || isLocalMode.current}>{utils.intl('??????????????????')}</Button>
          </ConfirmTip>
          <ConfirmTip tip={utils.intl('??????')} contentTip={utils.intl('???????????????????????????????????????????????????????????????????????????????????????????????????')}
            onConfirm={fetchLocalArgument}>
            <Button style={{ marginLeft: 7 }}>{utils.intl('??????????????????')}</Button>
          </ConfirmTip>
        </div>
        <div>
          <Button type="primary" disabled={argumentList.length == 0 || currentEditId != null || showAddArgument}
            onClick={checkValid}>{utils.intl('??????')}</Button>
        </div>
      </div>
      <div className="flex1" style={{ overflow: 'auto' }}>
        {
          argumentList.map(argument => {
            if (argument.id == currentEditId) {
              return (
                <ArgumentItem
                  key={argument.id}
                  isLocal={isLocalMode.current}
                  inEdit={currentEditId == argument.id}
                  detail={argument}
                  commandTypeOptions={props.commandTypeOptions}
                  controlTypeOptions={props.controlTypeOptions}
                  endControlOptions={props.endControlOptions}
                  energyUnitList={props.energyUnitList}
                  priceInfo={props.priceInfo}
                  cancelEdit={() => {
                    if (isLocalMode.current) {
                      isLocalMode.current = false
                      props.action('updateToView', { localArgument: [] })
                      setArgumentList(props.notSendArgumentList)
                    }
                    setCurrentEditId(null)
                  }}
                  saveArgument={saveArgument}
                  updateArgument={updateArgument}
                />
              )
            }
            return (
              <ArgumentItemLook
                detail={argument}
                commandTypeOptions={props.commandTypeOptions}
                controlTypeOptions={props.controlTypeOptions}
                endControlOptions={props.endControlOptions}
                energyUnitList={props.energyUnitList}
                onDeleteArgument={() => handleDeleteArgument(argument.id)}
                onEdit={onEdit}
              />
            )
          })
        }
        {
          showAddArgument && (
            <ArgumentItem
              inEdit={true}
              commandTypeOptions={props.commandTypeOptions}
              controlTypeOptions={props.controlTypeOptions}
              endControlOptions={props.endControlOptions}
              energyUnitList={props.energyUnitList}
              priceInfo={props.priceInfo}
              cancelEdit={() => setShowAddArgument(false)}
              saveArgument={saveArgument}
            />
          )
        }
        {
          argumentList.length !== 0 && !showAddArgument && (
            // <Button style={{ marginTop: 10 }} type="primary" onClick={onAdd}>{utils.intl('??????')}</Button>
            <a className="not-send-strategy-add-btn" onClick={onAdd}>
              <PlusOutlined style={{ fontSize: 16, marginRight: 8 }} />
              {utils.intl('????????????')}
            </a>
          )
        }
        {argumentList.length == 0 && !showAddArgument && (
          <div className="no-data-strategy-body">
            <EmptyData message={utils.intl('????????????????????????')} />
            <Button onClick={onAdd} className="strategy-add-btn wanke-primary-blue">{utils.intl('??????')}</Button>
          </div>
        )}
      </div>
    </div>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    username: state[globalNS].username,
    addArgumentLoading: getLoading('addArgument'),
    updateArgumentLoading: getLoading('updateArgument'),
    addArgumentSuccess: isSuccess('addArgument'),
    updateArgumentSuccess: isSuccess('updateArgument'),
    deleteArgumentSuccess: isSuccess('deleteArgument'),
    resetArgumentSuccess: isSuccess('resetArgument'),
    authSuccess: isSuccess('auth'),
    sendSuccess: isSuccess('send'),
  }
}

export default makeConnect(storage_run_strategy_shaving, mapStateToProps)(NotSendedArgumentTab)
