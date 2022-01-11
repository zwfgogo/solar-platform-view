import React, { Component, useState } from 'react';
import { Input, Select, Row, Col, Form, Checkbox, Modal, Table, message } from 'wanke-gui';
import { FormContainer } from '../../../../components/input-item/InputItem'
import { makeConnect } from '../../../umi.helper'
import utils from '../../../../public/js/utils';
import AbsoluteBubble from '../../../../components/AbsoluteBubble';

const FormItem = Form.Item;

const _Form = props => {
  const { dispatch, chanceModal, record, modalTitle, modalList, loading, pageTitle } = props;
  const [form] = Form.useForm();
  let [selectedRowKeys, setSelectedRowKeys] = React.useState([])
  const cancel = () => {
    dispatch({
      type: 'contentType/updateState',
      payload: {
        chanceModal: false,
      },
    });
  };
  const deleteMethod = (id) => {
    dispatch({
      type: 'contentType/deleteRecord',
      payload: {
        id: id,
      },
    });
  };
  async function handleSubmit(e) {
    e.preventDefault();
    form.validateFields().then((values) => {
      if(selectedRowKeys && selectedRowKeys.length === 0){
        message.error(utils.intl('请先勾选后再提交'));
      }else{
        dispatch({
          type: 'contentType/save',
          payload: {
            selectedRowKeys
          },
        });
      }
    })
  }

  const columns: any = [
    {
      title: utils.intl('序号'), dataIndex: 'num', width: 80, align: 'center'
    },
    {
      title: utils.intl('能量单元ID'), dataIndex: 'name', width: 150
    },
    {
      title: utils.intl('能量单元类型'), dataIndex: 'title'
    },
    {
      title: utils.intl('地区标识'),
      dataIndex: 'regionTitles',
    },
  ]
  const columns1: any = [
    {
      title: utils.intl('序号'), dataIndex: 'num', width: 80, align: 'center'
    },
    {
      title: utils.intl('设备性质'), dataIndex: 'devicePropertyTitle', width: 100
    },
    {
      title: utils.intl('设备类型ID'), dataIndex: 'name', width: 200
    },
    {
      title: utils.intl('设备类型'), dataIndex: 'title',
    },
    {
      title: utils.intl('输入/输出端子'),
      dataIndex: 'terminalTitles',
      render: text => <AbsoluteBubble>{text}</AbsoluteBubble>
    },
    {
      title: utils.intl('地区标识'),
      dataIndex: 'regionTitles',
      width: 120
    },
  ]
  //选择框回调
  const onSelectChange = (selectedRowKeys, selectedRows) => {
    setSelectedRowKeys(selectedRowKeys)
  }
  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: onSelectChange,
    columnTitle: utils.intl('选择'),
    columnWidth: '80px'
  }

  return (
    <Modal centered maskClosable={false} bodyStyle={{ color: 'white' }} width={'1100px'} visible={chanceModal}
      title={utils.intl('选择' + pageTitle)} onOk={handleSubmit} onCancel={cancel} wrapClassName={'customerModal'}>
      <div>
        <FormContainer form={form} layout={'vertical'} autoComplete="off"
          initialValues={{
          }}>
          <div className="flex-grow f-pr" >
            <Table dataSource={modalList} columns={pageTitle === '模型可包含的设备类型' ? columns1 : columns} loading={loading}
              rowKey="id"
              pagination={false}
              scroll={{y:600}}
              rowSelection={rowSelection}
            />
          </div>
        </FormContainer>
      </div>
    </Modal>
  );
};
//绑定layout model ，获取title
function mapStateToProps(model, getLoading) {
  return {
    ...model,
    loading: getLoading('getModalList'),
  };
}

export default makeConnect('contentType', mapStateToProps)(_Form)