import React from 'react'
import { PhoneInput, Table2 } from 'wanke-gui'
import { Input, Button, Radio, Form } from 'wanke-gui'
import { FormContainer } from '../../components/input-item/InputItem'
import TextItem from '../../components/input-item/TextItem'
import SelectItem from '../../components/input-item/SelectItem'
import { SettingState } from '../../models/setting'
import { ActionProp, UpdateAction, UpdateStateAction } from '../../interfaces/MakeConnectProps'
import { PageTableProps } from '../../interfaces/CommonInterface'
import FullContainer from '../../components/layout/FullContainer'
import RadioGroupItem from '../../components/input-item/RadioGroupItem'
import DetailItem from '../../components/layout/DetailItem'
import Label from '../../components/Label'
import { FormComponentProps } from '../../interfaces/CommonInterface'
import ListItemEditAndDelete from '../../components/layout/ListItemEditAndDelete'
import utils from '../../public/js/utils'
import { checkPhone } from '../../util/ruleUtil'
import PhoneInputItem from '../../components/input-item/PhoneInputItem'

type State = Pick<SettingState, 'query' | 'showUpdateWarning' | 'warningId' | 'account' | 'mobile' | 'period' | 'updateWarningSuccess' | 'warningList' | 'internationalCode'>

const FormItem = Form.Item

interface Props extends State, UpdateAction<SettingState>, ActionProp {
  addWarning: () => void
  updateWarning: () => void
  onDelete: (id: number) => void
  userList: { value: number, name: string, title: string }[]
  totalCount: number
  loading: boolean
  updateWarningLoading: boolean
  fetchWarningList: () => void
}

class TipSettingCompany extends React.Component<Props, State> {
  onPageChange = (page, pageSize) => {
    this.props.updateQuery({page, size: pageSize})
  }

  onAdd = () => {
    this.props.updateState({
      showUpdateWarning: true,
      warningId: null,
      account: null,
      mobile: '',
      internationalCode: '',
      period: 1,
      remind: 1
    })
  }

  onEdit = (record) => {
    let account
    let match = this.props.userList.find(item => item.name == record.userName)
    if (match) {
      account = match.value
    }
    this.props.updateState({
      showUpdateWarning: true,
      warningId: record.id,
      account: account,
      mobile: record.phone,
      internationalCode: record.internationalCode,
      period: record.noticePerPeriod
    })
  }

  componentDidMount(): void {
    this.props.fetchWarningList()
  }

  render() {
    return (
      <FullContainer>
        {
          !this.props.showUpdateWarning && (
            <>
              <div className="search-wrap">
                <Input.Search
                  style={{width: '300px'}} placeholder={utils.intl('请输入关键字查询')}
                  value={this.props.query.queryStr}
                  onChange={e => this.props.updateQuery({queryStr: e.target.value})}
                  onSearch={() => this.props.action('fetchWarningList')}
                />
                <Button type="primary" onClick={this.onAdd}>{utils.intl('新增')}</Button>
              </div>
              <div className="flex1" style={{marginTop: 15}}>
                <ListUser
                  loading={this.props.loading}
                  dataSource={this.props.warningList} onPageChange={this.onPageChange}
                  page={this.props.query.page} total={this.props.totalCount} size={this.props.query.size}
                  onDelete={this.props.onDelete} onEdit={this.onEdit}
                />
              </div>
            </>
          )
        }
        {
          this.props.showUpdateWarning && !this.props.updateWarningSuccess && (
            <UpdateLayout
              loading={this.props.updateWarningLoading}
              userList={this.props.userList}
              onCancel={() => this.props.updateState({showUpdateWarning: false})}
              addWarning={this.props.addWarning}
              updateWarning={this.props.updateWarning}
              warningId={this.props.warningId}
              account={this.props.account}
              mobile={this.props.mobile}
              internationalCode={this.props.internationalCode}
              period={this.props.period}
              updateState={this.props.updateState}
            />
          )
        }
        {
          this.props.showUpdateWarning && this.props.updateWarningSuccess && (
            <UpdateSuccess
              mobile={this.props.mobile}
              internationalCode={this.props.internationalCode}
              account={this.props.account}
              period={this.props.period}
              updateState={this.props.updateState}/>
          )
        }
      </FullContainer>
    )
  }
}

export default TipSettingCompany

/*
*
* */
interface ListProps extends PageTableProps {
  onDelete: (id: number) => void
  onEdit: (record) => void
}

const ListUser: React.FC<ListProps> = function (this: null, props) {
  const onDelete = (record: any, index: number) => {
    props.onDelete(record.id)
  }

  const onEdit = (record: any, index: number) => {
    props.onEdit(record)
  }

  const columns: any = [
    {title: utils.intl('用户姓名'), dataIndex: 'userTitle', width: 120},
    {title: utils.intl('账号'), dataIndex: 'userName', width: 120},
    {
      title: utils.intl('手机号码'),
      dataIndex: 'phone',
      width: 130,
      render: (text, record) => {
        return `${record.internationalCode || ''}${record.phone || ''}`
      }
    },
    {
      title: utils.intl('通知时段'), dataIndex: 'noticePerPeriod', width: 90, render: (value) => {
        if (value == 1) {
          return utils.intl('全天')
        }
        if (value == 2) {
          return utils.intl('白天')
        }
        if (value == 3) {
          return utils.intl('晚上')
        }
        return value
      }
    },
    {
      title: utils.intl('操作'),
      width: 170,
      render: (value, record, index) => {
        return (
          <ListItemEditAndDelete onEdit={() => onEdit(record, index)} onDelete={() => onDelete(record, index)}/>
        )
      }
    }
  ]

  return (
    <Table2
      x={580}
      loading={props.loading}
      dataSource={props.dataSource}
      columns={columns}
      page={props.page}
      size={props.size}
      total={props.total}
      onPageChange={props.onPageChange}
    />
  )
}

/*
*
*/
interface UpdateProps extends FormComponentProps, UpdateStateAction<SettingState> {
  loading: boolean
  userList: { value: number, name: string, title: string }[]
  onCancel: () => void
  addWarning: () => void
  updateWarning: () => void
  warningId: number
  account: number
  mobile: string
  internationalCode: string
  period: 1 | 2 | 3
}

class Update extends React.Component<UpdateProps> {
  onFinishFailed({errorFields}) {
    this.props.form.scrollToField(errorFields[0].name)
  }

  onConfirm = () => {
    this.props.form.validateFields().then(() => {
      if (this.props.warningId) {
        this.props.updateWarning()
      } else {
        this.props.addWarning()
      }
    })
  }

  render() {
    return (
      <div>
        <FormContainer form={this.props.form} onFinishFailed={this.onFinishFailed}>
          <div className="d-flex">
            <SelectItem label={utils.intl('用户账号')} rules={[{required: true}]} dataSource={this.props.userList}
                        disabled={this.props.warningId != null}
                        value={this.props.account}
                        onChange={v => this.props.updateState({account: v})}/>
            
            <PhoneInputItem
              label={utils.intl('手机号码')}
              required
              rules={[checkPhone(() => ({ required: true, maxLength: 16 }))]}
              style={{ width: 250, flexShrink: 0 }}
              value={{ phone: this.props.mobile, code: this.props.internationalCode }}
              onChange={v => this.props.updateState({ mobile: v.phone, internationalCode: v.code })}
            />
          </div>
          <section className="v-center">
            <Label style={{marginLeft: 10, paddingBottom: 0, width: 80}}>{utils.intl('用户姓名')}</Label>
            {this.props.userList.find(item => item.value == this.props.account)?.title}
          </section>
          <section style={{marginTop: 10}}>
            <RadioGroupItem
              label={utils.intl('通知时段')} rules={[{required: true}]}
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
  account: string
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
        <Button type="primary"
                onClick={() => props.updateState({showUpdateWarning: true, updateWarningSuccess: false})}>{utils.intl('修改')}</Button>
      </div>
    </div>
  )
}
