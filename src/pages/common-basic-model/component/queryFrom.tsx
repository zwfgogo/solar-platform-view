import React, { Component, useState } from 'react';
import { Input, Select, Row, Col, Form, Checkbox, Modal } from 'wanke-gui';
import { connect } from 'dva';
import { FormContainer } from '../../../components/input-item/InputItem'
import { makeConnect } from '../../umi.helper'
import {
    PlusCircleTwoTone,
    MinusCircleTwoTone
} from '@ant-design/icons';
import TextItem from '../../../components/input-item/TextItem'
import utils from '../../../public/js/utils';

const FormItem = Form.Item;

const _Form = props => {
    const { dispatch, queryModal, record, modalTitle, arr, energyUnits, devProperties, yesOrNo, numberType, numberTypeString, elementType } = props;
    const [form] = Form.useForm();
    const cancel = () => {
        dispatch({
            type: 'modelConfig/updateState',
            payload: {
                queryModal: false,
            },
        });
    };

    async function handleSubmit(e) {
        dispatch({
            type: 'modelConfig/updateState',
            payload: {
                queryModal: false,
            },
        });
    }
    let enumValuesInfo = record.enumValues && record.enumValues.map((o, i) => {
        return (
            <p style={{ marginTop: '5px' }}>{o.name + '-' + o.title}</p>
        )
    })
    return (
        <Modal centered maskClosable={false} bodyStyle={{ color: 'white' }} width={'700px'} visible={queryModal}
            title={utils.intl('定义技术参数')} footer={false} onCancel={cancel} wrapClassName={'customerModal'}>
            <div style={{ paddingLeft: '40px' }}>
                <Form form={form} layout={'horizontal'} autoComplete="off">
                    <Row>
                        <Col span={12}>
                            <FormItem
                                label={utils.intl('顺序号')}><span>{record.num}</span></FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                label={utils.intl('属性名称')}><span>{record.title}</span></FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                label={utils.intl('标识符号')}><span>{record.symbol}</span></FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                label={utils.intl('数据类型')}><span>{record.dataTypeTitle}</span></FormItem>
                        </Col>
                        {(() => {
                            switch (record.dataType && record.dataType.name) {
                                case 'int32':
                                case 'float':
                                case 'double':
                                    return (
                                        <Col span={24}>
                                            <FormItem
                                                style={{ float: 'left', width: '50%' }}
                                                label={utils.intl('取值范围')}><span>{record.min + '~' + record.max}</span></FormItem>
                                            <FormItem
                                                style={{ float: 'left', width: '50%' }}
                                                label={utils.intl('步长')}><span>{record.step}</span></FormItem>
                                            <FormItem
                                                style={{ float: 'left', width: '50%' }}
                                                label={utils.intl('默认单位')}><span>{record.unit && record.unit.title}</span></FormItem>
                                            <FormItem
                                                style={{ float: 'left', width: '50%' }}
                                                label={utils.intl('是否必填')}><span>{record.mustFill ? utils.intl('是') : utils.intl('否')}</span></FormItem>
                                        </Col>
                                    );
                                    break;
                                case 'enum':
                                    return (
                                        <Col span={12}>
                                            <FormItem label={utils.intl('枚举项')}>
                                                <span>{enumValuesInfo}</span>
                                            </FormItem>
                                        </Col>
                                    )
                                    break;
                                case 'bool':
                                    return (
                                        <Col span={12}>
                                            <FormItem
                                                label={utils.intl('布尔值')}><span>{'0-' + record.boolValues['false'] + ',' + '1-' + record.boolValues['true']}</span></FormItem>
                                        </Col>
                                    );
                                    break;
                                case 'text':
                                    return (
                                        <Col span={12}>
                                            <FormItem
                                                label={utils.intl('数据长度')}><span>{record.length}</span></FormItem>
                                        </Col>
                                    );
                                    break;
                                case 'date':
                                    return (
                                        <Col span={24}>
                                            <FormItem
                                                style={{ float: 'left', width: '50%' }}
                                                label={utils.intl('时间精度')}><span>{record.timeAccuracyTitle}</span></FormItem>
                                        </Col>
                                    );
                                    break;
                                case 'array':
                                    return (
                                        <Col span={24}>
                                            <FormItem
                                                style={{ float: 'left', width: '50%' }}
                                                label={utils.intl('元素类型')}><span>{record.arrayType && record.arrayType.title}</span></FormItem>
                                            <FormItem
                                                style={{ float: 'left', width: '50%' }}
                                                label={utils.intl('元素数量')}><span>{record.arraySize}</span></FormItem>
                                            <FormItem
                                                style={{ float: 'left', width: '50%' }}
                                                label={utils.intl('单位')}><span>{record.unit && record.unit.title}</span></FormItem>
                                        </Col>
                                    );
                                    break;
                                    defalut:
                                    break;
                            }
                        })()}
                        {record.dataType.name === 'int32' || record.dataType.name === 'float' || record.dataType.name === 'double' ? '' :
                            <Col span={12}>
                                <FormItem
                                    label={utils.intl('是否必填')}><span>{record.mustFill ? utils.intl('是') : utils.intl('否')}</span></FormItem>
                            </Col>
                        }
                        <Col span={24}>
                            <FormItem
                                label={utils.intl('描述')}><span>{record.description}</span></FormItem>
                        </Col>
                    </Row>
                </Form>
            </div>
        </Modal>
    );
};
//绑定layout model ，获取title
function mapStateToProps(model, e, state) {
    return {
        ...model
    };
}

export default makeConnect('modelConfig', mapStateToProps)(_Form)