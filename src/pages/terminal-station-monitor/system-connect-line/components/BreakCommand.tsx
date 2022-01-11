import React from 'react'
import { Button, Col, DeleteConfirmPopover, message, Row } from 'wanke-gui'
import DetailFormItem from '../../../../components/DetailFormItem'
import MakeConnectProps from '../../../../interfaces/MakeConnectProps'
import { makeConnect } from '../../../umi.helper'
import { connectLineModal } from '../model'

interface Props extends MakeConnectProps<connectLineModal>, connectLineModal {
  args: string[]
  onClose: () => void
}

const BreakCommand: React.FC<Props> = (props) => {

  const onSwitchClick = (type) => {
    props.action('sendBreakerCommand', { switchType: type, args: props.args })
      .then(() => {
        message.success('下发成功')
        props.onClose()
      })
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <DetailFormItem
        label={"切换阀门状态"}
        value={(
          <>
            <DeleteConfirmPopover tip="确定要打开阀门吗" onConfirm={() => onSwitchClick(0)}>
              <Button style={{ marginRight: 16 }}>打开</Button>
            </DeleteConfirmPopover>
            <DeleteConfirmPopover tip="确定要关闭阀门吗" onConfirm={() => onSwitchClick(1)}>
              <Button>关闭</Button>
            </DeleteConfirmPopover>
          </>
        )}
      />
    </div>
  )
}

function mapStateToProps(model, getLoading) {
    return {
        ...model,
    }
}

export default makeConnect('connect-line', mapStateToProps)(BreakCommand);
