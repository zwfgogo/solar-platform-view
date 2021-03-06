import React from 'react';
import moment from 'moment';
import { Input, Row, Col, Form, TimePicker, Select } from 'wanke-gui';
import { connect } from 'dva';
import { Modal } from 'antd';
import styles from './index.less';
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
      type: 'loadManagement/updateToView',
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
      type: 'loadManagement/updateToView',
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
      type: 'loadManagement/updateToView',
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
      type: 'loadManagement/updateToView',
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
  const { dispatch, addFormDisplay, breaker, loading } = props;
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
      type: 'loadManagement/updateToView',
      payload: {
        addFormDisplay: false,
      },
    });
  };
  const formItemLayout = {
    wrapperCol: { span: 16 }
  };

  function handleSubmit(e) {
    e.preventDefault();
    props.form.setFieldsValue({ 'controlTimes': props.record.controlTimes }, () => {
      // props.form.validateFields(['controlTimes']);

      props.form.validateFields().then((values) => {
        // values.mainStandbyType = values.mainStandbyType.trim() === '?????????' ? 0 : 1;
        values.breakerId = values.breaker;
          dispatch({
            type: `loadManagement/addLoad`,
            payload: {
              ...values,
              ...props.record,
              stationId: sessionStorage.getItem('station-id')
            },
          });
      });
    });
  }

  return (
    <Modal confirmLoading={loading} centered bodyStyle={{ color: 'white' }} width={'700px'} visible={addFormDisplay} title={'????????????'} onOk={handleSubmit} onCancel={cancel}>
      <div className={styles['load-form']}>
        <Form
          initialValues={{
            title: '',
            breaker: '',
            name: '',
            level: '',
            controlRound: '',
            powerThreshold: ''
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
                    message: '?????????????????????16?????????',
                    whitespace: true
                  },
                ]}
                {...formItemLayout}
                label={'???????????????'}><Input autoComplete="off" /></FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="breaker"
                rules={[
                  {
                    // max: 16,
                    required: true,
                    message: '?????????????????????',
                  },
                ]}
                {...formItemLayout}
                label={'???????????????'}><Select dataSource={breaker} className={"select100"} /></FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="name"
                rules={[
                  {
                    max: 8,
                    required: true,
                    message: '?????????????????????8?????????',
                    whitespace: true
                  },
                ]}
                {...formItemLayout}
                label={'???????????????'}><Input autoComplete="off" /></FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="level"
                rules={[
                  {
                    required: true,
                    message: '?????????????????????',
                  },
                ]}
                {...formItemLayout}
                label={'???????????????'}><Select dataSource={levelEnums} className={"select100"} /></FormItem>
            </Col>
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
            {/* {
              record.controlTimes.map((item, index) => {
                return (
                  
                );
              })
            } */}
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
  const { addFormDisplay, record, breaker } = state.loadManagement;
  const loading = state.loading.effects['loadManagement/addLoad'];
  return {
    addFormDisplay, record, breaker, loading
  };
}

const _FormRes = FormContainer.create()(_Form);
export default connect(mapStateToProps)(_FormRes);