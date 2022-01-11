import React from 'react'
import {TimePicker} from 'wanke-gui'
import {Moment} from 'moment'

interface Props {
  value: Moment
  onChange: (value: Moment) => void
}

function TimeSelect(this: null, props: Props) {
  return (
    <div>
      <TimePicker value={props.value} onChange={props.onChange} format="HH:mm"></TimePicker>
    </div>
  )
}

export default TimeSelect
