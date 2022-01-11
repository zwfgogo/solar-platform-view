/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React, { Component, useState } from 'react';
import { Input, message, Row, Col, Form, Select, Modal } from 'wanke-gui';
import { FormContainer } from '../../../../components/input-item/InputItem'
import {makeConnect} from '../../../umi.helper'
import {t_check_abnormal} from '../../../constants'

const _Form = props => {
  const { ignoreModal } = props;
  const cancel = () => {
    props.action("updateState", {
        ignoreModal: false,
    });
  };

  async function handleSubmit (e) {
      props.action("ignoreList");
  }
  return (
    <Modal centered maskClosable={false} bodyStyle={{ color: 'white' }} width={'500px'} visible={ignoreModal} title={'忽略'} onOk={handleSubmit} onCancel={cancel} wrapClassName={'customerModal'}>
        <div style={{textAlign: 'center'}}>
            <span style={{color:'#000', fontSize:'16px'}}>{'忽略该异常?'}</span>
        </div>
    </Modal>
  );
};

function mapStateToProps(model) {
    return {
        ...model
    };
}
const _FormRes = FormContainer.create()(_Form);
export default makeConnect(t_check_abnormal, mapStateToProps)(_FormRes);