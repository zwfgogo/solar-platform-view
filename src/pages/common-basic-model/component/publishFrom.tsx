import React, { Component, useState } from 'react';
import { Input, Select, Row, Col, Form, Checkbox, Modal } from 'wanke-gui';
import { connect } from 'dva';
import { FormContainer } from '../../../components/input-item/InputItem'
import { makeConnect } from '../../umi.helper'
import { letterAndNumberAndSpotRule } from '../../../util/ruleUtil'
import utils from '../../../public/js/utils';

const FormItem = Form.Item;

const _Form = props => {
  const { dispatch, publishModal, record, modelType,saveLoading } = props;
  const [form] = Form.useForm();

  const cancel = () => {
    dispatch({
      type: 'modelConfig/updateState',
      payload: {
        publishModal: false,
      },
    });
  };

  const formItemLayout = {
    wrapperCol: { span: 20 }
  }

  const formItemLayout1 = {
    wrapperCol: { span: 12 }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    form.validateFields().then((values) => {
      dispatch({
        type: 'modelConfig/publish',
        payload: {
          values,
        },
      }).then(res => {
        if(res){
          dispatch({
            type: 'deviceParameter/updateState',
            payload: {
              canEdit: false
            },
          });
          dispatch({
            type: 'modelConfig/getVerList',
          });
        }
      });
    })
  }

  return (
    <Modal centered maskClosable={false} bodyStyle={{ color: 'white' }} width={'700px'} visible={publishModal}
      title={utils.intl('发布' + modelType)} onOk={handleSubmit} onCancel={cancel} wrapClassName={'customerModal'} confirmLoading={saveLoading}>
      <div style={{ paddingLeft: '40px' }}>
        <FormContainer form={form} layout={'vertical'} autoComplete="off"
          initialValues={{
            versionTitle: '',
            description: '',
          }}>
          <Row>
            <Col span={24}>
              <FormItem
                name="versionTitle"
                rules={[{ required: true, message: utils.intl('请输入版本号') },
                { max: 30, message: utils.intl('不能超过N位字符', 30) }, letterAndNumberAndSpotRule()
                ]}
                {...formItemLayout1}
                label={utils.intl('版本号')}>
                <Input autoComplete="off" />
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                {...formItemLayout}
                name="description"
                rules={[
                  { required: false },
                  { max: 60, message: utils.intl('不能超过N位字符', 60) }
                ]}
                label={utils.intl('版本描述')}>
                <Input.TextArea
                  style={{ resize: 'none', height: '80px' }}
                  placeholder={utils.intl('不能超过N位字符', 60)}
                  autoComplete="off" />
              </FormItem>
            </Col>
          </Row>
        </FormContainer>
      </div>
    </Modal>
  );
};
//绑定layout model ，获取title
function mapStateToProps(model, getLoading, state) {
  return {
    ...model,
    saveLoading:getLoading('publish')
  };
}

export default makeConnect('modelConfig', mapStateToProps)(_Form)