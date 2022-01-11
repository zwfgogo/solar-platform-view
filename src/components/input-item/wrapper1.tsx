import React from 'react'
import {Form} from 'wanke-gui'
import {FormComponentProps, ValidationRule} from '../../interfaces/CommonInterface'
import utils from '../../public/js/utils'
import {wrapper} from 'wanke-gui/es/form1/InputItem'

let uid = 1

export interface CommonProp extends FormComponentProps {
  name?: string
  label?: string
  value?: any
  rules?: ValidationRule[]
  errs?: string[]
}

export interface CommonProp1 {
  required?: boolean
  errs?: string[]
}

const defaultEqual = (value1, value2) => {
  return JSON.stringify(value1) === JSON.stringify(value2)
}

function wrapper1<T extends CommonProp1>(Com, isEqual = defaultEqual) {
  type T1 = Omit<T, 'errs' | 'required'> & CommonProp

  class Component extends React.Component<T1> {
    name: string

    constructor(props) {
      super(props)
      this.name = props.name || 'wrapper_' + uid++
    }

    componentDidMount() {
      this.props.form.setFieldsValue({[this.name]: this.props.value})
    }

    componentDidUpdate() {
      if (!isEqual(this.props.value, this.props.form.getFieldValue(this.name))) {
        this.props.form.setFieldsValue({[this.name]: this.props.value})
      }
    }

    render() {
      const {rules, ...otherProps} = this.props
      let required = false
      let rules1 = []

      if (this.props.rules && this.props.rules.length > 0) {
        rules1 = [...this.props.rules]
        let rule = rules1[0]
        if ('required' in rule && rule.message == null) {
          required = rule.required
          rule.message = `${utils.intl('请输入')}${this.props.label || this.name}`
        }
      }

      return (
        <Form.Item shouldUpdate noStyle>
          {
            () => {
              let errs = this.props.form.getFieldError(this.name) || []
              return (
                <Form.Item noStyle name={this.name} rules={rules1}>
                  <Com required={required} {...otherProps} errs={errs}/>
                </Form.Item>
              )
            }
          }
        </Form.Item>
      )
    }
  }

  return wrapper<T1>(Component)
}

export default wrapper1
