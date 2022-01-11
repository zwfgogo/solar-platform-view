import React from 'react'
import { Button, Row, Col, Select, Input, Table2, SearchInput } from 'wanke-gui'
import RangePicker from "../../components/range-picker/RangePicker"
import moment from 'moment'
import OrderModal from './component/orderFrom'
import Page from "../../components/Page"
import { makeConnect } from "../umi.helper"
import FullContainer from "../../components/layout/FullContainer"
import { DispatchState } from './model'
import MakeConnectProps from "../../interfaces/MakeConnectProps"
import DispatchDetail from './DispatchDetail'
import utils from "../../public/js/utils";
import AbsoluteBubble from '../../components/AbsoluteBubble'
import { disabledDateAfterToday } from '../../util/dateUtil'
import { CrumbsPortal } from '../../frameset/Crumbs'
import FormLayout from '../../components/FormLayout'

const { FieldItem } = FormLayout
interface Props extends DispatchState, MakeConnectProps<DispatchState> {
  loading: boolean
  updateLoading: boolean
  timeDate?: string
}

class operationList extends React.Component<Props> {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.action('reset')
    this.props.action('getSelect')
    this.getEnums()
  }

  getList = () => {
    this.props.action('getList')
  }

  getEnums = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'dispatch/getEnums'
    })
  }
  //显示查看工单
  showDetail = (id) => {
    this.props.action('getDetail', { id })
  }

  showBjgd = (record) => {
    const { dispatch } = this.props
    dispatch({
      type: 'dispatch/updateState',
      payload: {
        orderModal: true,
        id: record.id,
        stationId: record.stationId,
        devId: record.devId,
        typeId: record.typeId,
        userNameProcess: record.userNameProcess,
        orderName: record.orderName,
        description: record.description
      }
    })
  }

  add = () => {
    if (this.props.stationArr.length > 0) {
      this.props.action('fetchDeviceType', { stationId: this.props.stationArr[0].value })
      this.props.updateState({ stationId: this.props.stationArr[0].value })
    } else {
      this.props.updateState({ stationId: null })
    }
    if (this.props.typeOptions.length > 0) {
      this.props.updateState({ typeId: this.props.typeOptions[0].value })
    } else {
      this.props.updateState({ typeId: null })
    }
    if (this.props.usersArr.length > 0) {
      this.props.updateState({ userNameProcess: this.props.usersArr[0].value })
    } else {
      this.props.updateState({ userNameProcess: null })
    }
    this.props.updateState({
      orderModal: true,
      id: null,
      devId: null,
      orderName: null,
      description: ''
    })
  }

  pageChange = (page, size) => {
    const { dispatch } = this.props
    dispatch({ type: 'dispatch/pageChange', payload: { page, size } })
  }

  dateChange = (date, dateString) => {
    const { dispatch, query } = this.props
    dispatch({
      type: 'dispatch/updateState',
      payload: { startDate: dateString[0], endDate: dateString[1] }
    })
    // this.pageChange(1, query.size)
  }

  //搜索框的值改变
  searchChange = (type, data) => {
    const { dispatch } = this.props
    dispatch({ type: 'dispatch/stringChange', payload: { [type]: data } })
  }

  search = () => {
    const { query } = this.props
    this.pageChange(1, query.size)
  }
  selectChange = (o) => {
    const { dispatch, query } = this.props
    dispatch({
      type: 'dispatch/updateState',
      payload: { selectStatusValue: o }
    })
    // this.pageChange(1, query.size)
  }

  render() {
    const columns: any = [
      {
        title: utils.intl('工单名称'), dataIndex: 'orderName', key: 'gdmc'
      },
      {
        title: utils.intl('工单类型'), dataIndex: 'typeTitle', key: 'gdlx',
      },
      {
        title: utils.intl('电站名称'), dataIndex: 'stationTitle', key: 'zd'
      },
      {
        title: utils.intl('设备对象'), dataIndex: 'devTitle', key: 'sb'
      },
      {
        title: utils.intl('工单描述'), dataIndex: 'description', key: 'gdms',
        render: (value) => <AbsoluteBubble>{value}</AbsoluteBubble>
      },
      {
        title: utils.intl('处理人'), dataIndex: 'userTitleProcess', key: 'clr'
      },
      {
        title: utils.intl('发起人'), dataIndex: 'userTitleCreate', key: 'fqr'
      },
      {
        title: utils.intl('工单状态'), dataIndex: 'statusTitle', key: 'sjzt',
        render: text => (
          <>
            {
              text === '处理中' || text === 'Processing' ? (<div className ="info-circle-icon"/>) :
              text === '处理完成' || text === 'Process Complete' ? <div className="success-circle-icon"/> : null
            }
            {text}
          </>
        )
      },
      {
        title: utils.intl('操作时间'), dataIndex: 'latestProcessTime', key: 'zxclsj'
      },
      {
        title: utils.intl('操作'),
        dataIndex: 'operation',
        key: 'cz',
        width: 100,
        align: 'right',
        render: (text, record, index) => {
          return (
            <span>
              <a onClick={() => this.showDetail(record.id)}>{utils.intl('查看')}</a>
            </span>
          )
        }
      }
    ]
    const { selectStatusValue, selectStatus, list, loading, orderModal, total, query, startDate, endDate } = this.props
    return (
      <Page style={{ background: "transparent", display: "flex", flexDirection: "column" }}>
        <CrumbsPortal>
          <Button style={{ marginLeft: '16px' }} onClick={() => this.props.action('onExport')}>{utils.intl('导出')}</Button>
          <Button type="primary" style={{ marginLeft: '16px' }} onClick={this.add}>{utils.intl('新增')}</Button>
        </CrumbsPortal>
        <FormLayout
          onSearch={this.search}
          onReset={() => {
            this.props.updateState({
              startDate: '',
              endDate: '',
              selectStatusValue: ''
            })
            this.props.updateQuery({
              queryStr: '',
            })
          }}>
          <FieldItem label={utils.intl('工单类型')}>
            <Select value={selectStatusValue} onChange={this.selectChange} dataSource={selectStatus} />
          </FieldItem>
          <FieldItem label={utils.intl('日期')}>
            <RangePicker
              disabledDate={current => disabledDateAfterToday(current)}
              maxLength={90}
              allowClear={true}
              onChange={this.dateChange}
              value={startDate && endDate ? [moment(startDate, 'YYYY-MM-DD'), moment(endDate, 'YYYY-MM-DD')] : []}
            />
          </FieldItem>
          <FieldItem label={utils.intl('关键字')}>
            <Input
              // searchSize="small"
              placeholder={utils.intl('工单名称/电站名称/设备/发起人/处理人')}
              value={query.queryStr}
              onChange={(e) => this.searchChange('queryStr', e.target.value)}
              // onSearch={this.search}
            />
          </FieldItem>
        </FormLayout>
        <FullContainer className="page-sub-container">
          <div className="flex1">
            <Table2 dataSource={list} columns={columns} loading={loading}
              page={query.page}
              size={query.size}
              total={total}
              onPageChange={this.pageChange}
            />
          </div>
          {
            orderModal && (
              <OrderModal
                id={this.props.id}
                stationId={this.props.stationId}
                devId={this.props.devId}
                typeId={this.props.typeId}
                orderName={this.props.orderName}
                description={this.props.description}
                userNameProcess={this.props.userNameProcess}
                stationArr={this.props.stationArr}
                typeOptions={this.props.typeOptions}
                usersArr={this.props.usersArr}
                devicesArr={this.props.devicesArr}
                orderModal={this.props.orderModal}

                updateLoading={this.props.updateLoading}
                updateState={this.props.updateState}
                action={this.props.action}
              />
            )
          }
          <DispatchDetail />
        </FullContainer>
      </Page>
    )
  }
}

function mapStateToProps(model, getLoading, state) {
  return {
    ...model,
    timeDate: state.global.timeDate,
    loading: getLoading('getList'),
    updateLoading: getLoading('save')
  }
}

export default makeConnect('dispatch', mapStateToProps)(operationList)
