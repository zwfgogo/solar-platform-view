import React, { useEffect, useState } from 'react'
import { Button } from 'wanke-gui'
import Header from '../../../components/Header'
import { Checkbox, message } from 'antd'
import LsTempCommand from '../item/LsTempCommand'
import { makeConnect } from '../../umi.helper'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import { RunStrategyShavingModel } from '../models/shaving'
import TempCommandDialog from '../dialog/TempCommandDialog'
import { storage_run_strategy_shaving } from '../../constants'

import utils from '../../../public/js/utils'
import { useAuthDialog } from '../dialog/AuthDialog'
import { WankeReturnOutlined } from 'wanke-icon'

interface Props extends MakeConnectProps<RunStrategyShavingModel>, RunStrategyShavingModel {
  username: string
  argumentId: number
  back: any
  loading: boolean
  sendTempCommandSuccess: boolean
  stopTempCommandSuccess: boolean
  sendTempCommandLoading: boolean
  stopTempCommandLoading: boolean
}

const TempStrategy: React.FC<Props> = function (this: null, props) {
  const [showAdd, setShowAdd] = useState(false)
  const [checked, setChecked] = useState(true)
  const [checkList, setCheckList] = useState([])
  const { authConfirm } = useAuthDialog({ username: props.username })

  const addTempStrategy = (energyUnitId, data) => {
    authConfirm(() => {
      props.action('sendTempCommand', {
        energyUnitId, controlParamId: props.argumentId, detail: data
      })
    })
  }

  const stop = () => {
    authConfirm(() => {
      props.action('stopTempCommand', { ids: checkList })
    })
  }

  const fetchList = () => {
    props.action('fetchTempCommandList', { controlParamId: props.argumentId })
  }

  useEffect(() => {
    fetchList()
  }, [props.argumentId])

  useEffect(() => {
    if (props.sendTempCommandSuccess) {
      message.success(utils.intl('下发临时指令成功'))
      setShowAdd(false)
      fetchList()
    }
    if (props.stopTempCommandSuccess) {
      message.success(utils.intl('停用成功'))
      setCheckList([])
      fetchList()
    }
  }, [props.sendTempCommandSuccess, props.stopTempCommandSuccess])

  return (
    <div className="temp-strategy-page">
      {
        showAdd && (
          <TempCommandDialog
            loading={props.sendTempCommandLoading}
            energyUnitOptions={props.energyUnitList}
            commandTypeOptions={props.commandTypeOptions}
            controlTypeOptions={props.controlTypeOptions}
            endControlOptions={props.endControlOptions}
            visible={showAdd}
            onCancel={() => setShowAdd(false)}
            onConfirm={addTempStrategy}
          />
        )
      }
      <Header
        title={(
          <span>
            {utils.intl('临时策略')}
            <WankeReturnOutlined style={{ color: '#3D7EFF', marginLeft: 16 }} onClick={() => props.back()} />
          </span>
        )}
      >
        <Checkbox
          style={{ marginTop: 8 }}
          checked={checked}
          onChange={e => {
            setChecked(e.target.checked)
            setCheckList([])
          }}
        >{utils.intl('只显示正在执行和未开始的')}</Checkbox>
      </Header>
      <div className="flex1" style={{ padding: '0 16px 16px' }}>
        <LsTempCommand
          loading={props.loading}
          commandTypeOptions={props.commandTypeOptions}
          controlTypeOptions={props.controlTypeOptions}
          endControlOptions={props.endControlOptions}
          dataSource={checked ? props.tempCommandList.filter(item => item.status == 0 || item.status == 1) : props.tempCommandList}
          selectedRowKeys={checkList}
          onChange={setCheckList}
        />
      </div>
      <div className="h-space" style={{ padding: '0 16px 16px' }}>
        <div>
          <Button type="primary" onClick={() => setShowAdd(true)}>{utils.intl('新增')}</Button>
          <Button
            loading={props.stopTempCommandLoading}
            type="primary"
            disabled={checkList.length == 0}
            style={{ marginLeft: 7 }}
            onClick={stop}
          >{utils.intl('停用')}</Button>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }) => {
  return {
    ...model,
    loading: getLoading('fetchTempCommandList'),
    sendTempCommandSuccess: isSuccess('sendTempCommand'),
    stopTempCommandSuccess: isSuccess('stopTempCommand'),
    sendTempCommandLoading: getLoading('sendTempCommand'),
    stopTempCommandLoading: getLoading('stopTempCommand'),
  }
}

export default makeConnect(storage_run_strategy_shaving, mapStateToProps)(TempStrategy)
