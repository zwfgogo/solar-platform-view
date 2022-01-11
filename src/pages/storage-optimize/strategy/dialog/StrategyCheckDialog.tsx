import React from 'react'

import BasicDialog, {DialogBasicProps} from '../../../../components/BasicDialog'

import {CheckOutlined} from 'wanke-icon'
import {ExclamationOutlined} from 'wanke-icon'

import {WankeRunSituationOutlined} from 'wanke-icon'

import utils from '../../../../public/js/utils'

/**
 * 修改密码
 */
interface Props extends DialogBasicProps {
  step1Success: number
  step2Success: number
  step3Success: number
}

class StrategyCheckDialog extends BasicDialog<Props> {
  getTitle(): string {
    return utils.intl('策略完整性校验')
  }

  getWidth(): number {
    return 700
  }

  onOk() {
    this.props.onExited()
  }

  getColor = (value) => {
    if (value == 0) {
      return 'gray'
    }
    if (value == 1) {
      return '#3d7eff'
    }
    return 'red'
  }

  getFooter(): any {
    return null
  }

  renderBody() {
    const {step1Success, step2Success, step3Success} = this.props
    return (
      <div style={{color: '#3d7eff'}} className="check-station-dialog">
        <div className="h-center">
          <WankeRunSituationOutlined style={{fontSize: 50}}/>
        </div>
        <div className="v-center" style={{padding: '20px 70px 30px'}}>
          <div style={{position: 'relative', color: this.getColor(step1Success)}}>
            <div className="icon-wrap" style={{borderColor: this.getColor(step1Success)}}>
              {
                step1Success == 0 && (<span>1</span>)
              }
              {
                step1Success == 1 && (<CheckOutlined style={{fontSize: 20}}/>)
              }
              {
                step1Success == 2 && (<ExclamationOutlined style={{fontSize: 20}}/>)
              }
            </div>
            <div className="step-tip">{utils.intl('设备台账完整性校验')}</div>
          </div>

          <div className="flex1 line" style={{borderColor: this.getColor(step2Success)}}></div>

          <div style={{position: 'relative', color: this.getColor(step2Success)}}>
            <div className="icon-wrap" style={{borderColor: this.getColor(step2Success)}}>
              {
                step2Success == 0 && (<span>2</span>)
              }
              {
                step2Success == 1 && (<CheckOutlined style={{fontSize: 20}}/>)
              }
              {
                step2Success == 2 && (<ExclamationOutlined style={{fontSize: 20}}/>)
              }
            </div>
            <div className="step-tip" style={{color: this.getColor(step2Success)}}>{utils.intl('电价数据完整性校验')}</div>
          </div>

          <div className="flex1 line" style={{borderColor: this.getColor(step3Success)}}></div>

          <div style={{position: 'relative', color: this.getColor(step3Success)}}>
            <div className="icon-wrap" style={{borderColor: this.getColor(step3Success)}}>
              {
                step3Success == 0 && (<span>3</span>)
              }
              {
                step3Success == 1 && (<CheckOutlined style={{fontSize: 20}}/>)
              }
              {
                step3Success == 2 && (<ExclamationOutlined style={{fontSize: 20}}/>)
              }
            </div>
            <div className="step-tip" style={{left: -70}}>{utils.intl('设备采集数据项完整性校验')}</div>
          </div>
        </div>
      </div>
    )
  }
}

export default StrategyCheckDialog
