import React from 'react'
import { Button, Row, Col, Table2, Select, RangePicker } from 'wanke-gui'
import { makeConnect } from '../../../umi.helper'
import MakeConnectProps from '../../../../interfaces/MakeConnectProps'
import { dayDetailModal } from './model'
import PageProps from '../../../../interfaces/PageProps'
import FullContainer from '../../../../components/layout/FullContainer'
import styles from './index.less'
import moment from 'moment';
import { getDate } from '../../../../util/dateUtil'
import Tools from '../../../../components/layout/Tools'
import Export from '../../../../components/layout/Export'
import { disabledDateAfterToday } from '../../../../util/dateUtil'
import { CrumbsPortal } from '../../../../frameset/Crumbs'
import utils from '../../../../public/js/utils'

interface Props extends MakeConnectProps<dayDetailModal>, dayDetailModal, PageProps {
    loading: boolean;
    powerUnitValue: any;
    crews: any;
    total: any;
    detail: any;
    selectedStationId: any;
    stationId: any;
}

class DayDetail extends React.Component<Props> {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        // this.props.action('getList')
        const { dispatch, action, stationId, selectedStationId } = this.props;
        if (!stationId) {
            dispatch({
                type: 'dayDetail/updateState',
                payload: { stationId: selectedStationId }
            }).then(res => {
                this.props.action('getList')
            })
        }
    }

    componentWillUnmount() {
        this.props.action('reset')
    }

    componentDidUpdate() {
        // const { dispatch, action, stationId, oldPowerUnitValue, powerUnitValue } = this.props;
        // if (powerUnitValue !== oldPowerUnitValue) {
        //     dispatch({
        //         type: 'dayDetail/updateState',
        //         payload: { oldPowerUnitValue: powerUnitValue }
        //     }).then(res => {
        //         this.props.action('getList')
        //     })
        // }
    }

    dateChange = async (date, dateString) => {
        const { dispatch } = this.props
        await dispatch({
            type: 'fmPerformance/updateState',
            payload: { startDate: dateString[0], endDate: dateString[1] }
        })

        this.props.action('getList')
    }
    changePowerUnit = async (value) => {
        const { dispatch } = this.props;
        await dispatch({
            type: 'fmPerformance/updateState',
            payload: { powerUnitValue: value }
        });

        this.props.action('getList')
    };
    pageChange = (page, size) => {
        const { dispatch } = this.props;
        dispatch({ type: 'dayDetail/pageChange', payload: { page, size } });
    };
    render() {
        const { list, loading, startDate, endDate, powerUnitValue, crews, dispatch, query, total, detail } = this.props
        const columns = [
            { title: utils.intl('序号'), dataIndex: 'num', key: 'xh', width: '65px' },
            {
                title: utils.intl('日期'), dataIndex: 'dtime', key: 'dtime', width: 120,
                render: (value, record) => {
                    if (record.adjustTimes > 0 || record.kp > 0 || record.foldbackTimes > 0 || record.adjustDeep > 0 || record.compensatoryPower > 0) {
                        let params = {
                            powerUnitValue: powerUnitValue,
                            date: value
                        };
                        return (
                            <span style={{ color: '#1890ff', cursor: 'pointer' }} onClick={() => {
                                dispatch({
                                    type: 'fmPerformance/tabChange',
                                    payload: { tabNum: '3', params: params, page: 'day' }
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
            { title: utils.intl('折返次数'), dataIndex: 'foldbackTimes', key: 'foldbackTimes' },
            { title: utils.intl('调节性能Kpd'), dataIndex: 'kp', key: 'kp' },
            { title: utils.intl('调节深度D') + '（MW）', dataIndex: 'adjustDeep', key: 'adjustDeep' },
            { title: utils.intl('补偿电量') + '（MWh）', dataIndex: 'compensatoryPower', key: 'compensatoryPower' },
        ]
        return (
            <FullContainer style={{ padding: '0 10px 10px 10px' }}>
                <CrumbsPortal>
                    <Button style={{ marginLeft: 16 }} type="primary" onClick={() => this.props.action('onExport')}>{utils.intl('导出')}</Button>
                </CrumbsPortal>
                <Row>
                    <Col span={20} className="f-tal">
                        <div style={{ position: 'relative', float: 'left' }}>
                            <Select value={powerUnitValue || undefined} onChange={this.changePowerUnit} dataSource={crews}
                                style={{ minWidth: '163px' }} placeholder={utils.intl('请选择')} />
                        </div>
                        <div className='e-ml10' style={{ position: 'relative', float: 'left' }}>
                            <RangePicker
                                disabledDate={disabledDateAfterToday}
                                onChange={this.dateChange}
                                value={[getDate(startDate), getDate(endDate)]}
                                allowClear={false}
                            />
                        </div>
                        {/* <Button className='e-ml10' type="primary" onClick={() => this.props.action('getList')}>{utils.intl('查询')}</Button> */}
                    </Col>
                </Row>
                <div className="e-pt10 f-pr columnPage">
                    {detail &&
                        <div className={styles["fontSize-18"] + ' total e-mb10 sub-context'} style={{ lineHeight: '38px' }}>
                            {/* <span>{utils.intl('合计')}</span> */}
                            <span className='e-ml15'><span
                                className={styles["color-999999"]}>{utils.intl('调节')}</span>
                                <span>
                                    <span className="e-value">{detail.adjustTimes}</span><span
                                        className="e-unit">{utils.intl('次')}</span>
                                </span>
                            </span>
                            <span className='e-ml15'><span
                                className={styles["color-999999"]}>{utils.intl('调节性能Kpd')}</span>
                                <span>
                                    <span className="e-value">{detail.kp}</span><span
                                        className="e-unit">{utils.intl('次')}</span>
                                </span></span>
                            <span className='e-ml15'><span
                                className={styles["color-999999"]}>{utils.intl('折返')}</span>
                                <span>
                                    <span className="e-value">{detail.foldbackTimes}</span><span
                                        className="e-unit">{utils.intl('次')}</span>
                                </span></span>
                            <span className='e-ml15'><span
                                className={styles["color-999999"]}>{utils.intl('调节深度D')}</span>
                                <span>
                                    <span className="e-value">{detail.adjustDeep}</span><span
                                        className="e-unit">MW</span>
                                </span>
                            </span>
                            <span className='e-ml15'><span
                                className={styles["color-999999"]}>{utils.intl('补偿电量')}</span>
                                <span>
                                    <span className="e-value">{detail.compensatoryPower}</span>
                                    <span className="e-unit">MWh</span></span>
                            </span>
                        </div>
                    }
                </div>
                <div className="flex1 e-pt10 f-pr">
                    <Table2 dataSource={list} columns={columns} loading={loading}
                        rowKey="id"
                        page={query.page}
                        size={query.size}
                        total={total}
                        onPageChange={(page, size) => this.pageChange(page, size)}
                    />
                </div>
            </FullContainer>
        )
    }
}

function mapStateToProps(model, getLoading, state) {
    return {
        ...model,
        loading: getLoading('getList'),
        crews: state.fmPerformance.crews,
        powerUnitValue: state.fmPerformance.powerUnitValue,
        startDate: state.fmPerformance.startDate,
        endDate: state.fmPerformance.endDate,
        selectedStationId: state.global.selectedStationId
    }
}

export default makeConnect('dayDetail', mapStateToProps)(DayDetail)
