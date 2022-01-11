import React from 'react'
import DateItem from '../../../../components/input-item/DateItem'
import { Moment } from 'moment'

interface Props {
  label: string
  required: boolean
  format: string
  disabled: boolean
  value: Moment
  onChange?: (v: Moment) => void
  disabledDate?: (date) => boolean
  disabledTime?: any
  showNow?: boolean
}

const DateType: React.FC<Props> = function (this: null, props) {
  const {format, showNow} = props
  let showTime = format == 'minute' || format == 'hour' || format == 'second'
  let dateFormat = null
  let picker = undefined
  if (format == 'year') {
    picker = 'year'
  } else if (format == 'month') {
    picker = 'month'
  } else if (format == 'hour') {
    dateFormat = 'YYYY-MM-DD HH:00'
  } else if (format == 'minute') {
    dateFormat = 'YYYY-MM-DD HH:mm'
  } else if (format == 'second') {
    dateFormat = 'YYYY-MM-DD HH:mm:ss'
  }

  return (
    <DateItem
      disabled={props.disabled}
      showNow={showNow}
      showTime={showTime}
      format={dateFormat}
      label={props.label}
      rules={[{required: props.required}]}
      value={props.value}
      onChange={props.onChange}
      picker={picker}
      disabledDate={props.disabledDate}
      disabledTime={props.disabledTime}
    />
  )
}

export default DateType
