import React, { useEffect } from 'react'
import Page from "../../../components/Page"
import MakeConnectProps from "../../../interfaces/MakeConnectProps"
import PageProps from "../../../interfaces/PageProps"
import { DiffState } from '../models/diff'
import { Button } from 'wanke-gui'
import AddReasonDialog from './AddReasonDialog'
import { makeConnect } from "../../umi.helper"
import { day_report_diff } from "../../constants"
import ReasonConfigDialog from './ReasonConfigDialog'
import FullContainer from "../../../components/layout/FullContainer"
import ListDiff from './ListDiff'
import moment from 'moment'
import { getDate, disabledDateAfterYesterday } from "../../../util/dateUtil"
import { FullLoading } from "wanke-gui"
import RangePicker from "../../../components/rangepicker"
import Tools from "../../../components/layout/Tools"
import Back1 from "../../../components/layout/Back1"
import Export from "../../../components/layout/Export"
import { CrumbsPortal } from '../../../frameset/Crumbs'
import utils from '../../../public/js/utils'

interface Props extends DiffState, MakeConnectProps<DiffState>, PageProps {
  stationId: number
  date: string
  loading: boolean
  updateLoading: boolean
}

const Diff: React.FC<Props> = function (this: null, props) {
  const addReason = () => {
    props.updateState({
      showReason: true,
      reasonId: null,
      dtime: moment(props.query.endDate, 'YYYY-MM-DD'),
      dutyDept: '',
      dutyUserTitle: '',
      causeTitle: null,
      planCompleteTime: moment(props.query.endDate, 'YYYY-MM-DD'),
      detail: '',
      solution: ''
    })
  }

  const onEdit = (record) => {
    props.updateState({
      showReason: true,
      reasonId: record.id,
      dtime: getDate(record.dtime),
      dutyDept: record.dutyDept,
      dutyUserTitle: record.dutyUserTitle,
      causeTitle: record.causeTitle,
      planCompleteTime: getDate(record.planCompleteTime),
      detail: record.detail,
      solution: record.solution
    })
  }

  const { query } = props

  useEffect(() => {
    props.updateQuery({ startDate: props.date, endDate: props.date })
  }, [])

  useEffect(() => {
    props.action('fetchReasonList', { stationId: props.stationId })
  }, [query.startDate, query.endDate])

  const onRangeChange = (date, dateString) => {
    props.updateQuery({ startDate: dateString[0], endDate: dateString[1] })
  }

  return (
    <Page pageId={props.pageId} pageTitle={utils.intl('差异原因')} style={{ padding: 15 }} className="page-day-report-diff">
      <CrumbsPortal pageName='diff'>
        <Button style={{ marginLeft: '16px' }} type="primary" onClick={addReason}>{utils.intl('新增记录')}</Button>
        <Button style={{ marginLeft: '16px' }} onClick={() => props.action('onExport')} type="primary">
          {utils.intl('导出')}
        </Button>
      </CrumbsPortal>
      {
        props.showReason && (
          <AddReasonDialog
            reasonId={props.reasonId}
            stationId={props.stationId}
            dtime={props.dtime}
            dutyDept={props.dutyDept}
            dutyUserTitle={props.dutyUserTitle}
            causeTitle={props.causeTitle}
            planCompleteTime={props.planCompleteTime}
            detail={props.detail}
            solution={props.solution}
            reasonConfigList={props.reasonConfigList}

            query={props.query}
            defaultDate={props.date}
            updateState={props.updateState}
            action={props.action}
            visible={props.showReason}
            confirmLoading={props.updateLoading}
            onExited={() => {
              props.updateState({ showReason: false })
            }}
          />
        )
      }
      {
        props.showConfigReason && (
          <ReasonConfigDialog
            editId={props.editId}
            editTitle={props.editTitle}
            reasonConfigList={props.reasonConfigList}
            action={props.action}
            updateState={props.updateState}
            visible={props.showConfigReason}
            onExited={() => props.updateState({ showConfigReason: false })}
          />
        )
      }

      <FullContainer>
        <div className="h-space">
          <div>
            <RangePicker
              allowClear={false} disabledDate={disabledDateAfterYesterday}
              onChange={onRangeChange} value={[moment(query.startDate), moment(query.endDate)]} />
          </div>
          <Button style={{ marginLeft: 15 }} onClick={() => props.updateState({ showConfigReason: true })}>{utils.intl('原因配置')}</Button>
        </div>
        <FullContainer className="flex1" style={{ marginTop: 10 }}>
          <div className="flex1 f-oa" style={{ position: 'relative' }}>
            {props.loading && (<FullLoading />)}
            {
              props.reasonList.map(item => {
                const deviation = item.deviation || {}
                return (
                  <div key={item.date} style={{ marginTop: 20 }}>
                    <div style={{ textAlign: 'center', marginBottom: 5 }}>
                      {deviation.date}
                      (
                      {utils.intl('充电偏差')}<span style={{ color: 'green' }}>{deviation.chargeDeviation}</span>，
                      {utils.intl('放电偏差')}<span style={{ color: 'red' }}>{deviation.dischargeDeviation}</span>，
                      {utils.intl('收益偏差')}<span style={{ color: 'red' }}>{deviation.incomeDeviation}</span>
                      )
                    </div>
                    <ListDiff
                      dataSource={item.differentRecord}
                      onDelete={id => props.action('deleteReason', { id, stationId: props.stationId })}
                      onEdit={onEdit}
                    />
                  </div>
                )
              })
            }
          </div>
        </FullContainer>
      </FullContainer>
    </Page>
  )
}

function mapStateToProps(model, getLoading) {
  return {
    ...model,
    loading: getLoading('fetchReasonList'),
    updateLoading: getLoading('updateReason') || getLoading('addReason')
  }
}

export default makeConnect(day_report_diff, mapStateToProps)(Diff)
