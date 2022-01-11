import React from 'react'
import { Button, Radio, Form, PhoneInput } from 'wanke-gui'
import { FormContainer } from '../../components/input-item/InputItem'
import TextItem from '../../components/input-item/TextItem'
import SelectItem from '../../components/input-item/SelectItem'
import { FormComponentProps } from '../../interfaces/CommonInterface'
import { ValueName } from '../../interfaces/CommonInterface'
import { SettingState } from '../../models/setting'
import { UpdateAction, UpdateStateAction } from '../../interfaces/MakeConnectProps'
import DetailItem from '../../components/layout/DetailItem'
import RadioGroupItem from '../../components/input-item/RadioGroupItem'

import { WankeInfoOutlined } from 'wanke-icon'
import utils from '../../public/js/utils'
import { checkPhone } from '../../util/ruleUtil'
import PhoneInputItem from '../../components/input-item/PhoneInputItem'

const FormItem = Form.Item

type State = Pick<SettingState,
  'query' | 'showUpdateWarning' | 'warningId' | 'remind' | 'mobile' | 'period' | 'createdByAdmin' | 'updateWarningSuccess' | 'internationalCode'>

interface Props extends State, UpdateAction<SettingState> {
  loading: boolean
  fetchSelfWarning: () => void
  addWarning: () => void
  updateWarning: () => void
  onDelete: (id: number) => void
  userList: ValueName[]
}

class TipSettingSelf extends React.Component<Props, State> {
  onPageChange = (page, pageSize) => {
    this.props.updateQuery({page, pageSize})
  }

  onEdit = () => {
    this.props.updateState({
      showUpdateWarning: true
    })
    if (!this.props.warningId) {
      this.props.updateState({
        mobile: '',
        internationalCode: '',
        period: 1
      })
    }
  }

  componentDidMount() {
    this.props.fetchSelfWarning()
  }

  render() {
    const language = localStorage.getItem('language')
    let periodText = ''
    if (this.props.period == 1) {
      periodText = '00:00:00-24:00:00'
    }
    if (this.props.period == 2) {
      periodText = '08:00:00-20:00:00'
    }
    if (this.props.period == 3) {
      periodText = '20:00:00-08:00:00'
    }

    return (
      <div className="tip-setting-tab">
        {
          !this.props.showUpdateWarning && (
            <div>
              <section style={{marginTop: 30}}>
                <div className="h-center" style={{color: '#999999'}}>
                  {utils.intl('以下是您的告警设置信息')}。
                </div>
              </section>
              {
                !this.props.warningId && (
                  <section style={{marginTop: 30, color: '#ff8328'}}>
                    <div className="h-center">
                      <WankeInfoOutlined style={{fontSize: 30}}/>
                    </div>
                    <div className="h-center" style={{marginTop: 20}}>
                      {utils.intl('您暂未添加任何提醒服务信息')}
                    </div>
                  </section>
                )
              }
              {
                this.props.warningId && (
                  <section>
                    <div className="h-center" style={{marginTop: 15}}>
                      <DetailItem
                        style={{width: 250, minHeight: 'auto'}}
                        labelStyle={{ width: language === 'en' ? 130 : 80 }}
                        label={utils.intl('手机号码')}
                        txt={`${this.props.internationalCode || ''}${this.props.mobile || ''}`}
                      />
                    </div>
                    <div className="h-center" style={{marginTop: 15}}>
                      <DetailItem
                        style={{width: 250, minHeight: 'auto'}}
                        labelStyle={{ width: language === 'en' ? 130 : 80 }}
                        label={utils.intl('通知时段')}
                        txt={periodText}
                      />
                    </div>
                  </section>
                )
              }
              <section style={{marginTop: 30}}>
                <div className="h-center">
                  <Button type="primary" onClick={this.onEdit}>
                    {
                      this.props.warningId ? utils.intl('修改') : utils.intl('新增')
                    }
                  </Button>
                </div>
              </section>
            </div>
          )
        }
        {
          this.props.showUpdateWarning && !this.props.updateWarningSuccess && (
            <UpdateLayout
              loading={this.props.loading}
              userList={this.props.userList}
              onCancel={() => this.props.updateState({showUpdateWarning: false})}
              updateWarning={this.props.warningId ? this.props.updateWarning : this.props.addWarning}
              remind={this.props.remind}
              mobile={this.props.mobile}
              internationalCode={this.props.internationalCode}
              period={this.props.period}
              createdByAdmin={this.props.createdByAdmin}
              updateState={this.props.updateState}
            />
          )
        }
        {
          this.props.showUpdateWarning && this.props.updateWarningSuccess && (
            <UpdateSuccess
              mobile={this.props.mobile}
              internationalCode={this.props.internationalCode}
              remind={this.props.remind}
              period={this.props.period}
              updateState={this.props.updateState}/>
          )
        }
      </div>
    )
  }
}

export default TipSettingSelf

/*
*
*/
interface UpdateProps extends FormComponentProps, UpdateStateAction<SettingState> {
  loading: boolean
  userList: ValueName[]
  onCancel: () => void
  updateWarning: () => void

  remind: number
  mobile: string
  internationalCode: string
  period: 1 | 2 | 3
  createdByAdmin: boolean
}

class Update extends React.Component<UpdateProps> {
  onFinishFailed({errorFields}) {
    this.props.form.scrollToField(errorFields[0].name)
  }

  onConfirm = () => {
    this.props.form.validateFields().then(() => {
      this.props.updateWarning()
    })
  }

  render() {
    const {remind} = this.props
    return (
      <div>
        <FormContainer form={this.props.form} onFinishFailed={this.onFinishFailed}>
          <div className="d-flex">
            <SelectItem label={utils.intl('提醒服务')} rules={[{required: true}]} disabled={this.props.createdByAdmin}
                        dataSource={[{value: 1, name: utils.intl('需要')}, {value: 2, name: utils.intl('不需要')}]} value={this.props.remind}
                        onChange={v => this.props.updateState({remind: v})}/>
            
            <PhoneInputItem
              label={utils.intl('手机号码')}
              required
              rules={[checkPhone(() => ({ required: true, maxLength: 16 }))]}
              style={{ width: 250, flexShrink: 0 }}
              value={{ phone: this.props.mobile, code: this.props.internationalCode }}
              onChange={v => this.props.updateState({ mobile: v.phone, internationalCode: v.code })}
            />
          </div>
          <section style={{marginTop: 10}}>
            <RadioGroupItem
              label={utils.intl('通知时段')} rules={[{required: remind == 1}]}
              value={this.props.period} onChange={(v: 1 | 2 | 3) => this.props.updateState({period: v})}
              errorStyle={{marginTop: 5}}
            >
              <Radio value={1}>{utils.intl('全天')}</Radio>
              <Radio value={2}>{utils.intl('白天')}(08:00 ~ 20:00)</Radio>
              <Radio value={3}>{utils.intl('晚上')}(20:00 ~ {utils.intl('次日')}08:00)</Radio>
            </RadioGroupItem>
          </section>
          <section style={{marginTop: 70}} className="h-center">
            <div className="h-space" style={{width: 180}}>
              <Button onClick={this.props.onCancel}>{utils.intl('取消')}</Button>
              <Button type="primary" onClick={this.onConfirm} loading={this.props.loading}>{utils.intl('保存')}</Button>
            </div>
          </section>
        </FormContainer>
      </div>
    )
  }
}

const UpdateLayout = FormContainer.create<UpdateProps>()(Update)

interface SuccessProps extends UpdateStateAction<SettingState> {
  remind: number
  mobile: string
  internationalCode: string
  period: 1 | 2 | 3
}

function UpdateSuccess(props: SuccessProps) {
  let periodText = ''
  if (props.period == 1) {
    periodText = '00:00:00-24:00:00'
  }
  if (props.period == 2) {
    periodText = '08:00:00-20:00:00'
  }
  if (props.period == 3) {
    periodText = '20:00:00-08:00:00'
  }
  return (
    <div>
      <section>
        <div className="h-center" style={{color: '#999999'}}>
          {utils.intl('系统“严重”告警会短信通知，以下是您的设置信息。')}
        </div>
        <div className="h-center" style={{marginTop: 15}}>
          <DetailItem
            style={{width: 250, minHeight: 'auto'}}
            label={utils.intl('手机号码')}
            txt={`${props.internationalCode || ''}${props.mobile || ''}`}
          />
        </div>
        <div className="h-center" style={{marginTop: 15}}>
          <DetailItem style={{width: 250, minHeight: 'auto'}} label={utils.intl('通知时段')} txt={periodText}/>
        </div>
      </section>
      <div className="h-center" style={{marginTop: 35}}>
        <Button type="primary" onClick={() => props.updateState({showUpdateWarning: true, updateWarningSuccess: false})}>{utils.intl('修改')}</Button>
      </div>
    </div>
  )
}
