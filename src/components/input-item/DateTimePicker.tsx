import React from 'react';
import { TimePicker } from 'wanke-gui';
import DatePicker from '../date-picker'
import moment, { Moment } from 'moment';
import { DatePickerProps } from 'antd/lib/date-picker';

function range(start, end) {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
}

export enum LIMIT_TYPE {
  before,
  after
}

interface Props {
  limitTime?: string;
  limitType?: LIMIT_TYPE;
  format?: string;
}

const disableDateHOC = (Component) => {
  class DateTimePicker extends React.Component<Props & DatePickerProps, { value?: Moment }> {
    static getDerivedStateFromProps(nextProps) {
      const { value } = nextProps;
      return { value };
    }

    static getDisabled(isLimit: boolean, limit: Moment, limitType: LIMIT_TYPE, type) {
      const typeMap = {
        hour: 24,
        minute: 60,
        second: 60
      };
      if(!isLimit) return () => [];
      let limitList = range(0, typeMap[type]);
      const limitNum = limit[type]();
      if(limitType === LIMIT_TYPE.before) {
        limitList = limitList.slice(0, limitNum);
      } else {
        limitList = limitNum === typeMap[type] ? [] : limitList.slice(limitNum + 1);
      }
      return () => limitList;
    }

    constructor(props) {
      super(props);
      this.state = {};
    }

    disabledDateTime = (value) => {
      const { limitTime, limitType = LIMIT_TYPE.before } = this.props;
      if(!limitTime || !value) return {};
      const limit = moment(limitTime);
      const isLimitDay = value.isSame(limit, 'day');
      const isLimitHour = value.isSame(limit, 'hour');
      const isLimitMinute = value.isSame(limit, 'minute');

      return {
        disabledHours: DateTimePicker.getDisabled(isLimitDay, limit, limitType, 'hour'),
        disabledMinutes: DateTimePicker.getDisabled(isLimitHour, limit, limitType, 'minute'),
        disabledSeconds: DateTimePicker.getDisabled(isLimitMinute, limit, limitType, 'second'),
      }
    }

    handleDateChange = (date: Moment, dateString: string) => {
      const { onChange, limitTime, limitType = LIMIT_TYPE.before, format } = this.props;
      let isDisabled = false;
      const limit = moment(limitTime);
      if(date) {
        if(limitType === LIMIT_TYPE.before && limitTime) {
          isDisabled = date.isBefore(limit);
        } else if(limitType === LIMIT_TYPE.after && limitTime) {
          isDisabled = date.isAfter(limit);
        }
      }
      if (onChange) {
        onChange(isDisabled ? limit : date, isDisabled ? limit.format(format || "YYYY-MM-DD HH:mm:ss") : dateString);
      }
    }

    render() {
      const { limitTime, limitType, ...restProps } = this.props;

      return (
        <Component
          {...restProps}
          showTime
          onChange={this.handleDateChange}
          disabledTime={this.disabledDateTime}
        />
      );
    }
  }
  return DateTimePicker;
};

export default disableDateHOC(DatePicker);
