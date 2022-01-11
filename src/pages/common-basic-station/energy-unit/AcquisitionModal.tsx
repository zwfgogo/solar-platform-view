import React, { Component, useState, useEffect } from 'react';
import { Form, Modal, FormContainer, Table1, message, Table2 } from 'wanke-gui';
import utils from '../../../public/js/utils';
import AbsoluteBubble from '../../../components/AbsoluteBubble';
import useLocalTablePage from '../../../hooks/useLocalTablePage';
import useRowSelection from '../../../hooks/useRowSelection';


const _Form = props => {
    const { visible, allCollectDevices = [], acquisitionLoading, bindCollectDevices, theme } = props;
    const [form] = Form.useForm();
    const {
      list: dataSource,
      page,
      pageSize,
      onPageChange
    } = useLocalTablePage({
      data: allCollectDevices,
      defaultPageSize: 20
    })
    const { selectedRowKeys, onChange, clearSelect } = useRowSelection({
      data: dataSource,
      keyName: 'id',
      defaultKeys: bindCollectDevices,
    })

    useEffect(() => {
        if (props.stationId) {
            props.action('getCollectDevicesByStation', { id: props.stationId })
        }
    }, [props.stationId])

    async function handleSubmit(e) {
        e.preventDefault();
        form.validateFields().then((values) => {
            props.dispatch({
                type: 'stationUpdate/postCollectDevices',
                payload: {
                    id: props.detail?.id,
                    controlDeviceIds: selectedRowKeys.length > 0 ? selectedRowKeys : []
                }
            })
        })
    }

    const columns: any = [
        {
            title: utils.intl('序号'), dataIndex: 'num', width: 80, align: 'center'
        },
        {
            title: utils.intl('采集设备名称'), dataIndex: 'name', width: 300,
            render: (text) => <AbsoluteBubble>{text}</AbsoluteBubble>
        },
        {
            title: utils.intl('设备型号'), dataIndex: 'model'
        },
        {
            title: utils.intl('状态'),
            dataIndex: 'state',
        },
        {
            title: utils.intl('设备状态时间'),
            dataIndex: 'stateTime',
        },
    ]

    const rowSelection = {
        selectedRowKeys: selectedRowKeys,
        onChange: onChange,
        columnWidth: 80
    }
    let color = theme === 'dark-theme' ? 'rgba(255,255,255,0.85)' : 'rgba(5,10,25,0.45)'
    return (
        <Modal centered maskClosable={false} bodyStyle={{ color: 'white' }} width={'1100px'} visible={visible}
            title={utils.intl('选择采集设备')}
            onOk={handleSubmit} onCancel={() => props.cancel()} wrapClassName={'customerModal'}
        >
            <div style={{ height: 500 }}>
                <FormContainer form={form} layout={'vertical'} autoComplete="off"
                    initialValues={{
                    }}>
                    <div className="f-pr" style={{ height: 500 }}>
                        <Table2
                            rowKey="id"
                            rowSelection={rowSelection}
                            dataSource={dataSource}
                            columns={columns}
                            loading={acquisitionLoading}
                            page={page}
                            size={pageSize}
                            total={allCollectDevices.length}
                            onPageChange={onPageChange}
                        />
                    </div>
                </FormContainer>
                <span style={{ position: 'absolute', bottom: '20px', color }}>{utils.intl('已勾选')}<span style={{ padding: '0 3px', color }}>{selectedRowKeys.length}</span>{utils.intl('个')}</span>
            </div>
        </Modal>
    );
};

export default _Form