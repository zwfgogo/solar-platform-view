import React from 'react'
import {Button, Row, Col, Input, Radio, Table2, Modal, Select} from 'wanke-gui'
import ExplainModal from './component/orderFrom'
import LevelModal from './component/level'
import Page from '../../../components/Page'
import {makeConnect} from '../../umi.helper'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import {abnormalWarningModal} from './model'
import PageProps from '../../../interfaces/PageProps'
import FullContainer from '../../../components/layout/FullContainer'
import styles from './index.less'
import { QuestionCircleTwoTone } from 'wanke-icon'
import {t_abnormal_warning} from '../../constants'

interface Props extends MakeConnectProps<abnormalWarningModal>, abnormalWarningModal, PageProps {
    loading: boolean;
    explainModal:boolean;
    levelModal:boolean;
}

class operationList extends React.Component<Props> {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.props.action("enumsAlarmLevel");
    }

    componentWillUnmount() {
        this.props.action("reset");
    }

    pageChange = (page, size) => {
        this.props.action("pageChange", {page, size});
    };

    sizeChange = (page, size) => {
        this.props.action("pageChange", {page, size});
    };
    search = () => {
        this.pageChange(1, 20);
    };
    searchChange = (type, data) => {
        const {dispatch, query} = this.props;
        this.props.action("updateQuery", {...query, [type]: data});
    };
    useHelp = () => {
        this.props.action("updateState", {explainModal: true});
    };
    levelChange = () => {
        const {dispatch, selectedRowKeys} = this.props;
        if (selectedRowKeys.length > 0) {
            this.props.action("updateState", {levelModal: true});
        } else {
            Modal.info({
                title: '未选择数据，请勾选',
                content: '',
                onOk() {
                },
            })
        }
    };
    //选择框回调
    onSelectChange = (selectedRowKeys, selectedRows) => {
        this.props.action("updateState", {selectedRowKeys});
    };
    //表格内下拉框直接切换告警级别
    selectionChange = (type, data, id) => {
        this.props.action("patchList", {alarmLevelId: data, idList: [id]});
    };
    onExport = () => {
        this.props.action("onExport");
    }

    render() {
        const {list, loading, levelModal, selectedRowKeys, explainModal, alarmLevel, query, total} = this.props
        const columns = [
            {
                title: '异常名称', dataIndex: 'title', key: 'ycmc', width: '17%',
            },
            {
                title: '设备对象', dataIndex: 'devTitle', key: 'sb', width: '26%'
            },
            {
                title: '判断条件', dataIndex: 'condition', key: 'pdtj', width: '40%',
            },
            {
                title:
                    <div>
                        <span onClick={this.levelChange} className={styles.tableName}>告警级别</span>
                        <QuestionCircleTwoTone className='e-ml10' onClick={this.useHelp} />
                    </div>,
                dataIndex: 'alarmLevelTitle', key: 'sfxsycgj', width: '17%',
                render: (text, record, index) => {
                    return (
                        <div className='alarmLevelContent'>
                            <Select value={record.alarmLevel.id}
                                    onChange={(data) => this.selectionChange('alarmId', data, record.id)}
                                    dataSource={alarmLevel}
                                    label="" style={{minWidth: '130px'}}/>
                        </div>
                    )
                }
            }
        ]
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange
        };
        return (
            <Page className="e-p10">
                <FullContainer>
                    <Row className="e-mt10 e-pl10">
                        <Col span={22} className="f-tal">
                            <Input.Search placeholder={'请输入关键字'}
                                          onChange={(e) => this.searchChange('queryStr', e.target.value)}
                                          onPressEnter={this.search}
                                          onSearch={this.search}
                                          style={{width: '400px'}}
                            />
                        </Col>
                        <Col span={2} className="f-tar">
                            <Button type="primary" onClick={this.onExport}>{'导出'}</Button>
                        </Col>
                    </Row>
                    <div className="flex-grow e-pt10 f-pr">
                        <Table2 dataSource={list} columns={columns} loading={loading}
                               rowKey="id"
                               rowSelection={rowSelection}
                               page={query.page}
                               size={query.size}
                               total={total}
                               onPageChange={(page, size) => this.pageChange(page, size)}
                        />
                    </div>
                    {explainModal ? <ExplainModal/> : ''}
                    {levelModal ? <LevelModal/> : ''}
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

export default makeConnect(t_abnormal_warning, mapStateToProps)(operationList)
