import React from 'react'
import { Button, Row, Col, Input, Radio, Table2, Modal, Select, SearchInput } from 'wanke-gui'
import ExplainModal from './component/orderFrom'
import LevelModal from './component/level'
import Page from "../../components/Page"
import { makeConnect } from "../umi.helper"
import MakeConnectProps from "../../interfaces/MakeConnectProps"
import { abnormalWarningModal } from './model'
import PageProps from "../../interfaces/PageProps"
import FullContainer from "../../components/layout/FullContainer"
import styles from './index.less'
import { QuestionCircleTwoTone } from 'wanke-icon/lib'
import utils from "../../public/js/utils";
import { CrumbsPortal } from '../../frameset/Crumbs'
import FormLayout from '../../components/FormLayout'

const { FieldItem } = FormLayout
interface Props extends MakeConnectProps<abnormalWarningModal>, abnormalWarningModal, PageProps {
    loading: boolean;
    explainModal: boolean;
    levelModal: boolean;
    selectedRowKeys?: string;
    list?: any[];
    query?: {
        page?: number,
        size?: number,
        queryStr?: string
    };
    alarmLevel?: any[];
    total?: number;
}

class operationList extends React.Component<Props> {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({ type: 'abnormalWarning/enumsAlarmLevel' });
    }

    componentWillUnmount() {
        this.props.dispatch({ type: 'abnormalWarning/reset' });
    }

    pageChange = (page, size) => {
        const { dispatch } = this.props;
        dispatch({ type: 'abnormalWarning/pageChange', payload: { page, size } });
    };

    sizeChange = (page, size) => {
        const { dispatch } = this.props;
        dispatch({ type: 'abnormalWarning/pageChange', payload: { page, size } });
    };
    search = () => {
        this.pageChange(1, 20);
    };
    searchChange = (type, data) => {
        const { dispatch, query } = this.props;
        dispatch({ type: 'abnormalWarning/updateQuery', payload: { ...query, [type]: data } });
    };
    useHelp = () => {
        const { dispatch } = this.props;
        dispatch({ type: 'abnormalWarning/updateState', payload: { explainModal: true } });
    };
    levelChange = () => {
        const { dispatch, selectedRowKeys } = this.props;
        if (selectedRowKeys.length > 0) {
            dispatch({ type: 'abnormalWarning/updateState', payload: { levelModal: true } });
        } else {
            Modal.info({
                title: utils.intl('未选择数据，请勾选'),
                content: '',
                onOk() {
                },
            })
        }
    };
    //选择框回调
    onSelectChange = (selectedRowKeys, selectedRows) => {
        const { dispatch } = this.props;
        dispatch({ type: 'abnormalWarning/updateState', payload: { selectedRowKeys } });
    };
    //表格内下拉框直接切换告警级别
    selectionChange = (type, data, id) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'abnormalWarning/patchList',
            payload: { alarmLevelId: data, idList: [id] }
        });
    };
    onExport = () => {
        const { dispatch } = this.props;
        dispatch({ type: 'abnormalWarning/onExport' });
    }

    render() {
        const { list, loading, levelModal, selectedRowKeys, explainModal, alarmLevel, query, total } = this.props
        const columns: any = [
            {
                title: utils.intl('异常名称'), dataIndex: 'title', key: 'ycmc', width: '17%',
            },
            {
                title: utils.intl('设备对象'), dataIndex: 'devTitle', key: 'sb', width: '26%'
            },
            {
                title: utils.intl('判断条件'), dataIndex: 'condition', key: 'pdtj'
            },
            {
                title:
                    <div>
                        <span onClick={this.levelChange} className={styles.tableName}>{utils.intl('告警级别')}</span>
                        <QuestionCircleTwoTone className='e-ml10' onClick={this.useHelp} />
                    </div>,
                dataIndex: 'alarmLevelTitle', key: 'sfxsycgj', width: '17%',
                render: (text, record, index) => {
                    return (
                        <div className='alarmLevelContent'>
                            <Select value={record.alarmLevel.id}
                                onChange={(data) => this.selectionChange('alarmId', data, record.id)}
                                dataSource={alarmLevel}
                                label="" style={{ minWidth: '130px' }} />
                        </div>
                    )
                }
            }
        ]
        const rowSelection: any = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        return (
            <Page style={{ background: "transparent", display: "flex", flexDirection: "column" }}>
                <CrumbsPortal>
                    <Button style={{ marginLeft: 16 }} type="primary" onClick={this.onExport}>{utils.intl('导出')}</Button>
                </CrumbsPortal>
                <FormLayout
                    onSearch={this.search}
                    onReset={() => {
                        this.props.updateQuery({
                            queryStr: '',
                        })
                    }}>
                    <FieldItem label={utils.intl('关键字')}>
                        <Input
                            placeholder={utils.intl("请输入关键字")}
                            onChange={(e) => this.searchChange('queryStr', e.target.value)}
                            // onSearch={this.search}
                            value={query.queryStr}
                        />
                    </FieldItem>
                </FormLayout>
                <FullContainer className="page-sub-container">
                    <div className="flex1">
                        <Table2 dataSource={list} columns={columns} loading={loading}
                            rowKey="id"
                            rowSelection={rowSelection}
                            page={query.page}
                            size={query.size}
                            total={total}
                            onPageChange={(page, size) => this.pageChange(page, size)}
                        />
                    </div>
                    {explainModal ? <ExplainModal /> : ''}
                    {levelModal ? <LevelModal /> : ''}
                </FullContainer>
            </Page>
        )
    }
}

function mapStateToProps(model, getLoading) {
    return {
        ...model,
        loading: getLoading('getList'),
    }
}

export default makeConnect('abnormalWarning', mapStateToProps)(operationList)
