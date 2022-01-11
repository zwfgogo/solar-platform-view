import React, { Component } from 'react';
import { makeConnect } from '../../../pages/umi.helper'
import { Button, Table2, Breadcrumb, Modal, Select, message, Popconfirm, Radio } from 'wanke-gui'
import { Form, Input } from 'antd'
import { strategyNS } from '../model'
import "../index.less"
import { strategyModel, CrumbState, GlobalState } from 'umi';
import _, { inRange } from 'lodash'
import { LeftOutlined } from 'wanke-icon';
import StrategyParams from './StrategyParams'
import { STRATEGY_MAP, PLAN_TRACKING_CHART, DISPATCH_MAP, mergeChartData, ENERGY_CONSUMPTION_CHART, MANUAL_CONTROL_CHART } from '../dataCfg'
import moment, { Moment } from 'moment';
// import moment from 'moment';
// import websocketHOC from '@/hoc/websoketHOC';
// import Sockette from 'sockette';
// import { setPointData } from '@/pages/Home/dataCfg';

const { Option } = Select
const { Group: RadioGroup } = Radio

interface StrategyInfoProps extends strategyModel, CrumbState, GlobalState {
  loading: boolean
  paramsLoading: boolean
  todayParamLoading: boolean
  dispatch: Function
  location: any
  createWS: Function
}

interface StrategyInfoState {
  crumbs: string[]
  isShowParams: boolean
  visible: boolean
  record: any
  type: string
  planLineList: { xData: any[], yData: any[] }
  chargeValue: number
  dischargeValue: number
  modelKey: number,
  popconfirmVisible: boolean
  modalType: 0 | 1 | 2 | 3
  issueRecord: any
}

// @websocketHOC
@makeConnect(strategyNS, (model: any, getLoading: (arg0: string) => any, state: any) => {
  const { global, crumbs } = state
  return {
    ...model,
    ...crumbs,
    ...global,
    loading: getLoading('getStrategyInfoList'),
    paramsLoading: getLoading('getStrategyParamList'),
    todayParamLoading: getLoading('getTodayParamList'),
  }
})
class StrategyInfo extends Component<StrategyInfoProps, StrategyInfoState> {

  formRef: any
  orderForm: any
  issueForm: any
  powerLinews: Sockette
  chargews: Sockette
  disChargews: Sockette
  planPointNumber: any // 计划跟踪的曲线ws结果
  i: any

  constructor(props) {
    super(props)
    this.state = {
      modalType: 0,
      crumbs: ['控制策略', '策略概览'],
      isShowParams: false,
      visible: false,
      record: null,
      type: null,
      planLineList: { xData: [], yData: [] },
      chargeValue: 0, // 充电量
      dischargeValue: 0, // 放电量
      modelKey: 1,
      popconfirmVisible: false,
      issueRecord: null
    }
  }

  componentDidMount() {
    // const { dispatch } = this.props
    // dispatch({ type: 'global/getEnergyUnitsByStationId' })
    // dispatch({ type: 'strategy/getStrategyParamList' })
    // dispatch({ type: 'strategy/getOrderMap' })
    // dispatch({ type: 'strategy/getSOCMap' })
    // dispatch({ type: 'strategy/getControlMap' })
    // dispatch({ type: 'strategy/getStrategyInfoList', payload: { page: 1, size: 20 } })
    // dispatch({ type: 'strategy/getIssueList', payload: { page: 1, size: 20 } })
    // dispatch({ type: "strategy/getRunningModel" })
    // this.i = setInterval(() => {
    //   dispatch({ type: "strategy/getRunningModel" })
    // }, 5000)
  }

  // componentDidUpdate(preProps, preState) {
  //   if (!this.state.type) {
  //     if(this.props.runningModel?.model && this.props.runningModel?.model !== preProps.runningModel?.model) this.setState({ modelKey: this.props.runningModel?.model || 1 })
  //   }
  // }

  componentWillUnmount(){
    if(this.i){
      clearInterval(this.i)
      this.i = undefined
    }
  }

  // 控制参数
  openControl = () => {
    this.setState({
      crumbs: ['控制策略', '策略概览'],
      isShowParams: true
    })
  }

  // 分页
  onPageChange = (page: number, size: number) => {
    // const { dispatch } = this.props
    // dispatch({ type: 'strategy/getStrategyInfoList', payload: { page, size } })
  }

  // 编辑
  openEditor = (record: any) => {
    this.setState({ visible: true, modalType: 0, record })
    if (this.formRef) this.formRef.setFieldsValue({ energyUnitId: record.energyUnitId.split(',') })
  }

  // 保存策略“经济运行”
  saveForm = () => {
    // const { dispatch } = this.props
    // const { record, modalType, issueRecord } = this.state
    // // console.log('modelKey', modelKey)
    // if (modalType === 0) {
    //   const { validateFields } = this.formRef
    //   validateFields().then(values => {
    //     dispatch({
    //       type: 'strategy/updateStrategyEnergyUnitId',
    //       payload: {
    //         data: { ...record, energyUnitId: values.energyUnitId.join() },
    //       }
    //     }).then(err => {
    //       if (!err) message.success('修改成功')
    //       else message.error('修改失败')
    //       this.setState({ visible: false })
    //     })
    //   }).catch(errorInfo => {
    //     errorInfo
    //   })
    // }else if(modalType === 3){ // 下发指令
    //   const { validateFields } = this.issueForm
    //   validateFields().then(values => {
    //     dispatch({
    //       type: 'strategy/editIssue',
    //       payload: {
    //         id: issueRecord?.id,
    //         ...Object.keys(values).reduce((pre, key) => ({
    //           ...pre,
    //           [key]: parseFloat(values[key])
    //         }), {})
    //       }
    //     }).then(err => {
    //       if (!err) {
    //         message.success('下发成功')
    //         this.setState({ visible: false })
    //       }
    //     })
    //   })
    // }else {
    //   const { validateFields } = this.orderForm
    //   validateFields().then(values => {
    //     dispatch({
    //       type: 'strategy/saveOrder',
    //       payload: {
    //         energyUnitPowerValue: Object.keys(values).reduce((pre, key) => ({
    //           ...pre,
    //           [key]: parseFloat(values[key])
    //         }), {}),
    //       }
    //     }).then(err => {
    //       if (!err) {
    //         message.success('保存成功')
    //         this.setState({ visible: false })
    //       }
    //     })
    //   }).catch(errorInfo => {
    //     errorInfo
    //   })
    // }

  }

  // 修改状态
  updateStatus = (record: any) => {
    const { dispatch } = this.props
    dispatch({
      type: 'strategy/updateStrategyStatus',
      payload: {
        data: { ...record, status: record.status === 0 ? 1 : 0 }
      }
    }).then(err => {
      if (!err) message.success('修改成功')
      else message.error('修改失败')
    })
  }

  // 保存控制参数
  saveParams = (params) => {
    const { dispatch } = this.props
    dispatch({
      type: 'strategy/updateStrategyParam',
      payload: {
        energyUnits: params,
      }
    }).then(err => {
      if (!err) message.success('修改成功')
      else message.error('修改失败')
    })
  }

  // 打开对应发的策略
  openStrategy = async (record) => {
    const { dispatch } = this.props
    const { id, title } = record
    if (STRATEGY_MAP[id]) {
      await dispatch({
        type: 'strategy/getStrategyObj',
        payload: { id: record.id }
      })
      this.setState({ type: id, crumbs: ['控制策略', title], record })
      if(this.i !== undefined) {
        clearInterval(this.i)
        this.i = undefined
      }
    } else {
      this.setState({ type: null, crumbs: ['控制策略', '策略概览'], isShowParams: false })
      message.warn('功能暂未开放')
    }
  }

  // 打开对应发的策略-调度模式
  openDispatch = async (record) => {
    const { dispatch } = this.props
    const { id, title } = record
    if (DISPATCH_MAP[id]) {
      await dispatch({
        type: 'strategy/getStrategyObj',
        payload: { id: record.id }
      })
      this.setState({ type: id, crumbs: ['控制策略', title], record })
      if(this.i !== undefined) {
        clearInterval(this.i)
        this.i = undefined
      }
    } else {
      this.setState({ type: null, crumbs: ['控制策略', '策略概览'], isShowParams: false })
      message.warn('功能暂未开放')
    }
  }

  // 查询“今日控制参数” ---> 计划跟踪
  searchTable = (date: Moment) => {
    const { dispatch } = this.props
    dispatch({
      type: 'strategy/getTodayParamList',
      payload: { date }
    })
  }

  // 修改控制参数
  updateControlParam = (value) => {
    const { dispatch, strategyObj } = this.props
    const { record } = this.state
    dispatch({
      type: 'strategy/updateStrategy',
      payload: {
        data: {
          id: record.id,
          args: {
            ...strategyObj,
            min: parseInt(value.min),
            max: parseInt(value.max)
          }
        }
      }
    }).then(err => {
      if (!err) message.success('修改成功')
      else message.error('修改失败')
    })
  }

  // 计划跟踪、光伏限电 ---> 查询功率曲线
  searchChart = async (value, chartMap = PLAN_TRACKING_CHART) => {
    const { dtime, energyId } = value
    this.planPointNumber = {}
    this.setState({
      planLineList: {
        xData: [],
        yData: []
      }
    })
    // console.log('energyId',energyId)
    if (dtime && dtime.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) { // 当前
      this.searchStoredEnergyChart(Array.isArray(energyId) ? energyId : [energyId], dtime, chartMap)
    } else {
      this.searchHistoryStoredEnergyChart(Array.isArray(energyId) ? energyId : [energyId], dtime, chartMap)
    }
  }

  // 计划跟踪、光伏限电websocket曲线
  searchStoredEnergyChart = async (ids: number[], dtime = moment(), chartMap) => {
    // const { dispatch, createWS, energyUnitsList } = this.props
    // const user = JSON.parse(sessionStorage.getItem('user'))
    // const stationId = user?.station?.id
    // const devicePointList = await dispatch({ type: 'global/getDevicePointList' })
    // console.log('devicePointList', devicePointList.find(item => item.name === 'SystemFrequency'))
    // const devTypeId = _.isEqual(MANUAL_CONTROL_CHART, chartMap) ? // 手动控制
    //   energyUnitsList.map(item => ({
    //     devId: item.id,
    //     typeId: devicePointList.find(d => d.name === MANUAL_CONTROL_CHART[0].split('|')[0])?.id
    //   }))
    //   :
    //   chartMap.map(item => ({
    //     devId: item.split('|')[1] === 's' ? [stationId] : ids,
    //     typeId: devicePointList.find(d => d.name === item.split('|')[0])?.id
    //   }))
    // const pointResult: any[] = await Promise.all(chartMap.map(item => dispatch({ type: 'home/getOverviewCardList', payload: { devId: item.split('|')[1] === 's' ? [stationId] : ids, typeId: [devicePointList.find(d => d.name === item.split('|')[0])?.id] } })))
    // // console.log('pointResult', pointResult)
    // const pointList: any[] = pointResult.reduce((pre: [], item: any) => [...pre, ...item], [])
    // // console.log('pointList', pointList)
    // if (pointList && pointList.length) {
    //   if (this.powerLinews) {
    //     this.powerLinews.send(JSON.stringify({ pointNumbers: pointList.map(item => item.pointNumber).join(), startDate: dtime.format('YYYY-MM-DD 00:00:00') }))
    //   } else
    //     this.powerLinews = createWS({
    //       url: "/measurements",
    //       onopen: e => {
    //         this.powerLinews.send(JSON.stringify({ pointNumbers: pointList.map(item => item.pointNumber).join(), startDate: dtime.format('YYYY-MM-DD 00:00:00') }))
    //       },
    //       onmessage: e => {
    //         const { data } = e
    //         const pointNumber = JSON.parse(data)
    //         this.planPointNumber = { ...this.planPointNumber, ...pointNumber }
    //         const resultData = mergeChartData(pointList, this.planPointNumber)
    //         // console.log('resultData', resultData)
    //         this.setState({ planLineList: resultData })
    //       }
    //     })
    // } else {
    //   message.warn('当前能量单元的点号为空')
    // }

    // if (!_.isEqual(chartMap, PLAN_TRACKING_CHART)) {
    //   const user = JSON.parse(sessionStorage.getItem('user'))
    //   const stationId = user?.station?.id
    //   if (this.chargews) {
    //     this.chargews.send(JSON.stringify({ stationId }))
    //   } else {
    //     this.chargews = createWS({
    //       url: "/electricity/day/charge",
    //       onopen: e => {
    //         this.chargews.send(JSON.stringify({ stationId }))
    //       },
    //       onmessage: e => {
    //         const { data } = e
    //         const pointNumber = JSON.parse(data)
    //         this.setState({ chargeValue: pointNumber[stationId] || 0 })
    //       }
    //     })
    //   }
    // }

    // if (!_.isEqual(chartMap, PLAN_TRACKING_CHART) && !_.isEqual(chartMap, ENERGY_CONSUMPTION_CHART)) {
    //   const user = JSON.parse(sessionStorage.getItem('user'))
    //   const stationId = user?.station?.id
    //   if (this.disChargews) {
    //     this.disChargews.send(JSON.stringify({ stationId }))
    //   } else {
    //     this.disChargews = createWS({
    //       url: "/electricity/day/discharge",
    //       onopen: e => {
    //         this.disChargews.send(JSON.stringify({ stationId }))
    //       },
    //       onmessage: e => {
    //         const { data } = e
    //         const pointNumber = JSON.parse(data)
    //         this.setState({ dischargeValue: pointNumber[stationId] || 0 })
    //       }
    //     })
    //   }
    // }
  }

  // 查询计划跟踪、光伏限电历史曲线
  searchHistoryStoredEnergyChart = async (ids: number[], dtime = moment(), chartMap) => {
    // const { dispatch, energyUnitsList } = this.props
    // const devicePointList = await dispatch({ type: 'global/getDevicePointList' })
    // const user = JSON.parse(sessionStorage.getItem('user'))
    // const stationId = user?.station?.id
    // const devTypeId = _.isEqual(MANUAL_CONTROL_CHART, chartMap) ? // 手动控制
    //   energyUnitsList.map(item => ({
    //     devId: item.id,
    //     typeId: devicePointList.find(d => d.name === MANUAL_CONTROL_CHART[0].split('|')[0])?.id
    //   }))
    //   :
    //   chartMap.map(item => ({
    //     devId: item.split('|')[1] === 's' ? [stationId] : ids,
    //     typeId: devicePointList.find(d => d.name === item.split('|')[0])?.id
    //   }))
    // const pointResult: any[] = await Promise.all(chartMap.map(item => dispatch({ type: 'home/getOverviewCardList', payload: { devId: item.split('|')[1] === 's' ? [stationId] : ids, typeId: [devicePointList.find(d => d.name === item.split('|')[0])?.id] } })))
    // const pointList: any[] = pointResult.reduce((pre: [], item: any) => [...pre, ...item], [])
    // // console.log('pointList', pointList)
    // if (pointList && pointList.length) {
    //   const pointNumber = await dispatch({ type: 'home/getPowerLineHistoryList', payload: { pointNumbers: pointList.map(item => item.pointNumber), dtime } })
    //   const resultData = mergeChartData(pointList, pointNumber)
    //   this.setState({ planLineList: resultData })
    // }

    // if (!_.isEqual(chartMap, PLAN_TRACKING_CHART)) {
    //   const user = JSON.parse(sessionStorage.getItem('user'))
    //   const stationId = user?.station?.id
    //   const chargeList = await dispatch({ type: 'strategy/getElectricityList', payload: { deviceId: stationId, timeType: 1, type: 1, dtime: [dtime.format('YYYY-MM-DD 00:00:00'), dtime.format('YYYY-MM-DD 23:59:59')] } })
    //   this.setState({ chargeValue: chargeList[0]?.val || 0 })
    // }

    // if (!_.isEqual(chartMap, PLAN_TRACKING_CHART) && !_.isEqual(chartMap, ENERGY_CONSUMPTION_CHART)) {
    //   const user = JSON.parse(sessionStorage.getItem('user'))
    //   const stationId = user?.station?.id
    //   const chargeList = await dispatch({ type: 'strategy/getElectricityList', payload: { deviceId: stationId, timeType: 1, type: 2, dtime: [dtime.format('YYYY-MM-DD 00:00:00'), dtime.format('YYYY-MM-DD 23:59:59')] } })
    //   this.setState({ dischargeValue: chargeList[0]?.val || 0 })
    // }
  }

  // 打开手动控制的控制参数
  openManualSetting = () => {
    const { id, title } = this.state.record
    this.setState({ type: `${id}-1`, crumbs: ['控制策略', title, '控制参数设置'] })
    // 查询
    this.props.dispatch({ type: 'strategy/getPlanIdAndName' })
  }

  // 重置state
  resetState = () => {
    this.setState({
      crumbs: this.state.crumbs.length === 3 ? this.state.crumbs.filter((item, index) => index < 2) : ['控制策略', '策略概览'],
      isShowParams: false,
      type: this.state.crumbs.length === 3 ? this.state.record.id : null,
      chargeValue: 0,
      planLineList: {
        xData: [],
        yData: []
      }
    })

    if(this.state.crumbs.length !== 3){
      this.i = setInterval(() => {
        this.props.dispatch({ type: "strategy/getRunningModel" })
      }, 5000)
    }

    if (this.powerLinews) {
      this.powerLinews.close();
      this.powerLinews = undefined
    }
    if (this.chargews) {
      this.chargews.close();
      this.chargews = undefined
    }
    if (this.disChargews) {
      this.disChargews.close();
      this.disChargews = undefined
    }
    this.planPointNumber = {}
  }

  // 确定（手动控制-控制参数设置）
  onManualOk = (item) => {
    const { id } = item
    if (id) { // 修改
      this.props.dispatch({ type: 'strategy/editPlan', payload: { args: item } })
        .then(error => {
          if (!error) message.success('修改成功')
        })
    } else {// 新增
      this.props.dispatch({ type: 'strategy/addPlan', payload: { args: item } })
        .then(error => {
          if (!error) message.success('新增成功')
        })
    }
    // this.onManualCancel();
  }

  // 取消（手动控制-控制参数设置）
  onManualCancel = () => {
    const { id, title } = this.state.record
    this.setState({ type: id, crumbs: ['控制策略', title] })
  }

  // 手动控制初始化
  manualControlInit = async () => {
    // const results = await this.props.dispatch({ type: 'strategy/getPlanIdAndName' })
    // await this.props.dispatch({ type: 'strategy/getPlanByPlanId', payload: { id: results[0]?.id } })
  }

  // tab切换查询
  tabsChange = key => {
    // this.props.dispatch({ type: 'strategy/getPlanByPlanId', payload: { id: key } })
  }

  // 删除计划
  deletePlan = record => {
    const { id } = record
    // this.props.dispatch({ type: 'strategy/deletePlan', payload: { id } }).then(error => {
    //   if (!error) message.success('删除成功')
    // })
  }

  // 模式切换
  modelChange = async (key: number) => {
    // const { modalType } = this.state
    // const { dispatch } = this.props
    
    // const err = await dispatch({ type: 'strategy/changeModel', payload: { model: key } })
    // if(modalType === 2) await dispatch({ type: 'strategy/getRunningModel' })
    // else if(modalType === 1) await dispatch({ type: 'strategy/getStrategyInfoList', payload: { page: 1, size: 20 } })
    // else await dispatch({ type: 'strategy/getIssueList', payload: { page: 1, size: 20 } })
  
    // if (!err) {
    //   message.success('模式切换成功')
      this.setState({ modelKey: key })
    // }
  }

  // 点击“发指令”/“指令终止”
  clickThis = (isNotnew: boolean) => {
    // const { runningModel, energyUnitsList, dispatch } = this.props
    // if (isNotnew) { // 指令终止
    //   dispatch({
    //     type: 'strategy/saveOrder',
    //     payload: {
    //       energyUnitPowerValue:
    //         runningModel?.energyUnitPowerValue ?
    //           Object.keys(runningModel?.energyUnitPowerValue)
    //             .reduce((pre, key) => ({
    //               ...pre,
    //               [key]: null
    //             }), {}) : energyUnitsList.reduce((pre, item) => ({
    //               ...pre,
    //               [item.id]: null
    //             }), {}),
    //     }
    //   }).then(err => {
    //     if (!err) {
    //       message.success('保存成功')
    //       this.setState({ visible: false })
    //     }
    //   })
    // } else { // 发指令
      this.setState({ modalType: 1, visible: true })
    // }
  }

  // 编辑指令
  clickThisEdit = () => {
    this.setState({ modalType: 2, visible: true })
  }

  // 打开下发
  openIssue = record => {
    this.setState({ issueRecord: record, modalType: 3, visible: true })
  }

  onIssuePageChange = (page: number, size: number) => {
    const { dispatch } = this.props
    dispatch({ type: 'strategy/getIssueList', payload: { page, size } })
  }

  render() {
    const { loading, strategyInfoList, strategyInfoPage, strategyInfoSize, strategyInfoTotal, energyUnitsList,
       strategyParamList, paramsLoading, todayParamList, todayParamLoading, strategyObj, planList, planObj, orderMap, 
       socMap, controlMap, runningModel, issueList, issuePage, issueSize, issueTotal } = this.props
    const { crumbs, isShowParams, visible, type, record, planLineList, chargeValue, dischargeValue, modelKey, modalType, issueRecord } = this.state
    // console.log('energyUnitsList', energyUnitsList)
    const columns = [{
      title: '序号',
      dataIndex: 'num',
      key: 'num',
      width: 70,
      align: 'center',
      render: (value, record, index) => index + 1
    }, {
      title: '策略名称/参数设置',
      dataIndex: 'title',
      key: 'title',
      width: 550,
      align: 'left',
      render: (value, record, index) => <div className="table-click-text" onClick={() => this.openStrategy(record)}>{value}</div>
    }, {
      title: '适用对象',
      dataIndex: 'energyUnitTitle',
      key: 'energyUnitTitle',
      align: 'left',
      // render: (value, record, index) => value ? value.map(item => energyUnitsList.find(eItem => eItem.id === item)?.title).join() : ''
    }, {
      title: '启用状态',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      align: 'center',
      render: (value, record) => value !== -1 ? (
        <Popconfirm title={`你确定要${value === 1 ? '关闭' : '启用'}吗？`} placement="bottom" color="#313131" onConfirm={() => value !== -1 ? this.updateStatus(record) : null}>
          <div className={`table-status-${value === 1 ? 'true' : value === 0 ? 'false' : ''}`}>{value === 1 ? '已启用' : value === 0 ? '未启用' : '自动'}</div>
        </Popconfirm>
      ) : <div className={`table-status-${value === 1 ? 'true' : value === 0 ? 'false' : ''}`}>自动</div>
    }, {
      title: '操作',
      dataIndex: 'num',
      key: 'num',
      width: 150,
      align: 'center',
      render: (value, record, index) => record.status === 1 ? null : <div className="table-click-text" onClick={() => this.openEditor(record)}>编辑</div>
    }]

    const dispatchColumns = [{
      title: '序号',
      dataIndex: 'num',
      key: 'num',
      width: 70,
      align: 'center',
      render: (value, record, index) => index + 1
    }, {
      title: '策略名称/参数设置',
      dataIndex: 'title',
      key: 'title',
      // width: 550,
      align: 'left',
      render: (value, record, index) => 
      <div 
      className="table-click-text" 
      onClick={() => this.openDispatch(record)}
      >{value}</div>
    },{
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      align: 'center',
      render: (value, record) => value === 1 ? '执行中' : '等待'
    }, 
    // {
    //   title: '操作',
    //   dataIndex: 'num',
    //   key: 'num',
    //   width: 150,
    //   align: 'center',
    //   render: (value, record, index) => <div className="table-click-text" onClick={() => this.openIssue(record)}>下发</div>
    // }
  ]

    const nowModelValue = runningModel?.energyUnitPowerValue || {};
    const isNotnew = Object.keys(nowModelValue).some(key => nowModelValue[key] !== undefined && nowModelValue[key] !== null)

    // console.log('nowModelValue', nowModelValue)
    // console.log(modelKey)

    return (
      <>
        <div className="strategy-info-crumbs">
          <Breadcrumb separator=">" style={{ color: "#acacac", height: 32, lineHeight: 1.5, display: 'inline-block' }}>
            {
              crumbs.map(item => (
                <Breadcrumb.Item>{item}</Breadcrumb.Item>
              ))
            }
          </Breadcrumb>
          {crumbs[1] !== '策略概览' || isShowParams ?
            <Button
              style={{ float: 'right' }}
              size="small"
              icon={<LeftOutlined />}
              onClick={() => this.resetState()}>返回</Button> : null}
        </div>
        <div className="strategy-info-box">
          {
            type ?
              (modelKey === 1 ? DISPATCH_MAP : STRATEGY_MAP)[type].component({
                energyUnitsList,
                record,
                todayParamList,
                todayParamLoading,
                searchTable: this.searchTable,
                updateControlParam: this.updateControlParam,
                searchChart: this.searchChart,
                strategyObj,
                planLineList,
                chargeValue,
                dischargeValue,
                openManualSetting: this.openManualSetting,
                onManualOk: this.onManualOk,
                onManualCancel: this.onManualCancel,
                planList,
                planObj,
                orderMap,
                socMap,
                controlMap,
                manualControlInit: this.manualControlInit,
                tabsChange: this.tabsChange,
                deletePlan: this.deletePlan
              })
              :
              isShowParams ?
                <StrategyParams
                  dataSource={strategyParamList}
                  loading={paramsLoading}
                  onCancle={() => {
                    this.setState({
                      crumbs: ['控制策略', '策略概览'],
                      isShowParams: false
                    })
                  }}
                  onSave={this.saveParams}
                />
                :
                <>
                  <div className="strategy-info-header">
                    <div className="strategy-info-header-left">
                      控制模式选择：
                      <Popconfirm overlayStyle={{ display: modelKey === 1 ? 'none' : undefined }} title="切换模式后将停止当前控制策略，确认切换吗？" placement="bottom" color="#313131" onConfirm={() => this.modelChange(1)}>
                        <Radio value={1} checked={modelKey === 1}>调度模式</Radio>
                      </Popconfirm>
                      <Popconfirm overlayStyle={{ display: modelKey === 2 ? 'none' : undefined }} title="切换模式后将停止当前控制策略，确认切换吗？" placement="bottom" color="#313131" onConfirm={() => this.modelChange(2)}>
                        <Radio value={2} checked={modelKey === 2}>手动模式</Radio>
                      </Popconfirm>
                      <Popconfirm overlayStyle={{ display: modelKey === 3 ? 'none' : undefined }} title="切换模式后将停止当前控制策略，确认切换吗？" placement="bottom" color="#313131" onConfirm={() => this.modelChange(3)}>
                        <Radio value={3} checked={modelKey === 3}>就地模式</Radio>
                      </Popconfirm>
                    </div>
                    <Button type="primary" onClick={this.openControl}>通用控制参数</Button>
                  </div>
                  <div className="strategy-info-body" style={{
                    padding: modelKey === 2 ? '0px' : '1%'
                  }}>
                    {
                      modelKey === 1 ? // 调度模式
                        <Table2
                          x={580}
                          loading={loading}
                          dataSource={
                            issueList
                          }
                          columns={dispatchColumns}
                          page={issuePage}
                          size={issueSize}
                          total={issueTotal}
                          onPageChange={this.onIssuePageChange}
                        />
                        :
                        modelKey === 2 ? // 手动模式
                          <div className="strategy-manual-box">
                            <div className="strategy-manual-header">
                              {
                                isNotnew ?
                                  <Popconfirm title="你确定要终止指令吗？" placement="bottom" color="#313131" onConfirm={() => this.clickThis(isNotnew)}>
                                    <Button type='danger'>指令终止</Button>
                                  </Popconfirm>
                                  :
                                  <Button type='primary' onClick={() => this.clickThis(isNotnew)}>发指令</Button>
                              }

                            </div>
                            <div className="strategy-manual-body">
                              {
                                isNotnew ? Object.keys(nowModelValue).map(key => (
                                  <div>
                                    {energyUnitsList.find(item => item.id === parseInt(key))?.title || '--'}有功功率指令：{nowModelValue[key] || 0}kW
                                  </div>
                                )) : null
                              }
                              {
                                isNotnew ?
                                  <Button
                                    type='primary'
                                    onClick={() => this.clickThisEdit()}>指令修改</Button> : null
                              }

                            </div>
                          </div>
                          : // 就地模式
                          <Table2
                            x={580}
                            loading={loading}
                            dataSource={
                              strategyInfoList
                            }
                            columns={columns}
                            page={strategyInfoPage}
                            size={strategyInfoSize}
                            total={strategyInfoTotal}
                            onPageChange={this.onPageChange}
                          />
                    }
                  </div>
                  <Modal
                    title={modalType === 1 ? '发指令' : modalType === 2 ? "指令修改" : modalType === 3 ? `下发指令“${issueRecord?.title}”` : `编辑策略“${record?.title}”` }
                    visible={visible}
                    wrapClassName="strategy-info-modal-box"
                    style={{ width: 417 }}
                    okText={modalType === 0 ? "保存" : '确定'}
                    onOk={this.saveForm}
                    onCancel={() => { this.setState({ visible: false }) }}
                  >
                    {
                      modalType === 0 ?
                        <Form
                          ref={form => this.formRef = form}
                          layout="vertical"
                        >
                          <Form.Item name="energyUnitId" label="适用对象" initialValue={record?.energyUnitId?.split(',') ? record?.energyUnitId?.split(',').map(item => parseInt(item)) : []} rules={[{ required: true, message: "请选择能量单元" }]}>
                            <Select
                              placeholder="请选择适用对象"
                              mode="multiple"
                              // checkAllText={utils.intl("全选")}
                              allowClear
                            >
                              {
                                energyUnitsList.map(item => (
                                  <Option value={item.id}>{item.title}</Option>
                                ))
                              }
                            </Select>
                          </Form.Item>
                        </Form>
                        :
                        modalType === 3 ? // 下发指令
                          <Form
                            ref={form => this.issueForm = form}
                            layout="vertical"
                          >
                            <Form.Item 
                            name={issueRecord?.type === 'ActivePower' ? 'activePower' : 'reactivePower'} 
                            label={issueRecord?.id === 6 ? "无功功率" : "有功功率"} 
                            rules={[
                              { required: true, message: `请输入${issueRecord?.id === 6 ? "无功功率" : "有功功率"}` },
                              { pattern: /^[-\+]?([0-9]+.?)?[0-9]{1,2}$/, message: '请输入合适的数字，最多保留2位有效数字' },

                            ]}>
                              <Input addonAfter={issueRecord?.id === 6 ? "kVarh" : "kW"} placeholder="请输入" />
                            </Form.Item>
                          </Form>
                          :
                          <Form
                            ref={form => this.orderForm = form}
                            layout="vertical"
                            initialValues={modalType === 2 ? nowModelValue : {}}
                          >
                            {
                              energyUnitsList.map(item => (
                                <Form.Item
                                  name={item.id}
                                  label={`${item.title}有功功率`}
                                  rules={[
                                    { required: true, message: `请输入${item.title}有功功率` },
                                    { pattern: /^[-\+]?([0-9]+.?)?[0-9]{1,2}$/, message: '请输入合适的数字，最多保留2位有效数字' },
                                    {
                                      validator: (_, value) => {
                                        if (parseFloat(value) !== NaN && parseFloat(value) >= parseFloat(((item.ratedPower || 0) * -1.5).toFixed(2)) && parseFloat(value) <= parseFloat(((item.ratedPower || 0) * 1.5).toFixed(2))) {
                                          return Promise.resolve()
                                        }
                                        return Promise.reject(`${item.title}有功功率的大小限制在[${((item.ratedPower || 0) * -1.5).toFixed(2)},${((item.ratedPower || 0) * 1.5).toFixed(2)}]之间`)
                                      }
                                    }
                                  ]}>
                                  <Input addonAfter="kW" placeholder="请输入" />
                                </Form.Item>
                              ))
                            }
                          </Form>
                    }
                  </Modal>
                </>
          }
        </div>
      </>
    );
  }
}

export default StrategyInfo;
