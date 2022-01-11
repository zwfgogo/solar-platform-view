import React from 'react';
import { Row, Col, Form, Modal, Select } from 'wanke-gui';
import { connect } from 'dva';
import { FormContainer } from '../../../../components/input-item/InputItem'

const FormItem = Form.Item;

const _Form = props => {
  const { dispatch, levelFormDisplay, record, title, curEnergy, energyList } = props;
  const energyTypeEnums = [{
    name: '主电源',
    value: 0
  }, {
    name: '备用电源',
    value: 1
  }];
  const levelEnums = energyList.map((item, index) => {
    index++;
    return {
      name: `${index}`,
      value: index
    }
  });
  const cancel = () => {
    dispatch({
      type: 'energyDetail/updateToView',
      payload: {
        levelFormDisplay: false,
      },
    });
  };
  const formItemLayout = {
    wrapperCol: { span: 16 },
  };
  function handleSubmit(e) {
    e.preventDefault();
    props.form.validateFields().then((values) => {
        dispatch({
          type: `energyDetail/updateEnergy`,
          payload: {
            ...values,
            id: curEnergy.id
          },
        });
    });
  }
  return (
    <Modal centered bodyStyle={{ color: 'white' }} width={'700px'} visible={levelFormDisplay} title={title} onOk={handleSubmit} onCancel={cancel}>
      <div style={{ paddingLeft: '90px' }}>
        <Form
          initialValues={{
            class: record.class,
            level: record.level
          }}
          form={props.form}
          layout={'vertical'}
          autoComplete="off">
          <Row>
            <Col span={12}>
              <FormItem
                name="class"
                rules={[
                  {
                    required: true,
                    message: '请选择电源性质',
                  },
                ]}
                {...formItemLayout}
                label={'电源性质：'}><Select dataSource={energyTypeEnums} className={"select100"} /></FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="level"
                rules={[
                  {
                    // max: 16,
                    required: true,
                    message: '请选择电源等级',
                  },
                ]}
                {...formItemLayout}
                label={'电源等级：'}><Select dataSource={levelEnums} className={"select100"} /></FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
};
//绑定layout model ，获取title
function mapStateToProps(state) {
  const { levelFormDisplay, record, curEnergy } = state.energyDetail;
  const energyList = state.energyManagement.energyList
  return {
    levelFormDisplay, record, curEnergy, energyList
  };
}
const _FormRes = FormContainer.create()(_Form);
export default connect(mapStateToProps)(_FormRes);