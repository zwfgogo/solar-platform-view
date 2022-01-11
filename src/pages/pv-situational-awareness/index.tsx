import React from 'react';
import { Button, Row, Col, Select, Input, Table2, FullLoading } from 'wanke-gui'
import DatePicker from '../../components/date-picker'
import Page from "../../components/Page";
import moment from 'moment';
import { makeConnect } from '../umi.helper'
import LineChart from '../../components/charts/LineChart'
import utils from "../../public/js/utils";
import styles from "./index.less"
class Awareness extends React.Component<any> {
    componentDidMount() {
        const { dispatch, stationDetail } = this.props;
        dispatch({ type: 'awareness/updateState', payload: { stationDetail } }).then(() => {
            dispatch({ type: 'awareness/init', payload: { dispatch } });
        });
        this.props.action('reset')
    }
    componentDidUpdate(prevProps: Readonly<any>) {
        const { stationDetail, dispatch, forecastTypeValue, date, tomorrowDate } = this.props;
        if (
            JSON.stringify(stationDetail) !== JSON.stringify(prevProps.stationDetail)
        ) {
            dispatch({ type: 'awareness/updateState', payload: { stationDetail } }).then(() => {
                if (forecastTypeValue === 2 && moment(this.props.timeDate).format('YYYY-MM-DD') === date || forecastTypeValue === 1 && moment(this.props.timeDate).add(1, 'day').format('YYYY-MM-DD') === tomorrowDate) {
                    dispatch({ type: "awareness/emitSocket", payload: { eventName: 'message', params: { predictType: forecastTypeValue, stationId: stationDetail?.id, date: forecastTypeValue === 1 ? tomorrowDate : date, frequency: 'original' } } })
                } else {
                    this.props.action('getCurve');
                }
            });
        }
    }
    componentWillUnmount() {
        const { dispatch } = this.props;
        dispatch({ type: 'awareness/closeSocket' });
    }

    disabledTomorrowDate = (current) => {
        return current > moment(this.props.timeDate).add(1, 'day').startOf('day');
    };
    disabledDate = (current) => {
        return current > moment(this.props.timeDate).startOf('day');
    };

    dateChange = (date, dateString) => {
        const { dispatch, forecastTypeValue, stationDetail, defineTomorrowDate } = this.props;
        // dispatch({ type: 'awareness/closeSocket' });
        this.props.updateState({
            nowDate: dateString
        })
        if (dateString < defineTomorrowDate) {
            this.props.updateState({
                echartList: {
                    xData: [], yData: [[]], series: [
                        {
                            name: utils.intl("awareness.预测值"),
                            unit: 'kW'
                        },
                        {
                            name: utils.intl("awareness.实际值"),
                            unit: 'kW'
                        }]
                }
            })
            if (forecastTypeValue === 1) {
                this.props.updateState({
                    tomorrowDate: dateString
                })
            } else {
                this.props.updateState({
                    date: dateString
                })
            }
        } else {
            this.props.updateState({
                tomorrowDate: dateString, echartList: {
                    xData: [], yData: [[]], series: [
                        {
                            name: utils.intl("awareness.预测值"),
                            unit: 'kW'
                        }]
                }
            })
        }
        if (forecastTypeValue === 2 && moment(this.props.timeDate).format('YYYY-MM-DD') === dateString || forecastTypeValue === 1 && moment(this.props.timeDate).add(1, 'day').format('YYYY-MM-DD') === dateString) {
            // dispatch({ type: 'awareness/init', payload: { dispatch } });
            dispatch({ type: "awareness/emitSocket", payload: { eventName: 'message', params: { predictType: forecastTypeValue, stationId: stationDetail.id, date: dateString, frequency: 'original' } } })
        } else {
            this.props.action('getCurve');
        }
    };
    changeType = (o) => {
        const { date, dispatch, stationDetail, tomorrowDate } = this.props;
        this.props.updateState({
            forecastTypeValue: o,
        })
        if (o === 1) {
            this.props.updateState({
                tomorrowDate: moment(this.props.timeDate).add(1, 'day').format('YYYY-MM-DD'), echartList: {
                    xData: [], yData: [[]], series: [
                        {
                            name: utils.intl("awareness.预测值"),
                            unit: 'kW'
                        }]
                }
            })
            dispatch({ type: "awareness/emitSocket", payload: { eventName: 'message', params: { predictType: o, stationId: stationDetail.id, date: moment(this.props.timeDate).add(1, 'day').format('YYYY-MM-DD'), frequency: 'original' } } })
        } else {
            this.props.updateState({
                date: moment(this.props.timeDate).format('YYYY-MM-DD'), echartList: {
                    xData: [], yData: [[], []], series: [
                        {
                            name: utils.intl("awareness.预测值"),
                            unit: 'kW'
                        },
                        {
                            name: utils.intl("实际值"),
                            unit: 'kW'
                        }
                    ]
                }
            })
            dispatch({ type: "awareness/emitSocket", payload: { eventName: 'message', params: { predictType: o, stationId: stationDetail.id, date: moment(this.props.timeDate).format('YYYY-MM-DD'), frequency: 'original' } } })
        }
        // dispatch({ type: 'awareness/init', payload: { dispatch } });
    }
    render() {
        const { echartList, date, forecastType, forecastTypeValue, loading, pageId, tomorrowDate, socketLoading } = this.props;
        return (
            <Page showStation pageId={pageId} className="bf-br4">
                <div className={styles.awareness}>
                    <div className="bf-br4 f-df flex-column e-p10" style={{ height: '100%' }}>
                        <div className="e-mt10 d-flex" style={{ marginLeft: 6 }}>
                            <div className="f-tal" style={{ marginRight: 10 }}>
                                <Select
                                    style={{ minWidth: '163px' }}
                                    onSelect={this.changeType}
                                    dataSource={forecastType}
                                    value={forecastTypeValue}
                                />
                            </div>
                            <div className="f-tal">
                                <DatePicker
                                    disabledDate={forecastTypeValue === 1 ? this.disabledTomorrowDate : this.disabledDate}
                                    allowClear={false}
                                    className={'select100'}
                                    onChange={this.dateChange}
                                    value={forecastTypeValue === 1 ? moment(tomorrowDate, 'YYYY-MM-DD') : moment(date, 'YYYY-MM-DD')}
                                />
                            </div>
                        </div>
                        <div className="flex-grow e-pt10 f-pr f-oh" style={{ position: 'relative' }}>
                            {socketLoading['message'] && <FullLoading />}
                            <LineChart series={echartList.series} xData={echartList.xData} yData={echartList.yData?.slice(0, echartList.series.length)} options={{
                                startDate: moment(forecastTypeValue === 1 ? tomorrowDate : date, 'YYYY-MM-DD HH:mm:ss').startOf('day'),
                                endDate: moment(forecastTypeValue === 1 ? tomorrowDate : date, 'YYYY-MM-DD HH:mm:ss').endOf('day'),
                                dateFormat: (d) => { return moment(d).format('HH:mm:ss') },
                            }} />
                        </div>
                    </div>
                </div>
            </Page>
        )
    }
}

function mapStateToProps(model, getLoading, state) {
    return {
        ...model,
        loading: getLoading('getList'),
        stationDetail: state.global.stationDetail,
        timeDate: state.global.timeDate,
    };
}

export default makeConnect('awareness', mapStateToProps)(Awareness);