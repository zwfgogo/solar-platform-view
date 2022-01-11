import React from 'react'
import { Button } from 'wanke-gui'
import { Modal } from 'antd'
import utils from '../public/js/utils';

export interface DialogBasicProps {
  centered?: boolean
  visible: boolean
  onExited: () => void
  confirmLoading?: boolean
}

class BasicDialog<P extends DialogBasicProps, S = {}> extends React.Component<P, S> {
  static defaultProps = {
    centered: true
  }

  getTitle(): string {
    return ''
  }

  getWidth(): number {
    return 600
  }

  renderBody(): any {

  }

  onCancel() {
    this.props.onExited()
  }

  onOk() {

  }

  getFooter() {
    return (
      <div className="dialog-footer">
        <Button onClick={this.props.onExited}>{utils.intl("取消")}</Button>
        <Button loading={this.props.confirmLoading} style={{ marginLeft: 8 }} type="primary" onClick={() => this.onOk()}>{utils.intl("确定")}</Button>
      </div>
    )
  }

  isMaskClosable() {
    return false
  }

  render() {
    return (
      <Modal
        title={this.getTitle()}
        width={this.getWidth()}
        visible={this.props.visible}
        onCancel={() => this.onCancel()}
        onOk={() => this.onOk()}
        destroyOnClose={true}
        maskClosable={this.isMaskClosable()}
        footer={this.getFooter()}
        centered={this.props.centered}
      >
        {
          this.renderBody()
        }
      </Modal>
    )
  }
}

export default BasicDialog
