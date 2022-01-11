import React from 'react'
import {Modal} from 'wanke-gui'

import utils from '../../../public/js/utils'

interface Props {
  lossCount: number
  visible: boolean
  onCancel: () => void
  onConfirm: () => void
}

const LossMonthDayDialog: React.FC<Props> = function (this: null, props) {
  return (
    <Modal
      centered
      width={'400px'}
      title={utils.intl('提示')}
      visible={props.visible}
      onCancel={props.onCancel}
      onOk={() => props.onConfirm()}
      okText={utils.intl('继续下发')}
      cancelText={utils.intl('取消下发')}
      className="loss-dialog"
    >
      <div style={{padding: 15}}>
        <div dangerouslySetInnerHTML={{__html: utils.intl('run-strategy.lossDay', props.lossCount)}}></div>
        <div style={{marginTop: 10}}>{utils.intl('如不指定，系统将按蓄电处理！')}</div>
      </div>
    </Modal>
  )
}

export default LossMonthDayDialog
