import React from 'react'

import BasicDialog, { DialogBasicProps } from "../../components/BasicDialog"
import { FormContainer } from "../../components/input-item/InputItem"
import DateItem from "../../components/input-item/DateItem"
import SelectItem from "../../components/input-item/SelectItem"
import { FormComponentProps } from "../../interfaces/CommonInterface"
import NumberItem from "../../components/input-item/NumberItem"
import { IndicatorConfigState } from './models/indicator-config-list'
import { ActionProp, UpdateStateAction } from "../../interfaces/MakeConnectProps"
import { numberRangeRule, numberRule } from "../../util/ruleUtil"
import TextItem from "../../components/input-item/TextItem"
import utils from '../../public/js/utils'

type ModelKey =
  'configId'
  | 'stationId'
  | 'stationList'
  | 'stationScale'
  | 'scaleDisplay'
  | 'scaleUnit'
  | 'dailyChargeTarget'
  | 'dailyDischargeTarget'
  | 'dailyProfitTarget'
  | 'profitDeviationThreshold'
  | 'effectTime'

/**
 * 新增指标
 */
interface Props extends DialogBasicProps, FormComponentProps, Pick<IndicatorConfigState, ModelKey>, ActionProp, UpdateStateAction<IndicatorConfigState> {
  addConfig: () => void
  updateConfig: () => void
}

class AddIndicatorDialog extends BasicDialog<Props> {
  getTitle(): string {
    return this.props.configId ? utils.intl('编辑指标') : utils.intl('新增指标')
  }

  getWidth(): number {
    return 480
  }

  notBigCharge = (rule, value: number, callback) => {
    if (value == null || this.props.dailyChargeTarget == null) {
      return Promise.resolve()
    }
    if (value > this.props.dailyChargeTarget) {
      return Promise.reject(utils.intl('日放电量目标不能大于日充电量目标'))
    }
    return Promise.resolve()
  }

  onFinishFailed({errorFields}) {
    this.props.form.scrollToField(errorFields[0].name)
  }

  onOk() {
    this.props.form.validateFields().then(() => {
      if (this.props.configId) {
        this.props.updateConfig()
      } else {
        this.props.addConfig()
      }
    })
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.stationScale != prevProps.stationScale) {
      this.props.form.validateFields(['chargeTarget'])
    }
  }

  renderBody() {
    const {
      stationId, stationList, stationScale, scaleDisplay, dailyChargeTarget, dailyDischargeTarget, dailyProfitTarget, profitDeviationThreshold, effectTime, updateState
    } = this.props
    const language = localStorage.getItem("language")
    return (
      <div style={{ paddingLeft: 8 }}>
        <FormContainer form={this.props.form} onFinishFailed={this.onFinishFailed}>
          <div className="d-flex myForm" style={{flexWrap: 'wrap'}}>
            <SelectItem label={utils.intl('电站')} rules={[{required: true}]} dataSource={stationList}
                        value={stationId} onChange={v => this.props.action('onStationChange', {stationId: v})}/>

            <TextItem label={utils.intl('电站规模')} disabled={true} placeholder="" value={scaleDisplay}/>

            <NumberItem label={utils.intl('日充电量目标')}
                        name="chargeTarget"
                        rules={[{required: true}, numberRule(7, 2, utils.intl('整数最多7位，小数最多2位的正数')),
                          numberRangeRule(0, 5 * (stationScale || 0), utils.intl('取值范围为[0,5倍建设规模]'))]}
                        suffix="kWh"
                        value={dailyChargeTarget} onChange={v => updateState({dailyChargeTarget: v})}
            />
            <NumberItem label={utils.intl('日放电量目标')} rules={[{required: true}, numberRule(7, 2, utils.intl('整数最多7位，小数最多2位的正数')), {validator: this.notBigCharge}]}
                        suffix="kWh"
                        value={dailyDischargeTarget} onChange={v => updateState({dailyDischargeTarget: v})}
            />
            <NumberItem label={utils.intl('收益偏差阈值')}
                        rules={[{required: true}, numberRangeRule(0, 50, utils.intl('范围0-50')), numberRule(null, 1, utils.intl('最多保留一位小数'))]}
                        prefix="±" suffix="%"
                        min={0}
                        value={profitDeviationThreshold} onChange={v => updateState({profitDeviationThreshold: v})}
            />
            <NumberItem label={utils.intl('日收益目标')} rules={[{required: true}, numberRule(null, 2, utils.intl('最多保留两位小数'))]}
                        suffix={utils.intl('元')} min={0}
                        value={dailyProfitTarget} onChange={v => updateState({dailyProfitTarget: v})}/>
            <DateItem label={utils.intl('生效时间')} rules={[{required: true}]} style={{ width: language === 'zh' ? 270 : 380 }}
                      value={effectTime} onChange={v => updateState({effectTime: v})}/>
          </div>
        </FormContainer>
      </div>
    )
  }
}

export default FormContainer.create<Props>()(AddIndicatorDialog)
