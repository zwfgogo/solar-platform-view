/**
 *  增加区间长度限制的功能 maxLength 为number类型
 */
import React, { useState, useEffect } from 'react'
import { RangePicker } from 'wanke-gui'
// import { Moment } from 'moment'
// import { WankeDateNewOutlined } from 'wanke-icon'
// import { RangePickerProps } from 'antd/lib/date-picker'

// const AntdRangePicker = DatePicker.RangePicker

// type Props = RangePickerProps & {
//   maxLength?: number
//   value?: Moment[]
// }

// const RangePicker: React.FC<Props> = function(this: null, props) {
//   const {maxLength, disabledDate, onCalendarChange, value, onOpenChange, ...restProps} = props
//   const [realValue, setRealValue] = useState(value || [])
//   const [showViewDate, setShowViewDate] = useState(false)
//   const [viewDates, setViewDates] = useState([])

//   const handleDisabledDate1 = (current: Moment) => {
//     if (!viewDates || viewDates.length === 0) {
//       return disabledDate?.(current)
//     }
//     const targetDate = viewDates[0] || viewDates[1]
//     const tooLate = targetDate && current.diff(targetDate, 'days') > (maxLength - 1)
//     const tooEarly = targetDate && targetDate.diff(current, 'days') > (maxLength - 1)
//     return disabledDate?.(current) || tooEarly || tooLate
//   }

//   const handleCalendarChange = (value, formatString) => {
//     if (value && value.length === 2 && value[0] && value[1]) {
//       setViewDates([])
//     } else {
//       setViewDates(value)
//     }
//     onCalendarChange && onCalendarChange(value, formatString)
//   }

//   const handleOpenChange = (flag) => {
//     if (!flag) {
//       // 在handleCalendarChange后执行
//       setTimeout(() => {
//         setViewDates([])
//       })
//     }
//     setShowViewDate(flag)
//     onOpenChange && onOpenChange(flag)
//   }

//   const handleChange = (value, formatString) => {
//     const nextValue = value || []
//     setRealValue(nextValue)
//     props.onChange && props.onChange(nextValue, formatString)
//   }

//   useEffect(() => {
//     setRealValue(value)
//   }, [value])

//   return (
//     <AntdRangePicker
//       {...restProps}
//       onChange={handleChange}
//       onOpenChange={handleOpenChange}
//       value={(showViewDate ? viewDates : realValue) as any}
//       disabledDate={(props.disabledDate || props.maxLength) ? handleDisabledDate1 : undefined}
//       onCalendarChange={handleCalendarChange}
//       suffixIcon={<WankeDateNewOutlined />}
//     />
//   )
// }

export default RangePicker
