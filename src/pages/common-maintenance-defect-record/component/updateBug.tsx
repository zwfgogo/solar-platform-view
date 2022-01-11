/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React from 'react'
import { Row, Col, Form, Modal, Select, Input, DatePicker } from 'wanke-gui'
import { connect } from 'dva'
import moment, { Moment } from 'moment'
import styles from './index.less'
import { createFlexableFormItem } from "../../../components/FlexFormItem"
import { FormContainer } from "../../../components/input-item/InputItem"
import utils from "../../../public/js/utils";
import { isZh } from '../../../core/env'

const FormItem = createFlexableFormItem(Form.Item)

const _Form = props => {
    const { dispatch, showUpdateBug, record, stationOptions } = props
    const cancel = () => {
        dispatch({
            type: 'defectRecord/updateState',
            payload: {
                showUpdateBug: false
            }
        })
    }
    const formItemLayout = {
        wrapperCol: { span: 21 }
    }
    async function handleSubmit(e) {
        e.preventDefault()
        props.form.validateFields().then((values) => {
            const data = { ...values }
            data.endTime = values.endTime?.format("YYYY-MM-DD 00:00:00")
            dispatch({
                type: 'defectRecord/updateBug',
                payload: {
                    values: data
                }
            })
        })
    }

    const disabledDate = (current) => {
        const { startTime } = props
        let d = new Date()
        let date = d.getFullYear() + '-' + (d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)) + '-' + (d.getDate() < 10 ? '0' + d.getDate() : d.getDate())
        return current < moment(startTime, 'YYYY-MM-DD').startOf('day') || current > moment(date, 'YYYY-MM-DD').endOf('day')
    }
    return (
        <Modal centered
            className={styles.runModal}
            confirmLoading={props.newLoading}
            maskClosable={false}
            bodyStyle={{ color: 'white' }}
            width={500} visible={showUpdateBug}
            title={utils.intl('消除缺陷')}
            onOk={handleSubmit}
            onCancel={cancel}
        >
            <div style={{ paddingRight: '20px' }}>
                <Form
                    initialValues={{
                        processer: JSON.parse(sessionStorage.getItem('userInfo')).title,
                        bugStationId: record.stationId,
                        bugDate: record.startTime,
                        endTime: record.endTime
                    }}
                    form={props.form}
                    layout={isZh() ? 'horizontal' : 'vertical'}
                    autoComplete="off">
                    <Row>
                        <Col span={24}>
                            <FormItem
                                name="processer"
                                rules={[
                                    {
                                        max: 16,
                                        required: true,
                                        message: utils.intl('请输入消除人')
                                    }
                                ]}
                                {...formItemLayout}
                                label={utils.intl('消除人')}><Input disabled autoComplete="off" /></FormItem>
                        </Col>
                        <Col span={24}>
                            <FormItem
                                name="endTime"
                                rules={[
                                    {
                                        required: true,
                                        message: utils.intl('请选择日期')
                                    }
                                ]}
                                {...formItemLayout}
                                label={utils.intl('消除日期')}><DatePicker disabledDate={disabledDate}
                                    allowClear={false}
                                    className={'select100'}
                                /></FormItem>
                        </Col>

                    </Row>
                    <Row>
                        <Col span={24}>
                            <FormItem
                                name="acceptor"
                                rules={[
                                    {
                                        max: 16,
                                        required: true,
                                        message: utils.intl('请输入验收人')
                                    }
                                ]}
                                {...formItemLayout}
                                label={utils.intl('验收人')}><Input autoComplete="off" /></FormItem>
                        </Col>
                        <Col span={24}>
                            <FormItem
                                name="director"
                                rules={[
                                    {
                                        max: 16,
                                        required: true,
                                        message: utils.intl('请输入负责人')
                                    }
                                ]}
                                {...formItemLayout}
                                label={utils.intl('负责人')}><Input autoComplete="off" /></FormItem>
                        </Col>
                    </Row>
                </Form>
            </div>
        </Modal>
    );
}

function mapStateToProps(state) {
    return {
        ...state.defectRecord
    }
}

const _FormRes = FormContainer.create()(_Form)
export default connect(mapStateToProps)(_FormRes)