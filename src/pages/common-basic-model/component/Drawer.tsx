import React, { Component, useState } from 'react';
import { Drawer, Table1 } from 'wanke-gui'
import { makeConnect } from '../../umi.helper'
import './drawer.less'
import { Column } from 'wanke-gui/lib/table'
import utils from '../../../public/js/utils';
import AbsoluteBubble from '../../../components/AbsoluteBubble'

const _Form = props => {
    const { dispatch, drawerShow, verList, loading,verName } = props;

    const onClose = () => {
        dispatch({
            type: 'modelConfig/updateState',
            payload: {
                drawerShow: false,
            },
        });
    };
    const switchVer = (record) => {
        dispatch({
            type: 'modelConfig/updateState',
            payload: {
                drawerShow: false,verId:record.id,verName:record.title,
            },
        }).then(res=>{
            dispatch({
                type: 'deviceParameter/getList',
            });
        });
    }

    const columns: Column<any>[] = [
        {
            title: utils.intl('版本号'), dataIndex: 'title', key: 'gdmc',width: 100
        },
        {
            title: utils.intl('发布时间'), dataIndex: 'publishTime', key: 'gdmc', align: 'center',width: 150,
        },
        {
            title: utils.intl('版本描述'), dataIndex: 'description', key: 'gdmc',
            render: (value) => <AbsoluteBubble>{value}</AbsoluteBubble>
        },
        {
            title: utils.intl('操作'), dataIndex: 'establishDate', key: 'gdmc',
            width: 100,
            align: 'center',
            render: (text, record, index) => {
                if(verName !== record.title){
                    return (
                        <span>
                            <a onClick={switchVer.bind(this, record)}>{utils.intl('切换')}</a>
                        </span>
                    )
                }
            }
        },
    ];
    return (
        <Drawer
            title={utils.intl('切换版本')}
            placement="right"
            closable={true}
            destroyOnClose={true}
            width={600}
            onClose={onClose}
            className="publish-drawer"
            visible={drawerShow}
        >
            <div className="flex-grow e-pt10 f-pr" style={{height:'100%'}}>
                <Table1 x={0} dataSource={verList} columns={columns} loading={loading} rowKey="id" />
            </div>
        </Drawer>
    );
};
//绑定layout model ，获取title
function mapStateToProps(model, getLoading, state) {
    return {
        ...model,
        loading: getLoading('getList'),
    };
}

export default makeConnect('modelConfig', mapStateToProps)(_Form)