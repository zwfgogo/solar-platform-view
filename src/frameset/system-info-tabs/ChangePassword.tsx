import React from 'react'
import { FormContainer } from '../../components/input-item/InputItem'

import TextItem, { Props as TextItemProps } from '../../components/input-item/TextItem'
import { noSpaceRule } from '../../util/ruleUtil'
import { Button } from 'wanke-gui'
import Center from '../../public/components/Center'
import { UpdateStateAction } from '../../interfaces/MakeConnectProps'
import { SettingState } from '../../models/setting'
import { FormComponentProps } from '../../interfaces/CommonInterface'
import { LockOutlined } from 'wanke-icon'
import utils from '../../public/js/utils'

interface Props extends FormComponentProps, UpdateStateAction<SettingState> {
  oldPassword: string
  newPassword: string
  newPassword1: string
  changePassword: (oldPassword, newPassword1) => void
  isMustRestPage?: boolean;
}

class ChangePassword extends React.Component<Props> {
  checkPasswordEqual = (rule, value, callback) => {
    if (value.length < 6 || value.length > 20) {
      callback()
      return
    }
    if (this.props.newPassword != value) {
      callback(utils.intl('2次新密码不一致'))
      return
    }
    callback()
  }

  onConfirm = () => {
    this.props.form.validateFields().then((values) => {
      this.props.changePassword(this.props.oldPassword, this.props.newPassword1)
    })
  }

  lengthCheck = (msg) => {
    return {
      validator: (rule, value: any, callback) => {
        if (!value) {
          return callback()
        }
        if (value.length < 6 || value.length > 20) {
          return callback(msg)
        }
        if (!/[a-z|A-Z]+/.test(value)) {
          return callback(msg)
        }
        if (!/\d+/.test(value)) {
          return callback(msg)
        }
        callback()
      }
    }
  }

  notEqual = () => {
    return {
      validator: (rule, value: string, callback) => {
        if (!value) {
          return callback()
        }
        if (value == this.props.oldPassword) {
          return callback(utils.intl('新密码与原密码不能相同'))
        }
        callback()
      }
    }
  }

  render() {
    const { isMustRestPage } = this.props;
    const textItemProps: Pick<TextItemProps, 'size' | 'addonBefore'> = isMustRestPage ? {
      addonBefore: <LockOutlined style={{ fontSize: 17, color: '#b3babf' }} />,
      size: 'large'
    } : {};

    return (
      <div className="change-password-tab">
        <FormContainer form={this.props.form} style={isMustRestPage ? {padding: '20px 0'} : {padding: '20px 40px'}}>
          <TextItem
            {...textItemProps}
            placeholder={utils.intl('请输入6-20位原密码')}
            type="password" label={isMustRestPage ? utils.intl('默认密码') : utils.intl('原密码')}
            rules={[{required: true, message: utils.intl('请输入6-20位密码')}, this.lengthCheck(utils.intl('密码必须由6-20位个字母和数字组成')), noSpaceRule()]}
            value={this.props.oldPassword} onChange={v => this.props.updateState({oldPassword: v})}/>

          <TextItem
            {...textItemProps}
            placeholder={utils.intl('新密码必须由6-20位字母和数字组成')}
            type="password" label={utils.intl('新密码')} rules={[{required: true, message: utils.intl('请输入6-20位密码')}, this.lengthCheck(utils.intl('新密码必须由6-20位字母和数字组成')), noSpaceRule(), this.notEqual()]}
            value={this.props.newPassword} onChange={v => this.props.updateState({newPassword: v})}/>

          <TextItem
            {...textItemProps}
            placeholder={utils.intl('新密码必须由6-20位字母和数字组成')}
            type="password" label={utils.intl('确认新密码')}
            rules={[{required: true, message: utils.intl('请输入6-20位密码')}, this.lengthCheck(utils.intl('新密码必须由6-20位字母和数字组成')), noSpaceRule(), {validator: this.checkPasswordEqual}]}
            value={this.props.newPassword1} onChange={v => this.props.updateState({newPassword1: v})}/>
        </FormContainer>
        {
          isMustRestPage ? (
            <div>
              <Button type="primary" onClick={this.onConfirm}>{utils.intl('确认修改')}</Button>
            </div>
          ) : (
            <Center>
              <Button type="primary" onClick={this.onConfirm}>{utils.intl('确定')}</Button>
            </Center>
          )
        }
      </div>
    )
  }
}

export default FormContainer.create<Props>()(ChangePassword)
