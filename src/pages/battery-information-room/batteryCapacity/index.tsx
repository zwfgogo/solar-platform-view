import React, { useState, useEffect } from "react";
import styles from "./index.less";
import Page from "../../../components/Page";
import classnames from 'classnames';
import { LineChart, Select, RangePicker, Radio, Button } from 'wanke-gui'
import Card from "../../../components/Card/index";
import { makeConnect } from "../../umi.helper"
import { disabledDateAfterYesterday } from '../../../util/dateUtil'
import moment from 'moment';
import { getChartMax, getChartMin } from '../../page.helper'
import utils from "../../../public/js/utils";
interface Props {
    dispatch: any;
    pageId: any;
    batteryCapacity: any;
    action: any;
    selectArr: string[];
    unitRadioValue: string;
    decayCapacity: any;
    unitChangeValue: string;
    unitDecayValue: string;
    batteryDecayValue: string;
    batteryArr: any[];
    startDate: string;
    endDate: string;
    startDecayDate: string;
    endDecayDate: string;
}

const Index: React.FC<Props> = props => {
    const {
        dispatch,
        pageId,
        batteryCapacity,
        selectArr,
        unitRadioValue,
        decayCapacity,
        unitChangeValue,
        unitDecayValue,
        batteryDecayValue,
        batteryArr,
        startDate,
        endDate,
        startDecayDate,
        endDecayDate,
    } = props;

    useEffect(() => {
        props.action('getSelect').then(res => {
            props.action('getCapacity')
            props.action('getBatteryCapacity')
        })
        return () => {
            props.action('reset')
        }
    }, []);

    useEffect(() => {
        if (unitRadioValue && unitDecayValue) {
            props.action('getBatteryCapacity')
        }
    }, [unitRadioValue]);

    const selectChange = (o, name) => {
        props.action('updateToView', { [name + 'Value']: o })
    }

    const dateChange = (date, dateString) => {
        props.action('updateToView', { startDate: dateString[0], endDate: dateString[1] })
    }

    const dateDecayChange = (date, dateString) => {
        props.action('updateToView', { startDecayDate: dateString[0], endDecayDate: dateString[1] })
    }

    const optionsWithDisabled = [
        { label: 'kWh', value: 'kWh' },
        { label: '%', value: '%' },
    ];

    const unitOnChange = (o) => {
        props.action('updateToView', {
            unitRadioValue: o.target.value, decayCapacity: {
                xData: [], yData: [[]], series: [{
                    name: "",
                    unit: 'kWh'
                }]
            }
        })
    }

    const changeQuery = () => {
        props.action('updateToView', {
            startDate: startDate, endDate: endDate, batteryCapacity: {
                xData: [], yData: [[], []], series: [{
                    name: utils.intl('平均满充电量'),
                    unit: 'kWh'
                },
                {
                    name: utils.intl('平均满放电量'),
                    unit: 'kWh'
                }]
            }
        })
        props.action('getCapacity')
    }

    const decayQuery = () => {
        props.action('updateToView', {
            startDecayDate: startDecayDate, endDecayDate: endDecayDate, decayCapacity: {
                xData: [], yData: [[]], series: [{
                    name: "",
                    unit: 'kWh'
                }]
            }
        })
        props.action('getBatteryCapacity')
    }
    //获取图表最大值最小值
    let capacityMin = batteryCapacity?.yData?.[0]?.[0] || '';
    let capacityMax = batteryCapacity?.yData?.[0]?.[0] || '';
    for (let i = 0; i < batteryCapacity.yData.length; i++) {
        batteryCapacity?.yData[i].forEach(item => { capacityMax = item > capacityMax ? item : capacityMax });
        batteryCapacity?.yData[i].forEach(item => { capacityMin = item < capacityMin ? item : capacityMin });
    }
    let decayMin = decayCapacity?.yData?.[0]?.[0] || '';
    let decayMax = decayCapacity?.yData?.[0]?.[0] || '';
    for (let i = 0; i < decayCapacity.yData.length; i++) {
        decayCapacity?.yData[i].forEach(item => { decayMax = item > decayMax ? item : decayMax });
        decayCapacity?.yData[i].forEach(item => { decayMin = item < decayMin ? item : decayMin });
    }
    return (
        <Page pageTitle={utils.intl('电池容量特征分析')} pageId={pageId} className={classnames("bf-br5 page-bg1 e-mt5", styles.page)} style={{ marginTop: 6 }} showStation={false}>
            <div className="f-df flex-column capacity" style={{ height: '100%' }}>
                <div className="flex1" style={{ width: '100%', height: '100%' }}>
                    <Card
                        title={utils.intl('储能单元充放电量趋势')}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <LineChart
                            series={batteryCapacity.series}
                            xData={batteryCapacity.xData}
                            yData={batteryCapacity.yData}
                            options={{ dateFormat: (d) => { return moment(d).format('YYYY-MM-DD') }, tooltipDateFormat: "YYYY-MM-DD", max: getChartMax(capacityMax), min: getChartMin(capacityMin) }}
                        />
                        <div style={{ position: 'absolute', top: '0', left: '200px', lineHeight: '48px', width: 'calc(100% - 200px)' }} >
                            <div className='e-mr20' style={{ float: 'left' }}>
                                <Select value={unitChangeValue} onChange={o => selectChange(o, 'unitChange')} dataSource={selectArr}
                                    label={''} style={{ minWidth: '163px' }} />
                            </div>
                            <div className='e-mr20' style={{ float: 'left' }}>
                                <RangePicker
                                    disabledDate={current => disabledDateAfterYesterday(current)}
                                    allowClear={false}
                                    onChange={dateChange}
                                    style={{ width: '270px' }}
                                    value={[startDate ? moment(startDate, 'YYYY-MM-DD') : null, endDate ? moment(endDate, 'YYYY-MM-DD') : null]}
                                />
                            </div>
                            <Button type="primary" onClick={changeQuery}>{utils.intl('查询')}</Button>
                        </div>
                    </Card>
                </div>
                <div className="flex1" style={{ width: '100%', height: '100%', marginTop: '10px', position: 'relative' }}>
                    <Card
                        title={utils.intl('电池容量衰减曲线')}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <LineChart
                            series={decayCapacity.series}
                            xData={decayCapacity.xData}
                            yData={decayCapacity.yData}
                            options={{ dateFormat: (d) => { return moment(d).format('YYYY-MM-DD') }, tooltipDateFormat: "YYYY-MM-DD", min: getChartMin(decayMin), max: getChartMax(decayMax) }}
                        />
                        <div style={{ position: 'absolute', top: '0', left: '200px', lineHeight: '48px', width: 'calc(100% - 200px)' }} >
                            <div className='e-mr20' style={{ float: 'left' }}>
                                <Select value={unitDecayValue} onChange={o => selectChange(o, 'unitDecay')} dataSource={selectArr}
                                    label={''} style={{ minWidth: '163px' }} />
                            </div>
                            <div className='e-mr20' style={{ float: 'left' }}>
                                <Select value={batteryDecayValue} onChange={o => selectChange(o, 'batteryDecay')} dataSource={batteryArr}
                                    label={''} style={{ minWidth: '163px' }} />
                            </div>
                            <div className='e-mr20' style={{ float: 'left' }}>
                                <RangePicker
                                    disabledDate={current => disabledDateAfterYesterday(current)}
                                    allowClear={false}
                                    onChange={dateDecayChange}
                                    style={{ width: '270px' }}
                                    value={[startDecayDate ? moment(startDecayDate, 'YYYY-MM-DD') : null, endDecayDate ? moment(endDecayDate, 'YYYY-MM-DD') : null]}
                                />
                            </div>
                            <Button type="primary" onClick={decayQuery}>{utils.intl('查询')}</Button>
                            <div className='e-mr20' style={{ float: 'right' }}>
                                <Radio.Group
                                    options={optionsWithDisabled}
                                    onChange={unitOnChange}
                                    value={unitRadioValue}
                                    optionType="button"
                                    buttonStyle="solid"
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </Page >
    );
};

const mapStateToProps = (model, getLoading, state) => {
    return {
        ...state.batteryCapacity
    }
}

export default makeConnect('batteryCapacity', mapStateToProps)(Index)