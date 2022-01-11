import React from 'react'
import {Form} from 'antd'
import classnames from 'classnames'
import wrapper1, {CommonProp1} from '../../../../components/input-item/wrapper1'
import Label from '../../../../components/Label'
import {Input} from 'wanke-gui'
import {InputProps} from 'antd/lib/input'
import {ValidationRule} from '../../../../interfaces/CommonInterface'

interface Props extends CommonProp1, Omit<InputProps, 'onChange'> {
  label: string
  rules?: ValidationRule[]
  form: any
  onChange: (v: string) => void
  disabled?: boolean
}

const StrategyNameInput: React.FC<Props> = function (this: null, props) {
  return (
    <div className={classnames('d-flex v-center', props.className)} style={{width: '100%'}}>
      <Label horizontal={true}>
        {props.label}
      </Label>

      <Form.Item name={props.name} rules={props.rules || []} noStyle>
        <Input
          value={props.value}
          placeholder={props.placeholder}
          onChange={v => props.onChange(v.target.value)}
          disabled={props.disabled}
          style={{width: 200}}
        />
      </Form.Item>
      <div style={{marginLeft: 5}}>
        {
          props.errs && props.errs.map(item => {
            return (
              <div style={{color: 'red'}}>
                {item}
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default wrapper1<Props>(StrategyNameInput)
