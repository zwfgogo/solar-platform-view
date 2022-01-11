import React, { useEffect, useRef } from 'react'
import { FullLoading, Table1 } from 'wanke-gui'
import utils from '../../../public/js/utils'
import { AnalogTypeName, C19StrategyControlType } from '../strategy.constant'
import useEnergyUnitValue from './useEnergyUnitValue'

interface Props {
  stationId: number
  runStrategyId: number
  action: any
  c19CurrentControlParam: any
  loading: boolean
}

const C19CurrentControlParams: React.FC<Props> = (props) => {
  const { data } = useEnergyUnitValue({
    energyUnits: props.c19CurrentControlParam.map(item => ({
      id: item.energyUnitId,
      type: item.type === C19StrategyControlType.ActiveMode ? AnalogTypeName.ActivePower : AnalogTypeName.ReactivePower
    }))
  })
  const dataRef = useRef<any>({})
  dataRef.current = data

  const columns: any = [{
    title: utils.intl('strategy.序号'),
    dataIndex: 'num'
  }, {
    title: utils.intl('strategy.能量单元'),
    dataIndex: 'energyUnitTitle'
  }, {
    title: utils.intl('strategy.目标'),
    dataIndex: 'value',
    render: (text, record) => addUnit(text, record.type)
  }, {
    title: utils.intl('strategy.实时值'),
    dataIndex: 'real',
    render: (text, record) => {
      return <span>{addUnit(dataRef.current[record.energyUnitId], record.type)}</span>
    }
  }]

  useEffect(() => {
    props.action('fetchC19CurrentControlParams', {
      runStrategyId: props.runStrategyId,
      stationId: props.stationId,
    })
  }, [])

  return (
    <>
      {props.loading && <FullLoading />}
      <Table1
        pagination={false}
        columns={columns}
        dataSource={props.c19CurrentControlParam}
        scroll={{ y: 500 }}
      />
    </>
  )
}

export default C19CurrentControlParams

function addUnit(val, type) {
  const unit = type === C19StrategyControlType.ActiveMode ? 'kWh' : 'kVar'
  if (!val && val !== 0) return ''

  return `${val}${unit}`
}
