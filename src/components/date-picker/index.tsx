import React from 'react'
import { DatePicker as AntdDatePicker } from 'antd'
import { DatePickerProps } from 'antd/lib/date-picker'
import { WankeDateNewOutlined } from 'wanke-icon'
import RangePicker from '../range-picker/RangePicker'

const { MonthPicker, WeekPicker, YearPicker, TimePicker } = AntdDatePicker


class DatePicker extends React.Component<DatePickerProps>{
    static RangePicker: any
    static TimePicker: any
    static YearPicker: any
    static WeekPicker: any
    static MonthPicker: any

    render() {
        return <AntdDatePicker {...this.props} suffixIcon={<WankeDateNewOutlined />} />
    }

}

DatePicker.MonthPicker = MonthPicker;
DatePicker.WeekPicker = WeekPicker;
DatePicker.YearPicker = YearPicker;
DatePicker.TimePicker = TimePicker;
DatePicker.RangePicker = RangePicker;

export default DatePicker