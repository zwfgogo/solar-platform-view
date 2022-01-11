/**
 * 异常规则配置
 */
import _ from 'lodash'
import { Moment } from 'moment'
import React, { Component } from 'react'
import { AlarmState, GlobalState } from 'umi'
import { Tabs, Select, Input, Button, Dropdown, Table2, Tooltip, Modal, TreeSelect } from 'wanke-gui'
import { Menu } from 'antd'
import { CaretDownOutlined, DownOutlined, InfoCircleFilled } from 'wanke-icon'
import FormLayout from '../../../components/FormLayout'
import Page from '../../../components/Page'
import RangePicker from '../../../components/rangepicker'
import { CrumbsPortal } from '../../../frameset/Crumbs'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import PageProps from '../../../interfaces/PageProps'
import Item from '../../../public/components/SelectItem'
import utils from '../../../public/js/utils'
import { alarm_config, globalNS } from '../../constants'
import { makeConnect } from '../../umi.helper'
import "./index.less"
import AlarmRulesExportModal from './AlarmRulesExportModal'
import AlarmRulesSyncModal from './AlarmRulesSyncModal'
import { isZh } from '../../../core/env'
import CustomCascader from '../component/CustomCascader'
import createServices from '../../../util/createServices'
import RichText from '../component/RichText'
import moment from 'moment'

interface Props extends PageProps, GlobalState, MakeConnectProps<AlarmState>, AlarmState {
  exportLoading: boolean
  syncLoading: boolean
}
interface State {
  searchObj: any
  selectedRowKeys: string[],
  tabsKey: string
}

const { TabPane } = Tabs;
const { FieldItem } = FormLayout
// const { Option } = Select

class AlarmRulesPage extends Component<Props, State> {
  state = {
    searchObj: {},
    selectedRowKeys: [],
    tabsKey: null,
  }

  componentDidMount() {
    const { dispatch } = this.props
    // 获取异常类型数据
    dispatch({ type: `${alarm_config}/getAlarmTypesList`, payload: {} })
    // 获取相关枚举集合
    dispatch({ type: `${alarm_config}/getAllEnums` })
    // 
    dispatch({ type: `${alarm_config}/getStationTypeByName` })
    // 获得适用对象树
    dispatch({ type: `${alarm_config}/getAlarmObjectsTree` })
    // if (this.props.alarmRulesEnums?.alarmScopes?.[0].name)
    //   this.setState({ tabsKey: this.props.alarmRulesEnums?.alarmScopes?.[0].name }, () => this.onSearch())
  }

  componentWillUnmount() {
    const { dispatch } = this.props
    dispatch({
      type: `${alarm_config}/updateState`, payload: {
        alarmTypesList: [],
        alarmTypesPage: 1,
        alarmTypesSize: 20,
        alarmTypesTotal: 0
      }
    })
  }

  componentDidUpdate(preProps) {
    if (!_.isEqual(preProps.alarmRulesEnums?.alarmScopes, this.props.alarmRulesEnums?.alarmScopes) && this.props.alarmRulesEnums?.alarmScopes) {
      this.setState({ tabsKey: this.props.alarmRulesEnums?.alarmScopes?.[0].name }, () => this.onSearch())
    }

    if(!_.isEqual(preProps.stationType, this.props.stationType)){
      
    }
  }

  getSearchObj = () => {
    const { searchObj: originSearch } = this.state
    const searchObj = _.cloneDeep(originSearch)
    if (searchObj.dtime && searchObj.dtime.length === 2) searchObj.dtime = searchObj.dtime.map((d, index) => d.format(index === 0 ? 'YYYY-MM-DD 00:00:00' : 'YYYY-MM-DD 23:59:59')).join()
    else delete searchObj.dtime
    // if (searchObj.deviceTypeId) searchObj.deviceTypeId = searchObj.deviceTypeId.join()
    // if (searchObj.stationId) searchObj.stationId = searchObj.stationId.join()
    if (searchObj.alarmLevelId) searchObj.alarmLevelId = searchObj.alarmLevelId.join()
    // if (searchObj.alarmTypeId) searchObj.alarmTypeId = searchObj.alarmTypeId.join()
    return _.omitBy(searchObj, (value, key) => value === null || value === undefined)
  }

  // 查询
  onSearch = (page = 1, size = 20) => {
    const { dispatch } = this.props
    // const { tabsKey } = this.state
    // const alarmScopeId = (alarmRulesEnums?.alarmScopes || []).find(item => item.name === tabsKey)?.id
    dispatch({ type: `${alarm_config}/getAlarmRulesList`, payload: { page, size, ...this.getSearchObj() } })
  }

  // 导出-old
  exportAlarmRules = () => {
    const { dispatch, alarmRulesEnums } = this.props
    const { tabsKey } = this.state
    const alarmScopeId = (alarmRulesEnums?.alarmScopes || []).find(item => item.name === tabsKey)?.id
    dispatch({ type: `${alarm_config}/onExport`, payload: { tabsKey, searchObj: { ...this.getSearchObj(), alarmScopeId } } })
  }

  // 导出-new
  exportAlarmRulesNew = (stationIds) => {
    const { dispatch } = this.props
    dispatch({
      type: `${alarm_config}/onExportNew`,
      payload: { stationIds }
    })
  }

  toggleExportModal = (flag) => {
    this.props.updateState({
      exportModalVisible: flag
    })
  }

  toggleSyncModal = (flag) => {
    this.props.updateState({
      syncModalVisible: flag
    })
  }

  alarmRulesSync = (stationIds) => {
    const { dispatch } = this.props
    dispatch({
      type: `${alarm_config}/onSync`,
      payload: { stationIds }
    })
  }

  // 新增打开页面
  openAlarmRules = () => {
    this.props.forward("AlarmRulesEditPage", { type: 'new', tabKey: this.state.tabsKey, searchObj: this.getSearchObj() });
  }

  // 过滤条件onChange
  handleFormChange = (searchObj) => {
    this.setState({ searchObj })
  }

  // 切换tabs
  handleChange = key => {
    const { dispatch } = this.props
    dispatch({ type: `${alarm_config}/updateState`, payload: { alarmRulesList: [], alarmRulesPage: 1, alarmRulesSize: 20, alarmRulesTotal: 0 } })
    this.setState({ searchObj: {}, tabsKey: key, selectedRowKeys: [] }, () => this.onSearch())
  }

  // 表格选择
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys })
  }

  // 查看异常规则查看页面
  viewAlarmRules = (record) => {
    if (record.alarmScope?.name === 'device') {
      const deviceTypeName = record.alarmObject?.deviceTypeName
      this.props.dispatch({
        type: `${alarm_config}/getDeviceTypeTreeChildren`,
        payload: {
          deviceTypeName,
          firmId: record?.firmId
        }
      })
    }
    this.props.forward("AlarmRulesEditPage", { type: 'view', tabKey: this.state.tabsKey, record, searchObj: this.getSearchObj() });
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
              this.deleteAllRules(selectedRowKeys)
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
              this.deleteRules(record)
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

  deleteRules = (record) => {
    const { id } = record
    const { dispatch } = this.props
    // const { tabsKey } = this.state
    // const alarmScopeId = (alarmRulesEnums?.alarmScopes || []).find(item => item.name === tabsKey)?.id
    dispatch({ type: `${alarm_config}/deleteAlarmRules`, payload: { id, searchObj: this.getSearchObj() } })
  }

  deleteAllRules = (selectedRowKeys) => {
    const { dispatch } = this.props
    // const { tabsKey } = this.state
    // const alarmScopeId = (alarmRulesEnums?.alarmScopes || []).find(item => item.name === tabsKey)?.id
    dispatch({ type: `${alarm_config}/deleteAllAlarmRules`, payload: { ids: selectedRowKeys.join(), searchObj: this.getSearchObj() } })
    this.setState({ selectedRowKeys: [] })
  }

  // 批量修改级别
  handleMenuClick = ({ key }) => {
    const { selectedRowKeys } = this.state
    const { dispatch } = this.props
    // const { tabsKey } = this.state
    // const alarmScopeId = (alarmRulesEnums?.alarmScopes || []).find(item => item.name === tabsKey)?.id
    if (selectedRowKeys.length > 0)
      dispatch({ type: `${alarm_config}/patchAlarmRulesLevel`, payload: { ids: selectedRowKeys.join(), alarmLevelId: key, searchObj: this.getSearchObj() } })
  }

  updateTreeData = (list: any[], key: React.Key, children: any[]): any[] => {
    return list.map((node) => {
      if (node.key === key) {
        return {
          ...node,
          children: children?.map((item, index) => ({ ...item, key: `${key}-${index}`, isLeaf: !item.hasChild })),
        };
      }
      if (node.children?.length) {
        return {
          ...node,
          children: this.updateTreeData(node.children, key, children),
        };
      }
      return node;
    });
  }

  render() {
    const { pageId, alarmRulesEnums, stationList, alarmTypesList, alarmRulesList, alarmRulesSize, alarmRulesTotal, alarmRulesPage, alarmTree } = this.props
    const { searchObj, selectedRowKeys, tabsKey } = this.state
    const { alarmScopes, alarmLevels, deviceTypes } = alarmRulesEnums


    const stationDataList = stationList.map(item => ({ value: item.id, name: item.title }))
    // const alarmTypesDataList = (alarmTypesList || []).map(item => ({ value: item.id, name: item.title }))
    const alarmLevelsList = (alarmLevels || []).map(item => ({ value: item.id, name: item.title }))
    const alarmScopesList = (alarmScopes || []).map(item => ({ value: item.id, name: item.title }))

    const firmTypeName = JSON.parse(sessionStorage.getItem('userInfo'))?.firm?.firmType?.name
    const isPlatform = firmTypeName === 'Platform'

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    }

    const columns = [
      //   {
      //   title: 'ID',
      //   dataIndex: 'id',
      //   key: 'id',
      //   width: 160,
      // }, 
      {
        title: utils.intl('适用类型'),
        dataIndex: 'alarmScope',
        key: 'alarmScope',
        width: 180,
        ellipsis: true,
        render: (obj, record) => `${obj?.title}${obj?.name === 'deviceType' ? `-${deviceTypes?.find(item => item.name === record.alarmObject?.deviceTypeName)?.title}` : ''}`
      }, {
        title: utils.intl('适用对象'),
        dataIndex: 'alarmObjectTitles',
        key: 'alarmObjectTitles',
        ellipsis: true,
        render: (text) => (
          <Tooltip placement="topLeft" title={text ? (
            <div dangerouslySetInnerHTML={{ __html: text.replace(/;/g, '<br/>') }} />
          ) : null}>
            <div style={{
              width: '100%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>{text}</div>
          </Tooltip>
        )
      }, {
        title: utils.intl('异常类型'),
        dataIndex: 'alarmType',
        key: 'alarmType',
        width: 200,
        ellipsis: true,
        // render: (obj) => obj?.title
      }, {
        title: utils.intl('异常详情'),
        dataIndex: 'desc',
        key: 'desc',
        ellipsis: true,
      }, {
        title: utils.intl('异常级别'),
        dataIndex: 'alarmLevel',
        key: 'alarmLevel',
        width: 100,
        render: (obj) => obj?.title
      }, {
        title: utils.intl('维护时间'),
        dataIndex: 'dtime',
        key: 'dtime',
        width: 180,
      }, {
        title: utils.intl('维护人'),
        dataIndex: 'userTitle',
        key: 'userTitle',
        ellipsis: true,
        width: 200,
      }, {
        title: utils.intl('操作'),
        dataIndex: 'operate',
        key: 'operate',
        align: "right",
        width: 150,
        render: (text, record) => (
          <>
            <span style={{ color: "#3D7EFF", cursor: "pointer", marginRight: 16 }} onClick={() => this.viewAlarmRules(record)}>{utils.intl('查看')}</span>
            {  isPlatform ? null : <span style={{ color: "#3D7EFF", cursor: "pointer" }} onClick={() => this.confirmDelete(record)}>{utils.intl('删除')}</span> }
          </>
        )
      }];

    const renderSelectLabel = () => {
      if (isZh()) {
        return (
          <label
            style={{ marginRight: 16 }}
          >
            {utils.intl('已选择')}
            <span style={{ color: "#3D7EFF", margin: "0px 4px" }}>{selectedRowKeys.length}</span>
            {utils.intl('项')}
          </label>
        )
      } else {
        return (
          <label
            style={{ marginRight: 16 }}
          >
            Selected
            <span style={{ color: "#3D7EFF", margin: "0px 4px" }}>{selectedRowKeys.length}</span>
          </label>
        )
      }
    }

    return (
      <Page pageId={pageId} className="alarm-rules-page" style={{ background: "transparent" }}>
        <CrumbsPortal pageName="AlarmRulesPage">
          <Button onClick={() => this.toggleExportModal(true)}>
            {utils.intl('导出')}
          </Button>
          <Button style={{ marginLeft: 16 }} onClick={() => this.toggleSyncModal(true)}>
            {utils.intl('同步')}
          </Button>
          {
            isPlatform ? null : (
              <Button style={{ marginLeft: 16 }} type="primary" onClick={this.openAlarmRules}>
                {utils.intl('新增')}
              </Button>
            )
          }
        </CrumbsPortal>
        {/* <RichText style={{ width: 780, height: 118 }}/> */}
        <div className="alarm-rules-tabs-body">
          <FormLayout
            onSearch={() => this.onSearch()}
            onReset={() => this.setState({
              searchObj: {
                alarmScopeId: null,
                alarmLevelId: [],
                alarmObjectId: null,
                queryStr: undefined,
                alarmObjectId: null,
              }
            })}
          >
            <FieldItem label={utils.intl('关键字')}>
              <Input
                value={searchObj.queryStr}
                onChange={e => this.handleFormChange({ ...searchObj, queryStr: e.target.value })}
                placeholder={utils.intl('请输入')}
              />
            </FieldItem>
            <FieldItem label={utils.intl('适用类型')}>
              <Select
                dataSource={alarmScopesList}
                // mode="multiple"
                className="card-detail-select"
                style={{ width: '100%' }}
                value={searchObj.alarmScopeId}
                placeholder={utils.intl('全部')}
                allowClear
                // checkAllText={utils.intl("全选")}
                // selectText={val => <span className="select-text">({utils.intl(`已选 {0} 个`, val?.length ?? 0)})</span>}
                onChange={value => this.handleFormChange({ ...searchObj, alarmScopeId: value })} />
            </FieldItem>
            <FieldItem label={utils.intl('field.异常级别')}>
              <Select
                dataSource={alarmLevelsList}
                mode="multiple"
                className="card-detail-select"
                style={{ width: '100%' }}
                value={searchObj.alarmLevelId}
                maxTagCount='responsive'
                placeholder={utils.intl('全部')}
                allowClear
                checkAllText={utils.intl("全选")}
                selectText={val => <span className="select-text">({utils.intl(`已选 {0} 个`, val?.length ?? 0)})</span>}
                onChange={value => this.handleFormChange({ ...searchObj, alarmLevelId: value })} />
            </FieldItem>
            <FieldItem label={utils.intl('field.维护时间')}>
              <RangePicker
                allowClear
                onChange={value => this.handleFormChange({ ...searchObj, dtime: value })}
                disabledDate={(currentDate) => moment().isBefore(currentDate)}
                value={(searchObj.dtime || []) as [Moment, Moment]}
              />
            </FieldItem>
            <FieldItem label={utils.intl('适用对象')}>
              <TreeSelect
                treeData={alarmTree}
                filterTreeNode
                treeNodeFilterProp="title"
                treeLine
                showSearch
                allowClear
                suffixIcon={<CaretDownOutlined />}
                value={searchObj.alarmObjectId}
                loadData={(node) =>
                  new Promise<void>(resolve => {
                    console.log('node', node)
                    const { key, id, children, hasChild } = node
                    // setDisabled(true);
                    if (children && children.length || !hasChild) {
                      // setDisabled(false);
                      resolve();
                      return;
                    } else if (hasChild) {
                      createServices<{ parentId: number, activity: boolean }>("get", "/api/basic-data-management/equipment-ledger/devices/getDeviceTreeChild", { parentId: id, activity: true })
                        .then(data => {
                          console.log('data', this.updateTreeData(alarmTree, key, data?.results || []))
                          this.props.action('updateToView', { alarmTree: this.updateTreeData(alarmTree, key, data?.results || []) })
                          // setTreeList(tList => updateTreeData(tList, key, data?.results || []))
                          resolve();
                        })
                    }
                  })}
                onChange={value => this.handleFormChange({ ...searchObj, alarmObjectId: value })}
              />
            </FieldItem>
            {/* <FieldItem label={utils.intl('field.异常类型')}>
              <Select
                dataSource={alarmTypesDataList}
                mode="multiple"
                className="card-detail-select"
                style={{ width: '100%' }}
                value={searchObj.alarmTypeId}
                maxTagCount='responsive'
                checkAllText={utils.intl("全选")}
                selectText={val => <span className="select-text">({utils.intl(`已选 {0} 个`, val?.length ?? 0)})</span>}
                allowClear
                filterable
                showAllSelect={false}
                onChange={value => this.handleFormChange({ ...searchObj, alarmTypeId: value })} />
            </FieldItem> */}
          </FormLayout>
          <div className="alarm-rules-body">
            <div className="alarm-rules-page-btn-groups">
              {renderSelectLabel()}
              {
                 isPlatform ? null : <Button disabled={!selectedRowKeys.length} onClick={this.confirmAllDelete}>{utils.intl('批量删除')}</Button>
              }
              <Dropdown
                trigger={['click']}
                disabled={!selectedRowKeys.length}
                overlay={<Menu onClick={this.handleMenuClick}>
                  {(alarmLevelsList || []).map(item => (<Menu.Item key={item.value}>
                    {item.name}
                  </Menu.Item>))}
                </Menu>}>
                <Button type="primary" style={{ marginLeft: 8 }}>
                  {utils.intl('批量修改级别')} <DownOutlined />
                </Button>
              </Dropdown>
            </div>
            <div className="alarm-rules-page-table-box">
              <Table2
                x={tabsKey === 'station' ? 1400 : 1600}
                rowKey={record => record.id}
                className="alarm-table"
                rowSelection={rowSelection}
                dataSource={alarmRulesList}
                columns={columns}
                page={alarmRulesPage}
                size={alarmRulesSize}
                total={alarmRulesTotal}
                onPageChange={this.onSearch}
              />
            </div>
          </div>
        </div>

        {this.props.exportModalVisible ? (
          <AlarmRulesExportModal
            loading={this.props.exportLoading}
            stationDataList={stationDataList}
            onOk={this.exportAlarmRulesNew}
            onClose={() => this.toggleExportModal(false)}
          />
        ) : null}
        {this.props.syncModalVisible ? (
          <AlarmRulesSyncModal
            loading={this.props.syncLoading}
            stationDataList={stationDataList}
            results={this.props.syncResults}
            onSync={this.alarmRulesSync}
            onOk={() => this.toggleSyncModal(false)}
            onClose={() => this.toggleSyncModal(false)}
          />
        ) : null}
      </Page>
    )
  }
}


const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    stationList: state[globalNS].stationList,
    exportLoading: getLoading('onExportNew'),
    syncLoading: getLoading('onSync'),
    roleName: state[globalNS].roleName,
  }
}

export default makeConnect(alarm_config, mapStateToProps)(AlarmRulesPage)