/** 手动控制-控制参数设置 */
import React, { Component } from 'react';
import { Button, Tabs, Popconfirm, Modal, Input, message, DatePicker, Checkbox, Table1, Badge } from 'wanke-gui';
import { PlusOutlined, CloseOutlined } from 'wanke-icon';
import { Form } from 'antd'
import { FormInstance } from 'antd/lib/form';
import ManualControlForm from './ManualControlForm'
// import utils from '@/util/utils';
import _ from 'lodash'
import moment from 'moment';
// import { strategyModel } from 'umi';
import { checkDateInList } from '../dataCfg';

const { TabPane } = Tabs
const { RangePicker } = DatePicker
const { Group } = Checkbox

export interface ManualControlSettingProps {
  planList: any[],
  planObj: any
  energyUnitsList: any[]
  orderMap: any[]
  socMap: any[]
  controlMap: any[]
  record: any
  onManualCancel: () => void
  onManualOk: (item: any) => void
  tabsChange: (key: number) => void
  deletePlan: (record: any) => void
}

interface ManualControlSettingState {
  visible: boolean
  type: 1 | 2
  planList: any[] // 需要保存的
  tabActiveKey: number,
  record: any,
  recordIndex: number
}

class ManualControlSetting extends Component<ManualControlSettingProps, ManualControlSettingState> {

  baseForm: FormInstance<any>[] = []
  editForm: FormInstance<any>

  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      type: 1, // 1： 添加计划标题 2：新增指令设置
      planList: props.planList || [],
      tabActiveKey: 0,
      record: {},
      recordIndex: -1,
    }
  }

  componentDidMount() {
    const { planList } = this.props
    const newSaveObj = planList?.[0] ?? {}
    this.setState({ planList: planList || [] })
    // console.log('this.baseForm', newSaveObj)
    if (this.baseForm[0])
      this.baseForm[0].setFieldsValue({
        name: newSaveObj.name,
        energyUnitId: newSaveObj.energyUnitId?.split(',').map(item => parseInt(item)),
        time: [
          newSaveObj.startTime ? moment(newSaveObj.startTime) : undefined,
          newSaveObj.endTime ? moment(newSaveObj.endTime) : undefined
        ]
      })
  }

  componentDidUpdate(preProps, preState) {
    const { tabActiveKey } = this.state
    const { planList } = this.props
    if (!_.isEqual(this.props.planList, preProps.planList)) {
      this.setState({ planList: planList || [] })
      if (this.baseForm[tabActiveKey])
        this.baseForm[tabActiveKey].setFieldsValue({
          name: planList[tabActiveKey]?.name,
          energyUnitId: planList[tabActiveKey]?.energyUnitId?.split(',').map(item => parseInt(item)),
          time: [
            planList[tabActiveKey]?.startTime ? moment(planList[tabActiveKey].startTime) : undefined,
            planList[tabActiveKey]?.endTime ? moment(planList[tabActiveKey].endTime) : undefined
          ]
        })
    }
  }

  // 删除tab页
  deleteTab = (index) => {
    const { planList, deletePlan } = this.props
    if (planList && planList[index]) {
      deletePlan && deletePlan(planList[index])
      this.setState({ tabActiveKey: 0 })
    } else {
      this.setState({ planList: this.state.planList.filter((item, ind) => ind !== index), tabActiveKey: 0 })
    }
  }

  // 标签页编辑
  tabsEdit = (targetKey, action) => {
    if (action === 'add') { // 新增
      if (this.checkFormIsChange()) { // 存在没有保存的计划
        message.warn('存在没有保存的计划，请先保存完再操作')
      } else {
        this.setState({ type: 1, visible: true })
      }

    }
    // else if (action === 'remove') { // 删除

    // }
  }

  // 保存form表单
  saveForm = () => {
    const { type, tabActiveKey, recordIndex } = this.state
    if (type === 1) {// 保存计划标题
      this.editForm
        .validateFields()
        .then(values => {
          this.setState({ planList: [...this.state.planList, values], visible: false })
        })
    } else { // 保存具体充放电量内容
      this.editForm
        .validateFields()
        .then(values => {
          const newPlanList = _.cloneDeep(this.state.planList)
          // console.log('newPlanList', this.state.planList)
          newPlanList[tabActiveKey].instructs = recordIndex === -1 ?
            [...(newPlanList[tabActiveKey].instructs || []), {
              ...values,
              startTime: values.startTime.format('HH:mm:ss'),
              endTime: values.endTime.format('HH:mm:ss'),
            }].sort((a, b) => a.startTime < b.startTime ? -1 : 1) : newPlanList[tabActiveKey].instructs.map((item, ind) => recordIndex === ind ? ({
              ...item,
              ...values,
              startTime: values.startTime.format('HH:mm:ss'),
              endTime: values.endTime.format('HH:mm:ss'),
            }) : item)

          this.setState({ planList: newPlanList, visible: false })
        })
    }
  }


  // 添加表格数据
  openAddTableItem = () => {
    this.setState({ type: 2, visible: true, record: {}, recordIndex: -1 })
  }

  // tabs切换
  tabsChange = (key) => {
    const { tabsChange, planList } = this.props
    const { tabActiveKey } = this.state
    if (this.checkFormIsChange()) {
      message.warn('当前计划内容有改动，需要选保存后再切换')
    } else {
      this.setState({ tabActiveKey: parseInt(key) }, () => {
        this.baseForm[tabActiveKey].setFieldsValue({
          name: planList[tabActiveKey]?.name,
          energyUnitId: planList[tabActiveKey]?.energyUnitId?.split(',').map(item => parseInt(item)),
          time: [
            planList[tabActiveKey]?.startTime ? moment(planList[tabActiveKey]?.startTime) : undefined,
            planList[tabActiveKey]?.endTime ? moment(planList[tabActiveKey]?.endTime) : undefined
          ]
        })
      })
      tabsChange && tabsChange(parseInt(key))
    }
  }

  // 合并form表单的数据
  mergeForm = () => {
    const { planList } = this.props
    const { tabActiveKey } = this.state
    const formData = this.baseForm[tabActiveKey].getFieldsValue()
    return {
      ...(planList[tabActiveKey] || {}),
      name: formData.name,
      energyUnitId: formData.energyUnitId?.join(),
      startTime: formData.time?.[0]?.format('YYYY-MM-DD'),
      endTime: formData.time?.[1]?.format('YYYY-MM-DD'),
    }
  }

  // 判断之前的表单是否有改动
  checkFormIsChange = (): boolean => {
    // const { planList } = this.props
    const { planList, tabActiveKey } = this.state
    // console.log('planList[tabActiveKey]', planList[tabActiveKey])
    if (planList && planList.length) {
      return !_.isEqual(planList[tabActiveKey], this.mergeForm())
    }
    return false
  }

  // 删除表格数据
  deleteTable = (index: number) => {
    const { planList, tabActiveKey } = this.state
    const newPlanList = _.cloneDeep(planList)
    newPlanList[tabActiveKey].instructs = newPlanList[tabActiveKey].instructs.filter((item, ind) => ind !== index)
    this.setState({ planList: newPlanList })
  }

  // 编辑
  tableEdit = (record, index) => {
    this.setState({
      type: 2,
      visible: true,
      record,
      recordIndex: index
    }, () => {
      if (this.editForm)
        this.editForm.setFieldsValue({
          ...record,
          startTime: moment(record.startTime, 'HH:mm:ss'),
          endTime: moment(record.endTime, 'HH:mm:ss'),
        })
    })
  }

  // 保存所有
  onManualOk = () => {
    const { onManualOk } = this.props
    const { tabActiveKey, planList } = this.state
    this.baseForm[tabActiveKey]
      .validateFields()
      .then(values => {
        // console.log('values', values)
        const totalTime = (planList[tabActiveKey].instructs || []).reduce((pre, item) => {
          return pre + (item.endTime === '00:00:00' && item.startTime === '00:00:00' ? 24 * 60 * 60 : item.endTime === '00:00:00' && item.startTime !== '00:00:00' ? moment(item.endTime, 'HH:mm:ss').add(1, 'day').diff(moment(item.startTime, 'HH:mm:ss'), 's') : moment(item.endTime, 'HH:mm:ss').diff(moment(item.startTime, 'HH:mm:ss'), 's'))
        }, 0)
        // console.log('totalTime', totalTime === 24 * 60 * 60)
        if (totalTime !== 24 * 60 * 60) {
          message.error('指令总执行时长需要24小时！')
        } else {
          const newPlanList = _.cloneDeep(planList)
          newPlanList[tabActiveKey] = {
            ...newPlanList[tabActiveKey],
            ...values,
            startTime: values.time[0].format('YYYY-MM-DD'),
            endTime: values.time[1].format('YYYY-MM-DD'),
            energyUnitId: values.energyUnitId.join()
          }
          delete newPlanList[tabActiveKey].time
          this.setState({ planList: newPlanList })
          onManualOk && onManualOk(newPlanList[tabActiveKey])
        }
      })
  }

  render() {
    const { onManualOk, onManualCancel, energyUnitsList, orderMap, socMap, controlMap, record:propsRecord } = this.props
    const { visible, type, tabActiveKey, planList, record, recordIndex } = this.state
    const columns = [{
      title: '序号',
      dataIndex: 'num',
      align: 'center',
      width: 65,
      render: (value, record, index) => index + 1
    },
    {
      title: '储能指令',
      dataIndex: 'order',
      width: 120,
      render: (value, record) => orderMap.find(item => item.id === value)?.name
    },
    {
      title: '执行时间段',
      dataIndex: 'time',
      width: 165,
      render: (value, record) => `${moment(record.startTime, 'HH:mm:ss').format('HH:mm')} ~ ${moment(record.endTime, 'HH:mm:ss').format('HH:mm')}`
    },
    {
      title: '运行控制参数',
      dataIndex: 'control',
      render: (value, record) => {
        if (value === 1) return `功率 = ${record.power ?? 0}kW`
        else if (value === 2) return `电压/电流 = ${record.voltageLimit ?? 0}V/cell/${record.currentLimit ?? 0}${record.order === 1 ? 'C/AH' : 'A'}`
        return null
      }
    },
    {
      title: '阶段控制参数',
      dataIndex: 'endControl',
      render: (value, record) => value && `${socMap.find(item => item.id === value)?.name} ${socMap.find(item => item.id === value)?.name === '无' ? '' : `= ${record.soc}%`}`
    }, {
      title: '操作',
      dataIndex: 'operate',
      width: 165,
      render: (value, record, index) => (<div style={{ textAlign: 'center' }}>
        <span style={{ textDecoration: 'underline', cursor: 'pointer', color: '#177ddc', marginRight: 8 }} onClick={() => this.tableEdit(record, index)}>编辑</span>
        <Popconfirm title="你确定要删除吗？" placement="bottom" color="#313131" onConfirm={() => this.deleteTable(index)}>
          <span style={{ textDecoration: 'underline', cursor: 'pointer', color: '#d32029' }}>删除</span>
        </Popconfirm>
      </div>)
    }]

    // console.log('this.baseForm', propsRecord)
    return (
      <div className="manual-setting-box">
        <div className="manual-setting-body">
          <Tabs
            type="editable-card"
            onEdit={this.tabsEdit}
            activeKey={`${tabActiveKey}`}
            addIcon={<><PlusOutlined style={{ marginRight: 8 }} /> 新增</>}
            onChange={this.tabsChange}
            hideAdd={planList && planList.length > 9}
          >
            {
              (planList || []).map((item, index) => (
                <TabPane tab={
                  moment(moment(item.endTime).format('YYYY-MM-DD')).isBefore(moment(moment().format('YYYY-MM-DD'))) ?
                    (
                      <Badge count="!" title="该计划已过期">
                        {item.name}
                      </Badge>
                    )
                    :
                    item.name
                }
                  key={index}
                  closeIcon={
                    <Popconfirm title="你确定要删除吗？" placement="bottom" color="#313131" onConfirm={() => this.deleteTab(index)}>
                      <CloseOutlined />
                    </Popconfirm>
                  }>
                  <div className="manual-setting-tab-body">
                    <Form
                      ref={form => this.baseForm[index] = form}
                      layout='horizontal'
                      initialValues={{
                        name: item.name,
                        energyUnitId: item.energyUnitId?.split(',').map(item => parseInt(item)),
                        time: [
                          item.startTime ? moment(item.startTime) : undefined,
                          item.endTime ? moment(item.endTime) : undefined
                        ]
                      }}
                    >
                      <Form.Item name="name" label="控制参数名称" rules={[{ required: true, message: "请输入控制参数名称" }, { max: 16, message: '输入的内容请不要超过16个字' }]}>
                        <Input placeholder="请输入" style={{ width: 278 }} />
                      </Form.Item>
                      <Form.Item name="energyUnitId" label="适用对象" rules={[{ required: true, message: "请选择适用对象" }]}>
                        <Group>
                          {
                            energyUnitsList.filter(item => `,${propsRecord.energyUnitId},`.indexOf(`,${item.id},`) > -1).map(item => (
                              <Checkbox value={item.id}>{item.title}</Checkbox>
                            ))
                          }
                        </Group>
                      </Form.Item>
                      <Form.Item 
                      name="time" 
                      label="时间" 
                      rules={[
                        { required: true, message: "请选择时间" },
                        {
                          validator: (_, value) => {
                            return  (planList || []).filter((item, ind) => index !== ind).some(item => 
                              moment(value[0], 'YYYY-MM-DD').isSameOrAfter(item.startTime, 'day') && moment(value[0], 'YYYY-MM-DD').isSameOrBefore(item.endTime, 'day')
                              || moment(value[1], 'YYYY-MM-DD').isSameOrAfter(item.startTime, 'day') && moment(value[1], 'YYYY-MM-DD').isSameOrBefore(item.endTime, 'day')
                            ) ? Promise.reject('当前时间段与其他计划时间有冲突， 请重新选择') : Promise.resolve()
                          }
                        },
                      ]}>
                        <RangePicker
                          placeholder={["请选择", "请选择"]}
                          disabled={[
                            !moment(item.endTime).isBefore(moment()) && item.id,
                            false
                          ]}
                          disabledDate={(currentDate) => moment(moment().format('YYYY-MM-DD')).isAfter(currentDate)}
                          allowClear={false} />
                      </Form.Item>
                    </Form>
                    <Button type="primary" style={{ position: 'absolute', right: 20, top: 207 }} onClick={this.openAddTableItem}>新增</Button>
                    <div className="table-box" style={{ flexGrow: 1, overflow: 'hidden' }}>
                      <Table1
                        x={580}
                        dataSource={item.instructs || []}
                        columns={columns}
                      />
                    </div>
                  </div>
                </TabPane>
              ))
            }
          </Tabs>
        </div>
        <div className="manual-setting-footer">
          <Button onClick={onManualCancel}>取消</Button>
          <Button type="primary" onClick={this.onManualOk}>确定</Button>
        </div>
        <Modal
          title="控制指令设置"
          visible={visible}
          wrapClassName="manual-setting-modal-box"
          bodyStyle={{
            padding: type === 1 ? '24px 68px' : '24px'
          }}
          okText="确定"
          onOk={this.saveForm}
          onCancel={() => { this.setState({ visible: false }) }}
        >
          <ManualControlForm
            type={type}
            ref={ref => this.editForm = ref?.formRef}
            orderMap={orderMap}
            socMap={socMap}
            controlMap={controlMap}
            record={record}
            tableList={((planList || [])[tabActiveKey]?.instructs || []).filter((item, index) => index !== recordIndex)}
          />
        </Modal>
      </div>
    );
  }
}

export default ManualControlSetting;
