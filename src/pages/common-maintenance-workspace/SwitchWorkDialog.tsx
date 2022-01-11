import React from 'react'
import BasicDialog, { DialogBasicProps } from "../../components/BasicDialog"
import { ActionProp, UpdateStateAction } from "../../interfaces/MakeConnectProps"
import { WorkSpaceListState } from './models/workspace-list'
import { FormComponentProps } from "../../interfaces/CommonInterface"
import { FormContainer } from "../../components/input-item/InputItem"
import TextItem from "../../components/input-item/TextItem"
import TextAreaItem from "../../components/input-item/TextAreaItem"
import DateItem from "../../components/input-item/DateItem"
import { copy } from "../../util/utils"
import SelectItem from "../../components/input-item/SelectItem"
import TimeItem from "../../components/input-item/TimeItem"
import DetailItem from "../../components/layout/DetailItem"
import { FullLoading } from "wanke-gui"
import moment from 'moment'
import { maxLengthRule } from "../../util/ruleUtil"
import utils from "../../public/js/utils";

type ModelKey =
  'userList' |
  'systemAlarmSituation'
  | 'systemAlarmProcess'
  | 'systemControll'
  | 'taskCompletion'
  | 'date'
  | 'time'
  | 'runningModel'
  | 'runningStatus'
  | 'shiftDate'
  | 'shiftTime'
  | 'shiftId'
  | 'number'

/**
 *
 */
interface Props extends DialogBasicProps, FormComponentProps, UpdateStateAction<WorkSpaceListState>, Pick<WorkSpaceListState, ModelKey>, ActionProp {
  dutyTitle: string
  shiftTitle?: string
  loading?: boolean;
  type?: string;
}

class SwitchWorkDialog extends BasicDialog<Props> {
  getFooter() {
    return this.props.loading ? null : super.getFooter()
  }

  getTitle(): string {
    return utils.intl('交接班')
  }

  getWidth(): number {
    return 800
  }

  onRunningModelChange = (index, v) => {
    let runningModel = copy(this.props.runningModel)
    runningModel[index].detail = v
    this.props.updateState({ runningModel })
  }

  onStatusChange = (index, v) => {
    let runningStatus = copy(this.props.runningStatus)
    runningStatus[index].detail = v
    this.props.updateState({ runningStatus })
  }

  onOk() {
    this.props.form.validateFields().then(() => {
      if (this.props.type === 'edit') {
        this.props.action('editSwitchWork')
      } else {
        this.props.action('addSwitchWork')
      }
    })
  }

  onFinishFailed({ errorFields }) {
    this.props.form.scrollToField(errorFields[0].name)
  }

  renderBody() {
    const {
      userList,
      number, date, time, dutyTitle, runningModel, runningStatus, shiftDate, shiftTime, shiftId,
      systemAlarmSituation, systemAlarmProcess, systemControll, taskCompletion, type, shiftTitle
    } = this.props
    const isEdit = type === 'edit'
    const { updateState } = this.props
    return (
      <div className="switch-work-dialog" style={{ maxHeight: document.body.clientHeight - 300, overflow: 'auto', position: 'relative' }}>
        {
          this.props.loading && (<FullLoading />)
        }
        <FormContainer form={this.props.form} onFinishFailed={this.onFinishFailed}>
          <div>
            <div>
              <DetailItem label={utils.intl("值班人")} txt={dutyTitle} />
            </div>
            <div className="d-flex">
              <DateItem disabled={isEdit} label={utils.intl("值班日期")} value={date} onChange={v => updateState({ date: v })} />
              <TimeItem disabled={isEdit} format="HH:mm" label={utils.intl("值班时间")} value={moment(time, 'HH:mm:ss')} onChange={v => updateState({ time: v })} />
            </div>
          </div>

          <div className="d-flex" style={{ flexWrap: 'wrap', width: 207 }}>
            <DetailItem label={utils.intl("接班人")} txt={shiftTitle} />
            {/* <SelectItem
              disabled
              rules={[{required: true}]}
              dataSource={userList.map(item => ({...item, name: item.title}))}
              label={utils.intl("接班人")} value={shiftId} onChange={v => updateState({shiftId: v})}/> */}
          </div>

          <div className="d-flex" style={{ flexWrap: 'wrap' }}>
            <DateItem disabled label={utils.intl("交班日期")} value={shiftDate} onChange={v => updateState({ shiftDate: v })} />
            <TimeItem disabled format="HH:mm" label={utils.intl("交班时间")} value={shiftTime} onChange={v => updateState({ shiftTime: v })} />
          </div>
          <div className="d-flex" style={{ flexWrap: 'wrap' }}>
            <TextItem label={utils.intl("编号")} value={number} onChange={v => updateState({ number: v })} />
          </div>

          <div className="d-flex" style={{ flexWrap: 'wrap' }}>
            <div style={{ width: '100%' }}>
              <div>{utils.intl("电站运行方式")}</div>
              <div className="d-flex" style={{ overflow: 'auto', flexWrap: 'wrap' }}>
                {runningModel.map((item, index) => {
                  return (
                    <TextItem
                      key={index} label={item.stationTitle}
                      placeholder={utils.intl("请输入")}
                      value={item.detail} onChange={v => this.onRunningModelChange(index, v)} />
                  )
                })}
              </div>
            </div>

            <div style={{ width: '100%' }}>
              <div>{utils.intl("电站状态")}</div>
              <div className="d-flex" style={{ overflow: 'auto', flexWrap: 'wrap' }}>
                {runningStatus.map((item, index) => {
                  return (
                    <TextItem
                      key={index} label={item.stationTitle}
                      placeholder={utils.intl("请输入")}
                      value={item.detail} onChange={v => this.onStatusChange(index, v)} />
                  )
                })}
              </div>
            </div>

            <TextAreaItem className="w100" label={utils.intl("系统操作情况")} rules={[{ required: true }, maxLengthRule(128)]} placeholder={utils.intl("请输入不超过128字符描述")}
              value={systemAlarmSituation} onChange={v => updateState({ systemAlarmSituation: v })}
              rows={3} />

            <TextAreaItem className="w100" label={utils.intl("系统异常警告")} rules={[{ required: true }, maxLengthRule(128)]} placeholder={utils.intl("请输入不超过128字符描述")}
              value={systemAlarmProcess} onChange={v => updateState({ systemAlarmProcess: v })}
              rows={3} />

            <TextAreaItem className="w100" label={utils.intl("异常警告处理")} rules={[{ required: true }, maxLengthRule(128)]} placeholder={utils.intl("请输入不超过128字符描述")}
              value={systemControll} onChange={v => updateState({ systemControll: v })}
              rows={3} />

            <TextAreaItem className="w100" label={utils.intl("领导交代事项")} rules={[{ required: true }, maxLengthRule(128)]} placeholder={utils.intl("请输入不超过128字符描述")}
              value={taskCompletion} onChange={v => updateState({ taskCompletion: v })}
              rows={3} />
          </div>
        </FormContainer>
      </div>
    )
  }
}

export default FormContainer.create<Props>()(SwitchWorkDialog)
