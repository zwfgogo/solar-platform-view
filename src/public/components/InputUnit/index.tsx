import React from 'react'
import { Form } from 'wanke-gui'
import classnames from 'classnames'
import { FormComponentProps } from '../../../interfaces/CommonInterface'
import {FormContext} from '../../../components/input-item/InputItem'

const FormItem = Form.Item

interface Props extends FormComponentProps {
  label: string
  name: string
  rules?: { required: boolean, message: string, pattern?: RegExp }[]
  required?: boolean
  needTip?: string
  initialValue?: string | number
  dependencies: string[]
  children?: any
  className?: string
  getValueFromEvent?: (e) => any
  noErrorMessage?: boolean;
}

export function wrapper(Component) {
  return class W extends React.Component<any> {
    render() {
      return (
        <FormContext.Consumer>
          {
            (value: any) => (
              <Component {...this.props} form={value}/>
            )
          }
        </FormContext.Consumer>
      )
    }
  }
}

function InputUnit(props: Props) {
  return (
    <div className={classnames('input-unit', props.className)}>
      <div>
        <FormItem name={props.name}
                  label={props.label + ''}
                  rules={props.rules || []}
                  validateFirst={true}
                  dependencies={props.dependencies}
                  getValueFromEvent={props.getValueFromEvent}>
          {props.children}
        </FormItem>
      </div>
    </div>
  )
}

function InputUnitBasicInner(props: Props) {
  let errs = props.form.getFieldError(props.name) || [] // 自定义错误布局
  return (
    <div className={classnames({'has-error': errs.length > 0}, props.className)}>
      {props.children}
      {props.noErrorMessage ? '' : (
        <div style={{minHeight: 22}}>
          {errs.map((item, index) => {
            return (
              <span key={index} className=" ant-form-explain">{item}</span>
            )
          })}
        </div>)
      }
    </div>
  )
}

class InputUnitLayout extends React.Component<{ label: string, className?: string, required?: boolean }> {
  render() {
    return (
      <div className={classnames('input-unit', this.props.className)}>
        <div className={classnames('input-label-layout', {'ant-form-item-required': this.props.required})}>
          {this.props.label}
        </div>
        <div className="input-container">
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default wrapper(InputUnit)

let InputUnitBasic = wrapper(InputUnitBasicInner)
export {
  InputUnitBasic,
  InputUnitLayout
}

export { FormContext }
