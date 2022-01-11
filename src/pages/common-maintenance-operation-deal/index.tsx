import React from 'react'
import { Button, Row, Col, Select, Input, Table, Table2, SearchInput, RangePicker } from 'wanke-gui'
import moment from 'moment'
import DealModal from './component/dealFrom'
import QueryModal from './component/queryFrom'
import Page from "../../components/Page"
import { makeConnect } from "../umi.helper"
import FullContainer from "../../components/layout/FullContainer"
import utils from "../../public/js/utils";
import AbsoluteBubble from '../../components/AbsoluteBubble'
import { disabledDateAfterToday } from '../../util/dateUtil'
import { CrumbsPortal } from '../../frameset/Crumbs'
import FormLayout from '../../components/FormLayout'
import { isZh } from '../../core/env'

const { FieldItem } = FormLayout
class operationList extends React.Component<any> {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.action('reset')
    this.props.action('getSelect')
  }

  componentWillUnmount() {
    const { dispatch } = this.props
    dispatch({
      type: 'orderdeal/updateState',
      payload: {
        startDate: '',
        endDate: '', query: {
          page: 1,
          size: 20,
          queryStr: ''
        }
      }
    })
  }

  getList = () => {
    const { dispatch, date, pvSelectValue } = this.props
    dispatch({

      type: 'orderdeal/getList',
      payload: { date: date, id: pvSelectValue }
    })
  }
  //显示查看工单
  showCkgd = (id) => {
    const { dispatch } = this.props
    dispatch({
      type: 'orderdeal/updateState',
      payload: { queryModal: true }
    }).then(res => {
      dispatch({

        type: 'orderdeal/getDetail',
        payload: { id: id }
      })
    })
  }

  onClick = (record) => {
    const { dispatch } = this.props
    dispatch({
      type: 'orderdeal/updateState',
      payload: { id: record, dealModal: true, record: {} }
    })
  }

  dateChange = (date, dateString) => {
    const { dispatch } = this.props
    dispatch({
      type: 'orderdeal/updateState',
      payload: { startDate: dateString[0], endDate: dateString[1] }
    })
  }

  //搜索框的值改变
  searchChange = (type, data) => {
    const { dispatch } = this.props
    dispatch({ type: 'orderdeal/stringChange', payload: { [type]: data } })
  }

  search = () => {
    const { query } = this.props
    this.pageChange(1, query.size)
  }

  pageChange = (page, size) => {
    const { dispatch } = this.props
    dispatch({ type: 'orderdeal/pageChange', payload: { page, size } })
  }

  selectChange = (o, option) => {
    const { dispatch, query } = this.props
    dispatch({
      type: 'orderdeal/updateState',
      payload: { selectStatusValue: o }
    })
  }

  render() {
    const columns: any = [
      {
        title: (utils.intl('工单名称')), dataIndex: 'orderName', key: 'gdmc'
      },
      {
        title: (utils.intl('工单类型')), dataIndex: 'typeTitle', key: 'gdlx'
      },
      {
        title: (utils.intl('电站名称')), dataIndex: 'stationTitle', key: 'zd'
      },
      {
        title: (utils.intl('设备对象')), dataIndex: 'devTitle', key: 'sb'
      },
      {
        title: (utils.intl('工单描述')), dataIndex: 'description', key: 'gdms',
        render: (value) => <AbsoluteBubble>{value}</AbsoluteBubble>
      },
      {
        title: (utils.intl('处理人员')), dataIndex: 'userTitleProcess', key: 'clr'
      },

      {
        title: (utils.intl('发起人')), dataIndex: 'userTitleCreate', key: 'fqr'
      },
      {
        title: (utils.intl('工单状态')), dataIndex: 'statusTitle', key: 'sjzt',
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
        title: (utils.intl('操作时间')), dataIndex: 'latestProcessTime', key: 'zxclsj'
      },
      {
        title: (utils.intl('操作')),
        dataIndex: 'operation',
        key: 'cz',
        width: '140px',
        align: 'right',
        render: (text, record, index) => {
          if (record.statusTitle === (utils.intl('处理中'))) {
            return (
              <span>
                <a onClick={this.onClick.bind(this, record.id)}>{(utils.intl('处理'))}</a>
              </span>
            )
          }
          if (record.statusTitle === (utils.intl('处理完成'))) {
            return (
              <span>
                <a onClick={this.showCkgd.bind(this, record.id)}>{(utils.intl('查看'))}</a>
              </span>
            )
          }
        }
      }
    ]
    const { selectStatusValue, selectStatus, startDate, endDate, list, loading, dealModal, queryModal, total, query } = this.props
    return (
      <Page className="no-limit-filter-item" style={{ background: "transparent", display: "flex", flexDirection: "column" }}>
        <CrumbsPortal>
          <Button style={{ marginLeft: '16px' }} onClick={() => this.props.action('onExport')}>{utils.intl('导出')}</Button>
        </CrumbsPortal>
        <FormLayout
          noEllipsis
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
          <FieldItem style={{ width: isZh() ? 325 : 380 }} label={utils.intl('最新处理时间')}>
            <RangePicker
              disabledDate={disabledDateAfterToday}
              maxLength={90}
              onChange={this.dateChange}
              value={startDate && endDate ? [moment(startDate, 'YYYY-MM-DD'), moment(endDate, 'YYYY-MM-DD')] : []}
            />
          </FieldItem>
          <FieldItem label={utils.intl('关键字')}>
            <Input
              placeholder={utils.intl("工单名称/电站名称/设备/发起人/处理人")}
              onChange={(e) => this.searchChange('queryStr', e.target.value)}
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
          {dealModal ? <DealModal /> : ''}
          {queryModal ? <QueryModal /> : ''}
          {/* <Tools>
            <Export onExport={() => this.props.action('onExport')}/>
          </Tools> */}
        </FullContainer>
      </Page>
    )
  }
}

function mapStateToProps(model, getLoading, state) {
  return {
    ...model, loading: getLoading('getList'), timeDate: state.global.timeDate,
  }
}

export default makeConnect('orderdeal', mapStateToProps)(operationList)
