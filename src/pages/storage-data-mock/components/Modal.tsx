import React, { Component } from 'react';
import { Modal } from 'antd';
import { ModalProps } from 'antd/lib/modal';

export interface Props extends ModalProps {

}

class WankeModal extends Component<Props> {
  static info = Modal.info;
  static success = Modal.success;
  static error = Modal.error;
  static warn = Modal.warn;
  static warning = Modal.warning;
  static confirm = Modal.confirm;

  render() {
    return (
      <Modal {...this.props}
             maskClosable={this.props.maskClosable || false}
             centered={this.props.centered ?? true}
             destroyOnClose={this.props.destroyOnClose ?? true}
      />
    );
  }
}

export default WankeModal;
