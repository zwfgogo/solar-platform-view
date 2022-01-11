import React from 'react'
import {Form} from 'antd'
import classnames from 'classnames'
import wrapper1, {CommonProp1} from '../../../../components/input-item/wrapper1'

import {ExclamationCircleOutlined} from 'wanke-icon'
import {ValidationRule} from '../../../../interfaces/CommonInterface'

interface Props extends CommonProp1 {
  rules?: ValidationRule[]
  form: any
  value: any
  className?: string
  energyUnitName: string
  onClick: () => void
  showError: boolean
}

const EnergyUnitTab: React.FC<Props> = function (this: null, props) {
  return (
    <div className={classnames('unit', props.className)} onClick={props.onClick}>
      <Form.Item name={props.name} rules={props.rules || []} noStyle>
        <span>{props.energyUnitName}</span>
      </Form.Item>
      <div style={{marginLeft: 5}}>
        {
          props.showError && props.errs.length > 0 && (
            <ExclamationCircleOutlined style={{color: 'red', marginLeft: 5}} title={props.errs[0]}/>
          )
        }
      </div>
    </div>
  )
}

export default wrapper1<Props>(EnergyUnitTab)
