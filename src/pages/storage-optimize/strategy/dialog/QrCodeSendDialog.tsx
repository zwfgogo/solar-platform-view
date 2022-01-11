import React from 'react'
import {Button, Modal} from 'antd'

import {CloseOutlined} from 'wanke-icon'

import utils from '../../../../public/js/utils'

/**
 * 二维码下发
 */
interface Props {
  qrCode: string
  scanResult: any
  sendStrategy: () => void
  visible: boolean
  onExited: () => void
}

class QrCodeSendDialog extends React.Component<Props> {
  render() {
    const userInfo = []
    const userId = sessionStorage.getItem('user-id')
    const scanResult = this.props.scanResult[userId] || {}

    userInfo.push({
      userId: scanResult.firstUserId,
      success: scanResult.firstAgree,
      name: scanResult.firstUserName,
    })
    userInfo.push({
      userId: scanResult.secondUserId,
      success: scanResult.secondAgree,
      name: scanResult.secondUserName,
    })

    return (
      <Modal visible={this.props.visible}
             closable={false}
             width={260}
             title={null}
             footer={null}
             className="qrcode-send-dialog">
        <div style={{fontSize: 12}}>
          {
            userInfo.map(item => {
              if (!item.userId) {
                return null
              }
              if (item.success) {
                return (
                  <div className="h-center" style={{marginTop: 7}}>
                    <div className="info">{item.name}</div>
                    <div style={{marginLeft: 2}}>{utils.intl('已扫码确认')}</div>
                  </div>
                )
              }
              return (
                <div className="h-center" style={{marginTop: 7}}>
                  <div className="info">
                    {item.name}
                  </div>
                  <div style={{marginLeft: 2}}>{utils.intl('已扫码拒绝')}</div>
                </div>
              )
            })
          }

          <div className="h-center info">
            {userInfo.filter(item => item.userId != null).length}
            /
            {userInfo.length}
          </div>
          <div className="h-center">
            {
              this.props.qrCode && (
                <img src={this.props.qrCode} style={{width: 200}}/>
              )
            }
          </div>
          <div className="h-center"
               style={{marginTop: 5, textAlign: 'center'}}>{utils.intl('请两位不同用户使用万克云能进行扫码认证')}</div>
        </div>

        <div className="close" onClick={this.props.onExited}>
          <CloseOutlined style={{color: '#fff', fontSize: 16}}/>
        </div>
      </Modal>
    )
  }
}

export default QrCodeSendDialog
