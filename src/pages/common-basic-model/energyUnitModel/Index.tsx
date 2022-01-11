import React from 'react';
import { Button, Row, Col, Select, Input, Table, Authority, Table1 } from 'wanke-gui'
import ListItemDelete from '../../../components/ListItemDelete/index'
import Forward from "../../../public/components/Forward/index";
import Tools from '../../../components/layout/Tools'
import FullContainer from '../../../components/layout/FullContainer'
import Export from '../../../components/layout/Export'
import { makeConnect } from '../../umi.helper'
import AddFrom from "./component/addFrom";
import utils from '../../../public/js/utils';
import AbsoluteBubble from '../../../components/AbsoluteBubble';
import { CrumbsPortal } from '../../../frameset/Crumbs';
import DetailModal from './component/detailModal'


class EnergyUnit extends React.Component<any> {

    componentDidMount() {
        this.init();
    }
    componentWillUnmount() {
        this.props.action('reset');
    };

    init = () => {

        this.props.action('getList');
        this.props.action('getEnums');
    };

    showBj = (record) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'energyUnitModel/updateState',
            payload: { record: record, addModal: true, modalTitle: '编辑能量单元模型' }
        })
    };

    showDetail = async (record) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'energyUnitModel/updateState',
            payload: { record: record, detailModal: true, modalTitle: '查看能量单元模型' }
        })
    };

    delete = (id) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'energyUnitModel/deleteRecord',
            payload: {
                id: id,
            },
        });
    };
    showXz = async () => {
        const { dispatch } = this.props;
        await dispatch({
            type: 'energyUnitModel/getTypeId',
        });
        dispatch({
            type: 'energyUnitModel/updateState',
            payload: {
                record: {},
                addModal: true,
                modalTitle: '新增能量单元模型'
            },
        });
    };
    showParameterList = (record) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'modelConfig/updateState',
            payload: { id: record.id }
        })
    };

    render() {
        const {
            list,
            date,
            selectStatusValue,
            selectStatus,
            loading,
            query,
            total,
            vppNameModal,
            pageId,
            addModal,
            operationIds,
            detailModal,
        } = this.props;
        const columns: any = [
            {
                title: utils.intl('序号'), dataIndex: 'num', key: 'gdmc', width: 65
            },
            {
                title: utils.intl('能量单元类型ID'), dataIndex: 'name'
            },
            {
                title: utils.intl('能量单元类型'), dataIndex: 'title'
            },
            {
                title: utils.intl('地区标识'),
                dataIndex: 'regionTitles',
                render: (value) => <AbsoluteBubble>{value}</AbsoluteBubble>
            },
            {
                title: utils.intl('可包含的设备类型'), dataIndex: 'contentType', key: 'gdms', width: 160,
                render: (text, record, index) => {
                    return (
                        <span>
                            <Forward to="contentType" data={{ contentRecord: record, pageTitle: '模型可包含的设备类型' }}>
                                <span onClick={this.showParameterList.bind(this, record)}>{utils.intl('查看')}</span>
                            </Forward>
                        </span>
                    )
                }
            },
            {
                title: utils.intl('常用能量单元参数'), dataIndex: 'batteryCapacity', key: 'gdms', width: 160,
                render: (text, record, index) => {
                    return (
                        <span>
                            <Forward to="deveceParameter" data={{ _modelId: record.id }}>
                                <span onClick={this.showParameterList.bind(this, record)}>{utils.intl('查看')}</span>
                            </Forward>
                        </span>
                    )
                }
            },
            {
                title: utils.intl('操作'),
                dataIndex: 'operation',
                key: 'cz',
                align: 'right', width: 150,
                render: (text, record, index) => {
                    if (operationIds && operationIds.indexOf(record.id) !== -1) {
                        return (
                            <span>
                                <a onClick={this.showBj.bind(this, record)}>{utils.intl('编辑')}</a>
                                <ListItemDelete onConfirm={this.delete.bind(this, record.id)}>
                                    <a style={{ marginLeft: '10px' }}>{utils.intl('删除')}</a>
                                </ListItemDelete>
                            </span>
                        )
                    } else {
                        return (
                            <span>
                                <a onClick={this.showDetail.bind(this, record)}>{utils.intl('查看')}</a>
                            </span>
                        )
                    }
                }
            },
        ]
        return (
            <FullContainer>
                <CrumbsPortal pageName="index">
                    <Button type="primary" className={'e-mr16'} onClick={() => this.props.action('onExport')}>{utils.intl('导出')}</Button>
                    <Button type="primary" onClick={this.showXz}>{utils.intl('新增')}</Button>
                </CrumbsPortal>
                <div className="flex1 f-pr">
                    <Table1 dataSource={list} columns={columns} loading={loading} rowKey="id" />
                </div>
                {/* <div className="f-pr" style={{ height: '40px',margin: '10px' }}>
                    <Tools>
                        <Export onExport={() => this.props.action('onExport')}/>
                    </Tools>
                </div> */}

                {addModal ? <AddFrom /> : ''}
                {detailModal ? <DetailModal /> : ''}
            </FullContainer>
        )
    }
}

function mapStateToProps(model, getLoading) {
    return {
        ...model,
        loading: getLoading('getList'),
        updateLoading: getLoading('save')
    }
}

export default makeConnect('energyUnitModel', mapStateToProps)(EnergyUnit)
