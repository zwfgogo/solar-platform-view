import React from 'react';
import { Button, Row, Col, Select, Table2 } from 'wanke-gui'
import { connect } from 'dva';
import Page from "../../../components/Page";
import Forward from "../../../public/components/Forward/index";
import RangePicker from '../../../components/rangepicker/index'
import moment from 'moment';
import { disabledDateAfterToday } from "../../../util/dateUtil";

//VPP点击记录进入的页面
class VppRecord extends React.Component<any> {

    componentDidMount() {
        const { dispatch, action } = this.props;
        dispatch({
            type: 'vppRecord/updateState',
            payload: {
                actionNum: action, startDate: moment().format('YYYY-MM-DD'),
                endDate: moment().format('YYYY-MM-DD')
            }
        }).then(res => {
            this.getList();
        });
    }
    componentWillUnmount() {
        const { dispatch } = this.props;
        dispatch({ type: 'vppRecord/reset' });
    }
    getList = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'vppRecord/getList'
        });
    };
    pageChange = (page, size) => {
        const { dispatch } = this.props;
        dispatch({ type: 'vppRecord/pageChange', payload: { page, size } });
    };

    sizeChange = (page, size) => {
        const { dispatch } = this.props;
        dispatch({ type: 'vppRecord/pageChange', payload: { page, size } });
    };

    dateChange = (date, dateString) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'vppRecord/updateState',
            payload: { startDate: dateString[0], endDate: dateString[1] }
        }).then(res => {
            this.pageChange(1, 20);
        })
    };
    render() {
        const { list, date, selectStatusValue, selectStatus, loading, query, total, startDate, endDate, pageId, action } = this.props;
        const columns = [
            {
                title: '编号', dataIndex: 'num', key: 'bh', width: '100px'
            },
            {
                title: '指令下发时间', dataIndex: 'issueTime', key: 'gdmc',
                render: (text, record, index) => {
                    return (
                        <Forward to="vppRecordDetail" data={{ data: record, actionNum: action }}>
                            {text}
                        </Forward>

                    )
                }
            },
            {
                title: '下发调度功率', dataIndex: 'power', key: 'gdlx',
            },
            {
                title: '调度时间', dataIndex: 'dispatchTime', key: 'zd', align: 'center'
            },
            {
                title: '调度能量', dataIndex: 'energy', key: 'sb',
            },
            {
                title: '收益', dataIndex: 'profit', key: 'clr', align: 'right'
            },
        ]
        return (
            <Page className="bf-br10" pageId={pageId} pageTitle={'调度记录'}>
                <div className="bf-br10 f-df flex-column e-p10" style={{ height: '100%' }}>
                    <Row className="e-mt10 e-pl10">
                        <Col span={22} className="f-tal">
                            <div>
                                <span>指令下发时间：</span>
                                <RangePicker
                                    disabledDate={disabledDateAfterToday}
                                    maxLength={90}
                                    allowClear={true}
                                    onChange={this.dateChange}
                                    value={[startDate ? moment(startDate, 'YYYY-MM-DD') : startDate, endDate ? moment(endDate, 'YYYY-MM-DD') : endDate]}
                                />
                            </div>
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
                </div>
            </Page>
        )
    }
}

function mapStateToProps(state) {
    return {
        ...state.vppRecord, loading: state.loading.effects['vppRecord/getList'],
    };
}

export default connect(mapStateToProps)(VppRecord);
