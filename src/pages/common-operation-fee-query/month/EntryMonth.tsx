import React, { useEffect } from 'react'
import FullContainer from "../../../components/layout/FullContainer"
import Page from "../../../components/Page"
import { makeConnect } from "../../umi.helper"
import { fee_query_month_list } from "../../constants"
import { MonthListState } from '../models/month-list'
import PageProps from "../../../interfaces/PageProps"
import ListFeeMonthDay from './ListFeeMonthDay'
import { Button } from 'wanke-gui'
import MakeConnectProps from "../../../interfaces/MakeConnectProps"
import moment from 'moment'
// import { DatePicker } from 'wanke-gui'
import DatePicker from "../../../components/date-picker"
import Label from "../../../components/Label"
import Tools from "../../../components/layout/Tools"
import Export from "../../../components/layout/Export"
import Back1 from "../../../components/layout/Back1"
import { isBigThanToday } from "../../../util/dateUtil"
import { CrumbsPortal } from '../../../frameset/Crumbs'
import utils from '../../../public/js/utils'

const { MonthPicker } = DatePicker

interface Props extends PageProps, MakeConnectProps<MonthListState>, MonthListState {
  loading: boolean
  stationId: number
  pageTitle: string
  dtime: string
}

const EntryMonth: React.FC<Props> = function (this: null, props) {
  useEffect(() => {
    props.updateQuery({ dtime: moment(props.dtime).format('YYYY-MM') })
    props.action('fetchList', { stationId: props.stationId })
  }, [])

  const onDateChange = (v) => {
    props.updateQuery({ dtime: v.format('YYYY-MM') })
    props.action('fetchList', { stationId: props.stationId })
  }

  const { query } = props
  return (
    <Page pageId={props.pageId} pageTitle={props.pageTitle}>
      <CrumbsPortal pageName={'month-list'}>
        <Button style={{ marginLeft: '16px' }} onClick={() => props.action('onExport')} type="primary">
          {utils.intl('导出')}
        </Button>
      </CrumbsPortal>
      <FullContainer style={{ padding: 15 }}>
        <div className="h-space">
          <div className="v-center">
            <Label>{utils.intl('账单时间')}</Label>
            <MonthPicker
              format="YYYY-MM"
              value={moment(query.dtime)}
              onChange={onDateChange}
              disabledDate={current => isBigThanToday(current)}
              allowClear={false}
            />
          </div>
          <div>
            <Button type="primary" onClick={() => props.forward('electricity-meter', { stationId: props.stationId, dtime: query.dtime })}>{utils.intl('查看读数')}</Button>
          </div>
        </div>
        <FullContainer className="flex1" style={{ marginTop: 10 }}>
          <div className="flex1">
            <ListFeeMonthDay
              loading={props.loading}
              dataSource={props.list}
            />
          </div>
        </FullContainer>
      </FullContainer>
    </Page>
  )
}

function mapStateToProps(model, getLoading) {
  return {
    ...model,
    loading: getLoading('fetchList')
  }
}

export default makeConnect(fee_query_month_list, mapStateToProps)(EntryMonth)
