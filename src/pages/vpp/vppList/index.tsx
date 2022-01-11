import React from 'react';
import { Button, Row, Col, Select, Input, Table2 } from 'wanke-gui'
import {connect} from 'dva';
import Page from "../../../components/Page";
import ListItemDelete from '../../../components/ListItemDelete/index'
import Forward from "../../../public/components/Forward/index";
import VppNameFrom from "./component/vppNameFrom";

class Vpp extends React.Component<any> {

    componentDidMount() {
    }
    componentWillUnmount() {
        const {dispatch} = this.props;
        dispatch({ type: 'vpp/reset' });
        // dispatch({ type: 'vpp/pageChange', payload: { page:1, size:20 } });
        // dispatch({ type: 'vpp/stringChange', payload: { queryStr: '' } });
    }
//搜索框的值改变
    searchChange = (type, data) => {
        const {dispatch} = this.props;
        dispatch({ type: 'vpp/stringChange', payload: { [type]: data } });
    };
    getList = () =>{
        const {dispatch} = this.props;
        dispatch({
            type: 'vpp/getList',
        })
    };
    pageChange = (page, size) => {
        const {dispatch} = this.props;
        dispatch({ type: 'vpp/pageChange', payload: { page, size } });
    };

    sizeChange = (page, size) => {
        const {dispatch} = this.props;
        dispatch({ type: 'vpp/pageChange', payload: { page, size } });
    };
    search = () => {
        const {dispatch} = this.props;
        this.pageChange(1,20);
    };
    showBj = (record) => {
        const {dispatch} = this.props;
        dispatch({
            type: 'vpp/updateState',
            payload: {record: record, vppNameModal: true,modalTitle:'编辑VPP'}
        })
    };
    delete = (id) =>{
        const { dispatch } = this.props;
        dispatch({
            type: 'vpp/deleteRecord',
            payload: {
                id: id,
            },
        });
    };
    showXz = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'vpp/updateState',
            payload: {
                record:{},
                vppNameModal: true,
                modalTitle:'新增VPP'
            },
        });
    };
    showStationList = (record) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'allVpp/updateState',
            payload: {vppId: record.id}
        })
    };
    setVppId = (id) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'allVpp/updateState',
            payload: {vppId: id}
        })
    };
    render() {
        const {list,date,selectStatusValue,selectStatus,loading,query,total,vppNameModal,pageId} = this.props;
        const columns = [
            {
                title: 'VPP名', dataIndex: 'title', key: 'gdmc',
                render: (text, record, index) => {
                    if(record.isLink){
                        return (
                            <Forward to="vppMonitor" data={{id:record.id,pageTitle: record.title}}>
                                <span onClick={this.setVppId.bind(this,record.id)}>
                                    {text}
                                </span>
                            </Forward>
                        )
                    }else {
                        return (
                            <span title={text}>
                                {text}
                            </span>
                        )
                    }
                }
            },
            {
                title: '电站', dataIndex: 'sites', key: 'gdlx',
            },
            {
                title: '创建时间', dataIndex: 'establishDate', key: 'zd',align:'center',width: 150
            },
            {
                title: '光伏装机容量', dataIndex: 'pvCapacity', key: 'sb',
            },
            {
                title: '储能装机容量', dataIndex: 'batteryCapacity', key: 'gdms',
            },
            {
                title: '收益',
                dataIndex: 'revenue',
                key: 'clr',
                align:'right',
                render: (text, record, index) => {
                    return (
                        <Forward to="vppBill" data={{record:record}}>
                            <span>{text}</span>
                        </Forward>
                    );
                }
            },
            {
                title: '操作',
                dataIndex: 'operation',
                key: 'cz',
                width: '200px',
                render: (text, record, index) => {
                    return (
                        <span>
                            <a onClick={this.showBj.bind(this, record)}>{'编辑'}</a>
                            <ListItemDelete onConfirm={this.delete.bind(this, record.id)}>
                                <a style={{ marginLeft: '10px' }}>删除</a>
                            </ListItemDelete>
                            <Forward to="vppAdd" data={{record:record,pageTitle:'电站列表'}}>
                                <span style={{ marginLeft: '10px' }} onClick={this.showStationList.bind(this, record)}>{'电站列表'}</span>
                            </Forward>
                        </span>
                    )
                }
            },
        ]
        return (
            <Page pageId={pageId} className="bf-br10" onActivity={this.getList}>
                <div className="bf-br10 f-df flex-column e-p10" style={{height: '100%'}}>
                    <Row className="e-mt10 ">
                        <Col span={22} className="f-tal">
                            <Input.Search placeholder={'请输入查询字段VPP名'}
                                          onChange={(e) => this.searchChange('queryStr', e.target.value)}
                                          onPressEnter={this.search}
                                          onSearch={this.search}
                                          style={{width:'400px'}}
                            />
                        </Col>
                        <Col span={2} className="f-tar">
                            <Button type="primary" onClick={this.showXz}>{'新增'}</Button>
                        </Col>
                    </Row>
                    <div className="flex1 e-pt10 f-pr">
                        <Table2 dataSource={list} columns={columns} loading={loading}
                               rowKey="id"
                                page={query.page} size={query.size} total={total}
                                onPageChange={this.pageChange}
                        />
                    </div>
                </div>
                {vppNameModal ?<VppNameFrom/> :''}
            </Page>
        )
    }
}

function mapStateToProps(state) {
    return {
        ...state.vpp, loading: state.loading.effects['vpp/getList'],
    };
}

export default connect(mapStateToProps)(Vpp);
