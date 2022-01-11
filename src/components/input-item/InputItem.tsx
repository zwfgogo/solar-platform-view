import React, { CSSProperties } from 'react'
import { Form } from 'wanke-gui'
import classnames from 'classnames'

import { FormProps } from 'antd/lib/form'
import { FormComponentProps, ValidationRule } from '../../interfaces/CommonInterface'
import { FormContext } from 'wanke-gui/es/form1/InputItem'
import { ConfigConsumer } from 'wanke-gui/es/config-provider'

const FormItem = Form.Item

interface Props {
  label: React.ReactNode
  name: string
  rules?: ValidationRule[]
  required?: boolean
  needTip?: string
  initialValue?: string | number
  children?: any
  className?: string
  style?: CSSProperties
  errorStyle?: CSSProperties
  errorClassName?: string
  getValueFromEvent?: (e) => any
  contentStyle?: CSSProperties
}

interface Props1 extends Props, FormComponentProps {
}

export function wrapper<P>(Component) {
  return class W extends React.Component<Omit<P, 'form'>> {
    render() {
      return (
        <FormContext.Consumer>
          {
            (value: any) => (
              <Component {...this.props} form={value} />
            )
          }
        </FormContext.Consumer>
      )
    }
  }
}

function InputItem(props: Props1) {
  const { rules } = props
  const isRequired = !!rules?.find(item => item.required)
  return (
    <div className={classnames('input-item', props.className)} style={props.style}>
      <FormItem style={props.contentStyle} name={props.name} label={props.label ? <div>{isRequired ? <span style={{ color: "#ff4d4f", marginRight: 4, fontFamily: "SimSun, sans-serif", fontSize: 14, display: "inline-block", lineHeight: 1 }}>*</span> : null}{props.label}</div> : props.label} rules={props.rules || []} required={props.required}>
        {props.children}
      </FormItem>
    </div>
  )
}

function InputItemBasicInner(props: Props1) {
  let errs = props.form.getFieldError(props.name) || [] // 自定义错误布局
  return (
    <div className={classnames({ 'has-error': errs.length > 0 }, props.className)}>
      <Form.Item name={props.name} rules={props.rules || []} noStyle>
        {props.children}
      </Form.Item>
      <div className={props.errorClassName} style={props.errorStyle}>
        {errs.map((item, index) => {
          return (
            <span key={index} className=" ant-form-explain">{item}</span>
          )
        })}
      </div>
    </div>
  )
}

export default wrapper<Props>(InputItem)

interface FormContainerProps extends FormProps {
  onSubmit?: React.FormEventHandler<HTMLFormElement>
  className?: string
}

function create<T>() {
  return function (Component) {
    const FormHoc: React.FC<Omit<T, 'form'>> = function (this: null, props) {
      const [form] = Form.useForm()
      return (
        <Component form={form} {...props} />
      )
    }
    return FormHoc
  }
}

class FormContainer extends React.Component<FormContainerProps> {
  static create = create

  render() {
    return (
      <ConfigConsumer>
        {
          (configProps: any) => {
            return (
              <Form
                layout={this.props.layout || configProps.language == 'zh' ? 'horizontal' : 'vertical'}
                form={this.props.form}
                autoComplete="off"
                requiredMark
                onFinish={this.props.onSubmit}
                className={classnames('form-container', this.props.className)}
                onFinishFailed={this.props.onFinishFailed}
                style={this.props.style}
                initialValues={this.props.initialValues}
                {...this.props}
              >
                <FormContext.Provider value={this.props.form}>
                  {this.props.children}
                </FormContext.Provider>
              </Form>
            )
          }
        }
      </ConfigConsumer>
    )
  }
}

let InputItemBasic = wrapper<Props>(InputItemBasicInner)
export {
  FormContainer,
  InputItemBasic
}

export { FormContext }
