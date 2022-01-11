import React, { useEffect } from 'react'
import Page from "../../components/Page"
import PageProps from "../../interfaces/PageProps"
import FullContainer from "../../components/layout/FullContainer"
import ListReportDay from './ListReportDay'
import { DayReportDetailState } from './models/day-report-detail'
import MakeConnectProps from "../../interfaces/MakeConnectProps"
import { makeConnect } from "../umi.helper"
import { day_report_detail } from "../constants"
import Tools from "../../components/layout/Tools"
import Back1 from "../../components/layout/Back1"
import Export from "../../components/layout/Export"
import CommonEcharts from "../../components/charts/common-echarts/CommonEcharts"
import { Button, FullLoading } from "wanke-gui"
import moment from 'moment'
import utils, { triggerEvent } from "../../util/utils"
import { disabledDateAfterYesterday } from "../../util/dateUtil"
import { useEchartsOption, CustomChartOption } from "../../components/charts/common-echarts/useEchartsOption"
import { WankeExpandOutlined, WankeUpOutlined } from 'wanke-icon'
import RangePicker from "../../components/rangepicker"
import { CrumbsPortal } from '../../frameset/Crumbs'

const colorList = ["#ff8328", "#ff4c65", "#3d7eff", "#009297"]

const grid = {
  left: "80",
  right: "30",
  top: "40",
  bottom: "30"
}

interface Props extends PageProps, DayReportDetailState, MakeConnectProps<DayReportDetailState> {
  stationId: string
  pageTitle: string
  chartLoading: boolean
  startDate: string
  endDate: string
}

const DayReportHome: React.FC<Props> = function (this: null, props) {
  useEffect(() => {
    props.updateQuery({ startDate: props.startDate, endDate: props.endDate })
    props.action('fetchList', { stationId: props.stationId })
    props.action('fetchCharts', { stationId: props.stationId })
  }, [])

  const { query, isExpanded, chartInfo, chartLoading } = props
  const handleExpand = () => {
    props.updateState({
      isExpanded: !isExpanded
    })
    setTimeout(() => {
      triggerEvent('resize', window)
    }, 300)
  }

  const { option } = useEchartsOption<CustomChartOption.LineChart>({
    type: 'line',
    showLegend: true,
    colorList,
    showUnit: true,
    data: chartInfo,
    formatXData: (xData) => xData.map(value => (value || '').split(' ')[0]),
    customOption: {
      grid
    }
  })

  const onRangeChange = (date, dateString) => {
    props.updateQuery({
      startDate: dateString[0],
      endDate: dateString[1]
    })
    props.action('fetchList', { stationId: props.stationId })
    props.action('fetchCharts', { stationId: props.stationId })
  }

  const chartStyle: any = isExpanded ? {} : {
    position: 'absolute',
    width: '100%',
    zIndex: -1,
    opacity: 0
  }

  return (
    <Page className="page-day-report-detail" pageId={props.pageId} pageTitle={props.pageTitle}>
      <CrumbsPortal pageName='detail'>
        <Button style={{ marginLeft: '16px' }} onClick={() => props.action('onExport')} type="primary">
          {utils.intl('导出')}
        </Button>
      </CrumbsPortal>
      <FullContainer>
        <div style={{
          display: 'flex',
          height: '35%',
          flexDirection: 'column',
          overflow: 'hidden',
          ...chartStyle
        }}>
          <div style={{ flexShrink: 0, padding: 10 }}>
            <span>{utils.intl('选择时间')}: </span>
            <RangePicker
              allowClear={false}
              onChange={onRangeChange}
              value={[moment(query.startDate), moment(query.endDate)]}
              disabledDate={disabledDateAfterYesterday}
            />
          </div>
          <div style={{ flexGrow: 1, position: 'relative' }}>
            {chartLoading && <FullLoading />}
            <CommonEcharts option={option} />
          </div>
        </div>
        <div style={{
          marginBottom: 10,
          padding: 5,
          flexShrink: 0
        }} className="toggle-area">
          <a className="v-center" style={{ justifyContent: 'center' }} onClick={handleExpand}>
            {
              isExpanded ? (
                <WankeUpOutlined style={{ fontSize: 18, marginRight: 7 }} />
              ) : (
                  <WankeExpandOutlined style={{ fontSize: 18, marginRight: 7 }} />
                )
            }
            {isExpanded ? utils.intl('收起') : utils.intl('展开')}{utils.intl('此区域')}
          </a>
        </div>
        <FullContainer className="flex1 detail-list">
          <div className="flex1" style={{ padding: '0 16px' }}>
            <ListReportDay
              dataSource={props.list} onLook={(id, date) => props.forward('diff', { stationId: props.stationId, date: date })} />
          </div>
        </FullContainer>
      </FullContainer>
    </Page>
  )
}

function mapStateToProps(model, getLoading) {
  return {
    ...model,
    chartLoading: getLoading("fetchCharts")
  }
}

export default makeConnect(day_report_detail, mapStateToProps)(DayReportHome)
