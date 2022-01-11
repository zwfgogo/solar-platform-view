import React from 'react'
import { Button, Row, Col, Select, Input, Table } from 'wanke-gui'
import RangePicker from "../../components/range-picker/RangePicker"
import moment from 'moment'
import Page from "../../components/Page"
import DefectModal from './component/defectFrom'
import { makeConnect } from "../umi.helper"
import AddBugDialog from './component/NewBug'
import UpdateBugDialog from './component/updateBug'
import { DefectRecordState } from './model'
import MakeConnectProps from "../../interfaces/MakeConnectProps"
import { getDate } from "../../util/dateUtil"
import ListBug from './ListBug'
import FullContainer from "../../components/layout/FullContainer"
import utils from "../../public/js/utils";
import { disabledDateAfterToday } from '../../util/dateUtil'
import { CrumbsPortal } from '../../frameset/Crumbs'
import FormLayout from '../../components/FormLayout'

const { FieldItem } = FormLayout
interface Props extends DefectRecordState, MakeConnectProps<DefectRecordState> {
  loading: boolean
}

class operationList extends React.Component<Props> {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.action('getList')
    this.props.action('fetchStationList')
  }

  componentWillUnmount() {
    this.props.action('reset')
  }

  //显示查看工单
  showCkgd = (id) => {
    const { dispatch } = this.props
    dispatch({
      type: 'defectRecord/updateState',
      payload: { defectModal: true, type: 'query' }
    })
    dispatch({
      type: 'defectRecord/getDetail',
      payload: { id: id }
    })
  }

  showXzgd = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'defectRecord/updateState',
      payload: { record: { discoverer: JSON.parse(sessionStorage.getItem('userInfo')).title }, showAddBug: true, type: 'new', startOnChangeValue: '', endOnChangeValue: '' }
    })
  }

  pageChange = (page, size) => {
    const { dispatch } = this.props
    dispatch({ type: 'defectRecord/pageChange', payload: { page, size } })
  }

  sizeChange = (page, size) => {
    const { dispatch } = this.props
    dispatch({ type: 'defectRecord/pageChange', payload: { page, size } })
  }

  dateChange = (date, dateString) => {
    const { dispatch, query } = this.props
    dispatch({
      type: 'defectRecord/updateState',
      payload: { startDate: dateString[0], endDate: dateString[1] }
    })
    // this.pageChange(1, query.size)
  }

  search = () => {
    const { query } = this.props
    this.pageChange(1, query.size)
  }

  delete = (id) => {
    const { dispatch } = this.props
    dispatch({
      type: 'defectRecord/deleteRecord',
      payload: {
        id: id
      }
    })
  }

  updateBug = (record) => {
    this.props.updateState({
      showUpdateBug: true,
      record: {
        ...record,
        processer: JSON.parse(sessionStorage.getItem('userInfo')).title,
        bugStationId: record.stationId,
        bugDate: getDate(record.startTime),
        endTime: getDate(record.endTime)
      }
    })
  }

  onRecordChange = (v) => {
    this.props.updateQuery(v, 'record')
  }

  render() {
    const { record, startDate, endDate, list, loading, defectModal, total, query, showAddBug, showUpdateBug } = this.props

    return (
      <Page style={{ background: "transparent", display: "flex", flexDirection: "column" }}>
        <CrumbsPortal>
          <Button type="primary" onClick={this.showXzgd}>{utils.intl('记录缺陷')}</Button>
          <Button style={{ marginLeft: 16 }} type="primary" onClick={() => this.props.action('onExport')}>{utils.intl('导出')}</Button>
        </CrumbsPortal>
        <FormLayout
          onSearch={this.search}
          onReset={() => {
            this.props.updateState({
              startDate: moment().subtract(29, 'day').format('YYYY-MM-DD'),
              endDate: moment().format('YYYY-MM-DD')
            })
          }}>
          <FieldItem label={utils.intl('日期')}>
            <RangePicker
              disabledDate={disabledDateAfterToday}
              allowClear={true}
              onChange={this.dateChange}
              value={startDate && endDate ? [moment(startDate, 'YYYY-MM-DD'), moment(endDate, 'YYYY-MM-DD')] : []}
            />
          </FieldItem>
        </FormLayout>
        <FullContainer className="page-sub-container">
          <div className="flex1">
            <ListBug
              stationOptions={this.props.stationOptions}
              dataSource={list} loading={loading}
              page={query.page} size={query.size} total={total}
              onPageChange={this.props.onPageChange('getList')}
              updateBug={this.updateBug}
              showCkgd={this.showCkgd}
            />
          </div>
          {defectModal ? <DefectModal /> : ''}
          {showAddBug && (
            <AddBugDialog
              stationOptions={this.props.stationOptions}
              newLoading={this.props.newLoading}
            />
          )}
          {
            showUpdateBug && (
              <UpdateBugDialog
                // acceptor={record.acceptor}
                // director={record.director}
                // endTime={record.endTime}
                // processer={record.processer}
                startTime={record.startTime}
              // updateBug={() => this.props.action('updateBug')}
              // updateState={this.onRecordChange}
              // visible={showUpdateBug}
              // onExited={() => this.props.updateState({ showUpdateBug: false })}
              />
            )
          }
        </FullContainer>
      </Page>
    )
  }
}

function mapStateToProps(model, getLoading) {
  const { list } = model
  return {
    ...model, loading: getLoading('getList'), newLoading: getLoading('addBug')
  }
}

export default makeConnect('defectRecord', mapStateToProps)(operationList)
