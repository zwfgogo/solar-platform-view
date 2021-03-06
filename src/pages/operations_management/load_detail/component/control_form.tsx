import React from 'react';
import moment from 'moment';
import { Input, Row, Col, Form, Modal, TimePicker, Select } from 'wanke-gui';
import { connect } from 'dva';
import styles from './control.less';
import utils from '../../../../util/utils';

import { MinusCircleOutlined } from "wanke-icon";

import { WankeAddOutlined } from "wanke-icon";
import { FormContainer } from '../../../../components/input-item/InputItem'

const FormItem = Form.Item;

const ControlTime = props => {
  const addTime = () => {
    const results = [...props.record.controlTimes];
    results.push({ controlEndTime: '00:00', controlStartTime: results[results.length - 1].controlEndTime });
    props.record.controlTimes = results;
    props.dispatch({
      type: 'loadDetail/updateToView',
      payload: {
        record: { ...props.record }
      }
    });
  }

  const deleteTime = (e, index) => {
    const results = [...props.record.controlTimes];
    results.splice(index, 1);
    props.record.controlTimes = results;
    props.dispatch({
      type: 'loadDetail/updateToView',
      payload: {
        record: { ...props.record }
      }
    });
  }

  const updatecontrolStartTime = (e, index, value) => {
    const results = [...props.record.controlTimes];
    results[index].controlStartTime = value;
    props.record.controlTimes = results;
    props.dispatch({
      type: 'loadDetail/updateToView',
      payload: {
        record: { ...props.record }
      }
    });
  }

  const updatecontrolEndTime = (e, index, value) => {
    const results = [...props.record.controlTimes];
    results[index].controlEndTime = value;
    props.record.controlTimes = results;
    props.dispatch({
      type: 'loadDetail/updateToView',
      payload: {
        record: { ...props.record }
      }
    });
  }

  return (
    <div>
      {
        props.record.controlTimes.map((o, i) => {
          return (
            <div className={styles.time} key={i}>
              <TimePicker
                format={'HH:mm'}
                minuteStep={15}
                allowClear={false}
                value={moment(o.controlStartTime, 'HH:mm')}
                onChange={(e, value) => updatecontrolStartTime(e, i, value)}
              />
              <span className={styles.xian}>~</span>
              <TimePicker format={'HH:mm'}
                allowClear={false}
                minuteStep={15}
                value={moment(o.controlEndTime, 'HH:mm')}
                onChange={(e, value) => updatecontrolEndTime(e, i, value)}
              />
              {
                props.record.controlTimes.length === 1
                  ?
                  <span>
                    <WankeAddOutlined className={styles.add} onClick={addTime} />
                  </span>
                  :
                  <span>
                    <WankeAddOutlined className={styles.add} onClick={addTime} />
                    <MinusCircleOutlined style={{ color: "#3d7eff" }} onClick={(e) => deleteTime(e, i)} />
                  </span>
              }
            </div>
          );
        })
      }
    </div>
  );
}

const _Form = props => {
  const { dispatch, controlFormDisplay, record } = props;
  const controlRoundEnums = [{
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
        controlFormDisplay: false,
      },
    });
  };
  const formItemLayout = {
    wrapperCol: { span: 16 }
  };

  function handleSubmit(e) {
    e.preventDefault();
    props.form.setFieldsValue({ 'controlTimes': props.record.controlTimes }, () => {
      props.form.validateFields().then((values) => {
          dispatch({
            type: `loadDetail/updateControl`,
            payload: {
              ...record,
              ...values
            },
          });
      });
    });
  }

  return (
    <Modal centered bodyStyle={{ color: 'white' }} width={'700px'} visible={controlFormDisplay} title={'????????????????????????'} onOk={handleSubmit} onCancel={cancel}>
      <div style={{ paddingLeft: '90px', maxHeight: 600, overflow: "auto" }}>
        <Form
          initialValues={{
            controlRound: record.controlRound,
            powerThreshold: record.powerThreshold
          }}
          form={props.form}
          layout={'vertical'}
          autoComplete="off">
          <Row>
            <Col span={12}>
              <FormItem
                name="controlRound"
                rules={[
                  {
                    required: true,
                    message: '?????????????????????',
                  },
                ]}
                {...formItemLayout}
                label={'???????????????'}><Select dataSource={controlRoundEnums} className={"select100"} /></FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="powerThreshold"
                rules={[
                  {
                    pattern: /^(0|[1-9][0-9]{0,4})$/,
                    required: true,
                    message: '?????????????????????[0,99999]',
                  },
                ]}
                {...formItemLayout}
                label={'???????????????'}><Input autoComplete="off" addonAfter={<span>kW</span>} /></FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                name="controlTimes"
                rules={[
                  {
                    required: true,
                    message: '?????????????????????',
                  },
                  {
                    validator: (rule, value, callback) => {
                      const timeRepeat = utils.checkTimeRepeat(value, ['controlStartTime', 'controlEndTime']);
                      for (let item of value) {
                        // ???????????????00:00?????????24:00
                        if (item.controlStartTime >= item.controlEndTime && item.controlEndTime !== '00:00') {
                          callback('?????????????????????????????????');
                        }
                      }
                      if (timeRepeat) {
                        callback('????????????????????????')
                      }
                      callback();
                    }
                  }
                ]}
                label={'????????????'}><ControlTime {...props} /></FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
};

//??????layout model ?????????title
function mapStateToProps(state) {
  const { controlFormDisplay, record } = state.loadDetail;
  return {
    controlFormDisplay, record
  };
}

const _FormRes = FormContainer.create()(_Form);
export default connect(mapStateToProps)(_FormRes);