import React from 'react'
import {Table, Table1} from 'wanke-gui'

import utils from '../../../public/js/utils'

interface Props {
  loading: boolean
  commandTypeOptions: any[]
  controlTypeOptions: any[]
  endControlOptions: any[]
  dataSource: any[]
  selectedRowKeys: any[]
  onChange: (v) => void
}

function findTitle(options, value) {
  return options.find(o => o && o.id == value)?.title || null
}

const LsTempCommand: React.FC<Props> = (props) => {
  const columns = [
    {
      title: utils.intl('储能单元'), dataIndex: 'energyUnitTitle', width: 150
    },
    {
      title: utils.intl('策略生效时间'), dataIndex: 'startTime', width: 180
    },
    {
      title: utils.intl('策略失效时间'), dataIndex: 'endTime', width: 180
    },
    {
      title: utils.intl('临时控制指令'), dataIndex: ['controlCommand', 'id'], width: 120, render: (value) => {
        return (
          <span>{findTitle(props.commandTypeOptions, value)}</span>
        )
      }
    },
    {
      title: utils.intl('指令执行时段'), width: 200, dataIndex: 'runTime', render: (value) => {
        return (
          <span>{value[0]}-{value[1]}</span>
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
      title: utils.intl('结束控制参数'), dataIndex: ['endControlParam', 'id'], width: 120, render: (value, record) => {
        let endControlName = props.endControlOptions.find(item => item.id == value)?.name
        let result, unit
        if (endControlName == 'SOC') {
          result = record.soc
          unit = '%'
          return (
            <span>{findTitle(props.endControlOptions, value)}{result ? '=' : ''}{result}{unit}</span>
          )
        }
        return findTitle(props.endControlOptions, value)
      }
    },
    {
      title: utils.intl('状态'), width: 100, dataIndex: 'status', render: (value) => {
        let txt
        if (value == 0) {
          txt = utils.intl('未开始')
        } else if (value == 1) {
          txt = utils.intl('执行中')
        } else if (value == 2) {
          txt = utils.intl('已完成')
        } else if (value == 3) {
          txt = utils.intl('已停用')
        } else {
          txt = '-'
        }
        return (
          <div className="vh-center">
            <span className={'command-status status-' + value}>{txt}</span>
          </div>
        )
      }
    },
    {
      title: utils.intl('状态时间'), width: 150, dataIndex: 'statusTime'
    }
  ]

  return (
    <Table1
      loading={props.loading}
      rowSelection={{
        type: 'checkbox',
        selectedRowKeys: props.selectedRowKeys, onChange: props.onChange,
        getCheckboxProps: (record) => {
          return {
            disabled: record.status != 0 && record.status != 1
          }
        }
      }}
      pagination={false}
      rowKey={(record) => record.id + ''}
      dataSource={props.dataSource}
      columns={columns}
    />
  )
}

export default LsTempCommand
