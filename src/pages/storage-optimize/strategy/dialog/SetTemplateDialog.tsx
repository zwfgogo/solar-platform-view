import React from 'react'

import BasicDialog, {DialogBasicProps} from '../../../../components/BasicDialog'

import {FormContainer} from '../../../../components/input-item/InputItem'
import {FormComponentProps} from '../../../../interfaces/CommonInterface'
import TextItem from '../../../../components/input-item/TextItem'
import TextAreaItem from '../../../../components/input-item/TextAreaItem'
import {OptimizeRunningUpdateModel} from '../../models/update'
import {ActionProp, UpdateAction} from '../../../../interfaces/MakeConnectProps'
import {maxLengthRule} from '../../../../util/ruleUtil'


import utils from '../../../../public/js/utils'


type ModelKey = 'addTemplateName' | 'addTemplateDesc'

/**
 * 修改密码
 */
interface Props extends ActionProp, UpdateAction<OptimizeRunningUpdateModel>, DialogBasicProps, FormComponentProps, Pick<OptimizeRunningUpdateModel, ModelKey> {
  stationId: number
}

class SetTemplateDialog extends BasicDialog<Props> {
  getTitle(): string {
    return utils.intl('设为模板')
  }

  getWidth(): number {
    return 700
  }

  onFinishFailed({errorFields}) {
    this.props.form.scrollToField(errorFields[0].name)
  }

  onOk() {
    this.props.form.validateFields().then(() => {
      this.props.action('addTemplate', {stationId: this.props.stationId})
    })
  }

  renderBody() {
    return (
      <div>
        <FormContainer form={this.props.form} onFinishFailed={this.onFinishFailed}>
          <TextItem label={utils.intl('模板名称')} rules={[{required: true}, maxLengthRule(32)]}
                    value={this.props.addTemplateName} onChange={v => this.props.updateState({addTemplateName: v})}/>
          <TextAreaItem
            style={{width: '100%'}} rows={4} rules={[maxLengthRule(32)]}
            label={utils.intl('说明')} placeholder={utils.intl('请输入策略模板说明')}
            value={this.props.addTemplateDesc} onChange={v => this.props.updateState({addTemplateDesc: v})}/>
        </FormContainer>
      </div>
    )
  }
}

export default FormContainer.create<Props>()(SetTemplateDialog)
