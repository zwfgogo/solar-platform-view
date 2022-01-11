import React, { useState, useEffect } from "react";
import { Button, Row, Col, Select, Input, Table2 } from 'wanke-gui'
import DatePicker from '../../components/date-picker'
import Page from "../../components/Page";
import moment from 'moment';
import { makeConnect } from '../umi.helper'
import LineChart from '../../components/charts/LineChart'
import utils from "../../public/js/utils";
import styles from "./index.less"
import FormLayout from "../../components/FormLayout";
import Header from "../../components/Header";

const { FieldItem } = FormLayout

interface Props {
    dispatch: any;
    pageId: any;
    stationDetail: any;
    action: any;
    forecastTypeValue: any;
    forecastType: any[];
    timeDate: any;
    date: string;
    updateState: any;
}
const PowerForecast: React.FC<Props> = props => {
    const {
        stationDetail,
        pageId,
        forecastTypeValue,
        dispatch,
        forecastType,
        date
    } = props;

    useEffect(() => {
        dispatch({ type: 'powerForecast/updateState', payload: { stationDetail } }).then(() => {
            // dispatch({ type: 'powerForecast/init', payload: { dispatch } });
        });
        props.action('reset')
        return () => {
            props.action('reset')
            dispatch({ type: 'powerForecast/closeSocket' });
        }
    }, []);

    // componentDidUpdate(prevProps: Readonly<any>) {
    //     const { stationDetail, dispatch, forecastTypeValue, date, tomorrowDate } = props;
    //     if (
    //         JSON.stringify(stationDetail) !== JSON.stringify(prevProps.stationDetail)
    //     ) {
    //         dispatch({ type: 'awareness/updateState', payload: { stationDetail } }).then(() => {
    //             if (forecastTypeValue === 2 && moment(this.props.timeDate).format('YYYY-MM-DD') === date || forecastTypeValue === 1 && moment(this.props.timeDate).add(1, 'day').format('YYYY-MM-DD') === tomorrowDate) {
    //                 dispatch({ type: "awareness/emitSocket", payload: { eventName: 'message', params: { predictType: forecastTypeValue, stationId: stationDetail?.id, date: forecastTypeValue === 1 ? tomorrowDate : date, frequency: 'original' } } })
    //             } else {
    //                 this.props.action('getCurve');
    //             }
    //         });
    //     }
    // }

    const disabledTomorrowDate = (current) => {
        return current > moment(props.timeDate).add(10, 'day').startOf('day');
    };
    const disabledDate = (current) => {
        return current > moment(props.timeDate).startOf('day');
    };

    const dateChange = (date, dateString) => {
        dispatch({ type: 'powerForecast/updateState', payload: { nowDate: dateString } })
    };

    const changeType = (o) => {
        dispatch({ type: 'powerForecast/updateState', payload: { forecastTypeValue: o } })
    }

    const search = () => {
    }

    return (
        <Page showStation pageId={pageId} style={{ background: "transparent", display: "flex", flexDirection: "column" }}>
            <FormLayout
                onSearch={search}
                onReset={() => {
                    props.updateState({
                        startDate: '',
                        endDate: '',
                        selectStatusValue: ''
                    })
                }}>
                <FieldItem label={utils.intl('预测类型')}>
                    <Select
                        style={{ minWidth: '163px' }}
                        onSelect={changeType}
                        dataSource={forecastType}
                        value={forecastTypeValue}
                    />
                </FieldItem>
                <FieldItem label={utils.intl('光伏单元')}>
                    <Select
                        style={{ minWidth: '163px' }}
                        onSelect={changeType}
                        dataSource={forecastType}
                        value={forecastTypeValue}
                    />
                </FieldItem>
                <FieldItem label={utils.intl('日期')}>
                    <DatePicker
                        disabledDate={forecastTypeValue === 1 ? disabledTomorrowDate : disabledDate}
                        allowClear={false}
                        className={'select100'}
                        onChange={dateChange}
                        value={moment(date, 'YYYY-MM-DD')}
                    />
                </FieldItem>
            </FormLayout>
            <div className="page-sub-container" style={{ display: "flex", flexDirection: "column" }}>
                <div className="flex1">
                    <Header title={"功率数据"}>
                        <span>
                            图1
                        </span>
                    </Header>
                    {/* <LineChart series={echartList.series} xData={echartList.xData} yData={echartList.yData?.slice(0, echartList.series.length)} options={{
                            startDate: moment(forecastTypeValue === 1 ? tomorrowDate : date, 'YYYY-MM-DD HH:mm:ss').startOf('day'),
                            endDate: moment(forecastTypeValue === 1 ? tomorrowDate : date, 'YYYY-MM-DD HH:mm:ss').endOf('day'),
                            dateFormat: (d) => { return moment(d).format('HH:mm:ss') },
                        }} /> */}
                </div>
                <div className="flex1">
                    <Header title={"电量数据"}>
                        <span>
                            图2
                        </span>
                    </Header>
                    {/* <LineChart series={echartList.series} xData={echartList.xData} yData={echartList.yData?.slice(0, echartList.series.length)} options={{
                            startDate: moment(forecastTypeValue === 1 ? tomorrowDate : date, 'YYYY-MM-DD HH:mm:ss').startOf('day'),
                            endDate: moment(forecastTypeValue === 1 ? tomorrowDate : date, 'YYYY-MM-DD HH:mm:ss').endOf('day'),
                            dateFormat: (d) => { return moment(d).format('HH:mm:ss') },
                        }} /> */}
                </div>
            </div>
        </Page>
    )
}

function mapStateToProps(model, getLoading, state) {
    return {
        ...model,
        loading: getLoading('getList'),
        stationDetail: state.global.stationDetail,
        timeDate: state.global.timeDate,
    };
}

export default makeConnect('powerForecast', mapStateToProps)(PowerForecast);