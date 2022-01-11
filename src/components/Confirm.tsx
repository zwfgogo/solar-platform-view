import React from 'react'
import { Button, Modal } from 'antd'
import utils from '../public/js/utils';

interface Props {
  message: string
  visible: boolean
  onConfirm: () => void
  onCancel: () => void
}

const Confirm: React.FC<Props> = function (this: null, props) {
  return (
    <Modal
      width={415}
      style={{ top: 100 }}
      bodyStyle={{ padding: '32px 32px 24px' }}
      visible={props.visible}
      closable={false}
      title={null}
      footer={null}
    >
      <div>
        <section className="confirm-title">{utils.intl("提示")}</section>
        <section style={{ marginTop: 8 }}>{props.message}</section>
        <section style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <div style={{ marginTop: 20 }}>
            <Button type="default" onClick={props.onCancel}>{utils.intl("取消")}</Button>
            <Button danger type="default" style={{ marginLeft: 10 }} onClick={props.onConfirm}>{utils.intl("确定")}</Button>
          </div>
        </section>
      </div>
    </Modal>
  )
}

export default Confirm
