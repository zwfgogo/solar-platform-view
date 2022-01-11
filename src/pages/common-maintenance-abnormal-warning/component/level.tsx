/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React, { Component, useState } from 'react';
import { Input, message, Row, Col, Form, Radio, Modal } from 'wanke-gui';
import { connect } from 'dva';
import { FormContainer } from "../../../components/input-item/InputItem"
import utils from "../../../public/js/utils";
const RadioGroup = Radio.Group;

const _Form = props => {
    const { dispatch, levelModal, getAlarmLevel, alarmLevel, selectedRowKeys } = props;
    const cancel = () => {
        dispatch({
            type: 'abnormalWarning/updateState',
            payload: {
                levelModal: false,
            },
        });
    };

    async function handleSubmit(e) {
        dispatch({
            type: 'abnormalWarning/patchList',
            payload: { alarmLevelId: getAlarmLevel, idList: selectedRowKeys }
        });
    }
    const radioChange = (o) => {
        dispatch({
            type: 'abnormalWarning/updateState',
            payload: { getAlarmLevel: o.target.value }
        });
    };
    let radioArrRes = alarmLevel.map((o, i) => {
        return (
            <Radio value={o.value}>
                <span style={{ color: (i + 1) === getAlarmLevel ? '#3a75f8' : 'inherit' }}>
                    {o.name + '(' + o.description + ')'}
                </span>
            </Radio>
        )
    });
    return (
        <Modal centered maskClosable={false} bodyStyle={{ color: 'white' }} width={'550px'}
            visible={levelModal} title={utils.intl('切换告警级别')} onOk={handleSubmit} onCancel={cancel}
            wrapClassName={'groupmodal'}>
            <div>
                <RadioGroup onChange={radioChange} value={getAlarmLevel}>
                    {radioArrRes}
                </RadioGroup>
            </div>
        </Modal>
    );
};
//绑定layout model ，获取title
function mapStateToProps(state) {
    return {
        ...state.abnormalWarning
    };
}
const _FormRes = FormContainer.create()(_Form); //解决了getFieldDecorator无法定义;
export default connect(mapStateToProps)(_FormRes);