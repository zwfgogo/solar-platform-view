import React, {useEffect, useState} from 'react'
import {Modal, Form, NumberItem, FormContainer, SelectItem, TimeItem, message} from 'wanke-gui'
import {getDate, getDateStr} from '../../../util/dateUtil'
import {numberRangePrecisionRule} from '../../../util/ruleUtil'
import {Moment} from 'moment'
import {range, range0} from '../../page.helper'

import utils from '../../../public/js/utils'

interface Props {
  detail?: any
  commandTypeOptions: any[]
  controlTypeOptions: any[]
  endControlOptions: any[]
  visible: boolean
  onCancel: () => void
  onConfirm: (data) => void
}

const ControlCommandDialog: React.FC<Props> = function (this: null, props) {
  const [commandType, setCommandType] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [controlType, setControlType] = useState(null)
  const [power, setPower] = useState(null)
  const [endControlArgument, setEndControlArgument] = useState(null)
  const [chargeA, setChargeA] = useState(null)
  const [dischargeA, setDischargeA] = useState(null)
  const [chargeV, setChargeV] = useState(null)
  const [dischargeV, setDischargeV] = useState(null)
  const [soc, setSoc] = useState(null)

  let [form] = Form.useForm()

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
      setDischargeV(null)
      setDischargeA(null)
      setSoc(null)
    }
  }, [commandType])

  useEffect(() => {
    if (controlName == 'Power') {
      setChargeA(null)
      setChargeV(null)
      setDischargeV(null)
      setDischargeA(null)
    }
    if (controlName == 'Current/Voltage') {
      setPower(null)
      setSoc(null)
      setEndControlArgument(null)
    }
  }, [controlType])

  useEffect(() => {
    if (endControlName == 'Nothing') {
      setSoc(null)
    }
  }, [endControlArgument])

  const confirm = () => {
    form.validateFields().then(() => {
      if (getDateStr(endTime, 'HH:mm') <= getDateStr(startTime, 'HH:mm') && getDateStr(endTime, 'HH:mm') != '00:00') {
        message.error(utils.intl('结束时间不能小于开始时间'))
        return
      }
      if (props.detail) {
        props.onConfirm({
          id: props.detail.id,
          controlCommand: {id: commandType, name: commandName},
          startTime: getDateStr(startTime, 'HH:mm'),
          endTime: getDateStr(endTime, 'HH:mm'),
          controlMode: controlType ? {id: controlType, name: controlName} : null,
          activePower: power,
          endControlParam: endControlArgument ? {id: endControlArgument, name: endControlName} : null,
          soc: soc,
          chargeVoltage: chargeV,
          chargeCurrentLimit: chargeA,
          dischargeCurrent: dischargeA,
          dischargeEndVoltage: dischargeV
        })
      } else {
        props.onConfirm({
          controlCommand: {id: commandType, name: commandName},
          startTime: getDateStr(startTime, 'HH:mm'),
          endTime: getDateStr(endTime, 'HH:mm'),
          controlMode: controlType ? {id: controlType, name: controlName} : null,
          activePower: power,
          endControlParam: endControlArgument ? {id: endControlArgument, name: endControlName} : null,
          soc: soc,
          chargeVoltage: chargeV,
          chargeCurrentLimit: chargeA,
          dischargeCurrent: dischargeA,
          dischargeEndVoltage: dischargeV
        })
      }
    })
  }

  useEffect(() => {
    if (props.detail) {
      const {
        controlCommand, startTime, endTime, controlMode, activePower, endControlParam,
        soc, chargeCurrentLimit, chargeVoltage, dischargeCurrent, dischargeEndVoltage
      } = props.detail
      setCommandType(controlCommand?.id)
      setStartTime(getDate(startTime, 'HH:mm'))
      setEndTime(getDate(endTime, 'HH:mm'))
      setControlType(controlMode?.id)
      setPower(activePower)
      setEndControlArgument(endControlParam?.id)
      setSoc(soc)
      setChargeA(chargeCurrentLimit)
      setChargeV(chargeVoltage)
      setDischargeA(dischargeCurrent)
      setDischargeV(dischargeEndVoltage)
    }
  }, [props.detail])

  let commandName = props.commandTypeOptions.find(item => item.id == commandType)?.name
  let controlName = props.controlTypeOptions.find(item => item.id == controlType)?.name
  let endControlName = props.endControlOptions.find(item => item.id == endControlArgument)?.name

  return (
    <Modal
      centered
      width={'710px'}
      title={utils.intl('控制指令设置')}
      visible={props.visible}
      onOk={confirm}
      onCancel={props.onCancel}
      className="control-command-dialog form-item-format"
    >
      <FormContainer form={form} className="flex-wrap">
        <SelectItem
          label={utils.intl('储能指令')}
          rules={[{required: true}]}
          value={commandType}
          onChange={setCommandType}
          dataSource={props.commandTypeOptions.map(item => ({value: item.id, name: item.title}))}
        />

        <TimeItem label={utils.intl('执行开始时间')} rules={[{required: true, message: utils.intl('请选择开始时间')}]} format="HH:mm"
                  value={startTime}
                  style={{ width:'100%' }}
                  onChange={setStartTime}/>
        <TimeItem label={utils.intl('执行结束时间')} rules={[{required: true, message: utils.intl('请选择结束时间')}]} format="HH:mm"
                  value={endTime}
                  onChange={setEndTime}
                  style={{ width:'100%' }}
                  disabledHours={() => startTime ? range(startTime.hours() - 1) : []}
                  disabledMinutes={disabledMinutes(startTime)}
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
                    rules={[{required: true}, numberRangePrecisionRule(0, 999999, 2)]}
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
                    rules={[{required: true}, numberRangePrecisionRule(0, 100, 2)]}
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

export default ControlCommandDialog
