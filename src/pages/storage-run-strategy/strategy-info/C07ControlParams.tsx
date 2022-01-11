import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Button, Form, FullLoading, Popconfirm } from 'wanke-gui'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import utils from '../../../public/js/utils'
import { globalNS, storage_run_strategy_info } from '../../constants'
import { makeConnect } from '../../umi.helper'
import { useAuthDialog } from '../dialog/AuthDialog'
import { RunStrategyInfoModel } from '../models/strategyInfo'
import C07ControlParamsDetail from './C07ControlParamsDetail'
import C07ControlParamsForm from './C07ControlParamsForm'

interface Props extends MakeConnectProps<RunStrategyInfoModel>, RunStrategyInfoModel {
  username: string
  stationId: number
  runStrategyId: number
  planControlParamLoading: boolean
  localControlParamsLoading: boolean
  postPlanControlParamsLoading: boolean
  planControlParamSuccess: boolean
}

const C07ControlParams: React.FC<Props> = (props) => {
  const [values, setValues] = useState<any>({})
  const [form] = Form.useForm()
  const [isEdit, setIsEdit] = useState(false)
  const { authConfirm } = useAuthDialog({ username: props.username })

  const handleChange = (val) => {
    setValues({
      ...values,
      ...val
    })
  }

  const handleReset = () => {
    setValues({ type: values.type })
  }

  const getLocalParams = () => {
    props.action('fetchC07LocalControlParams', {
      runStrategyId: props.runStrategyId,
      stationId: props.stationId,
    }).then(data => {
      setValues(formatValues(data))
    })
  }

  const handleSave = () => {
    form.validateFields()
      .then(() => {
        authConfirm(() => {
          props.action('postC07PlanControlParams', {
            runStrategyId: props.runStrategyId,
            stationId: props.stationId,
            data: formatValuesForRequest(values)
          }).then(() => {
            setIsEdit(false)
          })
        })
      })
  }

  useEffect(() => {
    if (!isEdit) {
      setValues(formatValues(props.c07PlanControlParam))
    }
  }, [isEdit])

  useEffect(() => {
    if (props.planControlParamSuccess) {
      setValues(formatValues(props.c07PlanControlParam))
    }
  }, [props.planControlParamSuccess])

  useEffect(() => {
    props.action('fetchC07PlanControlParams', {
      runStrategyId: props.runStrategyId,
      stationId: props.stationId,
    })
  }, [])

  return (
    <>
      <div className="plan-control-params">
        <div style={{ marginBottom: 16 }}>
          <Popconfirm
            title={`${utils.intl('确认要重置参数吗')}?`}
            onConfirm={handleReset}
            okText={utils.intl('确认')}
            cancelText={utils.intl('取消')}
          >
            <Button
              disabled={!isEdit}
              style={{ marginRight: 16 }}
            >{utils.intl('一键重置参数')}</Button>
          </Popconfirm>
          <Button
            disabled={!isEdit}
            onClick={getLocalParams}
            loading={props.localControlParamsLoading}
          >{utils.intl('获取本地参数')}</Button>
        </div>
        {isEdit ? (
          <C07ControlParamsForm
            form={form}
            data={values}
            onChange={handleChange}
          />
        ) : (
          <C07ControlParamsDetail data={props.c07PlanControlParam} />
        )}
        <div style={{ marginTop: 16 }}>
          {isEdit ? (
            <>
              <Button
                key="save"
                type="primary"
                loading={props.postPlanControlParamsLoading}
                onClick={handleSave}
                style={{ marginRight: 16 }}
              >{utils.intl('保存并下发')}</Button>
              <Button key="cancel" onClick={() => setIsEdit(false)}>{utils.intl('取消')}</Button>
            </>
          ) : (
            <Button key="edit" type="primary" onClick={() => setIsEdit(true)}>{utils.intl('编辑')}</Button>
          )}
        </div>
      </div>
      {props.planControlParamLoading && <FullLoading />}
    </>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    username: state[globalNS].username,
    planControlParamLoading: getLoading('fetchC07PlanControlParams'),
    localControlParamsLoading: getLoading('fetchC07LocalControlParams'),
    postPlanControlParamsLoading: getLoading('postC07PlanControlParams'),
    planControlParamSuccess: isSuccess('fetchC07PlanControlParams'),
  }
}

export default makeConnect(storage_run_strategy_info, mapStateToProps)(C07ControlParams)

function formatValues(values) {
  const item = {
    ...values,
    targetVoltage: values.targetVoltage?.toString(),
    maxReactivePowerOutput: values.maxReactivePowerOutput?.toString(),
    maxReactivePowerInput: values.maxReactivePowerInput?.toString(),
    deviationRange: values.deviationRange?.map(item => item ? item.toString() : item),
    timeRange: values.startTime ? [moment(values.startTime), moment(values.endTime)] : undefined
  }
  delete item.startTime
  delete item.endTime
  return item
}

function formatValuesForRequest(values) {
  const data = {
    ...values,
    targetVoltage: Number(values.targetVoltage),
    maxReactivePowerOutput: Number(values.targetVoltage),
    maxReactivePowerInput: Number(values.targetVoltage),
    deviationRange: values.deviationRange?.map(item => item ? Number(item) : item),
    startTime: values.timeRange[0].format("YYYY-MM-DD"),
    endTime: values.timeRange[1].format("YYYY-MM-DD")
  }

  if (data.details) {
    data.details.forEach(item => {
      item.value = item.value ? Number(item.value) : item.value
      delete item.id
    })
  }

  delete data.timeRange
  delete data.id

  return data
}
