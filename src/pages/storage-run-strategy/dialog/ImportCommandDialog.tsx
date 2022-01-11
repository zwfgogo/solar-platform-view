import React, {FC, useState} from 'react'
import {message, Modal, Upload} from 'wanke-gui'
import {ModalProps} from 'antd/lib/modal/Modal'
import XLSX from 'xlsx'
import classnames from 'classnames'

import {InboxOutlined} from 'wanke-icon'

import utils from '../../../public/js/utils'

const {Dragger} = Upload

export interface UploadCsvProps extends ModalProps {
  onImport: (list) => void
  commandTypeOptions: any[]
  controlTypeOptions: any[]
  endControlOptions: any[]
}

const ImportCommandDialog: FC<UploadCsvProps> = function (props: UploadCsvProps) {
  const newProps = {
    accept: '.csv,.xlsx,.xls',
    name: 'file',
    beforeUpload(file) {
      const fileReader = new FileReader()
      fileReader.onload = event => {
        const result = event.target.result
        const workbook = XLSX.read(result, {type: 'array'})
        let data = []
        for (const sheet in workbook.Sheets) {
          if (workbook.Sheets.hasOwnProperty(sheet)) {
            data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]))
            break
          }
        }
        let commandList = []
        for (let i = 0; i < data.length; i++) {
          let item = data[i]
          if (!item[utils.intl('储能指令')]) {
            message.error(utils.intl(`第{0}行缺少 '储能指令'`, i + 1))
            return
          }
          if (!item[utils.intl('执行时段')]) {
            message.error(utils.intl(`第{0}行缺少 '执行时段'`), i + 1)
            return
          }
          let timeParts = item[utils.intl('执行时段')].split('-')
          let soc = item[utils.intl('阶段结束控制参数')].match(/SOC=(.*)%/)?.[1]
          let controlCommand = props.commandTypeOptions.find(option => option.title == item[utils.intl('储能指令')]) || null
          let endControlParam = props.endControlOptions.find(option => item[utils.intl('阶段结束控制参数')] && item[utils.intl('阶段结束控制参数')].indexOf(option.title) != -1) || null
          let controlMode = null
          let power = null
          let chargeV = null
          let chargeA = null
          let dischargeV = null
          let dischargeA = null
          if (item[utils.intl('运行控制参数')] && item[utils.intl('运行控制参数')].indexOf(utils.intl('功率=')) != -1) {
            let r = item[utils.intl('运行控制参数')].match(/=(.*)kW/)
            power = r?.[1]
            if (power == null) {
              message.error(utils.intl(`第{0}行缺少 '功率'`), i + 1)
              return
            }
            controlMode = props.controlTypeOptions.find(option => option.title == utils.intl('功率'))
          } else if (controlCommand.name == 'Charge') {
            controlMode = props.controlTypeOptions.find(option => option.title == utils.intl('电流/电压'))
            let r = item[utils.intl('运行控制参数')].match(/充电电流限值=(.*)C/)
            chargeA = r?.[1]
            r = item[utils.intl('运行控制参数')].match(/充电电压=(.*)V/)
            chargeV = r?.[1]
            if (chargeA == null) {
              message.error(utils.intl(`第{0}行 '运行控制参数' 缺少 '充电电流限值'`, i + 1))
              return
            }
            if (chargeV == null) {
              message.error(utils.intl(`第{0}行 '运行控制参数' 缺少 '充电电压'`, i + 1))
              return
            }
          } else if (controlCommand.name == 'Discharge') {
            controlMode = props.controlTypeOptions.find(option => option.title == utils.intl('电流/电压'))
            let r = item[utils.intl('运行控制参数')].match(/放电电流=(.*)C/)
            dischargeA = r?.[1]
            r = item[utils.intl('运行控制参数')].match(/放电截至电压=(.*)V/)
            dischargeV = r?.[1]
            if (dischargeA == null) {
              message.error(utils.intl(`第{0}行 '运行控制参数' 缺少 '放电电流'`, i + 1))
              return
            }
            if (dischargeV == null) {
              message.error(utils.intl(`第{0}行 '运行控制参数' 缺少 '放电截至电压'`, i + 1))
              return
            }
          }
          commandList.push({
            controlCommand: controlCommand,
            startTime: timeParts[0],
            endTime: timeParts[1],
            controlMode: controlMode,
            activePower: power,
            endControlParam: endControlParam,
            soc: soc,
            chargeVoltage: chargeV,
            chargeCurrentLimit: chargeA,
            dischargeCurrent: dischargeA,
            dischargeEndVoltage: dischargeV
          })
        }
        props.onImport(commandList)
      }
      // 以二进制方式打开文件
      fileReader.readAsArrayBuffer(file)
      return false
    }
  }
  return (
    <Modal
      visible={props.visible}
      title={utils.intl('导入')}
      onCancel={props.onCancel}
      footer={null}
    >
      <div className={classnames('e-mb20 f-pr uploadcon')}>
        <Dragger {...newProps} fileList={[]}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined/>
          </p>
          <p className="fontLighter">{utils.intl('单击或拖动文件到此区域')}</p>
          <p className="fontLighter">{utils.intl('支持扩展名.xls,.xlsx,.csv的文件')}</p>
        </Dragger>
      </div>
    </Modal>
  )
}

export default ImportCommandDialog
