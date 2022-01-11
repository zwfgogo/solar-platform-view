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
    const { dispatch, dealModal, record } = props;
    const cancel = () => {
        dispatch({
            type: 'orderdeal/updateState',
            payload: {
                dealModal: false,
            },
        });
    };
    const formItemLayout = {
        wrapperCol: { span: 21 },
    };

    async function handleSubmit(e) {
        e.preventDefault();
        props.form.validateFields().then((values) => {
            dispatch({
                type: 'orderdeal/getDeal',
                payload: {
                    values,
                },
            });
            // dispatch({
            //   type: 'updateState',
            //   payload: {
            //     data: { ...data, ...values },
            //   },
            // });
        });
    }

    return (
        <Modal centered maskClosable={false} bodyStyle={{ color: 'white' }} width={'700px'} visible={dealModal}
            title={utils.intl('处理日志')} onOk={handleSubmit} onCancel={cancel} wrapClassName={'customerModal'}>
            <div style={{ paddingLeft: '16px' }}>
                <Form
                    initialValues={{
                        resultDesc: record.resultDesc || ''
                    }}
                    form={props.form}
                    layout={'vertical'}
                    autoComplete="off">
                    <Row>
                        <Col span={24}>
                            <FormItem
                                colon={false}
                                name="resultDesc"
                                rules={[
                                    {
                                        max: 500,
                                        min: 4,
                                        required: true,
                                        message: utils.intl('请输入4~500位字符'),
                                    },
                                ]}
                                {...formItemLayout}
                                label={utils.intl('处理日志')}><Input.TextArea style={{ resize: "none", height: '120px' }} placeholder={utils.intl('请输入处理日志')}
                                    autoComplete="off" /></FormItem>
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
        ...state.orderdeal
    };
}

const _FormRes = FormContainer.create()(_Form);
export default connect(mapStateToProps)(_FormRes);