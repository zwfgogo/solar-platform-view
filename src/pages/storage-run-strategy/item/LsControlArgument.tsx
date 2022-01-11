import React from 'react'
import classnames from 'classnames'
import {Table, Table1} from 'wanke-gui'

import utils from '../../../public/js/utils'

interface Props {
  isFixHeightTable?: boolean
  commandTypeOptions: any[]
  controlTypeOptions: any[]
  endControlOptions: any[]
  dataSource: any[]
}

function findTitle(options, value) {
  return options.find(o => o && o.id == value)?.title || null
}

const LsControlArgument: React.FC<Props> = (props) => {
  const columns = [
    {
      title: utils.intl('储能指令'), dataIndex: ['controlCommand', 'title'], width: 200
    },
    {
      title: utils.intl('执行时段'), width: 200, render: (_, record) => {
        return (
          <div>
            {record.startTime}-{record.endTime}
            {
              record.temporary && (
                <a className="temporary-strategy-item">{utils.intl('临时')}</a>
              )
            }
          </div>
        )
      }
    },
    {
      title: utils.intl('运行控制参数'), dataIndex: ['controlMode', 'id'], width: 200, render: (value, record, _) => {
        let controlName = props.controlTypeOptions.find(item => item.id == value)?.name
        let commandType = props.commandTypeOptions.find(item => item.id == record.controlCommand?.id)?.name
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
          return (
            <span>{findTitle(props.endControlOptions, value)}{result ? '=' : ''}{result}{unit}</span>
          )
        }
        return findTitle(props.endControlOptions, value)
      }
    }
  ]

  if (props.isFixHeightTable) {
    return (
      <Table
        rowKey={(record, index) => index + ''}
        dataSource={props.dataSource}
        columns={columns}
        bordered={false}
        pagination={false}
        scroll={{ y:150 }}
        onRow={(record) => {
          if (record.temporary) {
            return {
              className: classnames({'temporary-strategy-row': record.temporary})
            }
          }
          return {}
        }}
      />
    )

  }

  return (
    <Table1
      rowKey={(record, index) => index + ''}
      dataSource={props.dataSource}
      columns={columns}
      bordered={false}
      pagination={false}
      onRow={(record) => {
        if (record.temporary) {
          return {
            className: classnames({'temporary-strategy-row': record.temporary})
          }
        }
        return {}
      }}
    />
  )
}

export default LsControlArgument
