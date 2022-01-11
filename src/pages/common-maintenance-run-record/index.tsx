import React from 'react';
import { Button, Row, Col, Select, Input, Table, Table2 } from 'wanke-gui'
import { connect } from 'dva';
import RangePicker from "../../components/rangepicker/index"
import moment from 'moment';
import RunModal from './component/runFrom'
import ListItemDelete from "../../components/ListItemDelete/index"
import Page from "../../components/Page";
import AbsoluteBubble from '../../components/AbsoluteBubble'
import { disabledDateAfterToday } from '../../util/dateUtil'
import { CrumbsPortal } from '../../frameset/Crumbs';
import utils from '../../public/js/utils';
import FormLayout from '../../components/FormLayout';
import FullContainer from '../../components/layout/FullContainer';

const { FieldItem } = FormLayout

class operationList extends React.Component<any> {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        const { dispatch } = this.props;
        dispatch({
            type: 'runRecord/stringChange', payload: {
                queryStr: '',
            }
        });
        dispatch({
            type: 'runRecord/updateState',
            payload: {
                startDate: moment().subtract(29, 'day').format('YYYY-MM-DD'),
                endDate: moment().format('YYYY-MM-DD')
            }
        })
    }

    //显示查看工单
    showCkgd = (id) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'runRecord/updateState',
            payload: { runModal: true, type: 'query' }
        }).then(res => {
            dispatch({
                type: 'runRecord/getDetail',
                payload: { id: id }
            })
        })
    };

    showBjgd = (record) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'runRecord/updateState',
            payload: { record: record, runModal: true, type: 'edit', id: record.id }
        })
    };

    showXzgd = () => {
        const { dispatch } = this.props;
        dispatch({

            type: 'runRecord/updateState',
            payload: { record: {}, runModal: true, type: 'new' }
        })
    };

    pageChange = (page, size) => {
        const { dispatch } = this.props;
        dispatch({ type: 'runRecord/pageChange', payload: { page, size } });
    };

    sizeChange = (page, size) => {
        const { dispatch } = this.props;
        dispatch({ type: 'runRecord/pageChange', payload: { page, size } });
    };

    dateChange = (date, dateString) => {
        const { dispatch, query } = this.props;
        dispatch({
            type: 'runRecord/updateState',
            payload: { startDate: dateString[0], endDate: dateString[1] }
        });
    };

    //搜索框的值改变
    searchChange = (type, data) => {
        const { dispatch } = this.props;
        dispatch({ type: 'runRecord/stringChange', payload: { [type]: data } });
    };

    search = () => {
        const { query } = this.props;
        this.pageChange(1, query.size);
    };

    delete = (id) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'runRecord/deleteRecord',
            payload: {
                id: id,
            },
        });
    };

    render() {
        const columns = [
            {
                title: utils.intl('日期'), dataIndex: 'date', key: 'date',
                render: (value) => value ? moment(value).format('YYYY-MM-DD') : value
            },
            {
                title: utils.intl('主持人'), dataIndex: 'presenter', key: 'presenter',
            },
            {
                title: utils.intl('参加人'), dataIndex: 'parter', key: 'parter',
                render: (value) => <AbsoluteBubble>{value}</AbsoluteBubble>
            },
            {
                title: utils.intl('运行分析译文'), dataIndex: 'analysisTopic', key: 'analysisTopic',
                render: (value) => <AbsoluteBubble>{value}</AbsoluteBubble>
            },
            {
                title: utils.intl('填写人'), dataIndex: 'writer', key: 'writer',
            },
            {
                title: utils.intl('审核人'), dataIndex: 'reviewer', key: 'reviewer',
            },
            {
                title: utils.intl('操作'), dataIndex: 'position', align: "right", key: 'position', render: (text, record, index) => {
                    return (
                        <div>
                            <a className="e-mr10" onClick={this.showCkgd.bind(this, record.id)}><span>{utils.intl('查看')}</span></a>
                            <a onClick={this.showBjgd.bind(this, record)}><span>{utils.intl('编辑')}</span></a>
                            <ListItemDelete onConfirm={this.delete.bind(this, record.id)}>
                                {/*tip={'是否删除该配置信息？'}*/}
                                <a style={{ marginLeft: '10px' }}>{utils.intl('删除')}</a>
                            </ListItemDelete>
                        </div>

                    )
                }
            }
        ]
        const { selectStatusValue, selectStatus, startDate, endDate, list, loading, runModal, total, query, dispatch } = this.props;
        return (
            <Page style={{ background: "transparent", boxShadow: "none", display: "flex", flexDirection: "column" }}>
                <CrumbsPortal>
                    <Button className="e-ml10" type="primary" onClick={this.showXzgd}>{utils.intl('新增')}</Button>
                    <Button type="primary" onClick={() => dispatch({
                        type: 'runRecord/onExport',
                    })} className="e-ml10">{utils.intl('导出')}</Button>
                </CrumbsPortal>
                <FormLayout
                    onSearch={this.search}
                    onReset={() => {
                        dispatch({
                            type: 'runRecord/stringChange', payload: {
                                queryStr: null,
                            }
                        });
                        dispatch({
                            type: 'runRecord/updateState',
                            payload: {
                                startDate: moment().subtract(29, 'day').format('YYYY-MM-DD'),
                                endDate: moment().format('YYYY-MM-DD')
                            }
                        })
                    }}>
                    <FieldItem label={utils.intl('日期')}>
                        <RangePicker
                            disabledDate={disabledDateAfterToday}
                            maxLength={90}
                            allowClear={true}
                            onChange={this.dateChange}
                            value={startDate && endDate ? [moment(startDate, 'YYYY-MM-DD'), moment(endDate, 'YYYY-MM-DD')] : []}
                        />
                    </FieldItem>
                    <FieldItem label={utils.intl('关键字')}>
                        <Input
                            placeholder={utils.intl('请输入关键字')}
                            value={query?.queryStr}
                            onChange={(e) => this.searchChange('queryStr', e.target.value)}
                        />
                    </FieldItem>
                </FormLayout>
                <FullContainer className="page-sub-container">
                    <div className="flex1">
                        <Table2 dataSource={list} columns={columns} loading={loading}
                            rowKey="num"
                            page={query.page}
                            size={query.size}
                            total={total}
                            onPageChange={(page, size) => this.pageChange(page, size)}
                        />
                    </div>
                </FullContainer>
                {/* <div className="f-df flex-column e-p10 page-sub-container"> */}
                {/* <div className="flex1 e-pt10 f-pr"> */}
                {/* <Table2 dataSource={list} columns={columns} loading={loading}
                            rowKey="num"
                            page={query.page}
                            size={query.size}
                            total={total}
                            onPageChange={(page, size) => this.pageChange(page, size)}
                        /> */}
                {/* <Tools>
                            <Export onExport={() => dispatch({
                                type: 'runRecord/onExport',
                            }) } />
                        </Tools> */}
                {/* </div> */}
                {/* </div> */}
                {runModal ? <RunModal /> : ''}
            </Page>
        )
    }
}

function mapStateToProps(state) {
    return {
        ...state.runRecord, loading: state.loading.effects['runRecord/getList'],
    };
}

export default connect(mapStateToProps)(operationList);