import React, { useState, useEffect } from "react";
import styles from "./index.less";
import Page from "../../../components/Page";
import classnames from 'classnames';
import { LineChart, Select, RangePicker, Radio, Button, Progress, BarChart, Row, MultiLineChart } from 'wanke-gui'
import Card from "../../../components/Card/index";
import { makeConnect } from "../../umi.helper"
import { disabledDateAfterYesterday } from '../../../util/dateUtil'
import moment from 'moment';
import { getChartMax, getChartMin } from '../../page.helper'
import utils from "../../../public/js/utils";
interface Props {
    dispatch: any;
    pageId: any;
    action: any;
    selectArr: string[];
    unitChangeValue: string;
    startDate: string;
    endDate: string;
    uniformity: any;
    _deviceId: any;
    _type: any;
    scoreEvaluate: any;
    _healthScore: any;
    _deviceTitle: any;
    chargingAnalysis: any;
    dischargingAnalysis: any;
    typeChangeValue: any;
    topStartDate: any;
    topEndDate: any;
    getUniformityCurveSuccess: boolean;
    _productionTime: any;
}

const Index: React.FC<Props> = props => {
    const {
        dispatch,
        pageId,
        selectArr,
        unitChangeValue,
        startDate,
        endDate,
        topStartDate,
        topEndDate,
        uniformity,
        _deviceId,
        _type,
        scoreEvaluate,
        _healthScore,
        _deviceTitle,
        chargingAnalysis,
        dischargingAnalysis,
        typeChangeValue,
        getUniformityCurveSuccess,
        _productionTime
    } = props;


    useEffect(() => {
        props.action('getSelect').then(res => {
            props.action('getUniformityCurve', { typeChangeValue, deviceId: _deviceId, type: _type })
        })
        props.action('init', { deviceId: _deviceId, type: _type })
        props.action('getEnergyUnitsInfo', { deviceId: _deviceId })
        return () => {
            props.action('reset')
        }
    }, []);


    useEffect(() => {
        clearData();
        clearTopData();
        props.action('getVoltageAnalysis', { deviceId: _deviceId, type: _type })
    }, [_type]);

    const selectChange = (o, name) => {
        if (name === 'typeChange') {
            if (o === 'voltage') {
                props.action('updateToView', {
                    uniformity: {
                        xData: [], yData: [[]], series: [{
                            name: "",
                            unit: "V"
                        }]
                    }
                })
            } else {
                props.action('updateToView', {
                    uniformity: {
                        xData: [], yData: [[]], series: [{
                            name: "",
                            unit: "℃"
                        }]
                    }
                })
            }
            props.action('getUniformityCurve', { typeChangeValue: o, deviceId: _deviceId, type: _type })
        }
        props.action('updateToView', { [name + 'Value']: o })
    }
    const clearData = () => {
        if (_type === 'Cell') {
            props.action('updateToView', {
                chargingAnalysis: {
                    xData: [], yData: [[], [], []], series: [{
                        name: utils.intl('电压差'),
                        unit: 'V'
                    },
                    {
                        name: utils.intl('SOC'),
                        unit: '%'
                    }, {
                        name: utils.intl('偏离度'),
                        unit: '%　'
                    }]
                },
                dischargingAnalysis: {
                    xData: [], yData: [[], [], []], series: [{
                        name: utils.intl('电压差'),
                        unit: 'V'
                    },
                    {
                        name: utils.intl('SOC'),
                        unit: '%'
                    }, {
                        name: utils.intl('偏离度'),
                        unit: '%　'
                    }]
                }
            })
        } else {
            props.action('updateToView', {
                chargingAnalysis: {
                    xData: [], yData: [[], [], []], series: [{
                        name: utils.intl('最大极差'),
                        unit: 'V'
                    },
                    {
                        name: utils.intl('标准差'),
                        unit: ''
                    }, {
                        name: utils.intl('SOC'),
                        unit: '%'
                    }]
                },
                dischargingAnalysis: {
                    xData: [], yData: [[], [], []], series: [{
                        name: utils.intl('最大极差'),
                        unit: 'V'
                    },
                    {
                        name: utils.intl('标准差'),
                        unit: ''
                    }, {
                        name: utils.intl('SOC'),
                        unit: '%'
                    }]
                }
            })
        }
    }
    const clearTopData = () => {
        if (_type === 'Cell') {
            props.action('updateToView', {
                uniformity: {
                    xData: [], yData: [[]], series: [{
                        name: "",
                        unit: "V"
                    }]
                },
            })
        } else {
            props.action('updateToView', {
                uniformity: {
                    xData: [], yData: [[]], series: [{
                        name: "",
                        unit: "℃"
                    }]
                },
            })
        }
    }

    const dateDecayChange = (date, dateString) => {
        clearData();
        props.action('updateToView', { startDate: dateString[0], endDate: dateString[1] })
        props.action('getVoltageAnalysis', { deviceId: _deviceId, type: _type })
    }
    const dateChange = (date, dateString) => {
        clearTopData();
        props.action('updateToView', { topStartDate: dateString[0], topEndDate: dateString[1] })
        props.action('getUniformityCurve', { typeChangeValue, deviceId: _deviceId, type: _type })
    }

    let scoreEvaluateContent = []


    let healthStatusColor = ''
    let warnStatusColor = ''
    switch (scoreEvaluate.healthStatus) {
        case '良好':
            healthStatusColor = '#62D56E'
            break;
        case '正常':
            healthStatusColor = '#B0E869'
            break;
        case '一般':
            healthStatusColor = '#F8D835'
            break;
        case '欠佳':
            healthStatusColor = '#FFAD38'
            break;
        case '较差':
            healthStatusColor = '#E0252F'
            break;
        default:
            healthStatusColor = 'rgba(255, 255, 255, 0.45)'
    }
    switch (scoreEvaluate.warnStatus) {
        case '低风险':
            warnStatusColor = 'rgba(98, 212, 110, 0.8)'
            break;
        case '中风险':
            warnStatusColor = 'rgba(255, 173, 56, 0.8)'
            break;
        case '高风险':
            warnStatusColor = 'rgba(224, 37, 47, 0.2)'
            break;
        default:
            warnStatusColor = 'rgba(255, 255, 255, 0.45)'
    }
    if (_type === 'Cell') {
        scoreEvaluateContent = [{ name: '所属电池单元评分', value: scoreEvaluate.batteryUnitScore, unit: utils.intl('分'), color: 'rgba(61, 126, 255, 1)' },
        { name: '超过同站电芯', value: scoreEvaluate.ratio, unit: utils.intl('%'), color: 'rgba(61, 126, 255, 1)' },
        { name: '同站电芯平均分', value: scoreEvaluate.averageScore, unit: utils.intl('分'), color: 'rgba(61, 126, 255, 1)' },
        { name: '电池健康状态', value: scoreEvaluate.healthStatus, color: healthStatusColor },
        { name: '安全风险', value: scoreEvaluate.warnStatus, color: warnStatusColor }]
    } else if (_type === 'BatteryUnit') {
        scoreEvaluateContent = [{ name: '超过同站电池单元', value: scoreEvaluate.ratio, unit: utils.intl('%'), color: 'rgba(61, 126, 255, 1)' },
        { name: '同站电池单元平均分', value: scoreEvaluate.averageScore, unit: utils.intl('分'), color: 'rgba(61, 126, 255, 1)' },
        { name: '电池健康状态', value: scoreEvaluate.healthStatus, color: healthStatusColor }]
    }

    const getSystemTime = () => {
        return moment(sessionStorage.getItem('timeDate') || undefined)
    }

    const disabledDateCustom = (current) => {
        return current && current > getSystemTime().subtract(1, 'day').endOf('day') || current && current < moment(_productionTime)
    }
    return (
        <Page pageTitle={utils.intl('电池容量特征分析')} pageId={pageId} className={classnames("bf-br5 page-bg1 e-mt5", styles.page)} style={{ marginTop: 6 }} showEnergyUnit={false}>
            <div className="f-df flex-column capacity" style={{ height: '100%' }}>
                <div className="flex1 f-df" style={{ width: '100%', height: '100%', flex: 0.38 }}>
                    <Card
                        title={utils.intl('电池健康评分')}
                        style={{ width: '100%', height: '100%', flex: 0.33 }}
                        showBorder
                    >
                        <div className="flex1 f-df" style={{ width: '100%' }} >
                            <div className="flex1">
                                <Progress
                                    type="circle"
                                    strokeColor={{
                                        '0%': 'rgba(61, 126, 255, 1)',
                                        '100%': 'rgba(146, 61, 255, 1)',
                                    }}
                                    percent={100}
                                    format={() => {
                                        return (
                                            <div>
                                                <span style={{ display: 'block', color: '#fff', fontSize: '24px' }}>{utils.intl(_healthScore)}<span style={{ fontSize: '18px', position: 'relative', bottom: '1px' }}>{utils.intl('分')}</span></span>
                                                <span style={{
                                                    display: 'inline-block', color: 'rgba(255, 255, 255, 0.65)',
                                                    fontSize: '16px', marginTop: '3px',
                                                    whiteSpace: 'nowrap',
                                                    textOverflow: 'ellipsis',
                                                    overflow: 'hidden',
                                                    wordBreak: 'break-all',
                                                    maxWidth: 90
                                                }} title={utils.intl(_deviceTitle)}>{utils.intl(_deviceTitle)}</span>
                                            </div>
                                        )
                                    }}
                                    strokeWidth={10}
                                    width={140}
                                    style={{ position: 'relative', transform: 'translate(-50%,-50%)', top: '47%', left: '50%' }}
                                />
                            </div>
                            <div className="flex1">
                                <div className={styles['singleDiv']} style={{ marginLeft: '22px' }}>
                                    {
                                        scoreEvaluateContent.map((o, i) => {
                                            return (
                                                <div className={styles['singleName']}><div className={styles['icon']}></div>{o.name}：<span style={{ float: 'right', color: o.color }}>{o.value}{o.unit}</span></div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </Card>
                    <Card
                        title={_type === 'Cell' ? utils.intl('历史数据查询') : utils.intl('温度一致性分析')}
                        style={{ width: '100%', height: '100%', marginLeft: 16, flex: 0.67, position: 'relative' }}
                        showBorder
                    >
                        <div style={{ position: 'absolute', top: '0', left: _type === 'Cell' ? '130px' : '140px', width: 'calc(100% - 200px)' }} >
                            {_type === 'Cell' ?
                                <>
                                    <div className='e-mr20' style={{ float: 'left', marginTop: 8 }}>
                                        <Select value={typeChangeValue} onChange={o => selectChange(o, 'typeChange')} dataSource={[{ name: '电压', value: 'voltage' }, { name: '温度', value: 'temperature' }]}
                                            label={''} style={{ width: '80px' }} />
                                    </div>
                                    <div className='e-mr20' style={{ float: 'left', marginTop: 8 }}>
                                        <RangePicker
                                            disabledDate={current => disabledDateCustom(current)}
                                            allowClear={false}
                                            onChange={dateChange}
                                            style={{ width: '270px' }}
                                            maxLength={30}
                                            value={[topStartDate ? moment(topStartDate, 'YYYY-MM-DD') : null, topEndDate ? moment(topEndDate, 'YYYY-MM-DD') : null]}
                                        />
                                    </div>
                                </>
                                :
                                <div className='e-mr20' style={{ float: 'left', marginTop: 8 }}>
                                    <RangePicker
                                        disabledDate={current => disabledDateCustom(current)}
                                        allowClear={false}
                                        onChange={dateChange}
                                        style={{ width: '270px' }}
                                        maxLength={365}
                                        value={[topStartDate ? moment(topStartDate, 'YYYY-MM-DD') : null, topEndDate ? moment(topEndDate, 'YYYY-MM-DD') : null]}
                                    />
                                </div>
                            }
                        </div>
                        {!getUniformityCurveSuccess ?
                            <LineChart
                                series={uniformity.series}
                                xData={uniformity.xData}
                                yData={uniformity.yData}
                                options={{
                                    dateFormat: (d) => {
                                        if (_type === 'Cell') {
                                            return moment(d).format('YYYY-MM-DD HH:mm:ss')
                                        } else {
                                            return moment(d).format('YYYY-MM-DD HH:mm:ss').indexOf("00:00:00") > -1 ? moment(d).format('YYYY-MM-DD') : ''
                                        }
                                    },
                                    tooltipDateFormat: _type === 'Cell' ? 'YYYY-MM-DD HH:mm:ss' : "YYYY-MM-DD"
                                }}
                            />
                            : ''}

                    </Card>
                </div>
                <div className="flex1" style={{ width: '100%', height: '100%', marginTop: '16px', position: 'relative', flex: 0.62 }}>
                    <Card
                        title={utils.intl('电压分析')}
                        style={{ width: '100%', height: '100%' }}
                        showBorder
                    >
                        <Row style={{
                            color: 'rgba(255, 255, 255, 0.65)',
                            paddingLeft: '16px'
                        }}>{utils.intl('充电末端')}</Row>
                        <MultiLineChart
                            series={chargingAnalysis.series
                            }
                            xData={chargingAnalysis.xData}
                            yData={chargingAnalysis.yData}
                            options={{ dateFormat: (d) => { return moment(d).format('YYYY-MM-DD HH:mm:ss').indexOf("00:00:00") > -1 ? moment(d).format('YYYY-MM-DD') : '' }, tooltipDateFormat: "YYYY-MM-DD" }}
                        />
                        <Row style={{
                            color: 'rgba(255, 255, 255, 0.65)',
                            paddingLeft: '16px'
                        }}>{utils.intl('放电末端')}</Row>
                        <MultiLineChart
                            series={dischargingAnalysis.series}
                            xData={dischargingAnalysis.xData}
                            yData={dischargingAnalysis.yData}
                            options={{ dateFormat: (d) => { return moment(d).format('YYYY-MM-DD HH:mm:ss').indexOf("00:00:00") > -1 ? moment(d).format('YYYY-MM-DD') : '' }, tooltipDateFormat: "YYYY-MM-DD" }}
                        />
                        <div style={{ position: 'absolute', top: '0', left: '100px', lineHeight: '48px', width: 'calc(100% - 200px)' }} >
                            <div className='e-mr20' style={{ float: 'left' }}>
                                <RangePicker
                                    disabledDate={current => disabledDateCustom(current)}
                                    allowClear={false}
                                    onChange={dateDecayChange}
                                    style={{ width: '270px' }}
                                    maxLength={365}
                                    value={[startDate ? moment(startDate, 'YYYY-MM-DD') : null, endDate ? moment(endDate, 'YYYY-MM-DD') : null]}
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </Page >
    );
};

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
    return {
        ...model,
        getUniformityCurveSuccess: isSuccess('getUniformityCurve'),
    }
}

export default makeConnect('problemBattery', mapStateToProps)(Index)