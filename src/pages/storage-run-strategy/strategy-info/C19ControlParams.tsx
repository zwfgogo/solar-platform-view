import React, { useEffect, useState } from 'react'
import { Button, Form, FullLoading, Popconfirm } from 'wanke-gui'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import utils from '../../../public/js/utils'
import { globalNS, storage_run_strategy_info } from '../../constants'
import { makeConnect } from '../../umi.helper'
import { useAuthDialog } from '../dialog/AuthDialog'
import { RunStrategyInfoModel } from '../models/strategyInfo'
import C19ControlParamsDetail from './C19ControlParamsDetail'
import C19ControlParamsForm from './C19ControlParamsForm'

interface Props extends MakeConnectProps<RunStrategyInfoModel>, RunStrategyInfoModel {
  username: string
  stationId: number
  runStrategyId: number
  planControlParamLoading: boolean
  postPlanControlParamsLoading: boolean
  planControlParamSuccess: boolean
}

const C19ControlParams: React.FC<Props> = (props) => {
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

  const handleSave = () => {
    form.validateFields()
      .then(() => {
        authConfirm(() => {
          props.action('postC19PlanControlParams', {
            runStrategyId: props.runStrategyId,
            stationId: props.stationId,
            data: formatValuesForRequest(values, props.energyUnitList)
          }).then(() => {
            setIsEdit(false)
          })
        })
      })
  }

  useEffect(() => {
    if (!isEdit) {
      setValues(formatValues(props.c19PlanControlParam))
    }
  }, [isEdit])

  useEffect(() => {
    if (props.planControlParamSuccess) {
      setValues(formatValues(props.c19PlanControlParam))
    }
  }, [props.planControlParamSuccess])

  useEffect(() => {
    props.action('fetchC19PlanControlParams', {
      runStrategyId: props.runStrategyId,
      stationId: props.stationId,
    })
    props.action('fetchEnergyUnitList', {
      stationId: props.stationId,
      runStrategyId: props.runStrategyId,
    })
  }, [])

  return (
    <div className="plan-control-params">
      {isEdit ? (
        <C19ControlParamsForm
          form={form}
          data={values}
          onChange={handleChange}
          energyUnitList={props.energyUnitList}
        />
      ) : (
        <C19ControlParamsDetail data={props.c19PlanControlParam} />
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
      {props.planControlParamLoading && <FullLoading />}
    </div>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    username: state[globalNS].username,
    planControlParamLoading: getLoading('fetchC19PlanControlParams'),
    postPlanControlParamsLoading: getLoading('postC19PlanControlParams'),
    planControlParamSuccess: isSuccess('fetchC19PlanControlParams'),
  }
}

export default makeConnect(storage_run_strategy_info, mapStateToProps)(C19ControlParams)

function formatValues(values) {
  return {
    configList: values.map(item => ({
      ...item,
      value: `${item.value ?? ''}`
    }))
  }
}

function formatValuesForRequest(values, energyUnitList) {
  return energyUnitList.map(unit => {
    const target = values.configList.find(item => unit.value === item.energyUnitId)
    let row: any = {
      energyUnitId: unit.value,
      energyUnitTitle: unit.name,
      type: null,
      value: null,
      enable: false,
    }

    if (target) {
      row = {
        ...target,
        energyUnitTitle: unit?.name,
        value: Number(target.value),
        enable: true,
      }
    }
    delete row.id

    return row
  })
}
