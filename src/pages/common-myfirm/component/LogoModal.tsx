import React, { Component, useState, useEffect } from 'react';
import { Input, Select, Row, Col, Form, Checkbox, Modal, DatePicker, message, FormContainer, Table1, Table2, Button } from 'wanke-gui';
import { makeConnect } from '../../umi.helper'
import utils from '../../../public/js/utils';
import { disabledDateAfterNow } from '../../../util/dateUtil';
import { numberRangePrecisionRule } from '../../../util/ruleUtil'
import moment from 'moment';
import '../style/logoModal.less'
import { WankeFirmCloseOutlined } from 'wanke-icon';

const FormItem = Form.Item;

const _Form = props => {
    const { visible, theme } = props;

    useEffect(() => {
    }, [])

    return (
        <Modal centered maskClosable={true} bodyStyle={{ color: 'white' }} visible={visible}
            title={utils.intl('logo样式')} onCancel={() => props.cancel()}
            footer={false} wrapClassName={'logoModal'} closeIcon={<img src={props.theme === 'light-theme' ? require('../close-firm.svg') : require('../black-close-firm.svg')} />}
        >
            <img style={{ width: 620 }} src={require('../logoModal.png')} />
        </Modal >
    );
};

export default _Form