/** 
 * 一次调频 
 * */
import React, { Component } from 'react'
import { Form } from 'antd'
import { DatePicker, Select, Button, LineChart } from 'wanke-gui'
import { SECOND_FM_CHART, getChartData } from '../dataCfg'
import moment from 'moment'

const { Option } = Select

export interface SecondFMProps {
  energyUnitsList: any[]
  planLineList: { xData: any[], yData: any[] }
  searchChart: (params: any, chartMap?: any[]) => void
  chargeValue: number,
  dischargeValue: number,
}

export default class SecondFM extends Component<SecondFMProps> {
  filterForm: any

  componentDidMount(){
    const { searchChart, energyUnitsList } = this.props
    searchChart && searchChart({
      dtime: moment(),
      energyId: energyUnitsList[0]?.id
    }, SECOND_FM_CHART)
  }

  // 查询
  searchChart = () => {
    const { validateFields } = this.filterForm
    const { searchChart } = this.props
    validateFields()
      .then(values => {
        searchChart && searchChart(values, SECOND_FM_CHART)
      }).catch(errorInfo => {
        errorInfo
      })
  }

  render() {
    const { energyUnitsList, chargeValue, dischargeValue } = this.props
    const planLineList = getChartData(2)
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
                <DatePicker />
              </Form.Item>
              <Form.Item label="储能单元" name="energyId" initialValue={energyUnitsList[0]?.id}>
                <Select
                  placeholder="请选择储能单元"
                >
                  {
                    energyUnitsList.map(item => (
                      <Option value={item.id}>{item.title}</Option>
                    ))
                  }
                </Select>
              </Form.Item>
            </Form>
            <Button type="primary" onClick={this.searchChart}>查询</Button>
          </div>
          <div className="plan-tracking-middle">
            <div className="plan-tracking-middle-left">
              当日全站累计充电：{chargeValue?.toFixed(2)}kWh
            <div className="plan-tracking-middle-sub-left">当日全站累计放电：{dischargeValue?.toFixed(2)}kWh</div>
            </div>
          </div>
          <div className="plan-tracking-chart">
            <LineChart
              xData={planLineList.xData}
              yData={planLineList.yData}
              series={[
                { name: '储能功率', unit: 'kw' },
                { name: '光伏功率', unit: 'kw' },
              ]}
              options={{
                axisColor: '#ccc',
                axisTextColor: '#ccc',
                backOpacity: [0, 0]
              }}
            />
          </div>
        </div>
      </div>
    )
  }
}
