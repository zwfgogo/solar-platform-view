import React from 'react'
import { Button, Row, Col, Table1, MultiLineChart, RangePicker, LineChart } from 'wanke-gui'
import { makeConnect } from '../../../umi.helper'
import MakeConnectProps from '../../../../interfaces/MakeConnectProps'
import { totalFMModal } from './model'
import PageProps from '../../../../interfaces/PageProps'
import FullContainer from '../../../../components/layout/FullContainer'
import moment from 'moment';
import { getDate } from '../../../../util/dateUtil'
import { disabledDateAfterToday } from '../../../../util/dateUtil'
import utils from '../../../../public/js/utils'
interface Props extends MakeConnectProps<totalFMModal>, totalFMModal, PageProps {
    loading: boolean;
    startDate: any;
    endDate: any;
    stationId: any;
    selectedStationId: any;
}

class TotalFM extends React.Component<Props> {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const { dispatch, action, stationId, selectedStationId } = this.props;
        if (!stationId) {
            dispatch({
                type: 'totalFM/updateState',
                payload: { stationId: selectedStationId }
            }).then(res => {
                this.props.action('getList')
            })
        }
        // this.props.action('getList')
    }

    componentWillUnmount() {
        this.props.action('reset')
    }

    componentDidUpdate() {
        const { dispatch, action, stationId, selectedStationId } = this.props;
        if (selectedStationId !== stationId) {
            dispatch({
                type: 'totalFM/updateState',
                payload: { stationId: selectedStationId }
            }).then(res => {
                this.props.action('getList')
            })
        }
    }

    dateChange = (date, dateString) => {
        const { dispatch } = this.props
        dispatch({
            type: 'fmPerformance/updateState',
            payload: { totalStartDate: dateString[0], totalEndDate: dateString[1] }
        }).then(res => {
            this.props.action('getList')
        })
    }
    render() {
        const { list, loading, conmandOutputChart, startDate, endDate, dispatch } = this.props
        const columns = [
            { title: utils.intl('序号'), dataIndex: 'num', key: 'xh', width: '65px' },
            {
                title: utils.intl('机组'), dataIndex: 'name', key: 'name',
                render: (value, record) => {
                    if (record.adjustTimes > 0 || record.adjustDeep > 0 || record.compensatoryPower > 0) {
                        let params = { id: record.id, startDate: '', endDate: '' };
                        params.startDate = startDate;
                        params.endDate = endDate;
                        return (
                            <span style={{ color: '#1890ff', cursor: 'pointer' }} onClick={() => {
                                dispatch({
                                    type: 'fmPerformance/tabChange',
                                    payload: { tabNum: '2', params: params, page: 'total' }
                                })
                            }}>
                                {value}
                            </span>
                        );
                    }
                    else {
                        return (
                            <span>{value}</span>);
                    }
                },
            },
            { title: utils.intl('调节次数'), dataIndex: 'adjustTimes', key: 'adjustTimes' },
            { title: utils.intl('调节深度D') + '（MW）', dataIndex: 'adjustDeep', key: 'adjustDeep' },
            { title: utils.intl('补偿电量') + '（MWh）', dataIndex: 'compensatoryPower', key: 'compensatoryPower' },
        ]
        return (
            <FullContainer style={{ padding: '0 10px' }}>
                <Row>
                    <Col span={12} className="f-tal">
                        <div>
                            {/* <span>{utils.intl('日期')}：</span> */}
                            <RangePicker
                                disabledDate={disabledDateAfterToday}
                                onChange={this.dateChange}
                                value={[getDate(startDate), getDate(endDate)]}
                                allowClear={false}
                            />
                        </div>
                    </Col>
                </Row>
                <div className="flex1 e-pt10 f-pr">
                    <LineChart
                        series={conmandOutputChart.series}
                        xData={conmandOutputChart.xData}
                        yData={conmandOutputChart.yData}
                        options={{
                            startDate: moment(startDate, 'YYYY-MM-DD HH:mm:ss').startOf('day'),
                            endDate: moment(endDate, 'YYYY-MM-DD HH:mm:ss').endOf('day'),
                            dateFormat: (d) => { return moment(d).format('YYYY-MM-DD') },
                        }}
                    />
                </div>
                <div className="flex1 e-pt10 f-pr">
                    <Table1 dataSource={list} columns={columns} loading={loading} rowKey="id" />
                </div>
            </FullContainer>
        )
    }
}

function mapStateToProps(model, getLoading, state) {
    return {
        ...model,
        loading: getLoading('getList'),
        startDate: state.fmPerformance.totalStartDate,
        endDate: state.fmPerformance.totalEndDate,
        selectedStationId: state.global.selectedStationId
    }
}

export default makeConnect('totalFM', mapStateToProps)(TotalFM)
