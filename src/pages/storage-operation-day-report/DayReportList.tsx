import React, { useEffect } from 'react'
import Page from "../../components/Page"
import PageProps from "../../interfaces/PageProps"
import FullContainer from "../../components/layout/FullContainer"
import { DayReportListState } from './models/day-report-list'
import MakeConnectProps from "../../interfaces/MakeConnectProps"
import { makeConnect } from "../umi.helper"
import { day_report_list } from "../constants"
import { Input, Button } from 'wanke-gui'
import ListStationInfo from './ListStationInfo'
import moment from 'moment'
import { disabledDateAfterYesterday } from "../../util/dateUtil"
import RangePicker from "../../components/rangepicker"
import utils from '../../public/js/utils'
import { CrumbsPortal } from '../../frameset/Crumbs'
import FormLayout from '../../components/FormLayout'

const { FieldItem } = FormLayout
interface Props
  extends PageProps,
  DayReportListState,
  MakeConnectProps<DayReportListState> {
  loading: boolean;
}

const DayReportList: React.FC<Props> = function (this: null, props) {
  const { query, totalCount } = props

  useEffect(() => {
    props.action('reset')
    props.action('fetchList')
  }, [])

  const onSearch = () => {
    props.updateQuery({ page: 1 })
    props.action('fetchList')
  }

  const onRangeChange = (date) => {
    props.updateQuery({
      startDate: date[0].format('YYYY-MM-DD'),
      endDate: date[1].format('YYYY-MM-DD')
    })
    // props.action('fetchList')
  }

  return (
    <Page className="no-limit-filter-item" pageId={props.pageId} style={{ background: "transparent", boxShadow: "none", display: "flex", flexDirection: "column" }}>
      <CrumbsPortal pageName='list'>
        <Button onClick={() => props.action('onExport')} type="primary">
          {utils.intl('导出')}
        </Button>
      </CrumbsPortal>
      <FormLayout
        onSearch={onSearch}
        onReset={() => {
          props.updateQuery({
            queryStr: null,
            startDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
            endDate: moment().subtract(1, 'days').format('YYYY-MM-DD')
          })
        }}>
        <FieldItem label={utils.intl('日期')}>
          <RangePicker
            allowClear={false}
            value={[moment(query.startDate), moment(query.endDate)]}
            onChange={onRangeChange}
            disabledDate={disabledDateAfterYesterday}
          />
        </FieldItem>
        <FieldItem label={utils.intl('电站名称')}>
          <Input
            placeholder={utils.intl('请输入关键字查询')}
            value={query.queryStr} onChange={e => props.updateQuery({ queryStr: e.target.value })}
          // onSearch={onSearch}
          />
        </FieldItem>
      </FormLayout>
      <FullContainer className="page-sub-container">
        <div className="flex1">
          <ListStationInfo
            loading={props.loading}
            page={query.page}
            size={query.size}
            total={totalCount}
            onPageChange={props.onPageChange('fetchList')}
            dataSource={props.list}
            onLook={(id, name) =>
              props.forward('detail', { stationId: id, pageTitle: name, startDate: query.startDate, endDate: query.endDate })
            }
          />
        </div>
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

export default makeConnect(day_report_list, mapStateToProps)(DayReportList)
