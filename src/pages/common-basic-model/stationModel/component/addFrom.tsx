import React, { Component, useState } from 'react';
import { Input, Select, Row, Col, Form, Checkbox, Modal } from 'wanke-gui';
import { connect } from 'dva';
import { FormContainer } from '../../../../components/input-item/InputItem'
import { makeConnect } from '../../../umi.helper'
import { startWithChineseLetterOrNumberRule, checkTextDataForNORMA } from '../../../../util/ruleUtil'
import utils from '../../../../public/js/utils';
import CheckboxGroup from '../../../../components/input-item/CheckboxGroup';

const FormItem = Form.Item;

const _Form = props => {
  const { dispatch, addModal, record, modalTitle, arr, terminalNumber, regionsArr, devProperties, yesOrNo, typeId, saveLoading } = props;
  const [form] = Form.useForm();
  const cancel = () => {
    dispatch({
      type: 'stationModel/updateState',
      payload: {
        addModal: false,
      },
    });
  };

  const formItemLayout = {
    wrapperCol: { span: 20 }
  }
  const formItemLayout1 = {
    labelCol: { span: 5 }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    form.validateFields().then((values) => {
      dispatch({
        type: 'stationModel/save',
        payload: {
          values,
        },
      });
    })
  }
  let regionsArrInfo = regionsArr.map((o, i) => {
    return (
      <Col span={4}>
        <Checkbox value={o.value} key={i}>
          {o.name}
        </Checkbox>
      </Col>
    )
  })
  let language = localStorage.getItem('language');
  return (
    <Modal centered maskClosable={false} bodyStyle={{ color: 'white' }} width={'700px'} visible={addModal}
      title={utils.intl(modalTitle)} onOk={handleSubmit} onCancel={cancel} wrapClassName={'customerModal'} confirmLoading={saveLoading}>
      <div style={{ paddingLeft: language !== 'zh' ? '40px' : '0', paddingRight: language !== 'zh' ? '0' : '40px' }}>
        <Form form={form} layout={language === 'zh' ? 'horizontal' : 'vertical'} autoComplete="off"
          labelCol={language === 'zh' ? { span: 10 } : undefined}
          initialValues={{
            name: record.name || typeId,
            title: record.title || '',
            regionIds: record.regionIds ? record.regionIds.split('，').map(Number) : []
          }}>
          <Row>
            <Col span={12}>
              <FormItem
                name="name"
                {...formItemLayout}
                label={utils.intl('电站类型ID')}><Input disabled autoComplete="off" /></FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="title"
                rules={[{ max: 30, required: true, message: utils.intl('请输入30字符以内电站类型') }, startWithChineseLetterOrNumberRule(), checkTextDataForNORMA()]}
                {...formItemLayout}
                label={utils.intl('电站类型')}><Input autoComplete="off" /></FormItem>
            </Col>
            <Col span={24}>
              <FormItem name="regionIds" rules={[{ required: true, message: utils.intl('请选择地区标识') }]} {...formItemLayout1} label={utils.intl('地区标识')}>
                <CheckboxGroup list={regionsArr} />
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
};

//绑定layout model ，获取title
function mapStateToProps(model, getLoading, state) {
  return {
    ...model,
    saveLoading: getLoading('save')
  };
}

// const _FormRes = FormContainer.create()(_Form);
export default makeConnect('stationModel', mapStateToProps)(_Form)