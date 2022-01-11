import React from 'react'
import moment, { Moment } from 'moment'
import wrapper1 from '../../../../components/input-item/wrapper1'
import DateTimePicker, { LIMIT_TYPE } from '../../../../components/input-item/DateTimePicker'
import Label from '../../../../components/Label'
import utils from '../../../../public/js/utils'

const DateTimePicker1 = wrapper1<any>(DateTimePicker)

interface Props {
  label: string
  required: boolean
  disabled: boolean
  value: Moment
  onChange: (v: Moment) => void
}

const DateTimeType: React.FC<Props> = function (this: null, props) {
  const disabledDate = (current) => {
    // 加一个小时开始算
    let date = moment(getLeastTime()).format('YYYY-MM-DD')
    return current < moment(date, 'YYYY-MM-DD').startOf('day')
  }

  const getLeastTime = () => {
    return moment().add(1, 'hour').format('YYYY-MM-DD HH:00:00')
  }

  return (
    <div className="input-item">
      <Label required={props.required}>{props.label}</Label>
      <DateTimePicker1
        required={true}
        disabled={props.disabled}
        rules={[{ required: true, message: utils.intl('请输入计划投产时间') }]}
        limitTime={getLeastTime()}
        limitType={LIMIT_TYPE.before}
        disabledDate={disabledDate}
        placeholder={`${utils.intl("请输入")}${props.label}`}
        style={{ width: '100%' }}
        format="YYYY-MM-DD HH:00:00"
        value={props.value} onChange={props.onChange}
      />
    </div>
  )
}

export default DateTimeType
