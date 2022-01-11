import React, {useRef, useState} from 'react'
import {Form, Modal} from 'wanke-gui'
import {Input} from 'antd'

import utils from '../../../public/js/utils'
import { auth } from '../run-strategy.service'
import './auth-dialog.less'
import { InfoCircleOutlined } from 'wanke-icon'

const FormItem = Form.Item

interface Props {
  header: string
  title: string
  desc: string
  username: string
  visible: boolean
  onCancel: () => void
  onConfirm: (password: string) => void
}

const AuthDialog: React.FC<Props> = function (this: null, props) {
  const [password, setPassword] = useState('')
  const [form] = Form.useForm()

  const handleSubmit = () => {
    form.validateFields().then(() => {
      props.onConfirm(password)
    })
  }
  
  return (
    <Modal
      centered
      width={480}
      title={props.header}
      visible={props.visible}
      onCancel={props.onCancel}
      onOk={handleSubmit}
      okText={utils.intl('验证')}
      className="auth-dialog"
    >
      <div>
        <div className="auth-dialog-title">
          <InfoCircleOutlined className="auth-dialog-icon" />
          <span>{props.title}</span>
        </div>
        <div className="auth-dialog-body">
          <div className="auth-dialog-desc">{props.desc}</div>
          <div style={{marginTop: 10}}>
            <span className="auth-dialog-label">{utils.intl('登陆账号')}:</span>
            <span className="auth-dialog-value">{props.username}</span>
          </div>
          <Form form={form} style={{marginTop: 10}}>
            <FormItem name="password" rules={[{ required: true, message: utils.intl('login.请输入密码') }]}>
              <Input
                placeholder={utils.intl('请在此输入密码')}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </FormItem>
          </Form>
        </div>
      </div>
    </Modal>
  )
}

export default AuthDialog

interface useAuthDialogProps {
  username: string
}

export function useAuthDialog({ username }: useAuthDialogProps) {
  const passwordRef = useRef('')

  const authRequest = async (callback: Function) => {
    await auth({ username, password: passwordRef.current })
    callback()
  }

  const authConfirm = (callback: Function) => {
    Modal.confirm({
      centered: true,
      width: 400,
      title: utils.intl('安全验证'),
      onCancel: () => passwordRef.current = '',
      onOk: () => authRequest(callback),
      okText: utils.intl('验证'),
      className: "auth-dialog",
      content: (
        <AuthDialogForm
          username={username}
          password={passwordRef.current}
          onPasswordChange={val => passwordRef.current = val}
        />
      )
    })
  }

  return {
    authConfirm,
  }
}

interface AuthDialogFormProps {
  username: string
  password: string
  onPasswordChange: (password: string) => void
}

const AuthDialogForm: React.FC<AuthDialogFormProps> = ({ username, password: originPassword, onPasswordChange }) => {
  const [password, setPassword] = useState(originPassword)

  const handlePasswordChange = (e) => {
    const val = e.target.value
    setPassword(val)
    onPasswordChange(val)
  }

  return (
    <div style={{padding: 15}}>
      <h3 className="common-label">{utils.intl('本操作需要验证密码，请输入')}</h3>
      <div style={{marginTop: 10}}>
        <Input value={username} disabled/>
      </div>
      <div style={{marginTop: 10}}>
        <Input placeholder={utils.intl('请在此输入密码')}
              type="password"
              value={password}
              onChange={handlePasswordChange}
        />
      </div>
    </div>
  )
}
