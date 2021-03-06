import React, { Component } from 'react';
import { Table2, Button, DatePicker, Select, Card, LineChart, Table1, BarChart } from 'wanke-gui'
import "./index.less"
import { AnalysisDetailModel } from '../models/detail';
import { GlobalState, history, CrumbState } from 'umi';
import moment, { Moment, DurationInputArg2 } from 'moment';
import BenefitChart from "../components/benefitChart";
import { makeConnect } from '../../umi.helper';
import { crumbsNS } from '../../constants';
import Page from '../../../components/Page';
import { isBigThanToday } from '../../../util/dateUtil';
import { CrumbsPortal } from '../../../frameset/Crumbs';

const { RangePicker } = DatePicker

interface ReportProps extends AnalysisDetailModel, GlobalState, CrumbState {
  loading: boolean,
  reportLoading: boolean,
  detailLoading: boolean,
  action: Function,
  dispatch: Function,
  pageId: number,
  energyUnitList: any
  efficiencyListDetail: any[]
  efficiencyChartDetail: any
  energyUnitValue: any
  back: () => void,
  dateType: any
  dateValue: [Moment, Moment],
  selectedStationId: any
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  const { global } = state
  return {
    ...global,
    ...model,
    ...state[crumbsNS],
    reportLoading: getLoading('getStrategyReportList'),
    detailLoading: isSuccess('getStrategyReportList'),
  }
}
@makeConnect('AnalysisDetail', mapStateToProps)

class ElectricityDetail extends Component<ReportProps> {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.init(this.props.selectedStationId)
  }

  componentDidUpdate(preProps) {
    if (preProps.selectedStationId !== this.props.selectedStationId) {
      this.init(this.props.selectedStationId)
    }
  }

  componentWillUnmount() {
    this.props.action('reset')
  }

  init = (stationId) => {
    const { dispatch, energyUnitValue, energyUnitList } = this.props
    dispatch({ type: 'global/getEnergyListByStationId', payload: { stationId } }).then((res) => {
      let match = res.find(item => item.type === 'Storage' && item.title === energyUnitValue)
      this.props.action('updateState', {
        unitType: match?.id
      })
      dispatch({ type: `${'AnalysisDetail'}/getStrategyReportList`, payload: { energyUnitId: match?.id, page: 1, size: 20, startTime: moment().subtract(30, 'days').format('YYYY-MM-DD 00:00:00'), endTime: moment().format('YYYY-MM-DD 23:59:59') } })
      dispatch({ type: `${'AnalysisDetail'}/getNearlyDate`, payload: { energyUnitId: match?.id } }).then((res) => {
        this.props.action('updateState', {
          dateValue: [moment(res, 'YYYY-MM-DD 23:59:59').subtract(30, 'days'), moment(res, 'YYYY-MM-DD 23:59:59')]
        })
        dispatch({
          type: `${'AnalysisDetail'}/getSummary`, payload: {
            energyUnitId: match?.id,
            startTime: moment(res, 'YYYY-MM-DD 23:59:59').subtract(30, 'days').format('YYYY-MM-DD 00:00:00'), endTime: moment(res, 'YYYY-MM-DD 23:59:59').format('YYYY-MM-DD 23:59:59')
          }
        })
      })
    })
  }

  onDetailPageChange = (page, size) => {
    const { dispatch, dateValue, unitType } = this.props
    dispatch({ type: `${'AnalysisDetail'}/getStrategyReportList`, payload: { page, size, startTime: dateValue[0].format('YYYY-MM-DD 00:00:00'), endTime: dateValue[1].format('YYYY-MM-DD 23:59:59'), energyUnitId: unitType } })
  }

  dateChange = (value) => {
    this.props.action('updateState', {
      dateValue: value
    })
  }

  selectChange = (o) => {
    this.props.action('updateState', {
      dateType: o
    })
  }
  unitSelectChange = (o) => {
    this.props.action('updateState', {
      unitType: o
    })
  }
  onQuery = () => {
    const { dispatch, unitType, dateValue, dateType } = this.props
    if (dateType === 'Year') {
      dispatch({ type: `${'AnalysisDetail'}/getStrategyReportList`, payload: { energyUnitId: unitType, page: 1, size: 20, startTime: dateValue[0].format('YYYY-01-01 00:00:00'), endTime: dateValue[1].format('YYYY-12-31 23:59:59') } })
      dispatch({ type: `${'AnalysisDetail'}/getSummary`, payload: { energyUnitId: unitType, startTime: dateValue[0].format('YYYY-01-01 00:00:00'), endTime: dateValue[1].format('YYYY-12-31 23:59:59') } })
    } else if (dateType === 'Month') {
      let lastDay = new Date(parseInt(dateValue[1].format('YYYY')), parseInt(dateValue[1].format('MM')), 0).getDate()
      dispatch({ type: `${'AnalysisDetail'}/getStrategyReportList`, payload: { energyUnitId: unitType, page: 1, size: 20, startTime: dateValue[0].format('YYYY-MM-01 00:00:00'), endTime: dateValue[1].format(`YYYY-MM-${lastDay} 23:59:59`) } })
      dispatch({ type: `${'AnalysisDetail'}/getSummary`, payload: { energyUnitId: unitType, startTime: dateValue[0].format('YYYY-MM-01 00:00:00'), endTime: dateValue[1].format(`YYYY-MM-${lastDay} 23:59:59`) } })
    } else if (dateType === 'Day') {
      dispatch({ type: `${'AnalysisDetail'}/getStrategyReportList`, payload: { energyUnitId: unitType, page: 1, size: 20, startTime: dateValue[0].format('YYYY-MM-DD 00:00:00'), endTime: dateValue[1].format('YYYY-MM-DD 23:59:59') } })
      dispatch({ type: `${'AnalysisDetail'}/getSummary`, payload: { energyUnitId: unitType, startTime: dateValue[0].format('YYYY-MM-DD 00:00:00'), endTime: dateValue[1].format('YYYY-MM-DD 23:59:59') } })
    }
  }

  exportCsv = () => {
    const { dateValue } = this.props
    this.props.action('exportCsv', {
      startTime: dateValue[0].format('YYYY-MM-DD 00:00:00'), endTime: dateValue[1].format('YYYY-MM-DD 23:59:59')
    })
  }


  render() {
    const { dateType, unitType, reportLoading, efficiencyListDetail, efficiencyPage, efficiencySize, efficiencyTotal,
      pageId, energyUnitList = [], efficiencyChartDetail, stackTotalEfficiencySummary, efficiencySummary, dateValue, detailLoading } = this.props
    const columns: any = [
      {
        title: '??????',
        dataIndex: 'num',
        key: 'num',
        width: 75,
        render: (value, record, index) => index + 1
      },
      {
        title: '??????',
        dataIndex: 'dtime',
        width: '40%',
        key: 'dtime',
        render: (value, record) => <div>{value}</div>
      },
      {
        title: '????????????',
        dataIndex: 'efficiency',
        key: 'efficiency',
        render: value => `${value ? value.toFixed(2) + ' %' : ''}`
      },
      {
        title: '???????????????',
        dataIndex: 'stackTotalEfficiency',
        key: 'stackTotalEfficiency',
        render: value => `${value ? value.toFixed(2) + ' %' : ''}`
      }
    ];

    let enums: any = [{ name: '??????', value: 'Day' }, { name: '??????', value: 'Month' }, { name: '??????', value: 'Year' }];

    return (
      <Page
        pageId={pageId}
        pageTitle="??????????????????"
        style={{ overflow: 'hidden' }}
      >
        <div className="report-charge-discharge-detail">
          <div className="report-charge-info-header">
            <div style={{ float: 'left', display: 'inline-block' }}>
              <Select
                label={``}
                value={dateType}
                dataSource={enums}
                onSelect={this.selectChange}
                style={{ minWidth: '80px' }}
              />
            </div>
            <div style={{ float: 'left', display: 'inline-block', marginLeft: '20px' }}>
              ?????????<RangePicker value={dateValue} onChange={this.dateChange} allowClear={false} disabledDate={isBigThanToday} picker={dateType.toLowerCase()} />
            </div>
            <div style={{ float: 'left', display: 'inline-block', marginLeft: '20px' }}>
              <Select
                label={`???????????????`}
                value={unitType}
                dataSource={energyUnitList.filter(item => item.type === 'Storage').map((item, index) => ({
                  name: item.title,
                  value: item.id
                }))}
                onSelect={this.unitSelectChange}
                style={{ minWidth: '127px' }}
              />
            </div>
            <Button style={{ float: 'left', marginLeft: '20px' }} onClick={this.onQuery}>??????</Button>
            <CrumbsPortal>
              <Button style={{ marginLeft: 16 }} onClick={this.exportCsv}>??????</Button>
            </CrumbsPortal>
          </div>
          <div className="report-all">
            <div className="report-accum">
              <div>
                <span>
                  ????????????????????????????????????{efficiencySummary}%
                </span>
                <span style={{ marginLeft: '50px' }}>
                  ????????????????????????????????????{stackTotalEfficiencySummary}%
                </span>
              </div>
            </div>
            <div className="report-echart">
              <LineChart
                xData={efficiencyChartDetail.xData}
                yData={efficiencyChartDetail.yData}
                series={efficiencyChartDetail.series}
                options={{
                  dateFormat: (d) => { return moment(d).format("YYYY-MM-DD") },
                  tooltipDateFormat: "YYYY-MM-DD"
                }}
              />
            </div>
            <div className="detail-body">
              {efficiencyListDetail &&
                <Table2
                  x={580}
                  loading={reportLoading}
                  dataSource={efficiencyListDetail}
                  columns={columns}
                  page={efficiencyPage}
                  size={efficiencySize}
                  total={efficiencyTotal}
                  onPageChange={this.onDetailPageChange}
                  rowKey={record => record.id}
                />
              }
            </div>
          </div>
        </div >
      </Page>
    );
  }
}

export default ElectricityDetail;
