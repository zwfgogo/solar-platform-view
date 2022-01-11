/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React, { Component, useState } from 'react';
import { Input, Row, Col, Form, Checkbox, Modal, TimePicker, notification } from 'wanke-gui';
import { connect } from 'dva';
import { FormContainer } from "../../../components/input-item/InputItem"
import moment from 'moment';
import {
    PlusCircleTwoTone,
    MinusCircleTwoTone
} from '@ant-design/icons';
import { checkMobile } from "../../../util/ruleUtil"
import utils from "../../../public/js/utils";

const FormItem = Form.Item;

const _Form = props => {
    const { dispatch, notificationModal, record, modalTitle, time } = props;
    const cancel = () => {
        dispatch({
            type: 'alarmNotification/updateState',
            payload: {
                notificationModal: false
            },
        });
    };
    const formItemLayout = {
        wrapperCol: { span: 23 },
    };
    async function handleSubmit(e) {
        e.preventDefault();
        props.form.validateFields().then((values) => {
            if ((time.map((o, i) => {
                if (o.startTime < o.endTime || o.startTime === '00:00' || o.endTime === '00:00') {
                    return true
                } else {
                    return false
                }
            }).indexOf(false) >= 0)) {
                notification.open({
                    message: utils.intl('结束时间必须大于开始时间'),
                });
            } else {
                dispatch({
                    type: 'alarmNotification/save',
                    payload: {
                        ...values,
                        dateTime: time,
                    },
                });
            }

        });
    }
    const addTime = () => {
        let results = [...time];
        results.push({ endTime: '00:00', startTime: results[results.length - 1].endTime })
        dispatch({
            type: 'alarmNotification/updateState',
            payload: {
                time: results
            },
        });
    }
    const deleteTime = (e, index) => {
        let results = [...time];
        results.splice(index, 1)
        dispatch({
            type: 'alarmNotification/updateState',
            payload: {
                time: results
            },
        });
    }
    const updateStartTime = (e, index, value) => {
        let results = [...time];
        results[index].startTime = value
        dispatch({
            type: 'alarmNotification/updateState',
            payload: {
                time: results
            },
        });
    }
    const updateEndTime = (e, index, value) => {
        let results = [...time];
        results[index].endTime = value
        dispatch({
            type: 'alarmNotification/updateState',
            payload: {
                time: results
            },
        });
    }
    let timeArr = time.map((o, i) => {
        return (
            <div className='time' key={i} style={{ position: 'relative', paddingTop: i !== 0 ? '14px' : '0px' }}>
                <TimePicker format={'HH:mm'}
                    minuteStep={15}
                    allowClear={false}
                    defaultOpenValue={moment('00:00', 'HH:mm')}
                    value={moment(o.startTime, 'HH:mm')}
                    onChange={(e, value) => updateStartTime(e, i, value)}
                />
                <span className='xian' style={{ paddingLeft: '19px', paddingRight: '19px' }}>~</span>
                <TimePicker format={'HH:mm'}
                    allowClear={false}
                    minuteStep={15}
                    defaultOpenValue={moment('00:00', 'HH:mm')}
                    value={moment(o.endTime, 'HH:mm')}
                    onChange={(e, value) => updateEndTime(e, i, value)}
                />
                {i === 0 ?
                    <div onClick={addTime} style={{ right: '-20px', position: 'absolute', top: '2px', cursor: 'pointer' }}  >
                        <PlusCircleTwoTone />
                    </div>
                    :
                    <div onClick={(e)=>deleteTime(e,i)} style={{ right: '-20px', position: 'absolute', top: '16px', cursor: 'pointer' }} >
                        <MinusCircleTwoTone twoToneColor={'#ff4d4f'} />
                    </div>}
            </div>
        )
    });
    return (
        <Modal centered maskClosable={false} bodyStyle={{ color: 'white' }} width={'600px'} visible={notificationModal}
            title={modalTitle} onOk={handleSubmit} onCancel={cancel} wrapClassName={'customerModal'}>
            <div style={{ paddingLeft: '90px' }}>
                <Form
                    initialValues={{
                        receiveName: record.receiveName || '',
                        phone: record.phone || ''
                    }}
                    form={props.form}
                    layout={'vertical'}
                    autoComplete="off">
                    <Row>
                        <Col span={16}>
                            <FormItem
                                name="receiveName"
                                rules={[
                                    {
                                        required: true,
                                        message: utils.intl('请输入短信接收人姓名'),
                                    },
                                    {
                                        max: 16,
                                        message: utils.intl('姓名不能超过16个字符'),
                                    },
                                ]}
                                {...formItemLayout}
                                label={utils.intl('短信接收人姓名')}><Input autoComplete="off" /></FormItem>

                        </Col>
                    </Row>
                    <Row>
                        <Col span={16}>
                            <FormItem
                                name="phone"
                                rules={[
                                    {
                                        required: true,
                                        message: utils.intl('请输入手机号'),
                                    },
                                    checkMobile()
                                ]}
                                {...formItemLayout}
                                label={utils.intl('手机号(+86):')}><Input autoComplete="off" /></FormItem>

                        </Col>
                    </Row>
                    <Row>
                        <Col span={16}>
                            <FormItem
                                name="dateTime"
                                {...formItemLayout}
                                label={utils.intl('短信接收时间')}>
                                {timeArr}
                            </FormItem>
                        </Col>
                    </Row>

                </Form>
            </div>
        </Modal>
    );
};

//绑定layout model ，获取title
function mapStateToProps(state) {
    return {
        ...state.alarmNotification
    };
}

const _FormRes = FormContainer.create()(_Form);
export default connect(mapStateToProps)(_FormRes);