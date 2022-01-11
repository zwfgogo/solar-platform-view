import React from 'react'
import { Button, Row, Col, Table1, Select, DatePicker, MultiLineChart, message } from 'wanke-gui'
import Page from '../../../components/Page'
import { makeConnect } from '../../umi.helper'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import { conmandOutputModal } from './model'
import PageProps from '../../../interfaces/PageProps'
import FullContainer from '../../../components/layout/FullContainer'
import moment from 'moment';
import Tools from '../../../components/layout/Tools'
import Export from '../../../components/layout/Export'
import { disabledDateAfterToday } from '../../../util/dateUtil'
import utils, { getQueryString } from '../../../util/utils'
import { CrumbsPortal } from '../../../frameset/Crumbs'
import FormLayout from '../../../components/FormLayout'

const { FieldItem } = FormLayout
const { RangePicker} = DatePicker

interface Props extends MakeConnectProps<conmandOutputModal>, conmandOutputModal, PageProps {
    loading: boolean;
    conmandOutputChart: any;
    selectedStationId: any;
}

class ConmandOutput extends React.Component<Props> {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const { dispatch, action, stationId, selectedStationId } = this.props;
        if (!stationId) {
            if (location.search.indexOf('?') !== -1) {
                dispatch({
                    type: 'conmandOutput/updateState',
                    payload: { stationId: selectedStationId, powerUnitValue: parseInt(getQueryString('powerUnitValue')) }
                }).then(res => {
                    dispatch({
                        type: 'conmandOutput/getCrews',
                    }).then(res => {
                        action('getList');
                    });
                })
            } else {
                dispatch({
                    type: 'conmandOutput/getCrews',
                }).then(res => {
                    action('getList');
                });
            }
        }
    }

    componentWillUnmount() {
        this.props.action('reset');
    }
    componentDidUpdate() {
        const { dispatch, action, stationId, selectedStationId } = this.props;
        if (selectedStationId !== stationId) {
            if (location.search.indexOf('?') !== -1) {
                dispatch({
                    type: 'conmandOutput/updateState',
                    payload: { stationId: selectedStationId, powerUnitValue: parseInt(getQueryString('powerUnitValue')) }
                }).then(res => {
                    dispatch({
                        type: 'conmandOutput/getCrews',
                    }).then(res => {
                        action('getList');
                    });
                })
            } else {
                dispatch({
                    type: 'conmandOutput/getCrews',
                }).then(res => {
                    action('getList');
                });
            }
        }
    }
    changePowerUnit = (value) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'conmandOutput/updateState',
            payload: { powerUnitValue: value }
        });
    };
    handleChangeStartTime = (value, dateTimeString, open) => {
        let { endTime, dispatch } = this.props;
        let endTimeNew = endTime;
        if (value.isAfter(endTimeNew)) {
            endTimeNew = value;
        }
        dispatch({
            type: 'conmandOutput/updateState',
            payload: {
                endTime: endTimeNew,
                startTime: value
            }
        });
    };
    handleChangeEndTime = (value, dateTimeString, open) => {
        let { startTime, dispatch } = this.props;
        let startTimeNew = startTime;
        if (value.isBefore(startTimeNew)) {
            startTimeNew = value;
        }
        dispatch({
            type: 'conmandOutput/updateState',
            payload: {
                startTime: startTimeNew,
                endTime: value
            }
        });
    };

    handSearch = () => {
        const { startTime, endTime, dispatch } = this.props;
        if (endTime.format('YYYY-MM-DD') === startTime.format('YYYY-MM-DD')) {
            if (startTime === endTime) {
                message.error(utils.intl('结束时间要大于开始时间'))
            } else {
                this.props.action('getList')
            }
        } else {
            message.error(utils.intl('开始结束时间需是同一日'))
        }

    };
    render() {
        const { list, loading, conmandOutputChart, startTime, endTime, powerUnitValue, crews, pageId } = this.props
        const columns: any = [
            { title: utils.intl('编号'), dataIndex: 'num', key: 'xh', width: '65px' },
            { title: utils.intl('数据时间'), dataIndex: 'dtime', key: 'sjsj', width: '14%' },
            { title: utils.intl('AGC指令') + '（MW）', dataIndex: 'AGCInstruction', key: 'agczl', width: '20%' },
            { title: utils.intl('合并出力') + '（MW）', dataIndex: 'mergeOutput', key: 'hbcl', width: '20%' },
            { title: utils.intl('机组出力') + '（MW）', dataIndex: 'unitOutput', key: 'jzcl', width: '20%' },
            { title: utils.intl('储能出力') + '（MW）', dataIndex: 'energyStorageCapacity', key: 'cncl', width: '20%' }
        ]
        return (
            <Page className="agcZlclqx no-limit-filter-item" showStation={true} pageId={pageId} style={{ background: "transparent", display: "flex", flexDirection: "column" }}>
                <CrumbsPortal>
                    <Button disabled={crews.length > 0 ? false : true} onClick={() => this.props.action('onExport')} type="primary">
                        {utils.intl('导出')}
                    </Button>
                </CrumbsPortal>
                <FormLayout onSearch={this.handSearch}>
                    <FieldItem style={{ width: 380 }} label={utils.intl('起止时间')}>
                        <RangePicker 
                        format="YYYY-MM-DD HH:mm"
                        allowClear={false}
                        value={[startTime, endTime]}
                        disabledDate={disabledDateAfterToday}
                        style={{ width: 300 }}
                        showTime
                        onChange={value => {
                            this.props.dispatch({
                                type: 'conmandOutput/updateState',
                                payload: {
                                    startTime: value[0],
                                    endTime: value[1]
                                }
                            });
                        }}
                        />
                        {/* <Input
                            name="search"
                            value={query.queryStr}
                            placeholder={utils.intl('请输入关键字查询')}
                            onChange={e => {
                                props.action('updateQuery', {
                                    queryStr: e.target.value
                                })
                            }}
                        /> */}
                    </FieldItem>
                    <FieldItem label={utils.intl('机组名称')}>
                        <Select
                            value={powerUnitValue || null}
                            onChange={this.changePowerUnit}
                            dataSource={crews}
                            style={{ minWidth: '163px' }}
                        />
                    </FieldItem>
                </FormLayout>
                <FullContainer className="page-sub-container">
                    {/* <Row className="e-mt10">
                        <Col span={24} className="f-tal">
                            <div style={{ position: 'relative', float: 'left' }}>
                                <span> {utils.intl('开始时间')}：</span>
                                <DatePicker
                                    showTime={{ format: 'HH:mm' }}
                                    format="YYYY-MM-DD HH:mm"
                                    value={startTime}
                                    onChange={this.handleChangeStartTime}
                                    allowClear={false}
                                    disabledDate={disabledDateAfterToday}
                                />
                                <span className='e-ml10'>{utils.intl('结束时间')}：</span>
                                <DatePicker
                                    showTime={{ format: 'HH:mm' }}
                                    format="YYYY-MM-DD HH:mm"
                                    value={endTime}
                                    onChange={this.handleChangeEndTime}
                                    allowClear={false}
                                    disabledDate={disabledDateAfterToday}
                                />
                            </div>
                            <div className='e-ml10' style={{ position: 'relative', float: 'left' }}>
                                <Select value={powerUnitValue || null} onChange={this.changePowerUnit} dataSource={crews}
                                    label={utils.intl('机组名称') + "："} style={{ minWidth: '163px' }} />
                            </div>
                            <Button className='e-ml10' type="primary" onClick={this.handSearch} disabled={crews.length > 0 ? false : true}>{utils.intl('查询')}</Button>
                        </Col>
                    </Row> */}
                    <div className="flex1 e-pt10 f-pr">
                        <MultiLineChart
                            xData={conmandOutputChart.xData}
                            yData={conmandOutputChart.yData}
                            series={conmandOutputChart.series}
                            options={{yAxisScale: true}}
                        />
                    </div>
                    <div className="flex1 e-pt10 f-pr">
                        <Table1 dataSource={list} columns={columns} loading={loading} rowKey='id'
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

export default makeConnect('conmandOutput', mapStateToProps)(ConmandOutput)
