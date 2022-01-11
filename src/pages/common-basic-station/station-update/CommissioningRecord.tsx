import React, { Component, useState, useEffect } from 'react';
import { Input, Select, Row, Col, Form, Checkbox, Modal, DatePicker, message, FormContainer, Table1, Table2, Button } from 'wanke-gui';
import { makeConnect } from '../../umi.helper'
import utils from '../../../public/js/utils';
import { disabledDateAfterNow } from '../../../util/dateUtil';
import { numberRangePrecisionRule } from '../../../util/ruleUtil'
import moment from 'moment';

const FormItem = Form.Item;

const _Form = props => {
    const { visible, debugLogs, deviceId, getDeviceDebugLoading } = props;

    useEffect(() => {
        props.action('getDeviceDebug', { deviceId })
    }, [])

    const columns: any = [
        {
            title: utils.intl('序号'), dataIndex: 'num', width: 80, align: 'center'
        },
        {
            title: utils.intl('时间'), dataIndex: 'dtime', width: 250
        },
        {
            title: utils.intl('动作'), dataIndex: 'actionTitle'
        },
        {
            title: utils.intl('操作人'),
            dataIndex: 'userTitle',
        },
    ]

    const onExport = () => {
        props.action('exportDeviceDebug', { deviceId, columns })
    }
    return (
        <Modal centered maskClosable={true} bodyStyle={{ color: 'white' }} width={'700px'} visible={visible}
            title={utils.intl('调试记录')} onCancel={() => props.cancel()}
            footer={false} wrapClassName={'customerModal'}
        >
            <Button
                onClick={onExport}
                type="primary"
                style={{ float: 'right', marginBottom: 5 }}
            >
                {utils.intl('导出')}
            </Button>
            <div className="flex1" style={{ width: '100%', height: '300px' }}>
                <Table1
                    dataSource={debugLogs}
                    columns={columns}
                    x={500}
                    rowKey="num"
                    loading={getDeviceDebugLoading}
                />
            </div >
        </Modal >
    );
};
// //绑定layout model ，获取title
// function mapStateToProps(model, getLoading, state) {
//     return {
//         ...model,
//         saveLoading: getLoading('save')
//     };
// }

// // const _FormRes = FormContainer.create()(_Form);
export default _Form