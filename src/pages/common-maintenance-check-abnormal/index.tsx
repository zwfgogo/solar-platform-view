import React from 'react'
import { Button, Row, Col, Input, Radio, Table2, Modal, Spin, Checkbox, RangePicker, MultiLineChart, BarChart, Select, message, Tabs } from 'wanke-gui'
import moment, { Moment } from 'moment'
import OrderModal from './component/orderFrom'
import columns from './component/columns'
import historyColumns from './component/historyColumns'
import IgnoreModal from './component/ignore'
import Page from "../../components/Page"
import { getDate } from "../../util/dateUtil"
import { makeConnect } from "../umi.helper"
import MakeConnectProps from "../../interfaces/MakeConnectProps"
import { AbnormalQueryModal } from './model'
import PageProps from "../../interfaces/PageProps"
import FullContainer from "../../components/layout/FullContainer"
import utils from "../../public/js/utils";
import { disabledDateAfterToday } from '../../util/dateUtil'
import _ from 'lodash'
import "./index.less"
import { CrumbsPortal } from '../../frameset/Crumbs'
import FormLayout from '../../components/FormLayout'
import DeviceModal from './component/DeviceModal'

const { TabPane } = Tabs
const FieldItem = FormLayout.FieldItem

interface Props extends MakeConnectProps<AbnormalQueryModal>, AbnormalQueryModal, PageProps {
  loading: boolean;
  historyLoading?: boolean;
  openQueryModal?: boolean;
  fetchPointDataTypeLoading?: boolean;
  openModal?: boolean;
  timeDate?: string;
  scenariosStationList: any[]
}

interface State {
  visible: boolean,
  rangeTime: Moment[]
  devTitle: string,
  stationList: any[],
  alarmLevelsList: any[],
  searchObj: any,
  page: number,
  size: number
}

class operationList extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      rangeTime: [],
      devTitle: null,
      stationList: [],
      alarmLevelsList: [],
      searchObj: {},
      page: 1,
      size: 20
    }
  }

  componentDidMount() {
    this.props.action('reset')
    this.props.action('fetchStationList')
    this.props.action('getAlarmLevelsList')
  }

  initSearchObj = (callBack?: (param: { searchObj: any, page: number, size: number }) => void) => {
    const searchObj = {
      station: [],
      alarmLevel: this.props.location.query?.alarmLevelName ? (this.props.alarmLevelsList || []).filter(item => item.name === this.props.location.query?.alarmLevelName).map(item => item.value) : [],
      time: [],
      keyWord: undefined
    }
    this.setState({
      searchObj,
      page: 1, 
      size: 20
    }, () => { callBack && callBack({ searchObj, page: 1, size: 20 }) })
  }

  setSearchObjToService = (searchObj) => {
    return {
      startDate: searchObj.time?.[0]?.format('YYYY-MM-DD'),
      endDate: searchObj.time?.[1]?.format('YYYY-MM-DD'),
      stationIdList: searchObj.station,
      alarmLevelIdList: searchObj.alarmLevel,
      queryStr: searchObj.keyWord,
    }
  }

  componentDidUpdate(preProps: Props, preState: State) {
    if (!_.isEqual(preProps.alarmLevelsList, this.props.alarmLevelsList)) {
      this.initSearchObj(({ searchObj, page, size }) => {
         this.props.action('getList', {  searchObj: this.setSearchObjToService(searchObj), page, size })
      });
    }

    if(!_.isEqual(preProps.location.query, this.props.location.query)){
      this.initSearchObj(({ searchObj, page, size }) => {
        if(searchObj.alarmLevel?.length) 
         this.props.action('getList', {  searchObj: this.setSearchObjToService(searchObj), page, size })
      });
    }
  }

  getEnums = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'abnormalQuery/getEnums'
    })
  }

  radioChange = (v) => {
    const { dispatch } = this.props
    const { stationList, alarmLevelsList, searchObj } = this.state
    dispatch({
      type: 'abnormalQuery/pageChange',
      payload: { page: 1, size: 20, listType: Number(v), searchObj: this.setSearchObjToService(searchObj) }
    })
    dispatch({
      type: 'abnormalQuery/updateState',
      payload: {
        abnormalCode: v, startDate: moment().subtract(29, 'day').format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD'), query: { stationList, alarmLevelIdList: alarmLevelsList }
      }
    })
  }

  search = () => {
    const { query, abnormalCode } = this.props
    this.pageChange(1, query.size, Number(abnormalCode))
  }

  pageChange = (page, size, e) => {
    const { dispatch } = this.props
    const { searchObj } = this.state
    this.setState({ page, size })
    dispatch({ type: 'abnormalQuery/pageChange', payload: { page, size, listType: e, searchObj: this.setSearchObjToService(searchObj) } })
  }

  sizeChange = (page, size, e) => {
    const { dispatch } = this.props
    const { searchObj } = this.state
    this.setState({ page, size })
    dispatch({ type: 'abnormalQuery/pageChange', payload: { page, size, listType: e, searchObj: this.setSearchObjToService(searchObj) } })
  }
  //搜索框的值改变
  searchChange = (type, data) => {
    const { dispatch } = this.props
    dispatch({ type: 'abnormalQuery/stringChange', payload: { [type]: data } })
  }
  dateChange = (date, dateString) => {
    const { dispatch } = this.props
    this.setState({ searchObj: { ...this.state.searchObj, time: date } })
    dispatch({
      type: 'abnormalQuery/updateState',
      payload: { startDate: dateString[0], endDate: dateString[1] }
    })
  }

  // 打开设备详情
  openDevMemo = (record) => {
    const { devId, startTime, devTitle, id, alarmId } = record
    // this.props.dispatch({ type: 'abnormalQuery/fetchPointDataType', payload: { deviceId: devId } })
    this.props.dispatch({ type: 'abnormalQuery/getDeviceModalTree', payload: { id: alarmId } })
    const endTime = moment(startTime, 'YYYY-MM-DD HH:mm:ss').add(15, 'm')
    const sTime = moment(startTime, 'YYYY-MM-DD HH:mm:ss').subtract(15, 'm')
    const timeDate = sessionStorage.getItem('timeDate') ? moment(sessionStorage.getItem('timeDate')) : moment()
    this.setState({
      visible: true, devTitle, rangeTime: [
        timeDate.isAfter(sTime, 'm') ? sTime : timeDate,
        timeDate.isAfter(endTime, 'm') ? endTime : timeDate
      ]
    })
  }

  cancel = () => {
    this.setState({ visible: false })
  }

  alarmLevelHandleChange = (value) => {
    const { dispatch } = this.props;
    this.setState({ alarmLevelsList: value, searchObj: { ...this.state.searchObj, alarmLevel: value } })
    dispatch({ type: 'abnormalQuery/alarmLevelChange', payload: { alarmLevelIdList: value } });
  }

  stationHandleChange = (value) => {
    const { dispatch } = this.props;
    this.setState({ stationList: value, searchObj: { ...this.state.searchObj, station: value } })
    dispatch({ type: 'abnormalQuery/stationChange', payload: { stationIdList: value } });
  }

  render() {
    const { list, loading, orderModal, abnormalCode, ignoreModal, historyLoading, total, openModal, type, alarmLevelsList, scenariosStationList } = this.props
    const { visible, rangeTime, devTitle, stationList, alarmLevelsList: aList, searchObj, page, size } = this.state;
    return (
      <Page className="alarm-page" style={{ backgroundColor: "transparent" }}>
        <CrumbsPortal>
          <Button type="primary" onClick={() => {
            this.props.action('onExport', abnormalCode === '1' ? { searchObj: this.setSearchObjToService(searchObj) } : { stationList, alarmLevelIdList: aList, searchObj: this.setSearchObjToService(searchObj) })
          }}>{utils.intl('导出')}</Button>
        </CrumbsPortal>
        <FullContainer style={{ backgroundColor: "transparent" }}>
          <FormLayout
          >
            <FieldItem label={utils.intl('电站')}>
              <Select style={{ display: "inline-block" }}
                value={searchObj.station || []}
                maxTagCount="responsive"
                checkAllText={utils.intl("全选")}
                selectText={val => <span className="select-text">({utils.intl(`已选 {0} 个`, val?.length ?? 0)})</span>}
                dataSource={
                  scenariosStationList && scenariosStationList.length ? scenariosStationList.map(item => ({ value: item.id, name: item.title })) : []
                } mode="multiple" onChange={this.stationHandleChange}>
              </Select>
            </FieldItem>
            <FieldItem label={utils.intl('告警级别')}>
              <Select style={{ display: "inline-block" }} value={searchObj.alarmLevel} maxTagCount="responsive" dataSource={alarmLevelsList || []} mode="multiple" checkAllText={utils.intl("全选")} selectText={val => <span className="select-text">({utils.intl(`已选 {0} 个`, val?.length ?? 0)})</span>} onChange={this.alarmLevelHandleChange}>
              </Select>
            </FieldItem>
            <FieldItem label={utils.intl('发生时间')}>
              <RangePicker
                disabledDate={disabledDateAfterToday}
                maxLength={90}
                onChange={this.dateChange}
                allowClear={false}
                value={
                  searchObj.time
                }
              />
            </FieldItem>
            <FieldItem label="">
              <Input placeholder={utils.intl('设备对象/异常类型/异常详情')}
                value={searchObj.keyWord}
                style={{ width: 'calc(100% - 80px)' }}
                onChange={
                  (e) => {
                    this.setState({ searchObj: { ...searchObj, keyWord: e.target.value } })
                  }
                }
              />
              <Button type="primary" onClick={this.search} style={{ float: "right" }}>{utils.intl("查询")}</Button>
            </FieldItem>
          </FormLayout>
          <div className="page-sub-container" style={{ padding: 0, height: 'calc(100% - 80px)' }}>
            <Tabs onChange={this.radioChange} activeKey={abnormalCode}>
              <TabPane tab={utils.intl('当前异常')} key={'1'}>
              </TabPane>
              <TabPane tab={utils.intl('历史异常')} key={'2'}>
              </TabPane>
            </Tabs>
            {abnormalCode === '1' ?
              <div className="flex1 f-pr" style={{ padding: '0 16px 10px', height: 'calc(100% - 64px)' }}>
                <Table2 dataSource={list} columns={columns(this.props, this.openDevMemo, this.setSearchObjToService(searchObj))}
                  loading={loading}
                  rowKey="num"
                  page={page}
                  size={size}
                  total={total}
                  onPageChange={(page, size) => this.pageChange(page, size, 1)}
                />
              </div>
              :
              <div className="flex1 f-pr" style={{ padding: '0 16px 10px', height: 'calc(100% - 64px)' }}>
                <Table2
                  x={1450}
                  dataSource={list}
                  columns={historyColumns(this.props.stationOptions, this.openDevMemo)}
                  loading={historyLoading}
                  rowKey="num"
                  page={page}
                  size={size}
                  total={total}
                  onPageChange={(page, size) => this.pageChange(page, size, 2)}
                />
              </div>
            }
            {type !== 'query' ?
              openModal === false && orderModal ? <OrderModal /> : ''
              :
              orderModal ? <OrderModal /> : ''
            }
            {ignoreModal ? <IgnoreModal searchObj={this.setSearchObjToService(searchObj)} page={page} size={size} /> : ''}
          </div>
        </FullContainer>
        {visible ? (
          <DeviceModal
            visible={visible}
            title={devTitle}
            defaultRangeTime={rangeTime}
            onCancel={this.cancel}
          />
        ) : null}
      </Page>
    )
  }
}

function mapStateToProps(model, getLoading, state) {
  return {
    ...model,
    time: state.global.time,
    timeDate: state.global.timeDate,
    scenariosStationList: state.global.scenariosStationList,
    loading: getLoading('getList'),
    historyLoading: getLoading('getHistoryList'),
    openModal: getLoading('getEnums'),
    openQueryModal: getLoading('getDetail'),
    fetchPointDataTypeLoading: getLoading('fetchPointDataType'),
  }
}

export default makeConnect('abnormalQuery', mapStateToProps)(operationList)
