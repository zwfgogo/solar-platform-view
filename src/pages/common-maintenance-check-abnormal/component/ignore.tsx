/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React, { Component, useState } from 'react';
import { Input, message, Row, Col, Form, Select, Modal } from 'wanke-gui';
import { connect } from 'dva';
import { FormContainer } from "../../../components/input-item/InputItem"
import utils from "../../../public/js/utils";

const FormItem = Form.Item;

const _Form = props => {
  const { dispatch, ignoreModal, record, searchObj, page, size } = props;
  const cancel = () => {
    dispatch({
        type: 'abnormalQuery/updateState',
        payload: {
            ignoreModal: false,
        },
    });
  };
  const formItemLayout = {
    wrapperCol: { span: 21 },
  };
  async function handleSubmit (e) {
      dispatch({
          type: 'abnormalQuery/ignoreList',
          payload: { searchObj, page, size }
      }).then(res => {
        if(res.errorCode === 0) message.success(utils.intl('忽略成功'))
      });
  }
  return (
    <Modal centered maskClosable={false} bodyStyle={{ color: 'white' }} width={'500px'} visible={ignoreModal} title={utils.intl('忽略')} onOk={handleSubmit} onCancel={cancel} wrapClassName={'customerModal'}>
        <div style={{textAlign: 'center'}}>
            <span className="basic-font-color" style={{fontSize:'16px'}}>{utils.intl('忽略该异常')}?</span>
        </div>
    </Modal>
  );
};
//绑定layout model ，获取title
function mapStateToProps(state) {
    return {
        ...state.abnormalQuery
    };
}
const _FormRes = FormContainer.create()(_Form);
export default connect(mapStateToProps)(_FormRes);