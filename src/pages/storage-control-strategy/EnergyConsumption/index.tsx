/** 能源消纳 ---> 光伏限电储能充电控制*/
import React, { Component } from 'react';
import { Form, Button } from 'antd'
import { Select, DatePicker, Modal, Input, Table1, LineChart } from 'wanke-gui'
import { ENERGY_CONSUMPTION_CHART, getChartData } from '../dataCfg'
import moment from 'moment'

const { Option } = Select

export interface EnergyConsumptionProps{
  energyUnitsList: any[],
  searchChart: (params: any, chartMap?:any[]) => void
  planLineList: { xData: any[], yData: any[] }
  chargeValue: number
}

class EnergyConsumption extends Component<EnergyConsumptionProps> {

  filterForm: any

  componentDidMount(){
    const { searchChart, energyUnitsList } = this.props
    searchChart && searchChart({
      dtime: moment(),
      energyId: energyUnitsList[0]?.id
    }, ENERGY_CONSUMPTION_CHART)
  }

  // 查询
  searchChart = () => {
    const { validateFields } = this.filterForm
    const { searchChart } = this.props
    validateFields()
    .then(values => {
      searchChart && searchChart(values, ENERGY_CONSUMPTION_CHART)
    }).catch(errorInfo => {
      errorInfo
    })
  }

  render() {
    const { energyUnitsList, chargeValue } = this.props
    const planLineList = getChartData(5)
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
            {/* <Button type="primary" className="btn-right" onClick={() => {
              this.setState({
                visible: true,
                modalTitle: '控制参数设置'
              })
            }}>控制参数</Button> */}
          </div>
          <div className="plan-tracking-middle">
          <div className="energy-consumption-middle-left">当日全站累计充电：{chargeValue.toFixed(2)}kWh</div>
            {/* <div className="plan-tracking-middle-right" onClick={this.openTableModal}>今日控制参数</div> */}
          </div>
          <div className="plan-tracking-chart">
            <LineChart
                xData={planLineList.xData}
                yData={planLineList.yData}
                series={[
                  { name: '限电计划', unit: 'kw' },
                  { name: '光伏可出力', unit: 'kw' },
                  { name: '光伏功率', unit: 'kw' },
                  { name: '储能功率', unit: 'kw' },
                  { name: '并网点总有功', unit: 'kw' },
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
    );
  }
}

export default EnergyConsumption;
