/** 手动控制 */
import React, { Component } from 'react';
import { Form, Button } from 'antd'
import { Select, DatePicker, LineChart } from 'wanke-gui'
import { Moment } from 'moment';
import moment from 'moment';
import { MANUAL_CONTROL_CHART, getChartData } from '../dataCfg';

const { Option } = Select

export interface ManualControlProps {
  energyUnitsList: any[],
  record: any,
  todayParamLoading: boolean,
  todayParamList: any[],
  strategyObj: any,
  planLineList: { xData: any[], yData: any[] },
  chargeValue: number,
  dischargeValue: number,
  planList: any[],
  planObj: any
  searchTable: (date: Moment) => void
  updateControlParam: (params: any) => void
  searchChart: (params: any, chartMap?:any[]) => void
  openManualSetting: () => void
  manualControlInit: () => void
}

interface ManualControlState {
}

class ManualControl extends Component<ManualControlProps, ManualControlState> {

  filterForm: any
  editForm: any

  constructor(props) {
    super(props)
    this.state = {
    }
  }

  componentDidMount(){
    const { searchChart, energyUnitsList, manualControlInit } = this.props
    searchChart && searchChart({
      dtime: moment(),
      energyId: energyUnitsList.map(item => item.id)
    }, MANUAL_CONTROL_CHART)
    manualControlInit()
  }

  // 保存
  saveForm = () => {
    const { updateControlParam } = this.props
    const { validateFields } = this.editForm
    validateFields()
    .then(values => {
      updateControlParam && updateControlParam(values)
      this.setState({ visible: false })
    }).catch(errorInfo => {
      errorInfo
    })
  }

  // 打开“今日控制参数”
  openTableModal = () => {
    const { searchTable } = this.props
    searchTable && searchTable(moment())
    this.setState({ modalTitle: '控制参数记录', visible: true })
  }

  // 自定义验证上限
  maxValidator = (rule, value) => {
    const { getFieldValue } = this.editForm
    const min = getFieldValue('min')
    if(min && min !== '' && parseInt(min) > parseInt(value)){
      return Promise.reject('请输入不小于下限的值')
    }
    return Promise.resolve()
  }

  // 自定义验证下限
  minValidator = (rule, value) => {
    const { getFieldValue } = this.editForm
    const max = getFieldValue('max')
    if(max && max !== '' && parseInt(max) < parseInt(value)){
      return Promise.reject('请输入不大于上限的值')
    }
    return Promise.resolve()
  }

  // 查询
  searchChart = () => {
    const { validateFields } = this.filterForm
    const { searchChart, energyUnitsList } = this.props
    validateFields()
    .then(values => {
      searchChart && searchChart({...values, energyId: energyUnitsList.map(item => item.id)}, MANUAL_CONTROL_CHART)
    }).catch(errorInfo => {
      errorInfo
    })
  }

  render() {
    const { energyUnitsList, record, todayParamList, todayParamLoading, searchTable, strategyObj, chargeValue, dischargeValue, openManualSetting } = this.props
    // console.log('energyUnitsList', energyUnitsList)
    const planLineList = getChartData(energyUnitsList.length)
    const columns = [{
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 100,
      align: 'center'
    }, {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 100,
      align: 'center'
    }, {
      title: '控制参数',
      dataIndex: 'content',
      key: 'content',
      align: 'left',
    }]
    return (
      <div className="plan-tracking-box">
        <div className="plan-tracking-header">策略跟踪曲线</div>
        <div className="plan-tracking-body">
          <div className="plan-tracking-filter">
            <Form
              ref={form => this.filterForm = form}
              layout="inline"
            >
              <Form.Item label="时间" name="dtime" initialValue={moment()}>
                <DatePicker allowClear={false}/>
              </Form.Item>
            </Form>
            <Button type="primary" onClick={this.searchChart}>查询</Button>
            <Button type="primary" className="btn-right" onClick={() => openManualSetting()}>控制参数</Button>
          </div>
          <div className="plan-tracking-middle">
            <div className="plan-tracking-middle-left">
            当日累计充电：{chargeValue?.toFixed(2)}kWh
            <div className="plan-tracking-middle-sub-left">当日累计放电：{dischargeValue?.toFixed(2)}kWh</div>  
            </div>
          </div>
          <div className="plan-tracking-chart">
          <LineChart
                xData={planLineList.xData}
                yData={planLineList.yData}
                series={
                energyUnitsList.map(item => ({
                  name: `${item.title}有功功率`,
                  unit: 'kw'
                }))
              }
                options={{
                  axisColor: '#ccc',
                  axisTextColor: '#ccc',
                  backOpacity: [0, 0]
                }}
              />
          </div>
        </div>
      </div>
    );
  }
}

export default ManualControl;
