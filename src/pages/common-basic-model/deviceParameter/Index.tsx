import React from 'react';
import { Button, Row, Col, Select, Input, Table, Authority, Modal, Empty, Table1 } from 'wanke-gui'
import { connect } from 'dva';
import Header from '../../../components/Header/index';
import moment from 'moment';
import Page from "../../../components/Page";
import ListItemDelete from '../../../components/ListItemDelete/index'
import Forward from "../../../public/components/Forward/index";
import Tools from '../../../components/layout/Tools'
import FullContainer from '../../../components/layout/FullContainer'
import Export from '../../../components/layout/Export'
import { makeConnect } from '../../umi.helper'
import Back1 from '../../../components/layout/Back1'
import Edit from '../../../components/layout/Edit'
import AddFrom from "../component/addFrom";
import PublishFrom from "../component/publishFrom";
import QueryFrom from "../component/queryFrom";
import Drawer from "../component/Drawer";
import Tree from './component/Tree'
import styles from './index.less';
import { FullLoading } from "wanke-gui";
import utils from '../../../public/js/utils';
const { Search } = Input;
const { confirm } = Modal

class DeviceParameter extends React.Component<any> {

    componentDidMount() {
        const { _modelId } = this.props;
        this.props.updateState({ modelId: _modelId });
        this.getList();
    };

    componentWillUnmount() {
        this.props.action('reset');
    };

    getList = () => {
        const { dispatch } = this.props;
        this.props.action('getTree');
        dispatch({
            type: 'modelConfig/getEnums',
        })
        // this.props.action('getList');
    };
    showBj = (record) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'modelConfig/updateState',
            payload: { record: record, addModal: true, numberTypeString: record.dataType && record.dataType.name, modalTitle: '编辑', type: record.type, arr: record.enumValues || [{ name: '', value: '' }] }
        })
    };

    showQuery = (record) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'modelConfig/updateState',
            payload: { record: record, queryModal: true }
        })
    };

    delete = (id) => {
        const { dispatch, list } = this.props;
        dispatch({
            type: 'deviceParameter/deleteRecord',
            payload: {
                id: id,
            },
        });
        let listArr = list;
        for (let i = 0; i < listArr.length; i++) {
            if (id === listArr[i].id) {
                listArr.splice(i, 1)
            }
        }
        this.props.action('moveRow', { listArr: listArr });
    };
    showXz = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'modelConfig/updateState',
            payload: {
                record: {},
                addModal: true,
                modalTitle: '新增',
                arr: [{ name: '', value: '' }]
            },
        });
    };
    publish = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'modelConfig/updateState',
            payload: {
                publishRecord: {},
                publishModal: true,
            },
        });
    }
    switchingVersion = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'modelConfig/updateState',
            payload: {
                drawerShow: true,
            },
        });
        this.props.action('getVerList');
    }
    edit = () => {
        this.props.updateState({ canEdit: true, canPublish: true })
        // this.props.action('addVersion');
    }
    defalutBack = () => {
        let that = this;
        confirm({
            title: utils.intl('提示'),
            content: utils.intl('该操作将不会保留本次编辑的结果，请确认是否返回之前的页面'),
            okText: utils.intl('确定'),
            okType: 'danger',
            cancelText: utils.intl('取消'),
            onOk() {
                that.props.action('getList');
                that.props.updateState({ canEdit: false })
            },
            onCancel() {
            }
        })

    }
    handleSearch = (o) => {
        this.props.action('getTree', { queryStr: o });
    }
    exitBack = () => {
        this.props.updateState({ treeId: '' })
        this.props.back();
    }
    listChange = (dragIndex, hoverIndex) => {
        const { list } = this.props;
        const dragRow = list[dragIndex];
        let listArr = list;
        listArr.splice(dragIndex, 1);
        listArr.splice(hoverIndex, 0, dragRow);
        this.props.action('moveRow', { listArr: listArr });
        this.props.updateState({ canPublish: false })
    }
    render() {
        const { list, date, selectStatusValue, selectStatus, loading, query, total,
            addModal, pageId, modelType, canEdit, publishModal, queryModal, drawerShow, treeRecord, verName, treeLoading, treeId, isSameFirm, companyTree, saveLoading, canPublish } = this.props;
        const columns: any = [
            {
                title: utils.intl('顺序号'), dataIndex: 'sn', key: 'xh', width: 100
            },
            {
                title: utils.intl('属性名称'), dataIndex: 'title', width: 150
            },
            {
                title: utils.intl('标识符号'), dataIndex: 'symbol', width: 150
            },
            {
                title: utils.intl('数据类型'), dataIndex: 'dataTypeTitle'
            },
            {
                title: utils.intl('数据定义'), dataIndex: 'definition'
            },
            {
                title: utils.intl('默认单位'),
                dataIndex: 'unitTitle',
                render: (text, record, index) => {
                    return (
                        <span>
                            {text ? text : utils.intl('无')}
                        </span>
                    )
                }
            },
            {
                title: utils.intl('必填'), dataIndex: 'mustFill', width: 100,
                render: (text, record, index) => {
                    return (
                        <span>
                            {text ? utils.intl('是') : utils.intl('否')}
                        </span>
                    )
                }
            },
            {
                title: utils.intl('操作'),
                dataIndex: 'operation',
                key: 'cz',
                width: 150,
                align: 'right',
                render: (text, record, index) => {
                    return (
                        <span>
                            <div>
                                <a onClick={this.showQuery.bind(this, record)}>{utils.intl('详情')}</a>
                                <Authority code="edit" codes={record.operation ? record.operation.split(',') : []}>
                                    <a style={{ marginLeft: 10 }} onClick={this.showBj.bind(this, record)}>{utils.intl('编辑')}</a>
                                </Authority>
                                <Authority code="delete" codes={record.operation ? record.operation.split(',') : []}>
                                    <ListItemDelete onConfirm={this.delete.bind(this, record.id)}>
                                        <a style={{ marginLeft: '10px' }}>{utils.intl('删除')}</a>
                                    </ListItemDelete>
                                </Authority>
                            </div>
                            {/* {canEdit ?
                                <div>
                                    <a onClick={this.showQuery.bind(this, record)}>{utils.intl('详情')}</a>
                                    <Authority code="edit" codes={record.operation ? record.operation.split(',') : []}>
                                        <a onClick={this.showBj.bind(this, record)}>{utils.intl('编辑')}</a>
                                    </Authority>
                                    <Authority code="delete" codes={record.operation ? record.operation.split(',') : []}>
                                        <ListItemDelete onConfirm={this.delete.bind(this, record.id)}>
                                            <a style={{ marginLeft: '10px' }}>{utils.intl('删除')}</a>
                                        </ListItemDelete>
                                    </Authority>
                                </div>
                                :
                            } */}
                        </span>
                    )
                }
            },
        ]
        return (
            <Page className="bf-br4 page-bg1" pageTitle={utils.intl(modelType + '常用参数配置')} pageId={pageId}>
                <FullContainer className='f-df' style={{ height: '100%', flexDirection: 'row' }}>
                    <div className="f-df f-pr bf-br4 e-p15 flex-column" style={{ width: '270px', overflow: 'auto' }}>
                        <div className={styles["filter-box"]}>
                            <Search
                                placeholder={utils.intl('查询对应类型名称', utils.intl(modelType))}
                                onSearch={this.handleSearch}
                            />
                        </div>
                        {treeLoading && <FullLoading />}
                        {companyTree.length === 0 ?
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            : <Tree />
                        }

                    </div>
                    <div className="flex1 e-ml10 f-pr flex-column f-df bf-br4">
                        <Row className="e-mt10 e-pl10 e-pb10 e-pr10 common-border-bottom">
                            <Col span={21}>
                                <div style={{ width: '100%', float: 'left' }}>
                                    <div style={{ height: '32px' }}>
                                        <span style={{ lineHeight: '32px', marginLeft: '10px' }}>
                                            {utils.intl('当前版本')}{utils.intl('：')}
                                            <span>{verName}</span>
                                            {!treeLoading ?
                                                <span onClick={this.switchingVersion} style={{ fontSize: '15px', marginLeft: '30px', color: '#3d7eff', textDecoration: 'underline', cursor: 'pointer' }}>{utils.intl('切换版本')}</span>
                                                : ''
                                            }
                                        </span>
                                    </div>
                                </div>
                            </Col>
                            <Col span={3} className="f-tar">
                                <Button type="primary" onClick={this.publish} disabled={canPublish}>{utils.intl('发布')}</Button>
                            </Col>
                        </Row>
                        <Header title={utils.intl('模型基础参数')}>
                        </Header>
                        <Row className="e-mt10 e-pl10">
                            {modelType === '设备' ?
                                <Col span={8}>
                                    <div style={{ padding: '10px' }}>
                                        <span style={{ color: '#999' }}>
                                            {utils.intl(modelType + '性质') + utils.intl('：')}
                                        </span>
                                        <span>
                                            {treeRecord.devicePropertyTitle}
                                        </span>
                                    </div>
                                </Col>
                                : ''}
                            {modelType === '设备' ?
                                <Col span={8}>
                                    <div style={{ padding: '10px' }}>
                                        <span style={{ color: '#999' }}>
                                            {utils.intl(modelType + '大类') + utils.intl('：')}
                                        </span>
                                        <span>
                                            {treeRecord.deviceCategoryTitle}
                                        </span>
                                    </div>
                                </Col>
                                : ''}
                            <Col span={8}>
                                <div style={{ padding: '10px' }}>
                                    <span style={{ color: '#999' }}>
                                        {utils.intl(modelType + '类型ID') + utils.intl('：')}
                                    </span>
                                    <span>
                                        {treeRecord.name}
                                    </span>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div style={{ padding: '10px' }}>
                                    <span style={{ color: '#999' }}>
                                        {utils.intl(modelType + '类型') + utils.intl('：')}
                                    </span>
                                    <span>
                                        {treeRecord.title}
                                    </span>
                                </div>
                            </Col>
                            {modelType === '设备' ?
                                <Col span={8}>
                                    <div style={{ padding: '10px' }}>
                                        <span style={{ color: '#999' }}>
                                            {utils.intl('输入/输出端')}{utils.intl('：')}
                                        </span>
                                        <span>
                                            {treeRecord.terminalTitles}
                                        </span>
                                    </div>
                                </Col>
                                : ''}
                            <Col span={8}>
                                <div style={{ padding: '10px' }}>
                                    <span style={{ color: '#999' }}>
                                        {utils.intl('地区标识')}{utils.intl('：')}
                                    </span>
                                    <span>
                                        {treeRecord.regionTitles}
                                    </span>
                                </div>
                            </Col>
                        </Row>
                        <Header title={utils.intl('技术参数')}>
                            <Button type="primary" onClick={this.showXz}>{utils.intl('新增')}</Button>
                        </Header>
                        <div className="flex1 f-pr" style={{ margin: '10px' }}>
                            <Table1 dataSource={list} columns={columns} loading={loading} rowKey="id"
                                draggable={true} moveRow={(a, b) => {
                                    this.listChange(a, b)
                                }}
                            />
                        </div>
                    </div>
                    {queryModal ? <QueryFrom /> : ''}
                    {addModal ? <AddFrom saveLoading={saveLoading} /> : ''}
                    {publishModal ? <PublishFrom /> : ''}
                    {drawerShow ? <Drawer /> : ''}
                </FullContainer>
            </Page>
        )
    }
}

function mapStateToProps(model, getLoading, state) {
    return {
        ...model, ...state.modelConfig,
        loading: getLoading('getList'),
        treeLoading: getLoading('getTree'),
        saveLoading: getLoading('save'),
    }
}

export default makeConnect('deviceParameter', mapStateToProps)(DeviceParameter)
