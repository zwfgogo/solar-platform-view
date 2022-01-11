import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { Modal, Select, Tabs } from 'wanke-gui'
import Label from 'wanke-gui/es/layout/Label'
import LsControlArgument from '../item/LsControlArgument'
import { getDateStr } from '../../../util/dateUtil'

import utils from '../../../public/js/utils'
import Header from '../../../components/Header'

interface Props {
  stationId: number
  strategyId: number
  energyUnits: any[]
  action: any
  commandTypeOptions: any[]
  controlTypeOptions: any[]
  endControlOptions: any[]
  todayCommandList: any[]

  visible: boolean
  onCancel: () => void
}

const TodayCommandDialog: React.FC<Props> = function (this: null, props) {
  const [current, setCurrent] = useState(null)
  useEffect(() => {
    if (props.energyUnits.length) {
      setCurrent(props.energyUnits[0].value)
    }
  }, [props.energyUnits])

  useEffect(() => {
    if (current) {
      props.action('fetchTodayCommandList', {
        stationId: props.stationId,
        runStrategyId: props.strategyId,
        energyUnitId: current
      })
    }
  }, [current])

  const renderTitle = () => {
    const isMultiUnit = props.energyUnits.length > 1
    if (isMultiUnit) {
      return (
        <div className="v-center" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
          <Select
            dataSource={props.energyUnits}
            value={current}
            style={{ width: 260 }}
            onChange={setCurrent}
          />
          <div style={{ marginTop: 4, flexShrink: 0 }}>
            {/* <Label>{utils.intl('日期')}</Label> */}
            <span className="common-grey-color">{getDateStr(moment())}</span>
          </div>
        </div>
      )
    }
    const target = props.energyUnits.find(unit => current && unit.value === current)

    return (
      <Header title={target?.name} style={{ padding: '16px 0 16px', marginTop: -16, marginLeft: -14 }} btnsStyleProps={{ right: 0 }}>
        <div>
          {/* <Label>{utils.intl('日期')}</Label> */}
          <span className="common-grey-color">{getDateStr(moment())}</span>
        </div>
      </Header>
    )
  }

  return (
    <Modal
      centered
      width={'1200px'}
      title={utils.intl('当日控制参数')}
      visible={props.visible}
      onCancel={props.onCancel}
      footer={null}
      className="today-command-dialog"
    >
      {/* <div className="v-center">
      </div> */}
      {renderTitle()}
      <div style={{ height: 300 }}>
        <LsControlArgument
          commandTypeOptions={props.commandTypeOptions}
          controlTypeOptions={props.controlTypeOptions}
          endControlOptions={props.endControlOptions}
          dataSource={props.todayCommandList}
        />
      </div>
    </Modal>
  )
}

export default TodayCommandDialog
