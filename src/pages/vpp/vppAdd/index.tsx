import React from 'react';
import {Button, Row, Col, Select, Input, Table, message, Table1} from 'wanke-gui'
import {connect} from 'dva';
import Header from '../../../components/Header/index';
import styles from './index.less';
import Page from "../../../components/Page";
import Footer from '../../../public/components/Footer'
import ListItemDelete from '../../../components/ListItemDelete/index'

class vppAdd extends React.Component<any> {

    componentDidMount() {
        const {dispatch,record} = this.props;
        dispatch({
            type: 'vppAdd/updateState',
            payload: {title:record.title}
        }).then(res=>{
            this.getSelect();
        });
    }
    componentWillUnmount() {
        const {dispatch,record} = this.props;
        dispatch({
            type: 'vppAdd/reset',
            payload: {}
        })
    }
    getSelect = () =>{
        const {dispatch,page} = this.props;
        dispatch({
            type: 'vppAdd/getSelect',
            payload:{filter:page === 'addList' ?1:2}
        });
    }

//搜索框的值改变
    searchChange = (type, data) => {
        const {dispatch} = this.props;
        dispatch({ type: 'vppAdd/stringChange', payload: { [type]: data } });
    };
    search = () => {
        const {dispatch,page} = this.props;
        if(page === 'addList'){
            dispatch({
                type: 'vppAdd/getList',
            })
        }else {
            dispatch({
                type: 'vppAdd/getAddList',
            })
        }
    };
    selectChange = (o, option) =>{
        const { dispatch,page } = this.props;
        dispatch({
            type: 'vppAdd/updateState',
            payload: {selectStatusValue:o,page:page}
        }).then(res=>{
            if(page === 'addList'){
                dispatch({
                    type: 'vppAdd/getList',
                })
            }else {
                dispatch({
                    type: 'vppAdd/getAddList',
                })
            }
        });
    };
    back = () =>{
        const {page, dispatch, back,selectStatus} = this.props;
        if(page === 'addList'){
            back();
            dispatch({
                type: 'vpp/getList',
            })
        }else {
            dispatch({
                type: 'vppAdd/updateState',
                payload: {page:'addList',selectStatusValue:selectStatus[0].value}
            }).then(res=>{
                this.getSelect();
            });
        }
        this.searchChange('queryStr','');
    };
    showXz = () =>{
        const { dispatch,selectStatus } = this.props;
        dispatch({
            type: 'vppAdd/updateState',
            payload: {page:'addContent',selectedRowKeys: [],selectStatusValue:selectStatus[0].value}
        }).then(res=>{
            this.getSelect();
        });
        this.searchChange('queryStr','');
    };
    confirm = () =>{
        const { dispatch, selectedRowKeys} = this.props;
        dispatch({
            type: 'vppAdd/save',
            payload: {stationIdList:selectedRowKeys,page:'addList'}
        }).then(res=>{
            this.back();
        });

    };
    delete = () =>{
        const { dispatch, selectedRowKeys} = this.props;
        if(selectedRowKeys.length){
            dispatch({
                type: 'vppAdd/deleteList',
                payload: {stationIdList:selectedRowKeys,page:'addList'}
            });
        }else{
            message.warning('请选择需要解绑的电站');
        }
    }
    render() {
        const {list,list1,date,selectStatusValue,selectStatus,loading,query,total,type,selectedRowKeys,page,back,title,pageId,pageTitle,addLoading} = this.props;
        const columns = [
            {
                title: '电站名', dataIndex: 'title', key: 'gdmc',
            },
            {
                title: '电站地址', dataIndex: 'address', key: 'gdlx',
            },
            {
                title: '创建时间', dataIndex: 'productionTime', key: 'zd',
            },
            {
                title: '光伏容量', dataIndex: 'pvCapacity', key: 'sb',
            },
            {
                title: '储能容量', dataIndex: 'batteryCapacity', key: 'gdms',
            },
            {
                title: '电站状态', dataIndex: 'siteStatusTitle', key: 'sjzt',
            },
        ];
        //选择框回调
        const onSelectChange = (selectedRowKeys, selectedRows) => {
            const { dispatch } = this.props;
            dispatch({
                type: 'vppAdd/updateState',
                payload: {
                    selectedRowKeys: selectedRowKeys,
                }
            })
        }
        const rowSelection = {
            selectedRowKeys: selectedRowKeys,
            onChange: onSelectChange
        }
        return (
            <Page pageId={pageId} pageTitle={pageTitle} className={styles.pageVppAdd}>
                <div className="f-df flex-column e-p10" style={{height: '100%'}}>
                    <div className="f-df flex1 flex-column f-pr bf-br-tlr10 e-p10" style={{height: '100%'}}>
                        <Header title={'电站列表'}>
                        </Header>
                        <Row className="e-mt10 e-pl10">
                            <Col span={4}>
                                <Select value={selectStatusValue} onChange={this.selectChange} dataSource={selectStatus}
                                        label="电站状态：" style={{minWidth: '163px'}}/>
                            </Col>
                            <Col span={page === 'addList' ?14 : 20} className="f-tar">
                                <Input.Search placeholder={'请输入查询字段电站名/地址'}
                                              onChange={(e) => this.searchChange('queryStr', e.target.value)}
                                              onPressEnter={this.search}
                                              onSearch={this.search}
                                              style={{width:'400px'}}
                                />
                            </Col>
                            {page === 'addList' ?
                            <Col span={6} className="f-tar">
                                <Button type="primary" onClick={this.back}>{'返回'}</Button>
                                <Button className="e-ml10" type="primary" onClick={this.showXz}>{'添加'}</Button>
                                <ListItemDelete onConfirm={this.delete}>
                                    <Button className="e-ml10" type="primary">{'删除'}</Button>
                                </ListItemDelete>
                            </Col>
                                :''}
                        </Row>
                        {page === 'addList' ?
                        <div className="flex1 e-pt10 f-pr">
                                <Table1 dataSource={list} columns={columns} loading={loading}
                                       rowKey="id"
                                        rowSelection={rowSelection}
                                />
                        </div>
                            :""
                            }
                        {page === 'addContent' ?
                            <div className="flex1 e-pt10 f-pr">
                                <Table1 dataSource={list1} columns={columns} loading={addLoading}
                                       rowKey="id"
                                       rowSelection={rowSelection}
                                />
                            </div>
                            :""}
                    </div>
                    {page === 'addContent' ?
                        <Footer>
                            <Button onClick={this.back}>取消</Button>
                            <Button
                                type="primary"
                                className="e-ml10"
                                onClick={this.confirm}
                            >
                                确定
                            </Button>
                        </Footer>
                            :""}
                </div>
            </Page>
        )
    }
}

function mapStateToProps(state) {
    return {
        ...state.vppAdd, loading: state.loading.effects['vppAdd/getList'], addLoading: state.loading.effects['vppAdd/getAddList'],
    };
}

export default connect(mapStateToProps)(vppAdd);
