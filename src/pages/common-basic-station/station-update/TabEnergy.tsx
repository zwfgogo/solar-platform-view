import React, { useEffect, useState } from 'react'
import ListEnergyUnit from './ListEnergyUnit'
import { Button } from 'antd'
import AddEnergyUnitDialog from './AddEnergyUnitDialog'
import { ValueName } from '../../../interfaces/CommonInterface'
import { ActionProp } from '../../../interfaces/MakeConnectProps'
import Tools from '../../../components/layout/Tools'
import Back1 from '../../../components/layout/Back1'
import FullContainer from '../../../components/layout/FullContainer'
import { FullLoading } from "wanke-gui"
import utils from '../../../public/js/utils'

// 设备信息页签
interface Props extends ActionProp {
  editable: boolean
  stationId: number
  stationType: number
  energyUnitList: any[]
  energyUnitTypes: ValueName[]
  toAddEnergyUnit: (energyTypeId) => void
  fetchStationEnergyListLoading: boolean
  back: () => void
}

const TabEnergy: React.FC<Props> = function (this: null, props) {
  const [showAdd, setShowAdd] = useState(false)

  const onConfirm = (energyTypeId) => {
    props.toAddEnergyUnit(energyTypeId)
    setShowAdd(false)
  }

  useEffect(() => {
    props.action('fetchStationEnergyList', { stationId: props.stationId })
  }, [])

  useEffect(() => {
    if (props.stationType) {
      props.action('fetchEnergyUnitType', { stationTypeId: props.stationType })
    }
  }, [props.stationType])

  return (
    <FullContainer>
      {
        showAdd && (
          <AddEnergyUnitDialog
            energyUnitTypes={props.energyUnitTypes}
            visible={showAdd}
            onExited={() => setShowAdd(false)}
            onConfirm={onConfirm}
          />
        )
      }
      <div className="flex1" style={{ padding: '0px 15px 15px 15px' }}>
        {props.fetchStationEnergyListLoading && (<FullLoading />)}
        {
          props.editable && (
            <div className="d-flex" style={{ flexDirection: 'row-reverse' }}>
              <Button type="primary" onClick={() => setShowAdd(true)}>{utils.intl("新增")}</Button>
            </div>
          )
        }
        <div style={{ marginTop: 10 }}>
          <ListEnergyUnit
            editable={props.editable}
            stationId={props.stationId}
            energyUnitList={props.energyUnitList}
            stationTypeId={null} />
        </div>
      </div>
      <Tools height={40}>
        {/* <Back1 back={props.back} /> */}
      </Tools>
    </FullContainer>
  )
}

export default TabEnergy
