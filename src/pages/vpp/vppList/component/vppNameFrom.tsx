/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React, {Component, useState} from 'react';
import {Input, Row, Col, Form, Checkbox, Modal} from 'wanke-gui';
import {connect} from 'dva';
import { FormContainer } from '../../../../components/input-item/InputItem'
import DatePicker from '../../../../components/date-picker'

const FormItem = Form.Item;

const _Form = props => {
    const {dispatch, vppNameModal, record,modalTitle} = props;
    const cancel = () => {
        dispatch({
            type: 'vpp/updateState',
            payload: {
                vppNameModal: false
            },
        });
    };
    const formItemLayout = {
        wrapperCol: {span: 23},
    };
    async function handleSubmit(e) {
        e.preventDefault();
        props.form.validateFields().then((values) => {
                dispatch({
                    type: 'vpp/save',
                    payload: {
                        values,
                    },
                });
        });
    }
    return (
        <Modal centered maskClosable={false} bodyStyle={{color: 'white'}} width={'500px'} visible={vppNameModal}
               title={modalTitle} onOk={handleSubmit} onCancel={cancel} wrapClassName={'customerModal'}>
            <div style={{paddingLeft: '90px'}}>
                <Form
                    initialValues={{
                        title: record.title || ''
                    }}
                    form={props.form}
                    layout={'vertical'}
                    autoComplete="off">
                    <Row>
                        <Col span={16}>
                            <FormItem
                                name="title"
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入VPP名',
                                    },
                                    {
                                        max: 32,
                                        message: 'VPP名不能超过32个字符',
                                    },
                                ]}
                                {...formItemLayout}
                                label={`VPP名`}><Input autoComplete="off"/></FormItem>
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
        ...state.vpp
    };
}

const _FormRes = FormContainer.create()(_Form);
export default connect(mapStateToProps)(_FormRes);