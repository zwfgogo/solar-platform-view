import React from 'react'
import NumberItem from '../../../../components/input-item/NumberItem'

interface Props {
  label: string
  required: boolean
  min: number
  max: number
  suffix: string
  disabled: boolean
  value: number
  onChange: (v: number) => void
}

const DoubleType: React.FC<Props> = function (this: null, props) {
  return (
    <NumberItem
      label={props.label}
      rules={[{required: props.required}]}
      min={props.min ?? undefined}
      max={props.max ?? undefined}
      suffix={props.suffix}
      disabled={props.disabled}
      value={props.value}
      onChange={props.onChange}
    />
  )
}

export default DoubleType
