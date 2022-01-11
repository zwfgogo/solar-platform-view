import React, { CSSProperties } from 'react'
import classnames from 'classnames'
import { InputNumber } from 'wanke-gui'
import Label from '../../../../components/Label'
import wrapper1, { CommonProp1 } from '../../../../components/input-item/wrapper1'
import { numberRangeRule } from '../../../../util/ruleUtil'
import utils from '../../../../public/js/utils'

interface Props {
  label: string
  disabled: boolean
  required: boolean
  value: [number, number]
  toMapSelect: (onSuccess: ({ lat, lng }) => void) => void
  onChange: ([latitude, longitude]) => void
}

const PositionType: React.FC<Props> = function (this: null, props) {
  const [latitude, longitude] = props.value

  return (
    <div className="d-flex">
      <div className="ant-row ant-form-item position-type">
        <Label required={props.required}>{props.label}</Label>
        <div className="d-flex">
          <Item
            style={{ width: 100, marginRight: 5 }}
            rules={[{ required: props.required }, numberRangeRule(-180, 180, utils.intl('超出经度范围'))]}
            min={-180} max={180}
            value={latitude} onChange={v => props.onChange([v, longitude])}
          />
          <Item
            style={{ width: 100, marginRight: 5 }}
            rules={[{ required: props.required }, numberRangeRule(-90, 90, utils.intl('超出纬度范围'))]}
            value={longitude} onChange={v => props.onChange([latitude, v])}
          />
          <div style={{ marginTop: 5 }}>
            <a onClick={() => props.toMapSelect(
              ({ lng, lat }) => props.onChange([lng, lat])
            )}>{utils.intl("地图选点")}</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PositionType

interface InputItemProps extends CommonProp1 {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  style?: CSSProperties
}

const InputItemCustomError: React.FC<InputItemProps> = function (this: null, props) {
  return (
    <InputNumber
      style={props.style}
      className={classnames({ 'input-error': props.errs.length > 0 })}
      value={props.value} onChange={props.onChange}
    />
  )
}

const Item = wrapper1<InputItemProps>(InputItemCustomError)
