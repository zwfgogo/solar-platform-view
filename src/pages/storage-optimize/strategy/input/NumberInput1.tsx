import React from 'react'
import {Form} from 'antd'
import classnames from 'classnames'
import wrapper1, {CommonProp1} from '../../../../components/input-item/wrapper1'
import Label from '../../../../components/Label'
import {InputNumber} from 'wanke-gui'
import {ValidationRule} from '../../../../interfaces/CommonInterface'

type NumberInputProps = any

interface Props extends NumberInputProps, CommonProp1 {
  label: string
  rules?: ValidationRule[]
  form: any
  suffix?: string
}

const NumberInput1: React.FC<Props> = function (this: null, props) {
  return (
    <div className={classnames('input-item', props.className)} style={props.style}>
      <Label horizontal required={props.required}>
        {props.label}
      </Label>

      <Form.Item name={props.name} rules={props.rules || []} noStyle>
        <div className="d-flex v-center">
          <InputNumber
            className={classnames({'with-error': props.errs.length > 0})}
            value={props.value}
            placeholder={props.placeholder}
            onChange={v => props.onChange(v)}
            precision={props.precision}
            min={props.min}
            max={props.max}
            disabled={props.disabled}
          />
          <div className="input-suffix">{props.suffix}</div>
        </div>
      </Form.Item>
    </div>
  )
}

export default wrapper1<Props>(NumberInput1)
