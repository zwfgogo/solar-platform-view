import React from 'react'
import { FormContainer } from '../../components/input-item/InputItem'

import CurrencyPicker from '../../components/currency-picker/CurrencyPicker'
import TimeZonePicker from '../../components/time-zone-picker/TimeZonePicker'
import { Button } from 'wanke-gui'
import Center from '../../public/components/Center'
import { UpdateStateAction } from '../../interfaces/MakeConnectProps'
import { SettingState } from '../../models/setting'
import { FormComponentProps } from '../../interfaces/CommonInterface'
import utils from '../../public/js/utils'

interface Props extends FormComponentProps, UpdateStateAction<SettingState> {
  currency: string
  timeZone: string
  changeUserSetting: (currency, timeZone) => void
}

class ChangeUserSetting extends React.Component<Props> {

  onConfirm = () => {
    this.props.form.validateFields().then((values) => {
      this.props.changeUserSetting(this.props.currency, this.props.timeZone);
    })
  }

  render() {
    console.log(this.props.currency)
    return (
      <div className="change-password-tab">
        <FormContainer form={this.props.form} style={{ padding: '20px 40px' }}>
          <CurrencyPicker
            name={'currency'}
            rules={[{ required: true }]}
            value={this.props.currency}
            label={utils.intl('结算货币')}
            required={true}
            onChange={v => this.props.updateState({ currency: v })}
          />
          <TimeZonePicker
            name={'timeZone'}
            rules={[{ required: true }]}
            label={utils.intl('时区')}
            required={true}
            value={this.props.timeZone}
            onChange={v => this.props.updateState({ timeZone: v })}
          />
        </FormContainer>
        <Center>
          <Button type="primary" onClick={this.onConfirm}>{utils.intl('确定')}</Button>
        </Center>
      </div>
    )
  }
}

export default FormContainer.create<Props>()(ChangeUserSetting)
