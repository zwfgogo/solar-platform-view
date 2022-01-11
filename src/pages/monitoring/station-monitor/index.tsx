import React from 'react';
import classnames from 'classnames';
import { FullLoading, LineChart, MultiLineChart } from 'wanke-gui'
import Page from "../../../components/Page";
import moment from 'moment';
import { makeConnect } from '../../umi.helper'
import Card from "../../../components/Card/index";
import EmptyImg from '../../../components/emptyImg';
import {
    CaretRightOutlined,
    GfTemperatureOutlined,
    GfAreaOutlined,
    GfScaleOutlined,
    GfWindSpeedOutlined,
    GfWindDirectionOutlined,
    GfWeatherStatusOutlined
} from 'wanke-icon'
import DetailAll from "./component/DetailAll";
import styles from "./index.less"
import utils from '../../../public/js/utils';
import { getImageUrl } from '../../page.helper';
import { getTargetSystemTime } from '../../../util/dateUtil';
import { fillLabelAxisByRange } from '../../../components/charts/common-echarts/calcOption/chartsTool';
import { history } from 'umi'
import ElectricChart from "./component/ElectricChart"
import ProfitChart from "./component/ProfitChart"
import PowerChart from "./component/PowerChart"
import { WeatherEnum } from '../../constants';
import { FREQUENCY_TYPE } from '../../constants'

function getTickValues(startDate, endDate, step, stepType) {
    const formater = 'YYYY-MM-DD HH:mm:ss'
    const result = {
        labelList: [],
        tickValues: undefined
    }
    result.labelList = fillLabelAxisByRange({
        startTime: startDate,
        endTime: endDate,
        formater: formater,
        step,
        stepType
    })
    result.tickValues = result.labelList.map(timeStr => {
        return moment(timeStr).valueOf()
    })
    return result
}

class StationMonitor extends React.Component<any> {

    componentDidMount() {
        const { stationDetail, dispatch, newStationDetail } = this.props;
        //JSON.stringify(newStationDetail) === '{}' 为有电站时的第一次开启长链接 
        if (JSON.stringify(newStationDetail) === '{}' && JSON.stringify(stationDetail) !== '{}') {
            dispatch({ type: 'stationMonitor/updateState', payload: { newStationDetail: stationDetail } }).then(() => {
                dispatch({ type: 'stationMonitor/init', payload: { dispatch } });
            });
        }
    }
    componentDidUpdate(prevProps: Readonly<any>) {
        const { stationDetail, electricSelect, powerSelect, dispatch, newStationDetail } = this.props;

        //当JSON.stringify(newStationDetail) !== '{}' 时证明不是第一次 需要判断前后电站是否相同，若不同则发起长链接参数变化的请求
        if (
            JSON.stringify(newStationDetail) !== '{}' && JSON.stringify(stationDetail) !== JSON.stringify(newStationDetail)
        ) {
            let stationType = parseInt(stationDetail?.properties?.FeedinMethod?.name, 10);
            dispatch({
                type: 'stationMonitor/updateState', payload: {
                    newStationDetail: stationDetail,
                    stationType,
                    detail: {},
                    powerChart: stationType === 0 ?
                        { series: [{ name: utils.intl('实时功率'), unit: 'kW' }, { name: utils.intl('辐照强度'), unit: 'W/㎡' }] } :
                        { series: [{ name: utils.intl('上网功率'), unit: 'kW' }, { name: utils.intl('自发自用功率'), unit: 'kW' }, { name: utils.intl('辐照强度'), unit: 'W/㎡' }] },
                    electricAndProfitChart: stationType === 0 ?
                        { series: [{ name: utils.intl('实际发电量'), unit: 'kWh' }, { name: utils.intl('理论发电量'), unit: 'kWh' }] } :
                        { series: [{ name: utils.intl('上网电量'), unit: 'kWh', stack: true }, { name: utils.intl('自发自用电量'), unit: 'kWh', stack: true }, { name: utils.intl('理论发电量'), unit: 'kWh' }] },
                    profitChart: stationType === 0 ?
                        { series: [{ name: utils.intl('电网售电收益'), unit: utils.intl(stationDetail?.currency) }] } :
                        { series: [{ name: utils.intl('电网售电收益'), unit: utils.intl(stationDetail?.currency) }, { name: utils.intl('非电网售电收益'), unit: utils.intl(stationDetail?.currency) }] },
                }
            }).then(() => {
                dispatch({ type: "stationMonitor/emitSocket", payload: { eventName: 'power_and_irradiance', params: { mod: powerSelect, stationId: stationDetail?.id, frequency: FREQUENCY_TYPE.Original } } })
                dispatch({ type: "stationMonitor/emitSocket", payload: { eventName: 'electric_and_profit', params: { mod: electricSelect, stationId: stationDetail?.id } } })
                dispatch({ type: "stationMonitor/emitSocket", payload: { eventName: 'profit', params: { mod: electricSelect, stationId: stationDetail?.id } } })
                dispatch({ type: "stationMonitor/emitSocket", payload: { eventName: 'weather', params: { stationId: stationDetail?.id } } })
                dispatch({ type: "stationMonitor/emitSocket", payload: { eventName: 'summary', params: { stationId: stationDetail?.id } } })
                dispatch({ type: "stationMonitor/emitSocket", payload: { eventName: 'abnormal', params: { stationId: stationDetail?.id } } })
            });
        }
    }
    componentWillUnmount() {
        this.props.action('reset');
        const { dispatch } = this.props;
        dispatch({ type: 'stationMonitor/closeSocket' });
    }

    powerChange = (o) => {
        const { dispatch, stationDetail, stationType } = this.props;
        this.props.updateState({ powerReFresh: false })
        if (o === 'day') {
            this.props.updateState({
                powerOptions: 'YYYY-MM-DD HH:mm:ss',
            })
        } else {
            this.props.updateState({
                powerOptions: 'HH:mm:ss'
            })
        }
        let that = this;
        setTimeout(function () { that.props.updateState({ powerReFresh: true }) }, 100);
        this.props.updateState({
            powerSelect: o,
            powerChart: stationType === 0 ?
                { series: [{ name: utils.intl('实时功率'), unit: 'kW' }, { name: utils.intl('辐照强度'), unit: 'W/㎡' }] } :
                { series: [{ name: utils.intl('上网功率'), unit: 'kW' }, { name: utils.intl('自发自用功率'), unit: 'kW' }, { name: utils.intl('辐照强度'), unit: 'W/㎡' }] },
        })
        dispatch({ type: "stationMonitor/emitSocket", payload: { eventName: 'power_and_irradiance', params: { mod: o, stationId: stationDetail.id, frequency: o === 'day' ? FREQUENCY_TYPE.Minute15 : FREQUENCY_TYPE.Original } } })
    }

    electricChange = (o) => {
        const { dispatch, stationDetail, stationType } = this.props;
        this.props.updateState({ electricReFresh: false })
        if (o === 'day') {
            this.props.updateState({
                electricOptions: 'YYYY-MM-DD',
                electricAndProfitChart: stationType === 0 ?
                    { series: [{ name: utils.intl('实际发电量'), unit: 'kWh' }, { name: utils.intl('理论发电量'), unit: 'kWh' }, { name: utils.intl('PR'), unit: '%' }] } :
                    { series: [{ name: utils.intl('上网电量'), unit: 'kWh', stack: true }, { name: utils.intl('自发自用电量'), unit: 'kWh', stack: true }, { name: utils.intl('理论发电量'), unit: 'kWh' }, { name: utils.intl('PR'), unit: '%' }] },
            })
        } else if (o === 'month') {
            this.props.updateState({
                electricOptions: 'YYYY-MM',
                electricAndProfitChart: stationType === 0 ?
                    { series: [{ name: utils.intl('实际发电量'), unit: 'kWh' }, { name: utils.intl('理论发电量'), unit: 'kWh' }, { name: utils.intl('PR'), unit: '%' }] } :
                    { series: [{ name: utils.intl('上网电量'), unit: 'kWh', stack: true }, { name: utils.intl('自发自用电量'), unit: 'kWh', stack: true }, { name: utils.intl('理论发电量'), unit: 'kWh' }, { name: utils.intl('PR'), unit: '%' }] },
            })
        } else {
            this.props.updateState({
                electricOptions: 'HH:mm:ss',
                electricAndProfitChart: stationType === 0 ?
                    { series: [{ name: utils.intl('实际发电量'), unit: 'kWh' }, { name: utils.intl('理论发电量'), unit: 'kWh' }] } :
                    { series: [{ name: utils.intl('上网电量'), unit: 'kWh', stack: true }, { name: utils.intl('自发自用电量'), unit: 'kWh', stack: true }, { name: utils.intl('理论发电量'), unit: 'kWh' }] },
            })
        }
        let that = this;
        setTimeout(function () { that.props.updateState({ electricReFresh: true }) }, 100);
        this.props.updateState({
            electricSelect: o,
        })
        dispatch({ type: "stationMonitor/emitSocket", payload: { eventName: 'electric_and_profit', params: { mod: o, stationId: stationDetail.id } } })
    }

    profitChange = (o) => {
        const { dispatch, stationDetail, stationType } = this.props;
        this.props.updateState({ profitReFresh: false })
        if (o === 'day') {
            this.props.updateState({
                profitOptions: 'YYYY-MM-DD',
                profitChart: stationType === 0 ?
                    {
                        series: [
                            // { name: utils.intl('平均电网售电价格'), unit: utils.intl(stationDetail?.currency) },
                            { name: utils.intl('电网售电收益'), unit: utils.intl(stationDetail?.currency) }
                        ]
                    } :
                    {
                        series: [
                            // { name: utils.intl('平均电网售电价格'), unit: utils.intl(stationDetail?.currency) }, { name: utils.intl('平均非电网售电价格'), unit: utils.intl(stationDetail?.currency) },
                            { name: utils.intl('电网售电收益'), unit: utils.intl(stationDetail?.currency), stack: true }, { name: utils.intl('非电网售电收益'), unit: utils.intl(stationDetail?.currency), stack: true },
                        ]
                    },
            })
        } else if (o === 'month') {
            this.props.updateState({
                profitOptions: 'YYYY-MM',
                profitChart: stationType === 0 ?
                    {
                        series: [
                            // { name: utils.intl('平均电网售电价格'), unit: utils.intl(stationDetail?.currency) }, 
                            // { name: utils.intl('LGC单价'), unit: utils.intl(stationDetail?.currency) },
                            { name: utils.intl('电网售电收益'), unit: utils.intl(stationDetail?.currency), stack: true }, { name: utils.intl('LGC收益'), unit: utils.intl(stationDetail?.currency), stack: true }
                        ]
                    } :
                    {
                        series: [
                            // { name: utils.intl('平均电网售电价格'), unit: utils.intl(stationDetail?.currency) }, { name: utils.intl('平均非电网售电价格'), unit: utils.intl(stationDetail?.currency) },
                            // { name: utils.intl('LGC单价'), unit: utils.intl(stationDetail?.currency) },
                            { name: utils.intl('电网售电收益'), unit: utils.intl(stationDetail?.currency), stack: true }, { name: utils.intl('非电网售电收益'), unit: utils.intl(stationDetail?.currency), stack: true },
                            { name: utils.intl('LGC收益'), unit: utils.intl(stationDetail?.currency), stack: true }
                        ]
                    },
            })
        } else {
            this.props.updateState({
                profitOptions: 'HH:mm:ss',
                profitChart: stationType === 0 ?
                    { series: [{ name: utils.intl('电网售电收益'), unit: utils.intl(stationDetail?.currency) }] } :
                    { series: [{ name: utils.intl('电网售电收益'), unit: utils.intl(stationDetail?.currency), stack: true }, { name: utils.intl('非电网售电收益'), unit: utils.intl(stationDetail?.currency), stack: true }] },
            })
        }
        let that = this;
        setTimeout(function () { that.props.updateState({ profitReFresh: true }) }, 100);
        this.props.updateState({
            profitSelect: o,
        })
        dispatch({ type: "stationMonitor/emitSocket", payload: { eventName: 'profit', params: { mod: o, stationId: stationDetail.id } } })
    }
    render() {
        const { weather, powerReFresh, electricReFresh, detail, pageId, electricAndProfitChart, powerChart, profitReFresh, profitChart, profitOptions,
            stationType, stationDetail, electricOptions, powerOptions, weatherDetail,
            powerSelect, electricSelect, profitSelect, abnormalObj, abnormalSum } = this.props;
        let electricDateFormat, powerDateFormat, profitDateFormat;
        electricDateFormat = getOptions('electric', electricSelect, electricOptions, stationDetail, stationType);
        powerDateFormat = getOptions('power', powerSelect, powerOptions, stationDetail, stationType);
        profitDateFormat = getOptions('profit', profitSelect, profitOptions, stationDetail, stationType);
        const powerData = getChartsData(powerDateFormat.labelList, powerChart);
        const electricData = getChartsData(electricDateFormat.labelList, electricAndProfitChart);
        const profitData = getChartsData(profitDateFormat.labelList, profitChart);
        return (
            <Page showStation={true} pageId={pageId} className={classnames("bf-br5 page-bg1", styles.page)}>
                <div className={styles.monitoring + " f-df"} style={{ height: '100%' }}>
                    <div className="flex1 f-pr f-df" style={{ flex: 0.3, minHeight: '160px' }}>
                        <div className={"bf-br4 flex1 f-pr e-mr10 flex-column f-df"} style={{ padding: '20px' }}>
                            <div className="f-df" style={{ height: '100px' }}>
                                <div className="flex1" style={{ flex: 0.32 }}>
                                    {
                                        stationDetail && stationDetail.photoFiles ? (
                                            <img style={{ width: '100%', height: '100%' }} src={getImageUrl(stationDetail?.photoFiles?.[0])} />
                                        ) : (
                                            <div style={{ height: '100%' }}><EmptyImg /></div>
                                        )
                                    }
                                </div>
                                <div className={styles.detailInformation + " flex1 flex-column f-df"} style={{ marginLeft: '25px', flex: 0.68 }}>
                                    <div className="flex1" style={{ flex: 0.25 }}>
                                        <p className={styles.address} title={stationDetail?.address}><GfAreaOutlined style={{ color: '#828282', marginRight: '5px', fontSize: '16px' }} />{stationDetail?.address}</p>
                                    </div>
                                    <div className="flex1" style={{ flex: 0.25 }}>
                                        <p><GfScaleOutlined style={{ color: '#828282', marginRight: '5px', fontSize: '16px' }} />{stationDetail?.scaleDisplay}</p>
                                    </div>
                                    <div className="flex1 f-df" style={{ flex: 0.5 }}>
                                        <div className="flex1">
                                            <p><GfWindSpeedOutlined style={{ color: '#828282', marginRight: '5px', fontSize: '16px' }} />{detail?.windSpeed}</p>
                                            <p><GfWindDirectionOutlined style={{ color: '#828282', marginRight: '5px', fontSize: '16px' }} />{detail?.windDirection}</p>
                                        </div>
                                        <div className="flex1">
                                            <p><GfTemperatureOutlined style={{ color: '#828282', marginRight: '5px', fontSize: '16px' }} />{detail?.temperature}</p>
                                            <p><GfWeatherStatusOutlined style={{ color: '#828282', marginRight: '5px', fontSize: '16px' }} />{weatherDetail?.weather ? WeatherEnum[weatherDetail?.weather] : null}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.alarm + " e-mt10"}>
                                <span className={styles.alarmContent}>{utils.intl('当前共有告警')}<span style={{ color: "#f3a55e" }}>{abnormalSum}</span>
                                    {utils.intl('monitoring.条')}，{utils.intl('monitoring.严重告警')}<span style={{ color: "#ef7573" }}>{abnormalObj.Serious}</span>
                                    {utils.intl('monitoring.严重告警条数，')}{utils.intl('请及时处理。')}</span>
                                <span style={{
                                    position: 'absolute',
                                    right: '30px',
                                    color: '#2f80ed',
                                    cursor: 'pointer'
                                }} onClick={() => { history.push('/alert-service/abnormal') }}>{utils.intl('立即查看')} <CaretRightOutlined /></span>
                            </div>
                            <DetailAll detail={detail} stationDetail={stationDetail} stationType={stationType} />
                        </div>
                    </div>
                    <div className="flex1 f-pr f-df flex-column" style={{ flex: 0.7, minHeight: '160px' }}>
                        <div className={"flex1 f-pr"}>
                            <Card title={utils.intl('功率趋势')}
                                // selectDay 
                                // zselectValue={powerSelect} 
                                // zselectChangeNow={this.powerChange} 
                                style={{ width: '100%', height: '100%' }}>
                                <div style={{ height: '92%', position: 'relative' }}>
                                    {this.props.socketLoading['power_and_irradiance'] && <FullLoading />}
                                    {powerReFresh ?
                                        <PowerChart data={powerData} options={powerDateFormat} />
                                        : ''}
                                </div>
                            </Card>
                        </div>
                        <div className={"flex1 f-pr e-mt10"}>
                            <Card title={utils.intl('电量趋势')} select zselectValue={electricSelect} zselectChangeNow={this.electricChange} style={{ width: '100%', height: '100%' }}>
                                <div style={{ height: '100%', position: 'relative' }}>
                                    {this.props.socketLoading['electric_and_profit'] && <FullLoading />}
                                    {electricReFresh ?
                                        <ElectricChart data={electricData} options={electricDateFormat} />
                                        : ''}
                                </div>
                            </Card>
                        </div>
                        <div className={"flex1 f-pr e-mt10"}>
                            <Card title={utils.intl('收益趋势')} select zselectValue={profitSelect} zselectChangeNow={this.profitChange} style={{ width: '100%', height: '100%' }}>
                                <div style={{ height: '100%', position: 'relative' }}>
                                    {this.props.socketLoading['profit'] && <FullLoading />}
                                    {profitReFresh ?
                                        <ProfitChart data={profitData} options={profitDateFormat} />
                                        : ''}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </Page >
        )
    }
}

function mapStateToProps(model, getLoading, state) {
    return {
        ...model,
        loading: getLoading('init'),
        stationDetail: state.global.stationDetail,
        theme: state.global.theme
    };
}

export default makeConnect('stationMonitor', mapStateToProps)(StationMonitor);

function getChartsData(labelList, chartData) {
    if (labelList) {
        const data = {
            xData: labelList,
            yData: (chartData.yData || []).map(row => {
                return labelList.map(timeStr => {
                    const index = chartData.xData.indexOf(timeStr)
                    if (index > -1) {
                        return row?.[index] === undefined ? null : row?.[index]
                    }
                    return null
                })
            }),
            series: chartData.series
        }
        return data
    }
    return chartData
}

function getOptions(type, select, option, stationDetail, stationType) {
    let chartOptions;
    const currentTime = getTargetSystemTime(stationDetail?.timeZone)
    if (type === 'electric') {
        if (select === 'month') {
            const { labelList = [] } = getTickValues(moment(currentTime).subtract(11, 'month').format(option + '-01 00:00:00'), moment(currentTime).format(option + '-01 00:00:00'), 1, 'month')
            chartOptions = {
                dateFormat: (d) => { return moment(d).format(option) },
                tooltipDateFormat: option,
                endDate: moment(currentTime),
                startDate: moment(currentTime).subtract(11, 'month'),
                types: stationType === 0 ? ['bar', 'bar', 'line'] : ['bar', 'bar', 'bar', 'line'],
                barWidth: 5,
                margin: { left: 70 },
                labelList
            }
        } else if (select === 'day') {
            const { labelList = [] } = getTickValues(moment(currentTime).subtract(29, 'day').format(option + ' 00:00:00'), moment(currentTime).format(option + ' 00:00:00'), 1, 'day')
            chartOptions = {
                dateFormat: (d) => { return moment(d).format(option) },
                tooltipDateFormat: option,
                endDate: moment(currentTime),
                startDate: moment(currentTime).subtract(29, 'day'),
                types: stationType === 0 ? ['bar', 'bar', 'line'] : ['bar', 'bar', 'bar', 'line'],
                barWidth: 5,
                margin: { left: 70 },
                labelList
            }
        } else {
            const { labelList = [] } = getTickValues(moment(currentTime).format('YYYY-MM-DD 00:00:00'), moment(currentTime).format('YYYY-MM-DD 23:44:59'), 15, 'minutes')
            chartOptions = {
                dateFormat: (d) => { return moment(d).format(option) },
                tooltipDateFormat: option,
                endDate: moment(currentTime).endOf('day'),
                startDate: moment(currentTime).startOf('day'),
                types: stationType === 0 ? ['bar', 'bar'] : ['bar', 'bar', 'bar'],
                barWidth: 4,
                margin: { left: 70 },
                labelList
            }
        }
    } else if (type === 'power') {
        if (select === 'day') {
            const { labelList = [] } = getTickValues(moment(currentTime).subtract(6, 'day').format('YYYY-MM-DD 00:00:00'), moment(currentTime).format('YYYY-MM-DD 23:44:59'), 15, 'minutes')
            chartOptions = {
                dateFormat: (d) => { return moment(d).format(option) },
                tooltipDateFormat: option,
                endDate: moment(currentTime),
                startDate: moment(currentTime).subtract(6, 'day'),
                types: stationType === 0 ? ['line', 'line'] : ['line', 'line', 'line'],
                margin: { left: 70 },
                labelList
            }
        } else {
            // const { labelList = [] } = getTickValues(moment(currentTime).format('YYYY-MM-DD 00:00:00'), moment(currentTime).format('YYYY-MM-DD 23:44:59'), 1, '')
            chartOptions = {
                dateFormat: (d) => { return moment(d).format(option) },
                tooltipDateFormat: option,
                endDate: moment(currentTime).endOf('day'),
                startDate: moment(currentTime).startOf('day'),
                types: stationType === 0 ? ['line', 'line'] : ['line', 'line', 'line'],
                margin: { left: 70 },
                // labelList
            }
        }
    } else if (type === 'profit') {
        if (select === 'month') {
            const { labelList = [] } = getTickValues(moment(currentTime).subtract(11, 'month').format(option + '-01 00:00:00'), moment(currentTime).format(option + '-01 00:00:00'), 1, 'month')
            chartOptions = {
                dateFormat: (d) => { return moment(d).format(option) },
                tooltipDateFormat: option,
                endDate: moment(currentTime),
                startDate: moment(currentTime).subtract(11, 'month'),
                types: stationType === 0 ? ['bar', 'bar'] : ['bar', 'bar', 'bar'],
                barWidth: 5,
                margin: { left: 70 },
                labelList
            }
        } else if (select === 'day') {
            const { labelList = [] } = getTickValues(moment(currentTime).subtract(29, 'day').format(option + ' 00:00:00'), moment(currentTime).format(option + ' 00:00:00'), 1, 'day')
            chartOptions = {
                dateFormat: (d) => { return moment(d).format(option) },
                tooltipDateFormat: option,
                endDate: moment(currentTime),
                startDate: moment(currentTime).subtract(29, 'day'),
                types: stationType === 0 ? ['bar'] : ['bar', 'bar'],
                barWidth: 5,
                margin: { left: 70 },
                labelList
            }
        } else {
            const { labelList = [] } = getTickValues(moment(currentTime).format('YYYY-MM-DD 00:00:00'), moment(currentTime).format('YYYY-MM-DD 23:44:59'), 15, 'minutes')
            chartOptions = {
                dateFormat: (d) => { return moment(d).format(option) },
                tooltipDateFormat: option,
                endDate: moment(currentTime).endOf('day'),
                startDate: moment(currentTime).startOf('day'),
                types: stationType === 0 ? ['bar'] : ['bar', 'bar'],
                barWidth: 5,
                margin: { left: 70 },
                labelList
            }
        }
    }
    return chartOptions
}
