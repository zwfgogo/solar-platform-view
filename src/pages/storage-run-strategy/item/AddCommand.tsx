import React from 'react'
import {Form} from 'antd'
import classnames from 'classnames'
import wrapper1, {CommonProp1} from '../../../components/input-item/wrapper1'
import {InputProps} from 'antd/lib/input'
import {ValidationRule} from '../../../interfaces/CommonInterface'
import {EditOutlined} from 'wanke-icon'

import utils from '../../../public/js/utils'

interface Props extends CommonProp1, Omit<InputProps, 'onChange'> {
  rules?: ValidationRule[]
  form: any
  onAdd: () => void
}

const AddCommand: React.FC<Props> = function (this: null, props) {
  return (
    <div className={classnames('d-flex v-center', props.className)}>
      <Form.Item name={props.name} rules={props.rules || []} noStyle>
        <div style={{margin: 10}}>
          <a onClick={props.onAdd}>
            <EditOutlined/>
            <span>{utils.intl('添加')}</span>
          </a>
        </div>
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

export default wrapper1<Props>(AddCommand)
