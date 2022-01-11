import React, { useEffect } from 'react'
import { ValueName } from '../../../interfaces/CommonInterface'
import SelectItem from '../../../components/input-item/SelectItem'
import { DEVICE_TYPE } from '../../constants'
import utils from '../../../public/js/utils'

interface Props {
  disabled: boolean
  deviceType: string
  value: { parent1Id: number, parent2Id: number, parent3Id: number }
  onChange: (values: { parentDevice: { parent1Id: number, parent2Id: number, parent3Id: number } }) => void
  onParent1Change: (provinceId: number) => void
  onParent2Change: (cityId: number) => void
  parentOption1: ValueName[]
  parentOption2: ValueName[]
  parentOption3: ValueName[]
}

const ParentType: React.FC<Props> = function (this: null, props) {
  useEffect(() => {
    if (props.value.parent1Id) {
      props.onParent1Change(props.value.parent1Id)
    }
    if (props.value.parent2Id) {
      props.onParent2Change(props.value.parent2Id)
    }
  }, [])

  const onParent1Change = (parent1Id: number) => {
    props.onParent1Change(parent1Id)
    props.onChange({ parentDevice: { parent1Id, parent2Id: null, parent3Id: null } })
  }

  const onParent2Change = (parent2Id: number) => {
    props.onParent2Change(parent2Id)
    props.onChange({ parentDevice: { parent1Id: props.value.parent1Id, parent2Id, parent3Id: null } })
  }

  const onParent3Change = (parent3Id: number) => {
    props.onChange({ parentDevice: { parent1Id: props.value.parent1Id, parent2Id: props.value.parent2Id, parent3Id } })
  }
  
  return (
    <>
      <SelectItem
        label={utils.intl(props.deviceType === 'Stack' ? "所属液流单元" : "所属电池单元")} // 针对电堆类型的设备特殊处理
        disabled={props.disabled}
        rules={[{ required: true }]}
        value={props.value.parent1Id}
        onChange={onParent1Change}
        dataSource={props.parentOption1}
      />
      {
        (props.deviceType == DEVICE_TYPE.batteryPackage || props.deviceType == DEVICE_TYPE.singleBattery) && (
          <SelectItem
            label={utils.intl("所属电池簇")}
            disabled={props.disabled}
            rules={[{ required: true }]}
            value={props.value.parent2Id}
            onChange={onParent2Change}
            dataSource={props.parentOption2}
          />
        )
      }
      {
        (props.deviceType == DEVICE_TYPE.singleBattery) && (
          <SelectItem
            label={utils.intl("所属电池包")}
            disabled={props.disabled}
            rules={[{ required: true }]}
            value={props.value.parent3Id}
            onChange={onParent3Change}
            dataSource={props.parentOption3}
          />
        )
      }
    </>
  )
}

export default ParentType
