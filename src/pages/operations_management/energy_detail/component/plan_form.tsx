import React from 'react';
import moment from 'moment';
import { Input, Row, Col, Form } from 'wanke-gui';
import DatePicker from '../../../../components/date-picker'
import { Modal } from 'antd';
import { connect } from 'dva';
import { addLoad } from '../../load_management/service';
import { FormContainer } from '../../../../components/input-item/InputItem'

const FormItem = Form.Item;
const { TextArea } = Input;

const _Form = props => {
  const { dispatch, editDisplay, record, title, curEnergy, addLoading, updateLoading } = props;
  let unit = 'MW';
  // storage MWh photovoltaic MWp 其他都是MW
  if (curEnergy.energyUnitType.title === '储能') {
    unit = 'MWh';
  } else if (curEnergy.energyUnitType.title === '光伏' || curEnergy.energyUnitType.name === '风电') {
    unit = 'MWp';
  }
  const cancel = () => {
    dispatch({
      type: 'energyDetail/updateToView',
      payload: {
        editDisplay: false,
      },
    });
  };
  const formItemLayout = {
    wrapperCol: { span: 16 },
  };
  const formItemLayout1 = {
    wrapperCol: { span: 20 },
  };
  function handleSubmit(e) {
    e.preventDefault();
    let action = title.includes('新增') ? 'add' : 'update';
    props.form.validateFields().then((values) => {
        values.startPlanTime = moment(values.startPlanTime).format('YYYY-MM-DD HH:mm');
        values.endPlanTime = moment(values.endPlanTime).format('YYYY-MM-DD HH:mm');
        dispatch({
          type: `energyDetail/${action}Plan`,
          payload: {
            ...record,
            ...values,
            id: record.id
          },
        });
    });
  }
  return (
    <Modal confirmLoading={title.includes('新增') ? addLoading : updateLoading} centered bodyStyle={{ color: 'white' }} width={'700px'} visible={editDisplay} title={title} onOk={handleSubmit} onCancel={cancel}>
      <div style={{ paddingLeft: '90px' }}>
        <Form
          initialValues={{
            startPlanTime: record !== '' ? moment(record.startPlanTime) : moment(new Date()).add(5, 'minutes'),
            endPlanTime: record !== '' ? moment(record.endPlanTime) : moment(new Date()).add(1, 'days'),
            impactCapacity: record.impactCapacity || '',
            content: record.content || ''
          }}
          form={props.form}
          layout={'vertical'}
          autoComplete="off">
          <Row>
            <Col span={12}>
              <FormItem
                name="startPlanTime"
                rules={[
                  {
                    required: true,
                    message: '请选择计划开始时间',
                  },
                  {
                    validator: (rule, value, callback) => {
                      if (!record.startActualTime && moment(value) < moment(new Date())) {
                        callback('计划时间必须是未来的时间');
                      }
                      callback();
                    }
                  }
                ]}
                {...formItemLayout}
                label={'计划开始时间：'}><DatePicker disabled={record.startActualTime ? true : false} style={{ width: "100%" }} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm"></DatePicker></FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="endPlanTime"
                rules={[
                  {
                    // max: 16,
                    required: true,
                    message: '请选择计划结束时间',
                  },
                  {
                    validator: (rule, value, callback) => {
                      if (moment(value) < moment(new Date())) {
                        callback('计划时间必须是未来的时间');
                      }
                      if (moment(value) < props.form.getFieldsValue(['startPlanTime']).startPlanTime) {
                        callback('结束时间要晚于开始时间');
                      }
                      callback();
                    }
                  }
                ]}
                {...formItemLayout}
                label={'计划结束时间：'}><DatePicker style={{ width: "100%" }} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm"></DatePicker></FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="impactCapacity"
                rules={[
                  {
                    pattern: /^(\-)?\d+(\.\d{1,3})?$/,
                    required: false,
                    message: '影响容量最多保留三位小数'
                  },
                  {
                    validator: (rule, value, callback) => {
                      if (parseFloat(value) > parseFloat(curEnergy.scale)) {
                        callback('影响容量大于总容量');
                      }
                      callback();
                    }
                  }
                ]}
                {...formItemLayout}
                label={'影响容量：'}><Input autoComplete="off" addonAfter={<span>{unit}</span>} /></FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                name="content"
                rules={[
                  {
                    max: 128,
                    required: false,
                    message: '检修内容最大为128个字符'
                  },
                ]}
                {...formItemLayout1}
                label={'检修内容：'}><TextArea rows={5} /></FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
};
//绑定layout model ，获取title
function mapStateToProps(state) {
  const { editDisplay, record, curEnergy } = state.energyDetail;
  const addLoading = state.loading.effects['energyDetail/addPlan'];
  const updateLoading = state.loading.effects['energyDetail/updatePlan'];
  return {
    editDisplay, record, curEnergy, addLoading, updateLoading
  };
}
const _FormRes = FormContainer.create()(_Form);
export default connect(mapStateToProps)(_FormRes);