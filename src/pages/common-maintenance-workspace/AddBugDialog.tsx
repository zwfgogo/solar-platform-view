import React from 'react'
import BasicDialog, { DialogBasicProps } from "../../components/BasicDialog"
import { FormComponentProps } from "../../interfaces/CommonInterface"
import { FormContainer } from "../../components/input-item/InputItem"
import DateItem from "../../components/input-item/DateItem"
import TextItem from "../../components/input-item/TextItem"
import TextAreaItem from "../../components/input-item/TextAreaItem"
import SelectItem from "../../components/input-item/SelectItem"
import { disabledDateAfterToday } from "../../util/dateUtil"
import { Moment } from 'moment'
import { ValueName } from "../../interfaces/CommonInterface"
import { inputLengthRule } from "../../util/ruleUtil"
import utils from "../../public/js/utils";

/**
 * 新增缺陷
 */
interface Props extends DialogBasicProps, FormComponentProps {
  updateState: (state) => void
  bugStationId: number
  discoverer: string
  bugDate: Moment
  bugContent: string
  stationOptions: ValueName[]
  addBug: () => void
}

class AddBugDialog extends BasicDialog<Props> {
  getTitle(): string {
    return utils.intl('新增缺陷')
  }

  getWidth(): number {
    return 700
  }

  onFinishFailed({ errorFields }) {
    this.props.form.scrollToField(errorFields[0].name)
  }

  onOk() {
    this.props.form.validateFields().then(() => {
      this.props.addBug()
    })
  }

  renderBody() {
    const { stationOptions, bugStationId, bugDate, discoverer, bugContent } = this.props
    const { updateState } = this.props
    return (
      <div>
        <FormContainer form={this.props.form} onFinishFailed={this.onFinishFailed}>
          <div className="d-flex" style={{ flexWrap: 'wrap' }}>
            <SelectItem
              label={utils.intl('电站名称')} dataSource={stationOptions} rules={[{ required: true }]}
              value={bugStationId} onChange={v => updateState({ bugStationId: v })}
            />
            <DateItem label={utils.intl('缺陷发现日期')} rules={[{ required: true }]} disabledDate={disabledDateAfterToday}
              value={bugDate} onChange={v => updateState({ bugDate: v })}
            />
            <TextItem label={utils.intl('发现人')} rules={[{ required: true }, inputLengthRule(16)]} disabled
              value={discoverer} onChange={v => updateState({ discoverer: v })} placeholder={utils.intl('请输入发现人')}
            />
            <TextAreaItem
              className="w100" label={utils.intl('缺陷内容')} rules={[{ required: true }, inputLengthRule(500)]} placeholder={utils.intl("请输入不超过500字符描述")} rows={3}
              value={bugContent} onChange={v => updateState({ bugContent: v })}
            />
          </div>
        </FormContainer>
      </div>
    )
  }
}

export default FormContainer.create<Props>()(AddBugDialog)
