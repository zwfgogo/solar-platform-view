import React, { useState, useEffect } from "react";
import styles from "./index.less";
import Page from "../../../components/Page";
import classnames from 'classnames';
import { LineChart, BarChart, Select, RangePicker, Button, Row, Col, Tabs } from 'wanke-gui'
import Card from "../../../components/Card/index";
import { makeConnect } from "../../umi.helper"
import ScattarChart from "../components/ScattarChart";
import { disabledDateAfterYesterday } from '../../../util/dateUtil'
const { TabPane } = Tabs
import moment from 'moment';
import utils from '../../../public/js/utils';

interface Props {
    dispatch: any;
    pageId: any;
    uniformity: any;
    action: any;
    uniformity2: any;
    uniformity3: any;
    selectArr: string[];
    startDate: string;
    endDate: string;
    unitValue: string;
    packValue: string;
    batteryValue: string;
    unitArr: any[];
    packArr: any[];
    batteryArr: any[];
    selectProcess: string;
    electricReFresh: boolean;
    activeTab: string;
}

const Index: React.FC<Props> = props => {
    const {
        dispatch,
        pageId,
        uniformity,
        uniformity2,
        uniformity3,
        selectArr,
        startDate,
        endDate,
        unitValue,
        packValue,
        batteryValue,
        unitArr,
        packArr,
        batteryArr,
        selectProcess,
        electricReFresh,
        activeTab
    } = props;

    useEffect(() => {
        props.action('getSelect');
        return () => {
            props.action('reset')
        }
    }, []);

    useEffect(() => {

    }, []);

    const selectChange = (o) => {
        props.action('updateToView', {
            selectProcess: o, uniformity2: {
                xData: [], yData: [[], [], []], series: [{
                    name: utils.intl('最大温升'),
                    unit: '℃/min'
                }, {
                    name: utils.intl('最小温升'),
                    unit: '℃/min'
                }, {
                    name: utils.intl('平均温升'),
                    unit: '℃/min'
                }]
            }
        })
        props.action('getScattarCurve')
    }

    const unitChange = (o) => {
        props.action('updateToView', { unitValue: o })
    }

    useEffect(() => {
        if (unitValue) {
            props.action('getPack')
        }
    }, [unitValue]);

    useEffect(() => {
        if (packValue) {
            props.action('getBattary')
        }
    }, [packValue]);

    const packChange = (o) => {
        props.action('updateToView', { packValue: o })
    }

    const batteryChange = (o) => {
        props.action('updateToView', { batteryValue: o })
    }

    const dateChange = (date, dateString) => {
        props.action('updateToView', {
            startDate: dateString[0], endDate: dateString[1], uniformity3: {
                xData: [], yData: [], series: [{
                    name: "",
                    unit: '℃'
                }]
            }
        })
        props.action('getDistributionCurve')
    }

    const tabChange = (o) => {
        props.action('updateToView', {
            electricReFresh: false, activeTab: o, uniformity: {
                xData: [], yData: [[]], series: [{
                    name: "",
                    unit: utils.intl('分')
                }]
            }
        })
        if (o === 'temperature') {
            props.action('init')
        } else {
            props.action('getUniformityCurve')
        }
        setTimeout(function () { props.action('updateToView', { electricReFresh: true }) }, 100);
    }
    const onQuery = () => {
        props.action('updateToView', {
            uniformity3: {
                xData: [], yData: [], series: [{
                    name: "",
                    unit: '℃'
                }]
            },
            uniformity: {
                xData: [], yData: [[]], series: [{
                    name: "",
                    unit: utils.intl('分')
                }]
            },
            uniformity2: {
                xData: [], yData: [[], [], []], series: [{
                    name: utils.intl('最大温升'),
                    unit: '℃/min'
                }, {
                    name: utils.intl('最小温升'),
                    unit: '℃/min'
                }, {
                    name: utils.intl('平均温升'),
                    unit: '℃/min'
                }]
            }
        })
        if (activeTab === 'temperature') {
            props.action('init')
        } else {
            props.action('getUniformityCurve')
        }
    }
    return (
        <Page pageTitle={utils.intl('电池健康特征分析')} pageId={pageId} className={classnames("bf-br5 page-bg1 e-mt5", styles.page)} showStation={false}>
            <div className="f-df flex-column batteryUniformity" style={{ height: '100%' }}>
                <Tabs onChange={tabChange} type="card" activeKey={activeTab}>
                    <TabPane tab={utils.intl('温度一致性')} key={'temperature'}>
                    </TabPane>
                    <TabPane tab={utils.intl('电压一致性')} key={'voltage'}>
                    </TabPane>
                </Tabs>
                <Row className="e-pt10 e-pb10 selectRow" style={{ backgroundColor: "#fff" }}>
                    <Col span={24} style={{ minWidth: '500px' }}>
                        <div className='e-ml20 e-mr20' style={{ float: 'left' }}>
                            <Select value={unitValue} onChange={unitChange} dataSource={unitArr}
                                label={utils.intl('设备对象') + '：'} style={{ minWidth: '163px' }} />
                        </div>
                        <div className='e-mr20' style={{ float: 'left' }}>
                            <Select value={packValue} onChange={packChange} dataSource={packArr}
                                label={''} style={{ minWidth: '163px' }} />
                        </div>
                        {batteryArr.length ? <div className='e-mr20' style={{ float: 'left' }}>
                            <Select value={batteryValue} onChange={batteryChange} dataSource={batteryArr}
                                label={''} style={{ minWidth: '163px' }} />
                        </div>
                            : ""
                        }
                        <Button type="primary" onClick={onQuery}>{utils.intl('查询')}</Button>
                    </Col>
                </Row>
                <div className="flex1 f-df flex-column" style={{ overflow: 'auto' }}>
                    <div className={'flex1'} style={{ width: '100%', height: '100%', position: 'relative', minHeight: '235px' }}>
                        <Card
                            title={activeTab === 'temperature' ? utils.intl('温度一致性评分') : utils.intl('电压一致性评分')}
                            style={{ width: '100%', height: activeTab === 'temperature' ? '100%' : '50%' }}
                        >
                            {electricReFresh && (<BarChart
                                series={uniformity.series}
                                xData={uniformity.xData}
                                yData={uniformity.yData}
                                options={{
                                    showScrollScaleArea: true, dateFormat: d => d,
                                    tooltipDateFormat: d => d
                                }}
                            />)}
                        </Card>
                    </div>
                    {activeTab === 'temperature' ?
                        <div className={'flex1'} style={{ width: '100%', height: '100%', position: 'relative', minHeight: '235px' }}>
                            <Card
                                title={utils.intl('电芯温升分布图')}
                                style={{ width: '100%', height: '100%' }}
                            >
                                <ScattarChart data={uniformity2} />
                                <div style={{ position: 'absolute', top: '0', left: '200px', lineHeight: '48px', width: 'calc(100% - 200px)' }} >
                                    <div className='e-mr20' style={{ float: 'left' }}>
                                        <Select value={selectProcess} onChange={selectChange} dataSource={selectArr}
                                            label={''} style={{ minWidth: '163px' }} />
                                    </div>
                                </div>
                            </Card>
                        </div>
                        : ""}
                    {activeTab === 'temperature' ?
                        <div className={'flex1'} style={{ width: '100%', height: '100%', position: 'relative', minHeight: '235px' }}>
                            <Card
                                title={utils.intl('电芯温度极差分布图')}
                                style={{ width: '100%', height: '100%' }}
                            >
                                <LineChart
                                    series={uniformity3.series}
                                    xData={uniformity3.xData}
                                    yData={uniformity3.yData}
                                />
                                <div style={{ position: 'absolute', top: '0', left: '200px', lineHeight: '48px', width: 'calc(100% - 200px)' }} >
                                    <RangePicker
                                        disabledDate={current => disabledDateAfterYesterday(current)}
                                        maxLength={30}
                                        allowClear={false}
                                        onChange={dateChange}
                                        style={{ width: '270px' }}
                                        value={[startDate ? moment(startDate, 'YYYY-MM-DD') : null, endDate ? moment(endDate, 'YYYY-MM-DD') : null]}
                                    />
                                </div>
                            </Card>
                        </div>
                        : ''}
                </div>
            </div>
        </Page >
    );
};

const mapStateToProps = (model, getLoading, state) => {
    return {
        ...state.batteryUniformity
    }
}

export default makeConnect('batteryUniformity', mapStateToProps)(Index)