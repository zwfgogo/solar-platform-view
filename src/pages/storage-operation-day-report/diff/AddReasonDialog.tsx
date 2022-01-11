import React from 'react'

import BasicDialog, { DialogBasicProps } from "../../../components/BasicDialog"
import { FormContainer } from "../../../components/input-item/InputItem"
import DateItem from "../../../components/input-item/DateItem"
import TextItem from "../../../components/input-item/TextItem"
import SelectItem from "../../../components/input-item/SelectItem"
import TextAreaItem from "../../../components/input-item/TextAreaItem"
import { FormComponentProps } from "../../../interfaces/CommonInterface"
import { ActionProp, UpdateStateAction } from "../../../interfaces/MakeConnectProps"
import { DiffState } from '../models/diff'
import { maxLengthRule } from "../../../util/ruleUtil"
import { Moment } from 'moment'
import classNames from 'classnames'
import utils from '../../../public/js/utils'

type ModelKey = 'reasonId' | 'dtime' | 'dutyDept' | 'dutyUserTitle' | 'causeTitle'
  | 'planCompleteTime' | 'detail' | 'solution' | 'query'

/**
 *
 */
interface Props extends DialogBasicProps, FormComponentProps, UpdateStateAction<DiffState>, Pick<DiffState, ModelKey>, ActionProp {
  stationId: number
  reasonConfigList: any[]
  defaultDate: string
}

class AddReasonDialog extends BasicDialog<Props> {
  getTitle(): string {
    return this.props.reasonId ? utils.intl('修改记录') : utils.intl('新增记录')
  }

  getWidth(): number {
    return 700
  }

  checkDate = (rule: any, value: Moment, callback) => {
    if (!this.props.dtime || !value) {
      return callback()
    }
    if (this.props.dtime.isAfter(value)) {
      return callback(utils.intl('计划完成时间不能小于选择时间'))
    }
    return callback()
  }

  handleDisabledDate = (date: Moment) => {
    if (date.isBefore(this.props.query.startDate) || date.isAfter(this.props.query.endDate)) {
      return true
    }
    return false
  }

  handleCompleteDisabledDate = (date: Moment) => {
    if (!this.props.dtime) {
      if (date.isBefore(this.props.query.startDate)) {
        return true
      }
      return false
    }
    if (date.isBefore(this.props.dtime)) {
      return true
    }
    return false
  }

  onOk() {
    this.props.form.validateFields().then(() => {
      if (this.props.reasonId) {
        this.props.action('updateReason', {stationId: this.props.stationId})
      } else {
        this.props.action('addReason', {stationId: this.props.stationId})
      }
    })
  }

  onFinishFailed({errorFields}) {
    this.props.form.scrollToField(errorFields[0].name)
  }

  componentDidMount() {
    this.props.action('fetchReasonConfigList')
  }

  renderBody() {
    const {dtime, dutyDept, dutyUserTitle, causeTitle, planCompleteTime, detail, solution} = this.props
    const {updateState} = this.props
    const language = localStorage.getItem("language")
    return (
      <div style={{ paddingLeft: 9 }}>
        <FormContainer form={this.props.form} onFinishFailed={this.onFinishFailed}>
          <div className={classNames("d-flex", `new-style-form-${language}`)} style={{flexWrap: 'wrap'}}>
            <DateItem label={utils.intl('选择日期')
            } rules={[{required: true}]}
            style={{ width: language === 'zh' ? 205 : 280 }}
                      value={dtime} onChange={v => updateState({dtime: v})}
                      disabledDate={this.handleDisabledDate}
            />
            <TextItem label={utils.intl('责任部门')} rules={[maxLengthRule(8)]}
                      value={dutyDept} onChange={v => updateState({dutyDept: v})}
            />
            <TextItem label={utils.intl('责任人')} rules={[maxLengthRule(8)]}
                      value={dutyUserTitle} onChange={v => updateState({dutyUserTitle: v})}
            />
            <SelectItem label={utils.intl('原因标题')} dataSource={this.props.reasonConfigList.map(item => ({value: item.title, name: item.title}))}
                        value={causeTitle} onChange={v => updateState({causeTitle: v})}
            />
            <DateItem style={{ width: language === 'zh' ? 205 : 280 }} label={utils.intl('计划完成时间')} rules={[{required: true}, {validator: this.checkDate}]}
                      value={planCompleteTime} onChange={v => updateState({planCompleteTime: v})}
                      disabledDate={this.handleCompleteDisabledDate}
            />
            <TextAreaItem label={utils.intl('原因详情')} className="w100" rules={[maxLengthRule(64)]}
                          value={detail} onChange={v => updateState({detail: v})}
                          rows={3}/>
            <TextAreaItem label={utils.intl('解决方案')} className="w100" rules={[maxLengthRule(64)]}
                          value={solution} onChange={v => updateState({solution: v})}
                          rows={3}/>
          </div>
        </FormContainer>
      </div>
    )
  }
}

export default FormContainer.create<Props>()(AddReasonDialog)
