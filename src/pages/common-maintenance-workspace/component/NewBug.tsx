/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React from 'react'
import { Row, Col, Form, Modal, Select, Input, DatePicker } from 'wanke-gui'
import { connect } from 'dva'
import moment, { Moment } from 'moment'

import { createFlexableFormItem } from "../../../components/FlexFormItem"
import { FormContainer } from "../../../components/input-item/InputItem"
import utils from "../../../public/js/utils";
import { isZh } from '../../../core/env'

const FormItem = createFlexableFormItem(Form.Item)

const _Form = props => {
    const { dispatch, visible, record, stationOptions } = props
    const cancel = () => {
        dispatch({
            type: 'workspace_list/updateState',
            payload: {
                showUpdateBug: false
            }
        })
    }
    const formItemLayout = {
        wrapperCol: { span: isZh() ? 21 : 24 }
    }
    async function handleSubmit(e) {
        e.preventDefault()
        props.form.validateFields().then((values) => {
            dispatch({
                type: 'workspace_list/addBug',
                payload: {
                    values: {
                        ...values,
                        startTime: values.startTime?.format('YYYY-MM-DD 00:00:00')
                    }
                }
            })
        })
    }
    const disabledDate = (current) => {
        let d = new Date()
        let date = d.getFullYear() + '-' + (d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)) + '-' + (d.getDate() < 10 ? '0' + d.getDate() : d.getDate())
        return current > moment(date, 'YYYY-MM-DD').endOf('day')
    }
    return (
        <Modal centered
            confirmLoading={props.newLoading}
            maskClosable={false}
            bodyStyle={{ color: 'white' }}
            width={480} visible={visible}
            title={utils.intl('新增缺陷')}
            onOk={handleSubmit}
            onCancel={cancel}
        >
            <div className="fixed-label-width-form label-4" style={{/* paddingLeft: '40px' */ }}>
                <Form
                    initialValues={{
                        discoverer: JSON.parse(sessionStorage.getItem('userInfo')).title
                    }}
                    form={props.form}
                    layout={isZh() ? 'horizontal' : 'vertical'}
                    autoComplete="off">
                    <Row gutter={16}>
                        <Col span={24}>
                            <FormItem
                                name="stationId"
                                rules={[
                                    {
                                        required: true,
                                        message: utils.intl('请选择电站名称')
                                    }
                                ]}
                                {...formItemLayout}
                                label={utils.intl('电站名称')}><Select
                                    dataSource={stationOptions}
                                    className={'select100'}
                                /></FormItem>

                        </Col>
                        <Col span={24}>
                            <FormItem
                                name="startTime"
                                rules={[
                                    {
                                        required: true,
                                        message: utils.intl('请选择日期')
                                    }
                                ]}
                                {...formItemLayout}
                                label={utils.intl('发现日期')}><DatePicker disabledDate={disabledDate}
                                    allowClear={false}
                                    className={'select100'}
                                /></FormItem>
                        </Col>
                        <Col span={24}>
                            <FormItem
                                name="discoverer"
                                rules={[
                                    {
                                        max: 16,
                                        required: true,
                                        message: utils.intl('请输入发现人')
                                    },
                                ]}
                                {...formItemLayout}
                                label={utils.intl('发现人')}><Input disabled autoComplete="off" /></FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>

                            <FormItem
                                name="bugContent"
                                rules={[
                                    {
                                        max: 500,
                                        required: true,
                                        message: utils.intl('请输入不超过500字符描述')
                                    }
                                ]}
                                label={utils.intl('缺陷内容')}><Input.TextArea style={{ resize: 'none', height: '120px' }} placeholder={utils.intl('请输入不超过500字符描述')}
                                    autoComplete="off" /></FormItem>

                        </Col>
                    </Row>
                </Form>
            </div>
        </Modal>
    );
}

function mapStateToProps(state) {
    return {
        ...state.workspace_list
    }
}

const _FormRes = FormContainer.create()(_Form)
export default connect(mapStateToProps)(_FormRes)