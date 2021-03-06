import React from 'react';
import { Button, Row, Col, Select, Input, Table, Authority, Table1 } from 'wanke-gui'
import ListItemDelete from '../../../components/ListItemDelete/index'
import Forward from "../../../public/components/Forward/index";
import AddFrom from "./component/addFrom";
import Tools from '../../../components/layout/Tools'
import FullContainer from '../../../components/layout/FullContainer'
import Export from '../../../components/layout/Export'
import { makeConnect } from '../../umi.helper'
import StringContent from '../../../components/StringContent'
import utils from '../../../public/js/utils';
import AbsoluteBubble from '../../../components/AbsoluteBubble';
import { CrumbsPortal } from '../../../frameset/Crumbs';
import DetailModal from './component/detailModal'

class Device extends React.Component<any> {

    componentDidMount() {
        this.init();
    };

    componentWillUnmount() {
        // this.props.action('reset');
    };

    init = () => {
        this.props.action('getList');
        this.props.action('getEnums');
    };

    showDetail = async (record) => {
        await this.getinputOutputTypes(record.inputOutputReverse ?? true, (record.terminals && record.terminals.length) || 2)
        let arr = []
        let inputOutputAllArr = []
        if (record.terminals) {
            for (let i = 1; i <= record.terminals.length; i++) {
                arr.push(1)
                if (inputOutputAllArr.indexOf(record.terminals[i - 1].inputOutputType.group) === -1) {
                    inputOutputAllArr.push(record.terminals[i - 1].inputOutputType.group);
                }
            }
        } else {
            arr = [1, 1]
        }
        const { dispatch } = this.props;
        dispatch({
            type: 'deviceModel/updateState',
            payload: {
                record: record,
                detailModal: true,
                judgeReverse: record.judgeReverse,
                arr: arr,
                judgeinputOutput: inputOutputAllArr
            }
        })
    };

    showBj = async (record) => {
        await this.getinputOutputTypes(record.inputOutputReverse ?? true, (record.terminals && record.terminals.length) || 2)
        let arr = []
        let inputOutputAllArr = []
        if (record.terminals) {
            for (let i = 1; i <= record.terminals.length; i++) {
                arr.push(1)
                if (inputOutputAllArr.indexOf(record.terminals[i - 1].inputOutputType.group) === -1) {
                    inputOutputAllArr.push(record.terminals[i - 1].inputOutputType.group);
                }
            }
        } else {
            arr = [1, 1]
        }
        const { dispatch } = this.props;
        dispatch({
            type: 'deviceModel/updateState',
            payload: { record: record, addModal: true, modalTitle: '??????????????????', judgeReverse: record.judgeReverse, arr: arr, judgeinputOutput: inputOutputAllArr }
        })
    };
    delete = (id) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'deviceModel/deleteRecord',
            payload: {
                id: id,
            },
        });
    };
    showXz = async () => {
        const { dispatch } = this.props;
        // await dispatch({
        //     type: 'deviceModel/getTypeId',
        // });
        await Promise.all([
            dispatch({
                type: 'deviceModel/getTypeId',
            }),
            this.getinputOutputTypes(true, 2)
        ])
        dispatch({
            type: 'deviceModel/updateState',
            payload: {
                record: {},
                addModal: true,
                modalTitle: '??????????????????',
                arr: [1, 1],
                judgeinputOutput: []
            },
        });
    };
    getinputOutputTypes = async (inputOutputReverse, terminalNum) => {
        const { dispatch } = this.props;
        await dispatch({
            type: 'deviceModel/getinputOutputTypes',
            payload: {
                inputOutputReverse,
                terminalNum
            },
        });
    }

    render() {
        const {
            list,
            date,
            selectStatusValue,
            selectStatus,
            loading,
            query,
            total,
            detailModal,
            addModal,
            pageId,
            modelType,
            operationIds
        } = this.props;
        // let datea = new Date();
        // let strDate = datea.toLocaleString().replace(/[??????]/g, '-').replace(/[????????????]/g, '');
        // console.log(new Date().getTimezoneOffset()/60)
        const columns: any = [
            {
                title: utils.intl('??????'), dataIndex: 'num', width: 65
            },
            {
                title: utils.intl('????????????'), dataIndex: 'devicePropertyTitle', key: 'sbxz', width: 150,
            },
            {
                title: utils.intl('????????????ID'), dataIndex: 'name'
            },
            {
                title: utils.intl('????????????'), dataIndex: 'deviceCategoryTitle',
                render: (value) => <AbsoluteBubble>{value}</AbsoluteBubble>
            },
            {
                title: utils.intl('??????????????????'), dataIndex: 'title',
                render: (value) => <AbsoluteBubble>{value}</AbsoluteBubble>
            },
            {
                title: utils.intl('??????/?????????'), dataIndex: 'terminalTitles', width: 130,
                render: (value) => <AbsoluteBubble>{value}</AbsoluteBubble>
            },
            {
                title: utils.intl('????????????'),
                dataIndex: 'regionTitles',
                render: (value) => <AbsoluteBubble>{value}</AbsoluteBubble>
            },
            {
                title: utils.intl('??????????????????'), width: 160,
                render: (text, record, index) => {
                    return (
                        <span>
                            <Forward to="deveceParameter" data={{ _modelId: record.id }}>
                                <span>{utils.intl('??????')}</span>
                            </Forward>
                        </span>
                    )
                }
            },
            {
                title: utils.intl('????????????'), width: 100,
                render: (text, record, index) => {
                    return (
                        <span>
                            <Forward to="detail" data={{ _id: record.id, _deviceTitle: record.deviceCategoryTitle }}>
                                <span>{utils.intl('??????')}</span>
                            </Forward>
                        </span>
                    )
                }
            },
            {
                title: utils.intl('??????'),
                width: 150,
                align: 'right',
                render: (text, record, index) => {
                    if (operationIds && operationIds.indexOf(record.id) !== -1) {
                        return (
                            <span>
                                <a onClick={this.showBj.bind(this, record)}>{utils.intl('??????')}</a>
                                <ListItemDelete onConfirm={this.delete.bind(this, record.id)}>
                                    <a style={{ marginLeft: '10px' }}>{utils.intl('??????')}</a>
                                </ListItemDelete>
                            </span>
                        )
                    } else {
                        return (
                            <span>
                                <a onClick={this.showDetail.bind(this, record)}>{utils.intl('??????')}</a>
                            </span>
                        )
                    }
                }
            },
        ]
        return (
            <FullContainer>
                <CrumbsPortal pageName="index">
                    <Button type="primary" className={'e-mr16'} onClick={() => this.props.action('onExport')}>{utils.intl('??????')}</Button>
                    <Button type="primary" onClick={this.showXz}>{utils.intl('??????')}</Button>
                </CrumbsPortal>
                <div className="flex1 f-pr">
                    <Table1 dataSource={list} columns={columns} loading={loading} rowKey="id" />
                </div>
                {/* <div className="f-pr" style={{ height: '40px', margin: '10px' }}>
                    <Tools>
                        <Export onExport={() => this.props.action('onExport')} />
                    </Tools>
                </div> */}
                {addModal ? <AddFrom /> : ''}
                {detailModal ? <DetailModal /> : ''}
            </FullContainer>
        )
    }
}

function mapStateToProps(model, getLoading, state) {
    return {
        ...model,
        loading: getLoading('getList'),
        updateLoading: getLoading('save')
    }
}

export default makeConnect('deviceModel', mapStateToProps)(Device)
