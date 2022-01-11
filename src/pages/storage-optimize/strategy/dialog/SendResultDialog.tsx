import React from 'react'

import BasicDialog, {DialogBasicProps} from '../../../../components/BasicDialog'

import {CloseSquareOutlined} from 'wanke-icon'

import utils from '../../../../public/js/utils'

/**
 * 修改密码
 */
interface Props extends DialogBasicProps {

}


class SendResultDialog extends BasicDialog<Props> {
  getTitle(): string {
    return null
  }

  getWidth(): number {
    return 400
  }

  getFooter() {
    return null
  }

  isMaskClosable() {
    return true
  }

  renderBody() {
    return (
      <div style={{color: '#3d7eff', padding: '20px 0'}}>
        <div className="h-center">
          <CloseSquareOutlined style={{fontSize: 50}}/>
        </div>

        <div className="h-center" style={{marginTop: 20, color: 'red'}}>{utils.intl('下发条件不足')}</div>

        <div className="h-center" style={{marginTop: 15, color: '#333333'}}>
          “{<span style={{color: 'red'}}>{utils.intl('储能单元名称')}</span>}{utils.intl('”未完善，请完善后下发')}</div>

      </div>
    )
  }
}

export default SendResultDialog
