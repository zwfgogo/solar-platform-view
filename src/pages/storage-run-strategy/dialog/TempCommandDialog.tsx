import React, {useEffect, useState} from 'react'
import moment, {Moment} from 'moment'
import {
  Modal,
  Form,
  NumberItem,
  FormContainer,
  SelectItem,
  DateItem,
  TimeItem,
  Button,
  Popover, message
} from 'wanke-gui'
import {disabledTime, getDateStr} from '../../../util/dateUtil'
import {range, range0} from '../../page.helper'
import {numberRangePrecisionRule} from '../../../util/ruleUtil'

import utils from '../../../public/js/utils'

interface Props {
  loading?: boolean
  energyUnitOptions: any[]
  commandTypeOptions: any[]
  controlTypeOptions: any[]
  endControlOptions: any[]
  visible: boolean
  onCancel: () => void
  onConfirm: (energyUnitId, data) => void
}

const TempCommandDialog: React.FC<Props> = function (this: null, props) {
  const [energyUnitId, setEnergyUnitId] = useState(null)
  const [commandType, setCommandType] = useState(null)
  const [startTime, setStartTime] = useState<Moment>(null)
  const [endTime, setEndTime] = useState(null)
  const [runStartTime, setRunStartTime] = useState(null)
  const [runEndTime, setRunEndTime] = useState(null)
  const [controlType, setControlType] = useState(null)
  const [power, setPower] = useState(null)
  const [endControlArgument, setEndControlArgument] = useState(null)
  const [chargeA, setChargeA] = useState(null)
  const [chargeV, setChargeV] = useState(null)
  const [dischargeA, setDischargeA] = useState(null)
  const [dischargeV, setDischargeV] = useState(null)
  const [soc, setSoc] = useState(null)
  const [showIgnoreWarning, setShowIgnoreWarning] = useState(false)

  let [form] = Form.useForm()

  const checkEndDate = (start) => {
    return {
      validator: (rule, value: Moment, callback) => {
        if (!value) {
          callback()
          return
        }
        if (value.isBefore(start)) {
          callback(utils.intl('失效时间不能小于开始时间'))
          return
        }
        callback()
      }
    }
  }

  const disabledMinutes = (start: Moment) => (hours) => {
    if (!start) {
      return []
    }
    let startHour = start.hour()
    let startMinute = start.minute()
    if (startHour == hours) {
      if (hours == 0) {
        return range(startMinute + 1)
      }
      return range0(startMinute + 1)
    }
    if (hours == 0) {
      return range(59)
    }
    return []
  }

  useEffect(() => {
    if (commandName == 'Storage') {
      setControlType(null)
      setPower(null)
      setEndControlArgument(null)
      setChargeA(null)
      setChargeV(null)
      setDischargeA(null)
      setDischargeV(null)
      setSoc(null)
    }
  }, [commandType])

  useEffect(() => {
    if (controlName == 'Power') {
      setChargeA(null)
      setChargeV(null)
      setDischargeA(null)
      setDischargeV(null)
    }
    if (controlName == 'Current/Voltage') {
      setPower(null)
      setSoc(null)
      setEndControlArgument(null)
    }
  }, [controlType])

  useEffect(() => {
    setSoc(null)
  }, [endControlArgument])

  const confirm = () => {
    form.validateFields().then(() => {
      if (getDateStr(runEndTime, 'HH:mm') <= getDateStr(runStartTime, 'HH:mm') && getDateStr(runEndTime, 'HH:mm') != '00:00') {
        message.error(utils.intl('结束时间不能小于开始时间'))
        return
      }
      if (startTime.isSame(endTime, 'day')) {
        if (getDateStr(runEndTime, 'HH:mm') < getDateStr(startTime, 'HH:mm')) {
          setShowIgnoreWarning(true)
          return
        }
        if (getDateStr(runStartTime, 'HH:mm') > getDateStr(endTime, 'HH:mm')) {
          setShowIgnoreWarning(true)
          return
        }
      }
      doSend()
    })
  }

  const doSend = () => {
    setShowIgnoreWarning(false)
    props.onConfirm(energyUnitId, {
      controlCommand: {id: commandType},
      startTime: getDateStr(startTime, 'YYYY-MM-DD HH:mm:00'),
      endTime: getDateStr(endTime, 'YYYY-MM-DD HH:mm:00'),
      runTime: [getDateStr(runStartTime, 'HH:mm'), getDateStr(runEndTime, 'HH:mm')],
      controlMode: controlType ? {id: controlType} : null,
      activePower: power,
      endControlParam: endControlArgument ? {id: endControlArgument} : null,
      soc: soc,
      chargeVoltage: chargeV,
      chargeCurrentLimit: chargeA,
      dischargeCurrent: dischargeA,
      dischargeEndVoltage: dischargeV
    })
  }

  let commandName = props.commandTypeOptions.find(item => item.id == commandType)?.name
  let controlName = props.controlTypeOptions.find(item => item.id == controlType)?.name
  let endControlName = props.endControlOptions.find(item => item.id == endControlArgument)?.name

  return (
    <Modal
      centered
      width={'710px'}
      title={utils.intl('新增临时指令')}
      visible={props.visible}
      className="control-command-dialog form-item-format"
      closable={false}
      footer={(
        <div>
          <Button onClick={props.onCancel}>{utils.intl('取消')}</Button>
          <Popover title={utils.intl('提示')} trigger={'click'} content={(
            <div>{utils.intl('该临时策略执行时间段未在生效时间范围内，将不会被执行。是否确认继续下发？')}
              <div style={{marginTop: 5, textAlign: 'right'}}>
                <Button size={'small'} onClick={() => setShowIgnoreWarning(false)}>{utils.intl('取消')}</Button>
                <Button style={{marginLeft: 5}} size={'small'} type="primary"
                        onClick={doSend}>{utils.intl('确定')}</Button>
              </div>
            </div>
          )} visible={showIgnoreWarning} onVisibleChange={(v) => v == false && setShowIgnoreWarning(v)}>
            <Button
              type="primary"
              disabled={showIgnoreWarning}
              onClick={confirm}
              loading={props.loading}
            >{utils.intl('下发')}</Button>
          </Popover>
        </div>
      )}
    >
      <FormContainer form={form} className="flex-wrap">
        <SelectItem
          label={utils.intl('目标对象')}
          rules={[{required: true}]}
          value={energyUnitId}
          onChange={setEnergyUnitId}
          dataSource={props.energyUnitOptions}
        />

        <DateItem label={utils.intl('生效时间')} rules={[{required: true}]} format="YYYY-MM-DD HH:mm"
                  showTime={true} value={startTime} onChange={setStartTime}
                  disabledDate={date => date.isBefore(moment(), 'day')}
                  disabledTime={disabledTime}
                  style={{ width: '100%' }}
        />
        <DateItem label={utils.intl('失效时间')} rules={[{required: true}, checkEndDate(startTime)]}
                  format="YYYY-MM-DD HH:mm"
                  showTime={true} value={endTime} onChange={setEndTime}
                  disabledDate={date => date.isBefore(startTime || moment(), 'day')}
                  style={{ width: '100%' }}
        />

        <SelectItem
          label={utils.intl('临时储能指令')}
          rules={[{required: true}]}
          value={commandType}
          onChange={setCommandType}
          dataSource={props.commandTypeOptions.map(item => ({value: item.id, name: item.title}))}
        />

        <TimeItem label={utils.intl('执行开始时间')} rules={[{required: true, message: utils.intl('请选择开始时间')}]} format="HH:mm"
                  value={runStartTime} onChange={setRunStartTime}
                  style={{ width: '100%' }}
        />
        <TimeItem label={utils.intl('执行结束时间')} rules={[{required: true, message: utils.intl('请选择结束时间')}]} format="HH:mm"
                  value={runEndTime} onChange={setRunEndTime}
                  disabledHours={() => runStartTime ? range(runStartTime.hours() - 1) : []}
                  disabledMinutes={disabledMinutes(runStartTime)}
                  style={{ width: '100%' }}
        />

        {
          commandName != 'Storage' && (
            <>
              <SelectItem
                label={utils.intl('运行控制方式')}
                rules={[{required: true}]}
                value={controlType}
                onChange={setControlType}
                dataSource={props.controlTypeOptions.map(item => ({value: item.id, name: item.title}))}
              />

              {
                controlName == 'Power' && (
                  <NumberItem
                    rules={[{required: true}]}
                    label={utils.intl('有功功率')}
                    suffix="kW"
                    value={power}
                    onChange={setPower}
                  />
                )
              }

              {
                controlName == 'Current/Voltage' && (
                  <>
                    {
                      commandName == 'Charge' && (
                        <NumberItem
                          label={utils.intl('充电电流限值')}
                          rules={[{required: true}, numberRangePrecisionRule(0, 9, 4)]}
                          suffix="C/AH"
                          value={chargeA}
                          onChange={setChargeA}
                        />
                      )
                    }
                    {
                      commandName != 'Charge' && (
                        <NumberItem
                          label={utils.intl('放电截至电压')}
                          rules={[{required: true}, numberRangePrecisionRule(0, 999, 4)]}
                          suffix="C/AH"
                          value={dischargeV}
                          onChange={setDischargeV}
                        />
                      )
                    }
                    {
                      commandName == 'Charge' && (
                        <NumberItem
                          label={utils.intl('充电电压')}
                          rules={[{required: true}, numberRangePrecisionRule(0, 999, 2)]}
                          suffix="V/cell"
                          value={chargeV}
                          onChange={setChargeV}
                        />
                      )
                    }
                    {
                      commandName != 'Charge' && (
                        <NumberItem
                          label={utils.intl('放电电流')}
                          rules={[{required: true}, numberRangePrecisionRule(0, 9999, 2)]}
                          suffix="A"
                          value={dischargeA}
                          onChange={setDischargeA}
                        />
                      )
                    }
                  </>
                )
              }
              {
                controlName != 'Current/Voltage' && (
                  <SelectItem
                    label={utils.intl('结束控制参数')}
                    rules={[{required: true}]}
                    value={endControlArgument}
                    onChange={setEndControlArgument}
                    dataSource={props.endControlOptions.map(item => ({value: item.id, name: item.title}))}
                  />
                )
              }

              {
                endControlName == 'SOC' && (
                  <NumberItem
                    label={utils.intl('SOC限值')}
                    rules={[{required: true}]}
                    suffix="%"
                    value={soc}
                    onChange={setSoc}
                  />
                )
              }
            </>
          )
        }
      </FormContainer>

    </Modal>
  )
}

export default TempCommandDialog
