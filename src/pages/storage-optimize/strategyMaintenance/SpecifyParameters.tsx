import React, { Component, useState, useEffect } from 'react';
import { Form, Modal, FormContainer, Table1, message, Table, Input, Row, Col } from 'wanke-gui';
import utils from '../../../public/js/utils';
import AbsoluteBubble from '../../../components/AbsoluteBubble';
import TableEdit from './TableEdit'
import Header from './Header/index';

const FormItem = Form.Item;

const _Form = props => {
    const { visible, strategyParams, theme, strategyId, stationId, strategyName, updateState, getStrategyParamsSuccess, selectId } = props;
    const [form] = Form.useForm();
    let [selectedRowKeys, setSelectedRowKeys] = useState([])
    let [params, setParams] = useState(strategyParams.details || [])
    let [postStatus, setPostStatus] = useState(true)
    let [show, setShow] = useState(false)

    useEffect(() => {
        if (props.stationId) {
            let energyUnitTypeNames = ''
            switch (strategyName) {
                case 'C01':
                    energyUnitTypeNames = 'Storage'
                    break;
                case 'C05':
                case 'C06':
                    energyUnitTypeNames = 'Storage'
                    break;
                case 'C07':
                    energyUnitTypeNames = 'Storage,Solar,Generation'
                    break;
                case 'C19':
                    energyUnitTypeNames = 'Storage,Solar,Generation,WindPower'
                    break;
                default:
                    break;
            }

            props.action('getStrategyParams', { stationId, runStrategyId: strategyId, energyUnitTypeNames })
        }
    }, [props.stationId])

    useEffect(() => {
        setSelectedRowKeys(selectId)
    }, [selectId])

    useEffect(() => {
        if (getStrategyParamsSuccess) {
            setParams(strategyParams.details)
            setShow(true)
        }
    }, [getStrategyParamsSuccess])



    async function handleSubmit(e) {
        if (postStatus) {
            e.preventDefault();
            form.validateFields().then((values) => {
                let postParams = strategyParams
                postParams.controlPid = values.controlPid
                postParams.voltagePid = values.voltagePid
                postParams.details.map((o, i) => {
                    if (selectedRowKeys.indexOf(o.energyUnitId) !== -1) {
                        o.enable = true
                    } else {
                        o.enable = false
                    }
                    o.activePowerPid = params[i]?.activePowerPid
                    o.reactivePowerPid = params[i]?.reactivePowerPid
                })
                props.action('putStrategyParams', { stationId, id: postParams.id, postParams: postParams, runStrategyId: strategyId })
            })
        } else {
            message.error(utils.intl('表单填写不规范'))
        }
    }
    //选择框回调
    const callback = (params, selectedRowKeys) => {
        let newStrategyParams = JSON.parse(JSON.stringify(strategyParams))
        newStrategyParams.details = params;
        newStrategyParams.details.map((o, i) => {
            if (selectedRowKeys.indexOf(o.energyUnitId) !== -1) {
                o.enable = true
            } else {
                o.enable = false
            }
        })
        setParams(params)
        setSelectedRowKeys(selectedRowKeys)
        updateState({ strategyParams: newStrategyParams })
    }

    const formItemLayout = {
        wrapperCol: { span: 20 }
    }

    let color = theme === 'dark-theme' ? 'rgba(255,255,255,0.85)' : 'rgba(5,10,25,0.45)'
    let language = localStorage.getItem('language');
    return (
        <Modal centered maskClosable={false} bodyStyle={{ color: 'white' }} width={'800px'} visible={show}
            title={utils.intl('指定参数')}
            onOk={handleSubmit} onCancel={() => { props.cancel(); setShow(false) }} wrapClassName={'customerModal'}
        >
            <div style={{ maxHeight: 400 }}>
                <div className="flex-grow f-pr" >
                    <Header title={utils.intl('适用对象')}>
                    </Header>
                    <TableEdit dataSource={strategyParams.details || []} strategyName={strategyName} callback={callback}
                        isPost={() => setPostStatus(true)} notPost={() => setPostStatus(false)} selectedRowKeys={selectedRowKeys}
                    />
                </div>
            </div>
            {strategyName === 'C05' || strategyName === 'C06' ?
                <div style={{ marginTop: 16 }}>
                    <Header title={utils.intl('控制指令')}>
                    </Header>
                    <Form form={form} layout={language === 'zh' ? 'horizontal' : 'vertical'} autoComplete="off"
                        labelCol={undefined}
                        initialValues={{
                            controlPid: strategyParams.controlPid
                        }}>
                        <Row>
                            <Col span={10}>
                                <FormItem
                                    name="controlPid"
                                    {...formItemLayout}
                                    label={utils.intl('指令值')}><Input autoComplete="off" /></FormItem>
                            </Col>
                        </Row>
                    </Form>
                </div>
                : ""}
            {strategyName === 'C07' ?
                <div style={{ marginTop: 16 }}>
                    <Form form={form} layout={language === 'zh' ? 'horizontal' : 'vertical'} autoComplete="off"
                        labelCol={undefined}
                        initialValues={{
                            controlPid: strategyParams.controlPid
                        }}>
                        <Header title={utils.intl('控制指令(调度模式)')}>
                        </Header>
                        <Row>
                            <Col span={10}>
                                <FormItem
                                    name="controlPid"
                                    {...formItemLayout}
                                    label={utils.intl('指令值')}><Input autoComplete="off" /></FormItem>
                            </Col>
                        </Row>
                        <Header title={utils.intl('电压监测点(远程模式、就地模式)')}>
                        </Header>
                        <Row>
                            <Col span={10}>
                                <FormItem
                                    name="voltagePid"
                                    {...formItemLayout}
                                    label={utils.intl('电压监测点')}><Input autoComplete="off" /></FormItem>
                            </Col>
                        </Row>
                    </Form>
                </div>
                : ""}
        </Modal>
    );
};

export default _Form