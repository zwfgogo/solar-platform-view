import React from 'react'
import {Table} from 'wanke-gui'
import ListItemEditAndDelete from '../../../components/layout/ListItemEditAndDelete'

import utils from '../../../public/js/utils'

interface Props {
  isLocal: boolean
  commandTypeOptions: any[]
  controlTypeOptions: any[]
  endControlOptions: any[]
  dataSource: any[]
  onEdit: (index) => void
  onDelete: (index) => void
}

function findTitle(options, value) {
  return options.find(o => o && o.id == value)?.title || null
}

const LsControlArgumentWithEdit: React.FC<Props> = (props) => {
  const columns = [
    {
      title: utils.intl('储能指令'), dataIndex: ['controlCommand', 'id'], width: 200, render: (value) => {
        return (
          <span>{findTitle(props.commandTypeOptions, value)}</span>
        )
      }
    },
    {
      title: utils.intl('执行时段'), width: 200, render: (_, record) => {
        return (
          <span>{record.startTime}-{record.endTime}</span>
        )
      }
    },
    {
      title: utils.intl('运行控制参数'), dataIndex: ['controlMode', 'id'], width: 200, render: (value, record, _) => {
        let controlName = props.controlTypeOptions.find(item => item.id == value)?.name
        let commandType = props.commandTypeOptions.find(item => item.id == record.controlCommand.id)?.name
        let result, unit
        if (controlName == 'Power') {
          result = record.activePower
          unit = 'kW'
          return (
            <span>{findTitle(props.controlTypeOptions, value)}{result ? '=' : ''}{result}{unit}</span>
          )
        }
        if (controlName == 'Current/Voltage') {
          if (commandType == 'Charge') {
            return (
              <div>
                <div>{utils.intl('充电电流限值')}={record.chargeCurrentLimit}C/AH</div>
                <div>{utils.intl('充电电压')}={record.chargeVoltage}V/cell</div>
              </div>
            )
          }
          return (
            <div>
              <div>{utils.intl('放电电流')}={record.dischargeCurrent}C/AH</div>
              <div>{utils.intl('放电截至电压')}={record.dischargeEndVoltage}V/cell</div>
            </div>
          )
        }
        return null
      }
    },
    {
      title: utils.intl('阶段结束控制参数'), dataIndex: ['endControlParam', 'id'], width: 200, render: (value, record) => {
        let endControlName = props.endControlOptions.find(item => item.id == value)?.name
        let result, unit
        if (endControlName == 'SOC') {
          result = record.soc
          unit = '%'
        }
        return (
          <span>{findTitle(props.endControlOptions, value)}{result ? '=' : ''}{result}{unit}</span>
        )
      }
    },
    {
      title: utils.intl('操作'), width: 120, render: (_, record, index) => {
        if (props.isLocal) {
          return null
        }
        return (
          <ListItemEditAndDelete onEdit={() => props.onEdit(index)} onDelete={() => props.onDelete(index)}/>
        )
      }
    }
  ]

  return (
    <Table
      rowKey={(record, index) => index + ''}
      dataSource={props.dataSource}
      columns={columns}
      bordered={false}
      pagination={false}
    />
  )
}

export default LsControlArgumentWithEdit
