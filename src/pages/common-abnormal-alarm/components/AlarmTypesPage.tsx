/**
 * 异常类型配置
 */
import React, { Component } from 'react'
import { AlarmState } from 'umi'
import { AutoSizer, Button, Dropdown, FormTable, Modal, Input, Table2, DatePicker, message } from 'wanke-gui'
import { Form } from 'antd'
import { DownOutlined, InfoCircleFilled } from 'wanke-icon'
import Page from '../../../components/Page'
import { CrumbsPortal } from '../../../frameset/Crumbs'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import PageProps from '../../../interfaces/PageProps'
import { GlobalState } from '../../../models/global'
import utils from '../../../public/js/utils'
import { alarm_config, globalNS } from '../../constants'
import { makeConnect } from '../../umi.helper'
import { receiverDayMap } from '../dataCfg'
import "./index.less"
import FormLayout from '../../../components/FormLayout'
import { Moment } from 'moment'
import { table } from '../../../public/js/mockdata'
import AbsoluteFullDiv from '../../../components/AbsoluteFullDiv'

const { Search, TextArea } = Input
const { FieldItem } = FormLayout
const { RangePicker } = DatePicker
const FormItem = Form.Item

interface Props extends PageProps, GlobalState, MakeConnectProps<AlarmState>, AlarmState {
  alarmNotifyConfigId: number | string
}
interface State {
  selectedRowKeys: any[],
  dataSource: any[]
  visible: boolean,
  searchObj: { dtime: Moment[], queryStr: string }
  tableItem: any;
}

class AlarmTypesPage extends Component<Props, State> {
  formBox: any;
  state = {
    selectedRowKeys: [],
    dataSource: [],
    visible: false,
    searchObj: {
      dtime: [],
      queryStr: undefined
    },
    tableItem: {} , // 当前异常类型对象
  }

  componentDidMount() {
    // 获得所有异常类型配置列表
    this.onSearch();
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

  // 删除异常类型
  deleteReceiver = (record) => {
    const { id } = record
    const { selectedRowKeys, searchObj } = this.state

    const { dispatch } = this.props
    dispatch({ type: `${alarm_config}/deleteAlarmTypes`, payload: { id, searchObj } })
    this.setState({
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

  // 批量删除异常类型
  deleteAllReceiver = (keys: (string | number)[]) => {
    const { searchObj } = this.state
    const { dispatch } = this.props
    dispatch({ type: `${alarm_config}/deleteAllAlarmTypes`, payload: { ids: keys.join(), searchObj } })
    this.setState({
      selectedRowKeys: []
    })
  }

  // 打开异常配置新增页面
  openAlarmTypes = () => {
    this.setState({ visible: true, tableItem: {} })
  }

  // 查询
  onSearch = (page = 1, size = 20) => {
    const { dispatch } = this.props
    const { searchObj: originSearch } = this.state
    const searchObj = _.cloneDeep(originSearch)
    if(searchObj.dtime && searchObj.dtime.length === 2) searchObj.dtime = searchObj.dtime.map((d, index) => d.format(index === 0 ? 'YYYY-MM-DD 00:00:00' : 'YYYY-MM-DD 23:59:59')).join()
    else delete searchObj.dtime
    dispatch({ type: `${alarm_config}/getAlarmTypesList`, payload: { page, size, ...searchObj } })
  }

  // 编辑页面
  editAlarmTypes = (record) => {
    this.setState({ tableItem: record, visible: true })
  }

  // 保存异常类型
  saveAlarmTypes = () => {
    const { dispatch } = this.props
    const { tableItem, searchObj: originSearch } = this.state
    const { validateFields } = this.formBox
    const searchObj = _.cloneDeep(originSearch)
    if(searchObj.dtime && searchObj.dtime.length === 2) searchObj.dtime = searchObj.dtime.map((d, index) => d.format(index === 0 ? 'YYYY-MM-DD 00:00:00' : 'YYYY-MM-DD 23:59:59')).join()
    else delete searchObj.dtime
    validateFields().then(values => {
      if(JSON.stringify(tableItem) !== '{}'){ // 编辑
        dispatch({ type: `${alarm_config}/putAlarmTypes`, payload: { body: { body: values, id: tableItem.id }, searchObj } })
        .then(errorCode => {
          if(errorCode === 0){
            message.success(utils.intl('保存成功'))
            this.setState({ visible: false })
          } 
        })
      }else{ // 新增
        dispatch({ type: `${alarm_config}/postAlarmTypes`, payload: { body: values, searchObj } })
        .then(errorCode => {
          if(errorCode === 0){
            message.success(utils.intl('保存成功'))
            this.setState({ visible: false })
          } 
        })
      }
    })
  }

  render() {
    const { pageId, alarmTypesList, alarmTypesPage, alarmTypesSize, alarmTypesTotal } = this.props
    const { selectedRowKeys, dataSource, visible, searchObj, tableItem,  } = this.state
    const language = localStorage.getItem('language')
    const columns = [{
      title: utils.intl('序号'),
      dataIndex: 'num',
      key: 'num',
      width: 65,
      render: (text, record, index) => record.isBind ? <div title={utils.intl('该条数据正在引用中，不可删除')}>{index + 1}</div> : index + 1
    }, {
      title: utils.intl('异常类型'),
      dataIndex: 'title',
      key: 'title',
      width: 160,
      render: (text, record) => record.isBind ? <div title={utils.intl('该条数据正在引用中，不可删除')}>{text}</div> : text
    }, {
      title: utils.intl('描述'),
      dataIndex: 'desc',
      key: 'desc',
      render: (text, record) => record.isBind ? <div title={utils.intl('该条数据正在引用中，不可删除')}>{text}</div> : text
    }, {
      title: utils.intl('维护时间'),
      dataIndex: 'dtime',
      key: 'dtime',
      width: 180,
      render: (text, record) => record.isBind ? <div title={utils.intl('该条数据正在引用中，不可删除')}>{text}</div> : text
    }, {
      title: utils.intl('维护人'),
      dataIndex: 'userTitle',
      key: 'userTitle',
      width: 180,
      render: (text, record) => record.isBind ? <div title={utils.intl('该条数据正在引用中，不可删除')}>{text}</div> : text
    }, {
      title: utils.intl('操作'),
      dataIndex: 'operate',
      key: 'operate',
      align: "right",
      width: 180,
      render: (text, record) => (
        <>
          <span style={{ color: "#3D7EFF", cursor: "pointer", marginRight: !record.isBind ? 16 : 0 }} onClick={() => this.editAlarmTypes(record)}>{utils.intl('编辑')}</span>
          { !record.isBind ? <span style={{ color: "#3D7EFF", cursor: "pointer" }} onClick={() => this.confirmDelete(record)}>{utils.intl('删除')}</span> : null }
        </>
      )
    },]

    const rowSelection = {
      selectedRowKeys,
      getCheckboxProps: (record) => ({ disabled: record.isBind }),
      onChange: this.onSelectChange,
    };

    return (
      <Page pageId={pageId} style={{ background: "transparent", boxShadow: "none", display: "flex", flexDirection: "column" }}>
        <CrumbsPortal>
          <Button style={{ marginLeft: 16 }} type="primary" onClick={this.openAlarmTypes}>
            {utils.intl('新增')}
          </Button>
        </CrumbsPortal>
        <FormLayout
          onSearch={() => this.onSearch()}
        >
          <FieldItem label={utils.intl('关键字')}>
            <Input
              value={searchObj.queryStr}
              onChange={e => this.setState({ searchObj: { ...searchObj, queryStr: e.target.value } })}
              placeholder={utils.intl('请输入关键字查询')}
            />
          </FieldItem>
          <FieldItem label={utils.intl('维护时间')} style={{ maxWidth: 'auto !important' }}>
            <RangePicker
              allowClear={true}
              onChange={value => this.setState({ searchObj: { ...searchObj, dtime: value } })}
              value={searchObj.dtime as [Moment, Moment]}
            />
          </FieldItem>
        </FormLayout>
        <div className="alarm-type-page-body">
          <div className="alarm-type-page-btn-groups">
            <label style={{ marginRight: 16 }}>{utils.intl('已选择')}<span style={{ color: "#3D7EFF", margin: "0px 4px" }}>{selectedRowKeys.length}</span>{utils.intl('项')}</label>
            <Button type="primary" disabled={!selectedRowKeys.length} onClick={this.confirmAllDelete}>{utils.intl('批量删除')}</Button>
          </div>
          <div className="alarm-type-page-table-box">
            <AbsoluteFullDiv>
              <Table2
                x={592}
                rowKey={record => record.id}
                rowSelection={rowSelection}
                dataSource={alarmTypesList}
                columns={columns}
                className="alarm-table"
                page={alarmTypesPage}
                size={alarmTypesSize}
                total={alarmTypesTotal}
                rowClassName={(record) => record.isBind ? "table-disabled-row" : null}
                onPageChange={this.onSearch}
              />
            </AbsoluteFullDiv>
          </div>
        </div>
        <Modal
          visible={visible}
          title={<div style={{ fontWeight: 'bold' }}>{utils.intl(JSON.stringify(tableItem) !== '{}' ? '编辑' : '新增')}</div>}
          width={480}
          destroyOnClose
          maskClosable={false}
          onCancel={() => this.setState({ visible: false })}
          okText={utils.intl('确定')}
          cancelText={utils.intl('取消')}
          onOk={this.saveAlarmTypes}
        >
          <Form
          layout={language === 'zh' ? "horizontal" : "vertical"}
          className="alarm-type-modal-form"
          ref={formBox => this.formBox = formBox}
          initialValues={{
            title: tableItem.title,
            desc: tableItem.desc
          }}
        >
          <FormItem
            label={utils.intl("异常类型")}
            name="title"
            rules={[{ required: true, message: utils.intl("请输入{0}", "异常类型") }, { max: 20, message: utils.intl('最大长度为{0}', 20) }]}
          >
            <Input style={{ width: '100%' }} placeholder={utils.intl("请输入")} />
          </FormItem>
          <FormItem
            label={utils.intl("描述")}
            name="desc"
          >
            <TextArea style={{ width: '100%' }} autoSize={{ minRows: 5, maxRows: 5 }} maxLength={200} placeholder={utils.intl("请输入")} showCount/>
          </FormItem>
        </Form>
        </Modal>
      </Page >
    )
  }
}

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    stationList: state[globalNS].stationList
  }
}

export default makeConnect(alarm_config, mapStateToProps)(AlarmTypesPage)
