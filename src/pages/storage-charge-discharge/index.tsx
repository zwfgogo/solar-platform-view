import React, { Component } from 'react';
import { Table2, Button, DatePicker, Select, Tooltip, RangePicker } from 'wanke-gui'
import { ReportModel } from './model';
import moment, { Moment } from 'moment';
import { isBigThanToday } from '../../util/dateUtil';
import { makeConnect } from '../umi.helper';
import { crumbsNS } from '../constants';
import Page from "../../components/Page";
import './index.less';
import utils from '../../public/js/utils';
import { GlobalState } from 'umi';

interface ReportProps extends ReportModel, GlobalState {
  loading: boolean,
  reportLoading: boolean,
  action: Function,
  dispatch: Function,
  pageId: any,
}

interface ReportState {
  dateValue: [Moment, Moment]
}

@makeConnect('ChargeAndDischarge', (model: any, getLoading: (arg0: string) => any, state: any) => {
  const { global } = state
  return {
    ...global,
    ...model,
    ...state[crumbsNS],
    reportLoading: getLoading('getStrategyReportList'),
  }
})
class ElectricityChargeQuery extends Component<ReportProps, ReportState> {

  constructor(props) {
    super(props)
    this.state = {
      dateValue: [moment().subtract(29, 'days'), moment()]
    }
  }

  componentDidMount() {
    this.fetchData()
  }

  componentDidUpdate(preProps) {
    if (preProps.selectedStationId !== this.props.selectedStationId) {
      this.fetchData()
    }
  }

  fetchData() {
    const { dispatch } = this.props
    dispatch({
      type: `${'ChargeAndDischarge'}/getStrategyReportList`,
      payload: {
        page: 1,
        size: 20,
        startTime: moment().subtract(30, 'days').format('YYYY-MM-DD 00:00:00'),
        endTime: moment().format('YYYY-MM-DD 23:59:59')
      }
    })
    // dispatch({ type: 'global/getEnergyUnitsByStationId' })
  }

  chargeAndDischargePageChange = (page, size) => {
    const { dispatch } = this.props
    const { dateValue } = this.state
    dispatch({ type: `${'ChargeAndDischarge'}/getStrategyReportList`, payload: { page, size, startTime: dateValue[0].format('YYYY-MM-DD 00:00:00'), endTime: dateValue[1].format('YYYY-MM-DD 23:59:59') } })
  }

  dateChange = (value) => {
    this.setState({ dateValue: value })
  }

  selectChange = (o) => {
    this.props.action('updateState', {
      enumsValue: o
    })
  }
  onQuery = () => {
    const { dateValue } = this.state
    const { dispatch } = this.props
    dispatch({ type: `${'ChargeAndDischarge'}/getStrategyReportList`, payload: { page: 1, size: 20, startTime: dateValue[0].format('YYYY-MM-DD 00:00:00'), endTime: dateValue[1].format('YYYY-MM-DD 23:59:59') } })
  }

  exportCsv = () => {
    const { dateValue } = this.state
    this.props.action('exportCsv', {
      startTime: dateValue[0].format('YYYY-MM-DD 00:00:00'), endTime: dateValue[1].format('YYYY-MM-DD 23:59:59')
    })
  }

  render() {
    const { enumsValue, reportLoading, chargeList, page, size, strategyTotal } = this.props
    const { dateValue } = this.state
    const columns: any = [
      {
        title: '??????',
        dataIndex: 'num',
        key: 'num',
        width: 75,
        render: (value, record, index) => index + 1
      },
      {
        title: '????????????',
        dataIndex: 'energyUnitTitle',
        key: 'energyUnitTitle',
        width: 140,
      },
      {
        title: '??????/??????',
        dataIndex: 'type',
        key: 'type',
        width: 140,
        render: (value, record) => {
          if (value === 'Charge') { return <div>??????</div> }
          else {
            return (
              <div>
                ??????
              </div>
            )
          }
        }
      },
      {
        title: '????????????',
        dataIndex: 'startTime',
        key: 'startTime',
        width: 200,
        render: (value, record) => {
          if (record?.startStatus === 'Connect') { return <div>{value}</div> }
          else if (record?.startStatus === 'DisConnect') {
            return (
              <Tooltip placement="top" title={'?????????????????????????????????????????????????????????'}>
                <div style={{ color: '#FF974A' }} >
                  {value}
                </div>
              </Tooltip>
            )
          }
        }
      },
      {
        title: '????????????',
        dataIndex: 'endTime',
        key: 'endTime',
        width: 200,
        render: (value, record) => {
          if (record?.endStatus === 'Connect') { return <div>{value}</div> }
          else if (record?.endStatus === 'DisConnect') {
            return (
              <Tooltip placement="top" title={'?????????????????????????????????????????????????????????'}>
                <div style={{ color: '#FF974A' }} >
                  {value}
                </div>
              </Tooltip>
            )
          }
        }
      },
      {
        title: '????????????',
        dataIndex: 'electricity',
        key: 'electricity',
        width: 140,
        render: value => `${value || value === 0 ? value.toFixed(2) + ' kWh' : ''}`
      },
      {
        title: '??????OCV',
        dataIndex: 'startOcv',
        key: 'startOcv',
        width: 140,
        render: value => `${value || value === 0 ? value.toFixed(2) + ' V' : ''}`
      },
      {
        title: '??????OCV',
        dataIndex: 'endOcv',
        key: 'endOcv',
        width: 140,
        render: value => `${value || value === 0 ? value.toFixed(2) + ' V' : ''}`
      },
      {
        title: '?????????????????????',
        dataIndex: 'startVoltage',
        key: 'startVoltage',
        width: 140,
        render: value => `${value || value === 0 ? value.toFixed(2) + ' V' : ''}`
      },
      {
        title: '?????????????????????',
        dataIndex: 'endVoltage',
        key: 'endVoltage',
        width: 140,
        render: value => `${value || value === 0 ? value.toFixed(2) + ' V' : ''}`
      },
    ];
    let enums: any = [{ name: '??????', value: '' }, { name: '??????', value: 'Charge' }, { name: '??????', value: 'Discharge' }];

    return (
      <Page
        showStation
        pageId={this.props.pageId}
        pageTitle={utils.intl('???????????????')}
      >
        <div className="report-charge-discharge">
          <div className="report-charge-info-header">
            <div style={{ float: 'left', display: 'inline-block' }}>
              ?????????<RangePicker value={dateValue} onChange={this.dateChange} allowClear={false} disabledDate={isBigThanToday} />
            </div>
            <div style={{ float: 'left', display: 'inline-block', marginLeft: '20px' }}>
              <Select
                label={`?????????`}
                value={enumsValue}
                dataSource={enums}
                onSelect={this.selectChange}
                style={{ minWidth: '120px' }}
              />
            </div>
            <Button style={{ float: 'left', marginLeft: '20px' }} onClick={this.onQuery}>??????</Button>
            <Button style={{ float: 'right' }} onClick={this.exportCsv}>??????</Button>
          </div>
          <div className="report-charge-body">
            <Table2
              x={580}
              loading={reportLoading}
              dataSource={chargeList}
              columns={columns}
              page={page}
              size={size}
              total={strategyTotal}
              onPageChange={this.chargeAndDischargePageChange}
              rowKey={record => record.num}
            />
          </div>
        </div >
      </Page>
    );
  }
}

export default ElectricityChargeQuery;
