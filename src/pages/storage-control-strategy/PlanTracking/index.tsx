/** 计划跟踪 */
import React, { Component } from 'react';
import { Form, Button } from 'antd'
import { Select, DatePicker, Modal, Input, Table1, LineChart } from 'wanke-gui'
import { Moment } from 'moment';
import moment from 'moment';
import { getChartData } from '../dataCfg';

const { Option } = Select

export interface PlanTrackingProps {
  energyUnitsList: any[],
  record: any,
  todayParamLoading: boolean,
  todayParamList: any[],
  strategyObj: any,
  planLineList: { xData: any[], yData: any[] },
  searchTable: (date: Moment) => void
  updateControlParam: (params: any) => void
  searchChart: (params: any, chartMap?:any[]) => void
}

interface PlanTrackingState {
  // energyUnitsList: any[],
  visible: boolean
  modalTitle: string
}

class PlanTracking extends Component<PlanTrackingProps, PlanTrackingState> {

  filterForm: any
  editForm: any

  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      modalTitle: '控制参数设置'
    }
  }

  componentDidMount(){
    const { searchChart, energyUnitsList } = this.props
    searchChart && searchChart({
      dtime: moment(),
      energyId: energyUnitsList[0]?.id
    })
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
    const { searchChart } = this.props
    validateFields()
    .then(values => {
      searchChart && searchChart(values)
    }).catch(errorInfo => {
      errorInfo
    })
  }

  render() {
    const { energyUnitsList, record, todayParamList, todayParamLoading, searchTable, strategyObj } = this.props
    const { visible, modalTitle } = this.state
    // console.log('todayParamList', todayParamList)
    const planLineList = getChartData(3)
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
              <Form.Item label="储能单元" name="energyId" initialValue={energyUnitsList[0]?.id}>
                <Select
                  placeholder="请选择储能单元"
                  // allowClear
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
            <Button type="primary" className="btn-right" onClick={() => {
              this.setState({
                visible: true,
                modalTitle: '控制参数设置'
              })
            }}>控制参数</Button>
          </div>
          <div className="plan-tracking-middle">
          {
            planLineList.yData.some(item => item && item.length) ?
            <div className="plan-tracking-middle-left">当日已成功获取调度计划曲线！</div>
            :
            <div className="plan-tracking-middle-left-error">当日未获取到调度计划曲线！</div>
          }
          
            <div className="plan-tracking-middle-right" onClick={this.openTableModal}>当日控制参数</div>
          </div>
          <div className="plan-tracking-chart">
          <LineChart
                xData={planLineList.xData}
                yData={planLineList.yData}
                series={[
                  { name: '光伏出力计划', unit: 'kw' },
                  { name: '光伏实际功率', unit: 'kw' },
                  { name: '储能实际功率', unit: 'kw' },
                ]}
                options={{
                  axisColor: '#ccc',
                  axisTextColor: '#ccc',
                  backOpacity: [0, 0]
                }}
              />
          </div>
        </div>
        <Modal
          title={modalTitle}
          visible={visible}
          okText={modalTitle === '控制参数设置' ? "保存" : "关闭"}
          cancelButtonProps={{
            style: { display: modalTitle === '控制参数设置' ? 'inline-block' : 'none' }
          }}
          wrapClassName={modalTitle === '控制参数设置' ? 'paramSetting-modal-box' : 'table-modal-box'}
          onOk={modalTitle === '控制参数设置' ? this.saveForm : () => { this.setState({ visible: false }) }}
          onCancel={() => { this.setState({ visible: false }) }}
        >
          {
            modalTitle === '控制参数设置' ?
              (
                <Form
                  ref={form => this.editForm = form}
                  layout="vertical"
                >
                  <Form.Item label="允许跟踪误差上限" name="max" initialValue={strategyObj?.max} rules={[
                    { required: true, message: '请输入允许跟踪误差上限!' },
                    { pattern: /\d+/g, message: '请输入数字!' },
                    { validator: this.maxValidator },
                  ]}>
                    <Input addonAfter="%" placeholder="请输入" />
                  </Form.Item>
                  <Form.Item label="允许跟踪误差下限" name="min" initialValue={strategyObj?.min} rules={[
                    { required: true, message: '请输入允许跟踪误差下限!' },
                    { pattern: /\d+/g, message: '请输入数字!' },
                    { validator: this.minValidator },
                  ]}>
                    <Input addonAfter="%" placeholder="请输入" />
                  </Form.Item>
                </Form>
              ) : (
                <>
                  <div className="modal-filter-date">
                    <DatePicker defaultValue={moment()} onChange={value => searchTable && searchTable(value)} />
                  </div>
                  <div className="modal-table">
                    <Table1
                      x={580}
                      loading={todayParamLoading}
                      dataSource={todayParamList}
                      columns={columns}
                    />
                  </div>
                </>
              )
          }
        </Modal>
      </div>
    );
  }
}

export default PlanTracking;
