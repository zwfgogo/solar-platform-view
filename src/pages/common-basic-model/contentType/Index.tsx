import React from 'react';
import { Button, Row, Col, Select, Input, Table, Table1 } from 'wanke-gui'
import Page from "../../../components/Page";
import ListItemDelete from '../../../components/ListItemDelete/index'
import AddFrom from "./component/addFrom";
import Tools from '../../../components/layout/Tools'
import FullContainer from '../../../components/layout/FullContainer'
import { makeConnect } from '../../umi.helper'
import Back1 from '../../../components/layout/Back1'
import utils from '../../../public/js/utils';
import { CrumbsPortal } from '../../../frameset/Crumbs';
import AbsoluteBubble from '../../../components/AbsoluteBubble';

const { Search } = Input

class Device extends React.Component<any> {

    componentDidMount() {
        this.getList();
    };

    componentWillUnmount() {
        // this.props.action('reset');
    };

    getList = () => {
        const { contentRecord } = this.props;
        this.props.updateState({ selectId: contentRecord.id });
        this.props.action('getList');
    };

    //搜索框的值改变
    searchChange = (type, data) => {
        const { dispatch } = this.props;
        dispatch({ type: 'contentType/stringChange', payload: { [type]: data } });
    };

    delete = (id) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'contentType/deleteRecord',
            payload: {
                contentId: id,
            },
        });
    };
    showXz = () => {
        const { dispatch } = this.props;
        this.props.action('getModalList');
        dispatch({
            type: 'contentType/updateState',
            payload: {
                record: {},
                chanceModal: true,
                modalTitle: '新增设备类型'
            },
        });
    };

    search = () => {
        const { dispatch } = this.props;
        this.props.action('getList');
    };

    //表格内下拉框直接切换告警级别
    selectionChange = (typeName, data, id) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'contentType/editList',
            payload: { [typeName]: data, id: id }
        });
    };

    render() {
        const { list, date, selectStatusValue, selectStatus, loading, query, total, chanceModal, pageId, modelType, pageTitle, yesOrNo } = this.props;
        const columns1 = [
            {
                title: utils.intl('序号'), dataIndex: 'num', key: 'xh', width: 80, align: 'center',
            },
            {
                title: utils.intl('能量单元ID'), dataIndex: 'name'
            },
            {
                title: utils.intl('能量单元类型'), dataIndex: 'title'
            },
            {
                title: utils.intl('地区标识'),
                dataIndex: 'regionTitles',
            },
            {
                title: utils.intl('必须包含'),
                dataIndex: 'regions1',
                render: (text, record, index) => {
                    return (
                        <div className='alarmLevelContent'>
                            <Select value={record.isMustContain}
                                onChange={(data) => this.selectionChange('isMustContain', data, record.id)}
                                dataSource={yesOrNo}
                                label="" style={{ minWidth: '130px' }} />
                        </div>
                    )
                }
            },
            {
                title: utils.intl('唯一性'),
                dataIndex: 'regions2',
                render: (text, record, index) => {
                    return (
                        <div className='alarmLevelContent'>
                            <Select value={record.isUnique}
                                onChange={(data) => this.selectionChange('isUnique', data, record.id)}
                                dataSource={yesOrNo}
                                label="" style={{ minWidth: '130px' }} />
                        </div>
                    )
                }
            },
            {
                title: utils.intl('操作'),
                dataIndex: 'operation',
                width: 100,
                align: 'center',
                render: (text, record, index) => {
                    return (
                        <span>
                            <ListItemDelete onConfirm={this.delete.bind(this, record.id)}>
                                <a>{utils.intl('删除')}</a>
                            </ListItemDelete>
                        </span>
                    )
                }
            },
        ]
        const columns: any = [
            {
                title: utils.intl('序号'), dataIndex: 'num', key: 'xh', width: 80, align: 'center',
            },
            {
                title: utils.intl('设备性质'), dataIndex: 'devicePropertyTitle'
            },
            {
                title: utils.intl('设备类型ID'), dataIndex: 'name'
            },
            {
                title: utils.intl('设备类型'), dataIndex: 'title'
            },
            {
                title: utils.intl('输入/输出端子'),
                dataIndex: 'terminalTitles',
                render: (text) => <AbsoluteBubble>{text}</AbsoluteBubble>
            },
            {
                title: utils.intl('地区标识'),
                dataIndex: 'regionTitles',
            },
            {
                title: utils.intl('必须包含'),
                dataIndex: 'regions3',
                render: (text, record, index) => {
                    return (
                        <div className='alarmLevelContent'>
                            <Select
                                value={record.isMustContain}
                                onChange={(data) => this.selectionChange('isMustContain', data, record.id)}
                                dataSource={yesOrNo}
                                label="" style={{ minWidth: '130px' }} />
                        </div>
                    )
                }
            },
            {
                title: utils.intl('唯一性'),
                dataIndex: 'regions4',
                render: (text, record, index) => {
                    return (
                        <div className='alarmLevelContent'>
                            <Select value={record.isUnique}
                                onChange={(data) => this.selectionChange('isUnique', data, record.id)}
                                dataSource={yesOrNo}
                                label="" style={{ minWidth: '130px' }} />
                        </div>
                    )
                }
            },
            {
                title: utils.intl('操作'),
                dataIndex: 'operation',
                width: 100,
                align: 'center',
                render: (text, record, index) => {
                    return (
                        <span>
                            <ListItemDelete onConfirm={this.delete.bind(this, record.id)}>
                                <a>{utils.intl('删除')}</a>
                            </ListItemDelete>
                        </span>
                    )
                }
            },
        ]
        return (
            <Page className="bf-br10" pageTitle={utils.intl(modelType + pageTitle)} pageId={pageId}>
                <CrumbsPortal pageName="contentType">
                    <Button type="primary" onClick={this.showXz} style={{ marginLeft: 8 }}>{utils.intl('选择')}</Button>
                </CrumbsPortal>
                <FullContainer className='e-p10'>
                    <Row className="e-mt10 ">
                        <Col span={22} className="f-tal">
                            <Search
                                placeholder={utils.intl('请输入关键字查询')}
                                style={{ width: 300 }}
                                onChange={(e) => this.searchChange('queryStr', e.target.value)}
                                onSearch={this.search}
                            />
                        </Col>
                    </Row>
                    <div className="flex1 e-pt10 f-pr">
                        <Table1 dataSource={list} columns={pageTitle === '模型可包含的设备类型' ? columns : columns1} loading={loading} rowKey="id" />
                    </div>
                    <div className="f-pr" style={{ height: '40px', margin: '10px' }}>
                        <Tools>
                            <Back1 back={() => this.props.back()} />
                        </Tools>
                    </div>
                    {chanceModal ? <AddFrom pageTitle={pageTitle} /> : ''}
                </FullContainer>
            </Page>
        )
    }
}

function mapStateToProps(model, getLoading, state) {
    return {
        ...model, ...state.modelConfig,
        loading: getLoading('getList'),
        updateLoading: getLoading('save')
    }
}

export default makeConnect('contentType', mapStateToProps)(Device)
