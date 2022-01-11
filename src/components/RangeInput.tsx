import React, { useEffect, useState } from 'react'
import { Input } from 'wanke-gui'
import './style/range-input.less'

interface Props {
  value?: any
  unit?: string
  onChange?: (value: any) => void
}

const RangeInput: React.FC<Props> = (props) => {
  const [values, setValues] = useState([])

  const triggerChange = (val) => {
    props.onChange?.(val)
  }

  const handleChange = (index, val) => {
    const newVal = values.slice()
    newVal[index] = val
    setValues(newVal)
    triggerChange(newVal)
  }

  useEffect(() => {
    setValues(props.value || [])
  }, [props.value])
  
  return (
    <div className="wanke-range-input">
      <Input
        value={values[0]}
        addonAfter={props.unit}
        onChange={e => handleChange(0, e.target.value)}
      />
      <span className="wanke-range-input-split">~</span>
      <Input
        value={values[1]}
        addonAfter={props.unit}
        onChange={e => handleChange(1, e.target.value)}
      />
    </div>
  )
}

export default RangeInput
