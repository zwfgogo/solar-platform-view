import React from 'react'
import { Button, Row, Col, Select, Table2 } from 'wanke-gui'
import Page from '../../../../components/Page'
import { makeConnect } from '../../../umi.helper'
import MakeConnectProps from '../../../../interfaces/MakeConnectProps'
import { investigationModal } from './model'
import PageProps from '../../../../interfaces/PageProps'
import FullContainer from '../../../../components/layout/FullContainer'
import styles from './index.less'
import RangePicker from '../../../../components/rangepicker/index'
import { getDate } from '../../../../util/dateUtil'
import moment from 'moment';
import Tools from '../../../../components/layout/Tools'
import Export from '../../../../components/layout/Export'
import Forward from "../../../../public/components/Forward/index";
import { disabledDateAfterToday } from '../../../../util/dateUtil'
import { CrumbsPortal } from '../../../../frameset/Crumbs'
import utils from '../../../../public/js/utils'
import FormLayout from '../../../../components/FormLayout'
import { isZh } from '../../../../core/env'

const FieldItem = FormLayout.FieldItem

interface Props extends MakeConnectProps<investigationModal>, investigationModal, PageProps {
    loading: boolean;
    explainModal: boolean;
    levelModal: boolean;
    list: any[];
    startDate: string;
    endDate: string;
    pageName: string;
    date: string;
    detail: any;
    energyList: any[];
    energyValue: string;
    powerUnitValue: string;
    crews: any[];
    selectedStationId: any;
}

class Investigation extends React.Component<Props> {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        // this.props.action('getEnergyUnits');
        // this.props.action('getList');
    }

    componentWillUnmount() {
        this.props.action('reset');
    }

    componentDidUpdate() {
        const { stationId, selectedStationId, dispatch } = this.props;
        console.log(selectedStationId, stationId)
        if (selectedStationId !== stationId) {
            dispatch({ type: 'investigation/getEnergyUnits' }).then(res => {
                this.props.action('getList');
            })
        }
    }

    pageChange = (page, size) => {
        const { dispatch } = this.props;
        dispatch({ type: 'investigation/pageChange', payload: { page, size } });
    };

    onDateChange = (date, dateString) => {
        const { dispatch, pageName } = this.props;
        dispatch({
            type: 'investigation/updateState',
            payload: { startDate: dateString[0], endDate: dateString[1] }
        });
    };
    changePowerUnit = (value) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'investigation/updateState',
            payload: { powerUnitValue: value }

        });
    };
    changeEnergy = (value) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'investigation/updateState',
            payload: { energyValue: value }

        });
    };
    render() {
        const { list, loading, query, total, startDate, endDate, energyList, energyValue, detail, pageId } = this.props
        const columns = [
            {
                title: utils.intl('序号'),
                dataIndex: 'num',
                key: 'xh',
                width: '65px',
                render: (value, record) => {
                    return (
                        <span>
                            {value}
                        </span>
                    );
                }
            },
            {
                title: utils.intl('日期'),
                dataIndex: 'date',
                key: 'date',
                render: (value, record) => {
                    return (
                        <Forward to="detailData" data={{ record: record, energyUnitValue: energyValue }}>
                            {value}
                        </Forward>
                    );
                }
            },
            {
                title: utils.intl('参与次数'),
                dataIndex: 'times',
                key: 'times',
                width: '12%',
                render: (value, record) => {
                    return (
                        <span>
                            {value}
                        </span>
                    );
                }
            },
            {
                title: utils.intl('参与充电次数'),
                dataIndex: 'chargeTimes',
                key: 'chargeTimes',
                width: '12%',
                render: (value, record) => {
                    return (
                        <span>
                            {value}
                        </span>
                    );
                }
            },
            {
                title: utils.intl('参与充电量') + '(kWh)',
                dataIndex: 'charge',
                key: 'charge',
                width: '13%',
                render: (value, record) => {
                    return (
                        <span>
                            {value}
                        </span>
                    );
                }
            },
            {
                title: utils.intl('充电SOC里程'),
                dataIndex: 'chargeSOC',
                key: 'chargeSOC',
                width: '14%',
                render: (value, record) => {
                    return (
                        <span>
                            {value}
                        </span>
                    );
                }
            },
            {
                title: utils.intl('参与放电次数'),
                dataIndex: 'dischargeTimes',
                key: 'dischargeTimes',
                width: '12%',
                render: (value, record) => {
                    return (
                        <span>
                            {value}
                        </span>
                    );
                }
            },
            {
                title: utils.intl('参与放电量') + '(kWh)',
                dataIndex: 'discharge',
                key: 'discharge',
                width: '13%',
                render: (value, record) => {
                    return (
                        <span>
                            {value}
                        </span>
                    );
                }
            },
            {
                title: utils.intl('放电SOC里程'),
                dataIndex: 'dischargeSOC',
                key: 'dischargeSOC',
                width: '14%',
                render: (value, record) => {
                    return (
                        <span>
                            {value}
                        </span>
                    );
                }
            }
        ]
        return (
            <Page pageId={pageId} pageTitle={utils.intl('储能参与情况查询')} className={styles["agcCncyqkcx"] + " e-p10 columnPage no-limit-filter-item"} showStation={true}
                style={{ background: "transparent", boxShadow: "none", display: "flex", flexDirection: "column", padding: 0 }}
            >
                <CrumbsPortal pageName='basicData'>
                    <Button style={{ marginLeft: 16 }} onClick={() => this.props.action('onExport')} type="primary">
                        {utils.intl('导出')}
                    </Button>
                </CrumbsPortal>
                <FormLayout onSearch={() => this.props.action('getList')}>
                    <FieldItem label={utils.intl('日期')} style={{ width: 300 }}>
                        <RangePicker
                            disabledDate={disabledDateAfterToday}
                            maxLength={365}
                            onChange={this.onDateChange}
                            value={[getDate(startDate), getDate(endDate)]}
                            allowClear={false}
                        />
                    </FieldItem>
                    <FieldItem label={utils.intl('能量单元')}>
                        <Select value={energyValue} onChange={this.changeEnergy} dataSource={energyList}
                            style={{ minWidth: isZh() ? 163 : 140 }} />
                    </FieldItem>
                </FormLayout>
                <FullContainer>
                    {/* <Row className="e-mt10">
                        <Col span={24} style={{ minWidth: '330px' }}>
                            <div style={{ position: 'relative', float: 'left' }}>
                                <span>{utils.intl('日期')}：</span>
                                <RangePicker
                                    disabledDate={disabledDateAfterToday}
                                    maxLength={365}
                                    onChange={this.onDateChange}
                                    value={[getDate(startDate), getDate(endDate)]}
                                    allowClear={false}
                                />
                            </div>
                            <div style={{ position: 'relative', float: 'left' }} className='e-ml10'>
                                <Select value={energyValue} onChange={this.changeEnergy} dataSource={energyList}
                                    label={utils.intl('能量单元') + "："} style={{ minWidth: '163px' }} />
                            </div>
                            <Button className='e-ml10' type="primary" onClick={() => this.props.action('getList')}>{utils.intl('查询')}</Button>
                        </Col>
                    </Row> */}
                    {detail && (
                        <div className={styles["fontSize-18"] + ' e-mb10 sub-context'} style={{ lineHeight: '38px' }}>
                            {/* <span>{utils.intl('合计')}</span> */}
                            <span className="e-ml15"><span className={styles["color-999999"]}>{utils.intl('参与次数')}</span>
                                <span>
                                    <span className="e-value">{detail.times}</span><span className="e-unit">{utils.intl('次')}</span>
                                </span>
                            </span>
                            <span className="e-ml15"><span className={styles["color-999999"]}>{utils.intl('参与充电次数')}</span>
                                <span><span className="e-value">{detail.chargeTimes}</span><span className="e-unit">{utils.intl('次')}</span></span>
                            </span>
                            <span className="e-ml15"><span className={styles["color-999999"]}>{utils.intl('参与充电量')}</span>
                                <span>
                                    <span className="e-value">{detail.chargePower}</span><span className="e-unit">kWh</span>
                                </span>
                            </span>
                            <span className="e-ml15"><span className={styles["color-999999"]}>{utils.intl('充电SOC里程')}</span>
                                <span><span className="e-value">{detail.chargeSoc}</span><span className="e-unit">%</span></span>
                            </span>
                            <span className="e-ml15"><span className={styles["color-999999"]}>{utils.intl('参与放电次数')}</span>
                                <span>
                                    <span className="e-value">{detail.dischargeTimes}</span><span className="e-unit">{utils.intl('次')}</span>
                                </span>
                            </span>
                            <span className="e-ml15"><span className={styles["color-999999"]}>{utils.intl('参与放电量')}</span>
                                <span>
                                    <span className="e-value">{detail.dischargePower}</span><span className="e-unit">kWh</span>
                                </span>
                            </span>
                            <span className="e-ml15 last-e-ml15"><span className={styles["color-999999"]}>{utils.intl('放电SOC里程')}</span>
                                <span>
                                    <span className="e-value">{detail.dischargeSoc}</span><span className="e-unit">%</span>
                                </span>
                            </span>
                        </div>
                    )}
                    <div className="flex1 f-pr">
                        <Table2 dataSource={list} columns={columns} loading={loading}
                            rowKey="id"
                            page={query.page}
                            size={query.size}
                            total={total}
                            onPageChange={(page, size) => this.pageChange(page, size)}
                        />
                    </div>
                </FullContainer>
            </Page>
        )
    }
}

function mapStateToProps(model, getLoading, state) {
    return {
        ...model,
        loading: getLoading('getList'),
        selectedStationId: state.global.selectedStationId
    }
}

export default makeConnect('investigation', mapStateToProps)(Investigation)
