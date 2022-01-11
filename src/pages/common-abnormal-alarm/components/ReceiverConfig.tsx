/**
 * 接受人配置
 */
import React, { Component } from 'react'
import { AlarmState } from 'umi'
import { AutoSizer, Button, Dropdown, FormTable, Modal, Input, Table2 } from 'wanke-gui'
import { Menu } from 'antd'
import { DownOutlined, InfoCircleFilled } from 'wanke-icon'
import Page from '../../../components/Page'
import { CrumbsPortal } from '../../../frameset/Crumbs'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import PageProps from '../../../interfaces/PageProps'
import { GlobalState } from '../../../models/global'
import utils from '../../../public/js/utils'
import { alarm_config, crumbsNS, globalNS } from '../../constants'
import { makeConnect } from '../../umi.helper'
import { receiverDayMap } from '../dataCfg'
import "./index.less"
import _ from 'lodash'

const { Search } = Input

interface Props extends PageProps, GlobalState, MakeConnectProps<AlarmState>, AlarmState {
  // alarmNotifyConfigId?: number | string
}
interface State {
  selectedRowKeys: any[],
  receiverSelectedRowKeys: any[]
  dataSource: any[]
  visible: boolean,
  receiverList: any[],
  page: number,
  size: number,
  total: number,
  searchValue: string
}



class ReceiverConfig extends Component<Props, State> {
  tableFormBox: any;
  allValues: any = {};
  state = {
    selectedRowKeys: [],
    receiverSelectedRowKeys: [],
    dataSource: [],
    visible: false,
    receiverList: [],
    page: 1,
    size: 20,
    total: 0,
    searchValue: null
  }

  componentDidMount() {
    const { dispatch } = this.props
    // 获得系统中所有用户列表
    dispatch({ type: `${alarm_config}/getUser` })
    // 获得已经绑定的短信接收人
    dispatch({ type: `${alarm_config}/getAlarmSmsConfig` })

    this.setState({ dataSource: this.props.smsList })
    this.getReceiverList()
  }

  componentDidUpdate(perProps, perState) {
    if (!_.isEqual(this.props.smsList, perProps.smsList)) {
      this.setState({ dataSource: this.props.smsList })
    }

    if (!_.isEqual(this.props.userList, perProps.userList) && this.props.userList?.length) {
      this.getReceiverList()
    }

    if (!_.isEqual(this.state.dataSource, perState.dataSource) && this.props.userList?.length) {
      this.getReceiverList()
    }
  }

  handleMenuClick = ({ key }) => {
    const { selectedRowKeys, dataSource } = this.state
    const { form } = this.tableFormBox
    const newDataSource = _.cloneDeep(dataSource)
    const formValue = {}
    selectedRowKeys.forEach(rowKey => {
      const index = newDataSource.findIndex(item => item.id === rowKey)
      newDataSource[index].timeRange = Number(key)
      formValue[`timeRange_${rowKey}`] = Number(key)
    })
    this.setState({ dataSource: newDataSource })
    form.setFieldsValue(formValue)
  }

  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys })
  }

  // 二次确认删除
  confirmDelete = (record) => {
    const modal = Modal.warn({
      centered: true,
      title: utils.intl('是否删除{0}', ''),
      className: "receiver-delete-modal",
      width: 394,
      content: (
        <>
          <p>{utils.intl('删除后将不可恢复，请谨慎操作，你还要继续吗')}？</p>
          <div style={{ textAlign: "right" }}>
            <Button onClick={() => modal.destroy()} style={{ marginRight: 8 }}>{utils.intl('取消')}</Button>
            <Button type="primary" onClick={() => {
              this.deleteReceiver(record)
              modal.destroy()
            }}>{utils.intl('确定')}</Button>
          </div>
        </>
      ),
      icon: <InfoCircleFilled color="rgba(250,173,20,0.85)" />,
      okButtonProps: {
        style: {
          display: "none"
        }
      }
    })
  }

  // 删除短信接收人
  deleteReceiver = (record) => {
    const { id } = record
    const { dataSource, selectedRowKeys } = this.state
    this.setState({
      dataSource: dataSource.filter(item => item.id !== id),
      selectedRowKeys: selectedRowKeys.filter(key => key !== id)
    })
  }

  // 批量删除
  confirmAllDelete = () => {
    const { selectedRowKeys } = this.state
    const modal = Modal.warn({
      centered: true,
      title: utils.intl('是否批量删除{0}', '选中项？'),
      className: "receiver-delete-modal",
      width: 394,
      content: (
        <>
          <p>{utils.intl('删除后将不可恢复，请谨慎操作，你还要继续吗')}？</p>
          <div style={{ textAlign: "right" }}>
            <Button onClick={() => modal.destroy()} style={{ marginRight: 8 }}>{utils.intl('取消')}</Button>
            <Button type="primary" onClick={() => {
              this.deleteAllReceiver(selectedRowKeys)
              modal.destroy()
            }}>{utils.intl('确定')}</Button>
          </div>
        </>
      ),
      icon: <InfoCircleFilled color="rgba(250,173,20,0.85)" />,
      okButtonProps: {
        style: {
          display: "none"
        }
      }
    })
  }

  // 批量删除短信接收人
  deleteAllReceiver = (keys: (string | number)[]) => {
    const { dataSource } = this.state
    this.setState({
      dataSource: dataSource.filter(item => keys.indexOf(item.id) < 0),
      selectedRowKeys: []
    })
  }

  // 前端分页
  getReceiverList = (page?: number = 1, size?: number = 20, searchValue?) => {
    const { userList } = this.props
    const { dataSource } = this.state
    const dataSourceIds = dataSource.map(item => item.id)
    // 过滤出已经在收件人列表里的数据
    const receiverAllList = userList.filter(item => {
      if (searchValue && searchValue !== '') {
        return dataSourceIds.indexOf(item.id) < 0 && (
          (item.title || '').indexOf(searchValue) > -1
          ||
          (item.name || '').indexOf(searchValue) > -1
          ||
          (item.phone || '').indexOf(searchValue) > -1
        )
      }
      return dataSourceIds.indexOf(item.id) < 0
    })
    this.setState({ receiverList: receiverAllList.slice((page - 1) * size, page * size), page, size, total: receiverAllList.length })
  }


  onReceiverSelectChange = (receiverSelectedRowKeys) => {
    this.setState({ receiverSelectedRowKeys })
  }

  // 添加短信接收人
  addReceiver = () => {
    const { userList } = this.props
    const { receiverSelectedRowKeys, dataSource } = this.state
    const addReceiverList = userList.filter(item => receiverSelectedRowKeys.indexOf(item.id) > -1).map(item => ({ id: item.id, key: item.id, name: item.name, title: item.title, phone: item.phone, timeRange: 1 }))
    this.setState({ dataSource: [...dataSource, ...addReceiverList], visible: false, searchValue: null, receiverSelectedRowKeys: [] })
  }


  // 保存短信接收人
  saveReceiver = () => {
    const { dispatch } = this.props
    const { dataSource } = this.state
    // console.log('dataSource', dataSource)
    const newDataSource = _.cloneDeep(dataSource);
    // for (let i = 0; i < newDataSource.length; i++) {
    //   const { id } = newDataSource[i];
    //   console.log('`timeRange_${id}', `timeRange_${id}`, this.allValues[`timeRange_${id}`])
    //   if(this.allValues[`timeRange_${id}`]) newDataSource.timeRange = this.allValues[`timeRange_${id}`];
    // }
    // 
    dispatch({ type: `${alarm_config}/putAlarmReceiver`, payload: { body: newDataSource.map(item => ({ ...item, timeRange: this.allValues[`timeRange_${item.id}`] ?? item.timeRange })) } })
  }

  back = () => {
    const { smsList } = this.props
    const { dataSource } = this.state
    if (_.isEqual(smsList, dataSource)) {
      this.props.dispatch({
        type: `${crumbsNS}/updateCrumbs`,
        payload: {
          type: 'back', count: 1
        }
      })
    } else {
      const modal = Modal.warn({
        centered: true,
        title: `${utils.intl('提示')}？`,
        className: "receiver-delete-modal",
        content: (
          <>
            <p>{utils.intl('该操作将不会保留本次编辑的结果，请确认是否返回之前的页面')}</p>
            <div style={{ textAlign: "right" }}>
              <Button onClick={() => modal.destroy()} style={{ marginRight: 8 }}>{utils.intl('取消')}</Button>
              <Button type="primary" onClick={() => {
                this.props.dispatch({
                  type: `${crumbsNS}/updateCrumbs`,
                  payload: {
                    type: 'back', count: 1
                  }
                })
                modal.destroy()
              }}>{utils.intl('确定')}</Button>
            </div>
          </>
        ),
        icon: <InfoCircleFilled color="rgba(250,173,20,0.85)" />,
        okButtonProps: {
          style: {
            display: "none"
          }
        }
      })
    }
  }

  render() {
    const { pageId, smsList } = this.props
    const { selectedRowKeys, dataSource, visible, page, size, receiverList, total, receiverSelectedRowKeys } = this.state
    const columns = [{
      title: utils.intl('接收人账号'),
      dataIndex: 'name',
      key: 'name',
      width: 200,
      disabledEdit: true,
    }, {
      title: utils.intl('姓名'),
      dataIndex: 'title',
      key: 'title',
      disabledEdit: true,
    }, {
      title: utils.intl('联系电话'),
      dataIndex: 'phone',
      key: 'phone',
      disabledEdit: true,
    }, {
      title: utils.intl('通知时段'),
      dataIndex: 'timeRange',
      key: 'timeRange',
      width: 280,
      dataSource: receiverDayMap,
      renderType: "select",
    }, {
      title: utils.intl('操作'),
      dataIndex: 'operate',
      key: 'operate',
      width: 150,
      disabledEdit: true,
      align: "right",
      render: (text, record) => <div style={{ color: "#3D7EFF", cursor: "pointer", display: 'inline' }} onClick={() => this.confirmDelete(record)}>{utils.intl('删除')}</div>
    },]

    const receiverColumns = [
      {
        title: utils.intl('接收人账号'),
        dataIndex: 'name',
        key: 'name',
        width: 200
      }, {
        title: utils.intl('接收人姓名'),
        dataIndex: 'title',
        key: 'title',
      }, {
        title: utils.intl('联系电话'),
        dataIndex: 'phone',
        key: 'phone',
        width: 180
      }]

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    const receiverRowSelection = {
      receiverSelectedRowKeys,
      onChange: this.onReceiverSelectChange,
    };

    return (
      <Page pageId={pageId} pageTitle={utils.intl("短信接收人配置")}>
        <CrumbsPortal>
          <Button style={{ marginLeft: 16 }} onClick={this.back}>{utils.intl('取消')}</Button>
          <Button style={{ marginLeft: 16 }} type="primary" onClick={this.saveReceiver}>
            {utils.intl('保存')}
          </Button>
        </CrumbsPortal>
        <div className="rc-page-header">
          <div className="rc-page-title">{utils.intl("短信接收人配置")}</div>
          <Button type="primary" onClick={() => this.setState({ visible: true })}>{utils.intl('添加接收人')}</Button>
        </div>
        <div className="rc-page-body">
          <div className="rc-page-btn-groups">
            <label style={{ marginRight: 16 }}>{utils.intl('已选择')}<span style={{ color: "#3D7EFF", margin: "0px 4px" }}>{selectedRowKeys.length}</span>{utils.intl('项')}</label>
            <Dropdown
              trigger={['click']}
              disabled={!selectedRowKeys.length}
              overlay={<Menu onClick={this.handleMenuClick}>
                {receiverDayMap.map(item => (<Menu.Item key={item.value}>
                  {item.name}
                </Menu.Item>))}
              </Menu>}>
              <Button type="primary" style={{ marginRight: 8 }}>
                {utils.intl('批量设置通知时段')} <DownOutlined />
              </Button>
            </Dropdown>
            <Button disabled={!selectedRowKeys.length} onClick={this.confirmAllDelete}>{utils.intl('批量删除')}</Button>
          </div>
          <div className="rc-page-table-box">
            <AutoSizer style={{ overflow: 'visible' }}>
              {({ width, height }) => (
                <FormTable
                  errorTipType="icon"
                  rowSelection={rowSelection}
                  columns={columns}
                  className="alarm-table"
                  rowKey={(record, index) => record.id}
                  ref={tableFormBox => this.tableFormBox = tableFormBox}
                  size="small"
                  isinitEdit
                  bordered={false}
                  scroll={{ y: height }}
                  dataSource={dataSource}
                  onValuesChange={(changedValues, allValues) => {
                    this.allValues = allValues;
                    // const newDataSource = [];
                    // for(let i = 0; i < dataSource.length; i ++){
                    //   const { id } = dataSource[i];
                    //   dataSource.timeRange = allValues[`timeRange_${id}`];
                    //   newDataSource.push(dataSource);
                    // }
                    // console.log('newDataSource',newDataSource)
                    // this.setState({ dataSource: newDataSource })
                  }}
                />
              )}
            </AutoSizer>
          </div>
        </div>
        <Modal
          visible={visible}
          title={<div style={{ fontWeight: "bold" }}>{utils.intl('添加接收人')}</div>}
          width={640}
          destroyOnClose
          maskClosable={false}
          onCancel={() => this.setState({ visible: false, searchValue: null, receiverSelectedRowKeys: [] })}
          okText={utils.intl('确定')}
          cancelText={utils.intl('取消')}
          onOk={this.addReceiver}
        >
          <div className="receiver-add-modal-box">
            <div style={{ marginBottom: 8 }}><Search style={{ width: 260 }} placeholder={utils.intl('请输入关键字')} onSearch={value => {
              this.setState({ searchValue: value })
              this.getReceiverList(1, 20, value)
            }} /></div>
            <div>
              <Table2
                x={590}
                rowKey={record => record.id}
                rowSelection={receiverRowSelection}
                dataSource={receiverList}
                columns={receiverColumns}
                className="alarm-table"
                page={page}
                size={size}
                total={total}
                onPageChange={(page, size) => {
                  this.getReceiverList(page, size, this.state.searchValue)
                }}
              />
            </div>
          </div>
        </Modal>
      </Page>
    )
  }
}

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    stationList: state[globalNS].stationList
  }
}

export default makeConnect(alarm_config, mapStateToProps)(ReceiverConfig)
