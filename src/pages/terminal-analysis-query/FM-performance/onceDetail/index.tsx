import React from 'react'
import { Button, Row, Col, Table2, Select, DatePicker } from 'wanke-gui'
import { makeConnect } from '../../../umi.helper'
import MakeConnectProps from '../../../../interfaces/MakeConnectProps'
import { onceDetailModal } from './model'
import PageProps from '../../../../interfaces/PageProps'
import FullContainer from '../../../../components/layout/FullContainer'
import moment from 'moment';
import Tools from '../../../../components/layout/Tools'
import Export from '../../../../components/layout/Export'
import AbsoluteBubble from '../../../../components/AbsoluteBubble'
import { disabledDateAfterToday } from '../../../../util/dateUtil'
import { CrumbsPortal } from '../../../../frameset/Crumbs'
import utils from '../../../../public/js/utils'

const { RangePicker } = DatePicker
interface Props extends MakeConnectProps<onceDetailModal>, onceDetailModal, PageProps {
    loading: boolean;
    startTime: any;
    endTime: any;
    powerUnitValue: any;
    crews: any;
    selectedStationId: any;
    stationId: any;
}

class OnceDetail extends React.Component<Props> {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        // this.props.action('getList')
        const { dispatch, action, stationId, selectedStationId } = this.props;
        if (!stationId) {
            dispatch({
                type: 'onceDetail/updateState',
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
        //         type: 'onceDetail/updateState',
        //         payload: { oldPowerUnitValue: powerUnitValue }
        //     }).then(res => {
        //         this.props.action('getList')
        //     })
        // }
    }

    handleChangeStartTime = (date, dateString) => {
        const { dispatch } = this.props
        dispatch({
            type: 'fmPerformance/updateState',
            payload: { startTime: date }
        })
    }
    handleChangeEndTime = (date, dateString) => {
        const { dispatch } = this.props
        dispatch({
            type: 'fmPerformance/updateState',
            payload: { endTime: date }
        })
    }
    pageChange = (page, size) => {
        const { dispatch } = this.props;
        dispatch({ type: 'onceDetail/pageChange', payload: { page, size } });
    };
    changePowerUnit = async (value) => {
        const { dispatch } = this.props;
        await dispatch({
            type: 'fmPerformance/updateState',
            payload: { powerUnitValue: value }
        });

        this.props.action('getList')
    };
    render() {
        const { list, loading, startTime, endTime, powerUnitValue, crews, query, total, } = this.props
        const columns = [
            { title: utils.intl('序号'), dataIndex: 'num', key: 'xh', width: '65px' },
            { title: utils.intl('日期'), dataIndex: 'date', key: 'date', width: 120 },
            { title: utils.intl('开始时间'), dataIndex: 'startTime', key: 'kssj', width: 120 },
            {
                title: utils.intl('AGC指令'), dataIndex: 'agc', key: 'agczl', width: '11%',
                render: (text, record, index) => {
                    return <AbsoluteBubble>{text + 'MW'}</AbsoluteBubble>
                }
            },
            { title: utils.intl('结束时间'), dataIndex: 'endTime', key: 'jssj', width: 120 },
            {
                title: utils.intl('开始出力'), dataIndex: 'unitStartPower', key: 'kscl', width: '11%',
                render: (text, record, index) => {
                    return <AbsoluteBubble>{text + 'MW'}</AbsoluteBubble>
                }
            },
            {
                title: utils.intl('结束出力'), dataIndex: 'unitEndPower', key: 'jscl', width: '11%',
                render: (text, record, index) => {
                    return <AbsoluteBubble>{text + 'MW'}</AbsoluteBubble>
                }
            },
            {
                title: utils.intl('合并出力'), dataIndex: 'mergedPower', key: 'hbcl', width: '12%',
                render: (text, record, index) => {
                    return <AbsoluteBubble>{text + 'MW'}</AbsoluteBubble>
                }
            },
            { title: 'K1', dataIndex: 'k1', key: 'k1', width: '5%' },
            { title: 'K2', dataIndex: 'k2', key: 'k2', width: '5%' },
            { title: 'K3', dataIndex: 'k3', key: 'k3', width: '5%' },
            { title: utils.intl('单次Kp'), dataIndex: 'kp', key: 'dckp', width: '6%' },
            {
                title: utils.intl('参与的储能单元'), dataIndex: 'energyStorageUnits', key: 'cydcndy',
                render: (text, record, index) => {
                    return <AbsoluteBubble>{text}</AbsoluteBubble>
                }
            }
        ]
        // console.log(powerUnitValue)
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
                                format="YYYY-MM-DD HH:mm"
                                showTime
                                onChange={async (value) => {
                                    const { dispatch } = this.props
                                    await dispatch({
                                        type: 'fmPerformance/updateState',
                                        payload: { startTime: value[0],  endTime: value[1] }
                                    })

                                    this.props.action('getList')
                                }}
                                value={[startTime, endTime]}
                                allowClear={false}
                            />
                            {/* <span>{utils.intl('开始时间')}：</span> */}
                            {/* <DatePicker
                                showTime={{ format: 'HH:mm' }}
                                format="YYYY-MM-DD HH:mm"
                                value={startTime}
                                onChange={this.handleChangeStartTime}
                                allowClear={false}
                                disabledDate={disabledDateAfterToday}
                            /> */}
                            {/* <span className='e-ml10'>{utils.intl('结束时间')}：</span> */}
                            {/* <DatePicker
                                showTime={{ format: 'HH:mm' }}
                                format="YYYY-MM-DD HH:mm"
                                value={endTime}
                                onChange={this.handleChangeEndTime}
                                allowClear={false}
                                disabledDate={disabledDateAfterToday}
                            /> */}
                        </div>
                        {/* <Button className='e-ml10' type="primary" onClick={() => this.props.action('getList')}>{utils.intl('查询')}</Button> */}
                    </Col>
                </Row>
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
        startTime: state.fmPerformance.startTime,
        endTime: state.fmPerformance.endTime,
        selectedStationId: state.global.selectedStationId
    }
}

export default makeConnect('onceDetail', mapStateToProps)(OnceDetail)
