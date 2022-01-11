import React from 'react';
import { Button, Row, Col, Select, Input, Table1, Cascader, RangePicker, Tooltip } from 'wanke-gui'
import { Table, message } from 'antd';
import Page from "../../../components/Page";
import Columns from '../columns/index';
import LineChart from '../component/demo/index'
import { makeConnect } from "../../umi.helper"
import { disabledDateAfterToday, disabledDateAfterYesterday, getDate, disabledDateAfterNow } from "../../../util/dateUtil"
import { common_battery_analyze } from '../../constants';
import classnames from 'classnames';
import _ from 'lodash'
import { CrumbsPortal } from '../../../frameset/Crumbs';
import utils from '../../../public/js/utils';
import moment from 'moment';
import FormLayout from '../../../components/FormLayout';

const { FieldItem } = FormLayout

interface Option extends Array<any> {
    id: string | number;
    label?: React.ReactNode;
    disabled?: boolean;
    children?: Option[];
}
class Battery extends React.Component<any> {

    componentDidMount() {
        this.props.action("getSelect")
    }

    componentWillUnmount() {
        this.props.action("reset");
    }

    componentDidUpdate(preProps) {
        if (!_.isEqual(preProps.stationId, this.props.stationId)) {
            this.props.action("getSelect")
        }
    }

    search = () => {
        const { selectStatusValue, cascaderOption, selectOption } = this.props;
        if (selectOption.enname === 'temperature' && cascaderOption.length === 1) {
            message.error(utils.intl('数据维度为温度,分析范围必须选到电池单元或电池组'));
        }
        else if (selectOption.enname === 'voltage' && cascaderOption.length < 3) {
            message.error(utils.intl('数据维度为电压,分析范围必须选到电池组'));
        }
        else if (selectOption.enname === 'SOC' && cascaderOption.length === 1) {
            message.error(utils.intl('数据维度为SOC,分析范围必须选到电池单元'));
        }
        else if (!selectStatusValue) {
            message.error(utils.intl('请选择数据维度'));
            return;
        } else {
            this.props.action("updateState", { pageName: selectOption.enname });
            this.props.action("getList");
        }
    };

    onClickTree = (e) => {
        this.props.action("updateState", { stationId: e.id }).then(res => {
            this.props.action("getSelect").then(res => {
                this.props.action("updateState", { tableHeight: document.getElementById("tableDiv").offsetHeight - 50 })
            })
        })
    }

    selectChange = (o, option) => {
        this.props.action("updateState", { selectStatusValue: o, selectOption: option }).then(res => {
            if (option.enname === 'SOC') {
                this.props.action("getCascader", { leafDevice: 'BatteryUnit', axiosList: true });
            } else {
                this.props.action("getCascader", { leafDevice: 'BatteryCluster', axiosList: true });
            }
        });
    };

    cascaderChange = (o, option) => {
        this.props.action("updateState", { cascaderStatusValue: o, cascaderOption: option });
    };

    dateChange = (date, dateString) => {
        this.props.action("updateState", { startDate: dateString[0], endDate: dateString[1] });
    };

    range = (start, end) => {
        const result = [];
        for (let i = start; i < end; i++) {
            result.push(i);
        }
        return result;
    }
    disabledRangeTime = (_, type) => {
        let time = this.props.time?.time || '';
        let day = this.props.time?.day || '';
        let timeArr = time.split(":");
        let startTime = (parseInt(timeArr[0]) || 0) + 1
        let endTime = (parseInt(timeArr[1]) || 0) + 1
        if (moment(_).format('DD') !== day) {
            return {

            };
        } else {
            if (moment(_).format('HH') !== timeArr[0]) {
                return {
                    disabledHours: () => this.range(startTime, 24),
                };
            } else {
                return {
                    disabledHours: () => this.range(startTime, 24),
                    disabledMinutes: () => this.range(endTime, 60),
                };
            }
        }

    }
    render() {
        const { list, stationId, selectStatusValue, selectStatus, loading, query, total, pageName, echartData, startDate, endDate, batteryTree, cascaderStatusValue, data, tableHeight, pageId } = this.props;
        let columns = (Columns.columns)[pageName].apply(this);
        return (
            <Page
                className="bf-br10"
                pageId={pageId}
                pageTitle={utils.intl('battery.电池分析')}
                showStation
                style={{ background: 'transparent' }}
            >
                <CrumbsPortal pageName='batteryList'>
                    <Button onClick={() => this.props.action('onExport', { columns })} type="primary">
                        {utils.intl('导出')}
                    </Button>
                </CrumbsPortal>
                <div
                    className={classnames("f-df")}
                    style={{ height: '100%' }}
                >
                    <div
                        className={classnames("flex1 f-pr flex-column f-df")}
                    >
                        {stationId ? (<>
                            <Row className="page-card-bg" style={{ padding: 16 }}>
                                <Col span={24}>
                                    <div style={{ marginRight: 16, float: 'left' }}>
                                        <Select value={selectStatusValue} onChange={this.selectChange} dataSource={selectStatus}
                                            label={utils.intl("数据维度") + "："} style={{ minWidth: '163px' }} />
                                    </div>
                                    <div style={{ marginRight: 16, float: 'left' }}>
                                        <span>{utils.intl("分析范围")}：</span>
                                        <Tooltip title={this.props.cascaderOption.length ? () => {
                                            let title = ''
                                            this.props.cascaderOption && this.props.cascaderOption.map((o, i) => {
                                                if (i === 0) {
                                                    title += o.title
                                                } else {
                                                    title += '/' + o.title
                                                }
                                            })
                                            return title
                                        } : undefined}>
                                            <Cascader
                                                placeholder={utils.intl("请选择分析范围")}
                                                onChange={this.cascaderChange}
                                                options={batteryTree}
                                                style={{ minWidth: '200px' }}
                                                fieldNames={{ label: 'title', value: 'id' }}
                                                changeOnSelect
                                                value={cascaderStatusValue}
                                            />
                                        </Tooltip>
                                    </div>
                                    <div style={{ float: 'left' }}>
                                        <span>{utils.intl("日期")}：</span>
                                        <RangePicker
                                            allowClear={false}
                                            disabledDate={current => disabledDateAfterNow(current)}
                                            // disabledTime={this.disabledRangeTime}
                                            format={'YYYY-MM-DD HH:mm'}
                                            maxLength={2}
                                            onChange={this.dateChange}
                                            showTime={{
                                                // hideDisabledOptions: true,
                                                format: 'HH:mm',
                                            }}
                                            style={{ width: '300px' }}
                                            value={[getDate(startDate), getDate(endDate)]}
                                        />
                                    </div>
                                    <Button style={{ marginLeft: 16 }} type="primary" onClick={this.search}>{utils.intl("查询")}</Button>
                                </Col>
                            </Row>
                            <div className="flex1 f-pr f-df flex-column page-card-bg" style={{ marginTop: 16 }}>
                                <div className="flex1 f-pr" style={{ padding: '16px 16px 0 16px' }}>
                                    <LineChart echartData={echartData} formatXLabel={true} loading={loading} />
                                </div>
                                <div className="flex1 f-pr" id={'tableDiv'} key={pageName} style={{ padding: 16 }}>
                                    <Table1 x={0} dataSource={list} columns={columns} loading={loading} rowKey="num" />
                                </div>
                            </div>
                        </>) : ""}
                    </div>

                </div>
            </Page>
        )
    }
}

function mapStateToProps(model, getLoading, state) {
    const { list } = model
    return {
        ...model,
        stationId: state.global.selectedStationId,
        loading: getLoading('getList'),
        time: state.global.time
    }
}

export default makeConnect(common_battery_analyze, mapStateToProps)(Battery);