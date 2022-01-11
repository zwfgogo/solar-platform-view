import React from 'react';
import { Input, Row, Col, Form, Modal, Select } from 'wanke-gui';
import { connect } from 'dva';
import { FormContainer } from '../../../../components/input-item/InputItem'

const FormItem = Form.Item;

const _Form = props => {
  const { dispatch, basicFormDisplay, curLoad, breaker } = props;
  const levelEnums = [{
    name: '1',
    value: 1
  }, {
    name: '2',
    value: 2
  }, {
    name: '3',
    value: 3
  }, {
    name: '4',
    value: 4
  }, {
    name: '5',
    value: 5
  }];
  const cancel = () => {
    dispatch({
      type: 'loadDetail/updateToView',
      payload: {
        basicFormDisplay: false,
      },
    });
  };
  const formItemLayout = {
    wrapperCol: { span: 16 },
  };
  function handleSubmit(e) {
    e.preventDefault();
    props.form.validateFields().then((values) => {
        values.breakerId = values.breaker;
        dispatch({
          type: `loadDetail/updateBasic`,
          payload: {
            ...curLoad,
            ...values
          },
        });
    });
  }
  return (
    <Modal centered bodyStyle={{ color: 'white' }} width={'700px'} visible={basicFormDisplay} title={"编辑负荷基础信息"} onOk={handleSubmit} onCancel={cancel}>
      <div style={{ paddingLeft: '90px' }}>
        <Form
          initialValues={{
            title: curLoad.title,
            name: curLoad.name,
            level: curLoad.level,
            breaker: curLoad.breaker.id
          }}
          form={props.form}
          layout={'vertical'}
          autoComplete="off">
          <Row>
            <Col span={12}>
              <FormItem
                name="title"
                rules={[
                  {
                    max: 16,
                    required: true,
                    message: '负荷名称最大为16个字符',
                    whitespace: true
                  },
                ]}
                {...formItemLayout}
                label={'负荷名称：'}><Input autoComplete="off" /></FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="name"
                rules={[
                  {
                    max: 8,
                    required: true,
                    message: '负荷代号最大为8个字符',
                    whitespace: true
                  },
                ]}
                {...formItemLayout}
                label={'负荷代号：'}><Input autoComplete="off" /></FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="level"
                rules={[
                  {
                    required: true,
                    message: '请选择保电级别',
                  },
                ]}
                {...formItemLayout}
                label={'保电级别：'}><Select dataSource={levelEnums} className={"select100"} /></FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="breaker"
                rules={[
                  {
                    // max: 16,
                    required: true,
                    message: '请选择开关',
                  },
                ]}
                {...formItemLayout}
                label={'开关名称：'}><Select dataSource={breaker} className={"select100"} /></FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
};
//绑定layout model ，获取title
function mapStateToProps(state) {
  const { basicFormDisplay, curLoad, breaker } = state.loadDetail;
  return {
    basicFormDisplay, curLoad, breaker
  };
}
const _FormRes = FormContainer.create()(_Form);
export default connect(mapStateToProps)(_FormRes);