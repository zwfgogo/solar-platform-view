import React, { useEffect, useState } from 'react'
import moment from 'moment'

import Label from '../../../components/Label'
import { Button, Dropdown, Menu, Tabs } from 'antd'
import LsControlArgument from './LsControlArgument'
import { TypeStrategyItem } from './ArgumentItem'
import { DateTypeOptions } from '../run-strategy.constants'
import { downloadCommandFile } from '../run-strategy.helper'
import ConfirmTip from '../../../components/ConfirmTip'

import utils from '../../../public/js/utils'
import AbsoluteBubble from '../../../components/AbsoluteBubble'
import { Select } from 'wanke-gui'
import AbsoluteFullDiv from '../../../components/AbsoluteFullDiv'
import { FzSetting1Outlined } from 'wanke-icon'

interface Props {
  energyUnitList: any[]
  commandTypeOptions: any[]
  controlTypeOptions: any[]
  endControlOptions: any[]
  detail: TypeStrategyItem
  onEdit: (id) => void
  onDeleteArgument: () => void
}

const ArgumentItemLook: React.FC<Props> = function (this: null, props) {
  const [unitId, setUnitId] = useState(null)

  const exportCsv = () => {
    downloadCommandFile(props.controlTypeOptions, props.endControlOptions, props.detail.details.filter(item => item.energyUnitId == unitId), 'csv')
  }

  const exportExcel = () => {
    downloadCommandFile(props.controlTypeOptions, props.endControlOptions, props.detail.details.filter(item => item.energyUnitId == unitId), 'excel')
  }

  useEffect(() => {
    if (props.energyUnitList.length > 0) {
      setUnitId(props.energyUnitList[0].value + '')
    }
  }, [props.energyUnitList])

  const menu = (
    <Menu>
      <Menu.Item onClick={exportCsv}>{utils.intl('导出csv')}</Menu.Item>
      <Menu.Item onClick={exportExcel}>{utils.intl('导出excel')}</Menu.Item>
    </Menu>
  )

  return (
    <div className="argument-item">
      <div className="argument-header">
        <div className="argument-header-title">
          <FzSetting1Outlined style={{ color: '#3D7EFF', marginRight: 8, fontSize: 16 }} />
          <span style={{ fontWeight: 'bold' }}>{props.detail.title}</span>
        </div>
        <div className="argument-header-range" style={{ marginTop: 3 }}>
          <Label>{utils.intl('适用季节/时段')}</Label>
          <span style={{ color: '#52C41A', verticalAlign: 'text-top' }}>
            [
            {DateTypeOptions.find(item => item.value == props.detail.applicableDateType)?.name}
            ]
          </span>
          {
            props.detail.applicableDate.map((item, index) => {
              return (
                <div key={index} style={{ marginRight: 7, display: 'inline-block', verticalAlign: 'text-top' }}>
                  {moment('2000-' + item[0]).format(utils.intl('MM月DD日'))}
                  <span style={{ margin: '0 5px' }}>-</span>
                  {moment('2000-' + item[1]).format(utils.intl('MM月DD日'))}
                  {index < props.detail.applicableDate.length - 1 ? ', ' : ''}
                </div>
              )
            })
          }
        </div>
        <div style={{ flexShrink: 0, marginTop: 6 }}>
          <a onClick={() => props.onEdit(props.detail.id)}>{utils.intl('编辑')}</a>
          {
            props.detail && (
              <ConfirmTip onConfirm={props.onDeleteArgument}>
                <a className="wanke-delete-btn" style={{ marginLeft: 10 }}>{utils.intl('删除')}</a>
              </ConfirmTip>
            )
          }
        </div>
      </div>
      <section className="argument-item-table-container">
        <header>
          <Select
            style={{ width: 150 }}
            dataSource={props.energyUnitList}
            value={unitId ? Number(unitId) : unitId}
            onChange={setUnitId}
          />
          <Dropdown overlay={menu}>
            <Button style={{}}>{utils.intl('导出')}</Button>
          </Dropdown>
        </header>
        <footer>
          <LsControlArgument
            isFixHeightTable
            commandTypeOptions={props.commandTypeOptions}
            controlTypeOptions={props.controlTypeOptions}
            endControlOptions={props.endControlOptions}
            dataSource={props.detail.details.filter(item => item.energyUnitId == unitId) || []}
          />
        </footer>
      </section>
    </div>
  )
}

export default ArgumentItemLook
