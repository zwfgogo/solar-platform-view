import React, { Component, useState, useEffect } from 'react';
import { Input, Select, Row, Col, Form, Checkbox, Modal, DatePicker } from 'wanke-gui';
import { makeConnect } from '../../umi.helper'
import utils from '../../../public/js/utils';
import { disabledDateAfterNow } from '../../../util/dateUtil';
import { numberRangePrecisionRule } from '../../../util/ruleUtil'
import moment from 'moment';

const FormItem = Form.Item;

const _Form = props => {
    const { dispatch, visible, saveLoading, recordDetail, detail, time } = props;

    const [type, setType] = useState(recordDetail.type || 'Maintenance')
    const [contentArr, setContentArr] = useState([])
    const [form] = Form.useForm();
    const [deviceCategories, setDeviceCategories] = useState('')

    const cancel = () => {
        props.cancel();
    };

    useEffect(() => {
        dispatch({
            type: 'stationRecordModel/getEnums',
        }).then(res => {
            setContentArr(res)
        });
        dispatch({
            type: 'stationRecordModel/getDeviceCategoriesByDeviceId', payload: { deviceId: props.detail?.id }
        }).then(res => {
            setDeviceCategories(res?.name)
        });
    }, [])

    const formItemLayout = {
        wrapperCol: { span: 18 }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        form.validateFields().then((values) => {
            if (recordDetail.id) {
                props.action('putRecord', { ...values, id: recordDetail.id, deviceId: props.detail?.id, dtime: values.dtime.format('YYYY-MM-DD hh:mm:ss') })
            } else {
                props.action('postRecord', { ...values, deviceId: props.detail?.id, dtime: values.dtime.format('YYYY-MM-DD hh:mm:ss') })
            }
        })
    }

    const operationSelect = (o) => {
        setType(o)
    }

    let language = localStorage.getItem('language');

    let powerDom: any = ''
    let afterLabel, beforeLabel = ''
    if (deviceCategories === 'ConverterInverter') {
        powerDom = <Input style={{ width: 260 }} suffix="kW" />
        beforeLabel = '?????????????????????'
        afterLabel = '?????????????????????'
    } else if (deviceCategories === 'Transformer') {
        powerDom = <Input style={{ width: 260 }} suffix="kVA" />
        beforeLabel = '???????????????'
        afterLabel = '???????????????'
    } else if (deviceCategories === 'LithiumIonBattery' || deviceCategories === 'LeadCarbonBattery') {
        powerDom = <Input style={{ width: 260 }} suffix="Ah" />
        beforeLabel = '???????????????'
        afterLabel = '???????????????'
    }
    let nowDate = time.year + '-' + time.month + '-' + time.day + ' ' + time.time

    return (
        <Modal centered maskClosable={false} bodyStyle={{ color: 'white' }} width={'680px'} visible={visible}
            title={utils.intl('??????????????????')} onOk={handleSubmit} onCancel={cancel} wrapClassName={'customerModal'} confirmLoading={saveLoading}>
            <div style={{ paddingLeft: language !== 'zh' ? '40px' : '0', paddingRight: language !== 'zh' ? '0' : '40px' }}>
                <Form form={form} layout={language === 'zh' ? 'horizontal' : 'vertical'} autoComplete="off"
                    labelCol={language === 'zh' ? { span: 6 } : undefined}
                    initialValues={{
                        type: recordDetail.type || 'Maintenance',
                        dtime: recordDetail.dtime ? moment(recordDetail.dtime) : moment(nowDate),
                        remarks: recordDetail.remarks,
                        beforeValue: recordDetail.beforeValue,
                        afterValue: recordDetail.afterValue,
                    }}
                >
                    <Row>
                        <Col span={24}>
                            <FormItem
                                name="dtime"
                                rules={[{ required: true, message: utils.intl('???????????????') }]}
                                {...formItemLayout}
                                label={utils.intl('??????')}>
                                <DatePicker
                                    disabledDate={current => disabledDateAfterNow(current)}
                                    // className={'select100'}
                                    allowClear={false}
                                    showTime={{ format: 'HH:mm' }}
                                    style={{ width: 260 }}
                                />
                            </FormItem>
                        </Col>
                        <Col span={24}>
                            <FormItem
                                name="type"
                                rules={[{ required: true, message: utils.intl('?????????????????????') }]}
                                {...formItemLayout}
                                label={utils.intl('????????????')}>
                                <Select onSelect={operationSelect} style={{ width: 260 }} dataSource={contentArr} />
                            </FormItem>
                        </Col>
                        {type === 'Replace' && powerDom
                            &&
                            <Col span={24}>
                                <FormItem
                                    name="beforeValue"
                                    rules={[{ required: true, message: utils.intl('????????????????????????') }, numberRangePrecisionRule(0, 999999, 2)]}
                                    {...formItemLayout}
                                    label={utils.intl(beforeLabel)}>
                                    {powerDom}
                                </FormItem>
                            </Col>
                        }
                        {type === 'Replace' && powerDom
                            &&
                            <Col span={24}>
                                <FormItem
                                    name="afterValue"
                                    rules={[{ required: true, message: utils.intl('????????????????????????') }, numberRangePrecisionRule(0, 999999, 2)]}
                                    {...formItemLayout}
                                    label={utils.intl(afterLabel)}>
                                    {powerDom}
                                </FormItem>
                            </Col>
                        }
                        <Col span={24}>
                            <FormItem
                                name="remarks"
                                rules={[{ required: false }]}
                                {...formItemLayout}
                                label={utils.intl('??????')}>
                                <Input.TextArea style={{ resize: 'none', height: '120px', width: language === 'zh' ? 440 : 550 }}
                                    placeholder={utils.intl('???????????????')}
                                    autoComplete="off" />
                            </FormItem>
                        </Col>
                    </Row>
                </Form>
            </div>
        </Modal >
    );
};

// //??????layout model ?????????title
// function mapStateToProps(model, getLoading, state) {
//     return {
//         ...model,
//         saveLoading: getLoading('save')
//     };
// }

export default _Form