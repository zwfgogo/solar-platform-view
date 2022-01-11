/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React, { Component, useState } from 'react';
import { Input, message, Row, Col, Form, Button, Modal } from 'wanke-gui';
import { connect } from 'dva';
import { FormContainer } from "../../../components/input-item/InputItem"
import { createFlexableFormItem } from "../../../components/FlexFormItem";
import utils from "../../../public/js/utils";

// const FormItem = Form.Item;
const FormItem = createFlexableFormItem(Form.Item)

const _Form = props => {
    const { dispatch, queryModal, record } = props;
    const cancel = () => {
        dispatch({
            type: 'orderdeal/updateState',
            payload: {
                queryModal: false,
            },
        });
    };
    const formItemLayout = {
        wrapperCol: { span: 24 },
    };

    return (
        <Modal centered maskClosable={false} bodyStyle={{ color: 'white' }} width={480} visible={queryModal}
            title={utils.intl('查看工单')} onCancel={cancel} wrapClassName={'customerModal'}
            footer={null}
        >
            <div className="dispatch-view" style={{ paddingLeft: '16px' }}>
                <Form autoComplete="off">
                    <Row>
                        <Col span={24}>
                            <FormItem flexAble label={utils.intl('设备对象')}>
                                <span>{record.devTitle}</span>
                            </FormItem>
                        </Col>
                        <Col span={24}>
                            <FormItem flexAble label={utils.intl('工单状态')}>
                                <span>{record.statusTitle}</span>
                            </FormItem>
                        </Col>
                        <Col span={24}>
                            <FormItem flexAble label={utils.intl('工单类型')}>
                                <span>{record.typeTitle}</span>
                            </FormItem>
                        </Col>
                        <Col span={24}>
                            <FormItem flexAble label={utils.intl('处理人员')}>
                                <span>{record.userTitleProcess}</span>
                            </FormItem>
                        </Col>
                        <Col span={24}>
                            <FormItem flexAble label={utils.intl('工单名称')}>
                                <span>{record.orderName}</span>
                            </FormItem>
                        </Col>
                        <Col span={24}>
                            <FormItem flexAble label={utils.intl('工单描述')}>
                                <span>{record.description}</span>
                            </FormItem>
                        </Col>
                        <Col span={24}>
                            <FormItem flexAble label={utils.intl('处理日志')}>
                                <span>{record.resultDesc}</span>
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
        ...state.orderdeal
    };
}

const _FormRes = FormContainer.create()(_Form);
export default connect(mapStateToProps)(_FormRes);