import React, { Component } from 'react';
import { Table2, Button, DatePicker, Select, Card, LineChart, Table1, BarChart } from 'wanke-gui'
import "./index.less"
import { AnalysisModel } from './models/index';
import { GlobalState, history, CrumbState } from 'umi';
import moment, { Moment, DurationInputArg2 } from 'moment';
import BenefitChart from "./components/benefitChart";
import { makeConnect } from '../umi.helper';
import { crumbsNS } from '../constants';
import Forward from '../../public/components/Forward';
import Page from '../../components/Page';

const { RangePicker } = DatePicker

interface ReportProps extends AnalysisModel, GlobalState, CrumbState {
  loading: boolean,
  analysisLoading: boolean,
  action: Function,
  dispatch: Function,
  pageId: number
  efficiencyList: any[]
  efficiencyChart: any
}

@makeConnect('Analysis', (model: any, getLoading: (arg0: string) => any, state: any) => {
  const { global } = state
  return {
    ...global,
    ...model,
    ...state[crumbsNS],
    analysisLoading: getLoading('getStrategyReportList'),
  }
})
class ElectricityChargeQuery extends Component<ReportProps> {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({ type: `${'Analysis'}/getStrategyReportList`, payload: { page: 1, size: 20 } })
  }

  componentDidUpdate(preProps) {
    if (preProps.selectedStationId !== this.props.selectedStationId) {
      const { dispatch } = this.props
      dispatch({ type: `${'Analysis'}/getStrategyReportList`, payload: { page: 1, size: 20 } })
    }
  }

  componentWillUnmount() {
    this.props.action('reset')
  }
  onAnalysisPageChange = (page, size) => {
    const { dispatch } = this.props
    dispatch({ type: `${'Analysis'}/getStrategyReportList`, payload: { page, size } })
  }

  selectChange = (o) => {
    this.props.action('updateState', {
      dateType: o
    })
  }
  onQuery = () => {
    const { dispatch } = this.props
    dispatch({ type: `${'Analysis'}/getStrategyReportList`, payload: { page: 1, size: 20 } })
  }

  exportCsv = () => {
    this.props.action('exportCsv')
  }


  render() {
    const { efficiencyTotal, analysisLoading, efficiencyList, efficiencyPage, efficiencySize, efficiencyChart, pageId } = this.props
    const columns: any = [
      {
        title: '序号',
        dataIndex: 'num',
        key: 'num',
        width: 75,
        render: (value, record, index) => index + 1
      },
      {
        title: '储能单元',
        dataIndex: 'energyUnitTitle',
        width: '40%',
        key: 'energyUnitTitle',
        render: (value, record, index) => {
          return (
            <Forward
              to="benefitDetail"
              data={{ energyUnitValue: value }}
            >
              {value}
            </Forward>
          )
        }
      },
      {
        title: '整体效率',
        dataIndex: 'efficiency',
        key: 'efficiency',
        render: value => `${value ? value.toFixed(2) + ' %' : ''}`
      },
      {
        title: '电堆总效率',
        dataIndex: 'stackTotalEfficiency',
        key: 'stackTotalEfficiency',
        render: value => `${value ? value.toFixed(2) + ' %' : ''}`
      }
    ];

    return (
      <Page
        pageId={pageId}
        pageTitle="液流储能效率分析"
        showStation
      >
        <div className="storage-efficiency-analysis">
          <div className="report-all">
            <div className="report-echart">
              <BenefitChart data={efficiencyChart} />
            </div>
            <div className="report-charge-body">
              <Table2
                x={580}
                loading={analysisLoading}
                dataSource={
                  efficiencyList.map((item, index) => ({
                    ...item,
                    key: index
                  }))
                }
                columns={columns}
                page={efficiencyPage}
                size={efficiencySize}
                total={efficiencyTotal}
                onPageChange={this.onAnalysisPageChange}
                rowKey={record => record.num}
              />
            </div>
          </div>
        </div >
      </Page>
    );
  }
}

export default ElectricityChargeQuery;
