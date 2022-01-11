/** 运行监测 */
import React, { Component } from 'react'
import { GlobalState } from 'umi'
import { Table1, DatePicker, Tooltip, LineChart, AutoSizer, Empty, AnimationNumber, Select, Button, BarChart, message, MultiLineChart, FullLoading } from 'wanke-gui'
import { FullscreenExitOutlined, FullscreenOutlined, QuestionCircleOutlined, WankeCircleRightOutlined, WankeFullscreen2Outlined, WankeFullscreenOut2Outlined } from 'wanke-icon'
import Page from '../../components/Page'
import { CrumbsPortal } from '../../frameset/Crumbs'
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import PageProps from '../../interfaces/PageProps'
import utils from '../../public/js/utils'
import { numberToFixed, roundingNumber, triggerEvent } from '../../util/utils'
import { makeConnect } from '../umi.helper'
import _ from 'lodash'
import "./index.less"
import { modelNamespace, OperationMonitorManagement } from './model'
import { crumbsNS, Socket_Port } from '../constants'
import SocketHelper from '../socket.helper'
import classNames from 'classnames'
import moment, { Moment } from 'moment'
import * as echarts from "echarts";
import { AlarmLevel, getChartData, getEChartsData, GridConnectStatus, options, TextMapLoad, TextMapUpload, WorkStatus, weatherMap, dateMap, energyUnitTypeMap, energyUnitElectricMap, cardListFieldMap, WorkColorMap } from './dataCfg'
import { formatChartData, formatChartDataCumulative, oldFormatChartData, sortChartData } from '../page.helper'
import $ from 'jquery'
import { CrumbState } from '../../config-battery/models/crumbs'
import EnergyUnitPage from './EnergyUnitPage'
import { fillLabelAxisByRange } from '../../components/charts/common-echarts/calcOption/chartsTool'
import CardText from '../../components/CardText'

interface Props extends MakeConnectProps<OperationMonitorManagement>, OperationMonitorManagement, GlobalState, PageProps, CrumbState {
  selectedStationId: any
  stations: any[]
  theme: "light-theme" | "dark-theme",
  loading: boolean,
}
interface State {
  realSocketIsConnect: boolean,
  strategyInfo: any;
  isScreen1: boolean;
  isScreen2: boolean;
  isScreen3: boolean;
  activeDate: Moment;
  chargeDate: Moment;
  incomeDate: Moment;
  nowStation: null,
  runningTime: string,
  realSocketWeatherIsConnect: boolean;
  originCrumbs: any[];
  energyUnit: any;
  energyUnitIncomeDateType: "day" | "month" | "year";
  activePowerData: {
    xData: string[],
    yData: number[][],
    series: { name: string, unit: string }[]
  }
  energyUnitActivePowerData: {
    xData: string[],
    yData: number[][],
    series: { name: string, unit: string }[]
  }
  tableWsList: any[];
  cdType: any[];
  dateType: "day" | "month" | "year";
  incomeDateType: "day" | "month" | "year";
  filterCDData: {
    xData: string[];
    yData: number[][];
    series: { name: string; unit: string }[]
  };
  cdData: {
    xData: string[];
    yData: number[][];
    series: { name: string; unit: string }[]
  },
  energyUnitCDData: {
    xData: string[];
    yData: number[][];
    series: { name: string; unit: string }[]
  },
  energyUnitElectricCount: any;
  incomeData: {
    xData: string[];
    yData: number[][];
    series: { name: string; unit: string }[]
  },
  incomeCount: number,
  energyUnitIncomeData: {
    xData: string[];
    yData: number[][];
    series: { name: string; unit: string }[]
  },
  energyUnitIncomeCount: number,
  weather: any
  energyUnitDateType: "day" | "month" | "year";
}

const img_weather = [...Object.keys(weatherMap).map(key => <img src={weatherMap[key].img} />), '--']

const dateTypeToServer = {
  "day": "detail",
  "month": "day",
  "year": "month",
}

const socket_weather = new SocketHelper(modelNamespace, Socket_Port, '/station-monitoring')
const socket = new SocketHelper(modelNamespace, Socket_Port, "/microgrid-strategy", {}, {
  mergeConfig: {
    'message_activePower': {
      mergeFn: mergeMicrogridCurve,
      defaultValue: []
    },
    'power_and_irradiance': {
      mergeFn: mergeEnergyPower,
    }
  },
  loadingEventNameMap: {
    'message_activePower': 'getActivePower',
    'message_cd': 'getChargeOrDischarge',
    'message_microgridList': 'getMicrogridList',
    'profit': 'profit',
    'power_and_irradiance': 'power_and_irradiance',
    'electric': 'electric',
    'energy_units_profit': 'energy_units_profit',
  }
});

function mergeMicrogridCurve(prevData, nextData) {
  return nextData.map((item, index) => {
    const res = {
      ...item
    }

    const prev = prevData[index]
    if (prev && prev.val) {
      res.val = (prev.val).concat(res.val || [])
    }
    return res
  })
}

function mergeEnergyPower(prevData, nextData) {
  const { results } = nextData
  if (prevData && prevData.results) {
    nextData.results = Object.keys(results).reduce((pre, key) => ({
      ...pre,
      [key]: results[key].concat(prevData.results?.[key] || []),
    }), {})
  }
  return nextData
}


// const colorList = ["#6397FF", "#42CECE", "#FA9B14", "#F0D200", "rgba(99,151,255,0.35)", "rgba(66,206,206,0.35)", "rgba(250,155,20,0.35)", "rgba(240,210,0,0.35)"]

const colorList = [
  '#0062ff', '#3dd598', '#ffb076', '#fc5a5a', '#a461d8', '#50b5ff', '#ff9ad5', '#ffc542', '#61a0a8', '#d48265',
  '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'
]


const emphasisStyle = {
  itemStyle: {
    shadowBlur: 10,
    shadowColor: 'rgba(0,0,0,0.3)'
  }
};

const commonStyle = {
  barWidth: '15%',
}

@makeConnect(
  modelNamespace,
  (batteryOperationState: any, getLoading: any, state: any) => {
    return {
      ...state[modelNamespace],
      // stationId: state.global.stationId,
      theme: state.global.theme,
      selectedStationId: state.global.selectedStationId,
      stations: state.global.stationList,
      crumbs: state[crumbsNS].crumbs,
      // energyList: state.global.energyList,
      loading: getLoading("getTableList"),
      // saveBatteriesLoading: getLoading("saveBatteries")
    };
  }
)
class Index extends Component<Props, State> {

  myChartsDom: any;
  myCharts: any;
  activePowerMessage: any; // 原始数据累计
  cdMessage: any;
  lineCharts: any;
  incomeData: any = {
    xData: [],
    yData: [],
    series: [{ name: utils.intl('收支'), unit: utils.intl('元') }]
  }
  energyUnitIncomeData: any = {
    xData: [],
    yData: [],
    series: [{ name: utils.intl('收支'), unit: utils.intl('元') }]
  }

  state: State = {
    realSocketIsConnect: false,
    realSocketWeatherIsConnect: false,
    strategyInfo: {
      title: utils.intl('园区微网削峰策略'),
      startTime: "",
      continueTime: "",
    },
    isScreen1: false,
    isScreen2: false,
    isScreen3: false,
    activeDate: moment(),
    chargeDate: moment(),
    runningTime: '--',
    cdType: [],
    dateType: "day",
    energyUnitIncomeDateType: "day",
    originCrumbs: [],
    energyUnit: null, // 当前的能量单元
    activePowerData: {
      xData: [],
      yData: [],
      series: []
    },
    energyUnitActivePowerData: {
      xData: [],
      yData: [],
      series: []
    },
    energyUnitElectricCount: {},
    cdData: {
      xData: [],
      yData: [],
      series: [],
    },
    energyUnitCDData: {
      xData: [],
      yData: [],
      series: []
    },
    weather: {},
    tableWsList: [],
    incomeDate: moment(),
    incomeData: {
      xData: [],
      yData: [],
      series: [{ name: utils.intl('收支'), unit: utils.intl('元') }]
    },
    incomeDateType: "day",
    incomeCount: 0,
    energyUnitIncomeData: {
      xData: [],
      yData: [],
      series: [{ name: utils.intl('收支'), unit: utils.intl('元') }]
    },
    energyUnitIncomeCount: 0,
    energyUnitDateType: "day",
  }

  componentDidMount() {
    // console.log('this.props.crumbs', this.props.crumbs)
    this.setState({ originCrumbs: this.props.crumbs }) // 记录原始的父页面面包屑数据
    this.props.dispatch({ type: `${crumbsNS}/_changeIsHideCalBack`, isHideCalBack: true })
    if (this.props.selectedStationId) {
      this.props.action('getTableList', { stationId: this.props.selectedStationId })
      const productionTime = this.props.stations?.find(station => station.id === this.props.selectedStationId)?.productionTime

      // TODO: 临时添加策略
      const { strategyInfo } = this.state
      strategyInfo.startTime = productionTime
      strategyInfo.continueTime = `${moment(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD 00:00:00').diff(moment(productionTime, 'YYYY-MM-DD 00:00:00'), 'days') + 1}${utils.intl('天')}`

      this.getRunStrategy();
      this.getWeather();
      this.setState({ runningTime: productionTime ? `${moment(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD 00:00:00').diff(moment(productionTime, 'YYYY-MM-DD 00:00:00'), 'days') + 1}` : '--', strategyInfo })
    }
    this.initEcharts();
  }

  componentDidUpdate(preProps, preState) {
    if (!_.isEqual(preProps.selectedStationId, this.props.selectedStationId)) {
      this.props.action('getTableList', { stationId: this.props.selectedStationId })
      const productionTime = this.props.stations?.find(station => station.id === this.props.selectedStationId)?.productionTime
      this.setState({
        runningTime: productionTime ? `${moment(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD 00:00:00').diff(moment(productionTime, 'YYYY-MM-DD 00:00:00'), 'days') + 1}` : '--',
        activePowerData: {
          xData: [],
          yData: [],
          series: []
        }, cdData: {
          xData: [],
          yData: [],
          series: [],
        },
        weather: {},
        tableWsList: [],
        incomeData: {
          xData: [],
          yData: [],
          series: [{ name: utils.intl('收支'), unit: utils.intl('元') }]
        },
        incomeCount: 0
      })
      this.getRunStrategy();
      this.getWeather();
      // socket.emit("getStrategy", { stationId: this.props.selectedStationId }) // websocket 获取热力图的温度详情(电池工况)
      // socket.emit("getActivePower", { stationId: this.props.selectedStationId, date: this.state.activeDate.format('YYYY-MM-DD') })
      // socket.emit("getChargeOrDischarge", { stationId: this.props.selectedStationId, date: this.state.chargeDate.format('YYYY-MM-DD') })
    }

    if (preState.activeDate.format('YYYY-MM-DD') !== this.state.activeDate.format('YYYY-MM-DD')) {
      socket.emit("getActivePower", { stationId: this.props.selectedStationId, date: this.state.activeDate.format('YYYY-MM-DD') })
    }

    if (preState.chargeDate.format('YYYY-MM-DD') !== this.state.chargeDate.format('YYYY-MM-DD')) {
      socket.emit("getChargeOrDischarge", { stationId: this.props.selectedStationId, date: this.state.chargeDate.format('YYYY-MM-DD') })
    }

    if (preProps.theme !== this.props.theme) {
      this.myCharts.setOption(options[this.props.theme])
    }

    if (!_.isEqual(preState.cdData, this.state.cdData) || !_.isEqual(this.state.cdType, preState.cdType)) {
      this.initEcharts();
    }

    if (!_.isEqual(preProps.tableList, this.props.tableList) && this.props.tableList?.length) {
      this.setState({ cdType: [`${this.props.tableList[this.props.tableList.length - 1].id}`], tableWsList: this.mergeTableList([]) });
      // this.getRunStrategy();
    }

    if (!_.isEqual(this.props.crumbs, preProps.crumbs)) {
      this.setState({ originCrumbs: this.props.crumbs })
    }
  }

  // websocket获取当前执行策略
  getRunStrategy = () => {
    const { selectedStationId, dispatch } = this.props
    // this.setState({ strategyInfo: null })
    if (this.state.realSocketIsConnect) {
      const { activeDate, chargeDate, dateType, incomeDate } = this.state
      socket.emit("getStrategy", { stationId: selectedStationId }) // websocket 获取热力图的温度详情(电池工况)
      socket.emit("getActivePower", { stationId: selectedStationId, date: activeDate.format('YYYY-MM-DD') })
      socket.emit("getChargeOrDischarge", { stationId: selectedStationId, date: chargeDate.format('YYYY-MM-DD') })
      socket.emit("getMicrogridList", { stationId: selectedStationId })
      // 收支曲线
      socket.emit("profit", { stationId: selectedStationId, mod: dateTypeToServer[this.state.incomeDateType], date: incomeDate.format(this.state.incomeDateType === 'day' ? 'YYYY-MM-DD' : this.state.incomeDateType === 'month' ? 'YYYY-MM' : 'YYYY') })
    } else {
      socket.start(
        dispatch,
        {},
        {
          connect: () => {
            const { activeDate, chargeDate, dateType, incomeDate } = this.state
            this.setState({ realSocketIsConnect: true })
            socket.emit("getStrategy", { stationId: selectedStationId })
            socket.emit("getActivePower", { stationId: selectedStationId, date: activeDate.format('YYYY-MM-DD') })
            socket.emit("getChargeOrDischarge", { stationId: selectedStationId, date: chargeDate.format('YYYY-MM-DD') })
            socket.emit("getMicrogridList", { stationId: selectedStationId })
            // 收支曲线
            socket.emit("profit", { stationId: selectedStationId, mod: dateTypeToServer[this.state.incomeDateType], date: incomeDate.format(this.state.incomeDateType === 'day' ? 'YYYY-MM-DD' : this.state.incomeDateType === 'month' ? 'YYYY-MM' : 'YYYY') })
          },
          message_strategy: (message: any) => {
            // 获取当前策略状态
            if (!message?.errorCode) {
              this.setState({ strategyInfo: { ...(this.state.strategyInfo || {}), ...message } });
            }
          },
          message_activePower: (message: any) => {
            const { activeDate, chargeDate, dateType, incomeDate } = this.state
            // 获取功率曲线
            const activePowerData = getChartData(message, activeDate, this.state.activePowerData?.yData || [], this.state.activePowerData?.xData || []);
            activePowerData.series = activePowerData.series?.map(i => ({ ...i, name: utils.intl(i.name) })) || []
            this.setState({ activePowerData: activePowerData });
          },
          message_cd: (message: any) => {
            // 获取电量图表
            const { chargeDate, cdData } = this.state
            this.setState({ cdData: getEChartsData(message, chargeDate) });
          },
          message_microgridList: (message: any) => { // 表格websocket
            this.setState({ tableWsList: this.mergeTableList(message) })
          },
          profit: (message: any) => { // 收支曲线
            const { incomeDateType } = this.state
            const incomeData =
              // incomeDateType === 'day' ? sortChartData(formatChartDataCumulative(
              //   // this.state.incomeData,
              // {
              //   xData: [], 
              //   yData: [], 
              //   series: [{ name: utils.intl('收支'), unit: utils.intl('元') }]
              // }, 
              // message.results, ["profit"]))
              // : 
              sortChartData(formatChartData(this.incomeData, message.results, ["profit"]));
            this.incomeData = _.cloneDeep(incomeData);
            const dayIncomeYData = []
            let number1 = null;
            const incomeCount = roundingNumber((incomeData.yData || []).reduce((pre, num) => {
              if (Array.isArray(num)) {
                return pre + num.reduce((p, n) => {
                  const yData = n && n.value ? roundingNumber(Number(n.value)) : Number.isFinite(n) ? roundingNumber(Number(n)) : null;
                  if (yData || yData === 0) {
                    number1 = yData + p
                  }
                  dayIncomeYData.push(yData || yData === 0 ? roundingNumber(yData + p) : roundingNumber(number1));
                  return incomeDateType === 'day' ? (yData ?? 0) + p : n && (n.value || n.value === 0) ? p + (n.value ?? 0) : Number.isFinite(n) ? p + n : 0
                }, 0)
              }
              return pre + (num ?? 0)
            }, 0))

            // console.log('incomeCount', _.cloneDeep(incomeData.yData), dayIncomeYData)

            // incomeDateType 月维度和年维度为柱状图需要补点
            if (incomeDateType !== 'day') {
              // const date = incomeData.xData[0]
              // const { startTime, endTime } = this.getTimeXDataRange(moment(date, 'YYYY-MM-DD HH:mm:ss'), incomeDateType)
              // const xData = fillLabelAxisByRange({
              //   startTime,
              //   endTime,
              //   stepType: incomeDateType === 'month' ? 'day' : 'month',
              //   step: 1,
              //   formater: 'YYYY-MM-DD HH:mm:ss'
              // })
              // const dataMap = []
              // incomeData.yData.forEach((item, index) => {
              //   const m = {}
              //   item.forEach((is, i) => {
              //     m[incomeData.xData[i]] = is
              //   })
              //   dataMap[index] = m
              // })

              // incomeData.yData = incomeData.yData.map((yd, i) => {
              //   return xData.map(x => {
              //     return dataMap[i]?.[x] && (dataMap[i]?.[x].value || dataMap[i]?.[x].value === 0) ? roundingNumber(dataMap[i]?.[x].value) : dataMap[i]?.[x] && !dataMap[i]?.[x].value ? null : dataMap[i]?.[x] ? roundingNumber(dataMap[i]?.[x]) : null
              //   })
              // })
              // incomeData.xData = xData
            }
            else { // 按日维度的数据
              incomeData.yData = [dayIncomeYData]
            }

            this.setState({ incomeData, incomeCount: incomeCount ? Number(incomeCount.toFixed(2)) : 0 }, () => {
              triggerEvent('resize', window);
            })
          },
          power_and_irradiance: (message: any) => { // 能量单元功率曲线
            const { energyUnitActivePowerData, energyUnit } = this.state
            energyUnitActivePowerData.series = energyUnit?.type === "Solar" ? [
              { name: utils.intl('实时功率'), unit: "kW" },
              { name: utils.intl('辐照强度'), unit: "W/m²" },
            ] : [{ name: utils.intl('实时功率'), unit: "kW" }];

            // console.log('power', message.results["power"].map(i => i.val))

            const powerData = sortChartData(formatChartData(energyUnitActivePowerData, message.results, energyUnit?.type === "Solar" ? ["power", "irradiance"] : ["power"]))
            let num = null
            powerData.yData = powerData.yData.map(items => {
              num = null
              return items.map(i => {
                if (i && !i.flag) {
                  if (i.value || i.value === 0 || typeof (i) == "number") {
                    num = roundingNumber(i.value ?? i);
                  }
                  if (typeof i === 'object') {
                    return { value: i.value || i.value === 0 ? roundingNumber(i.value) : num, flag: i.flag }
                  } else {
                    return i || i === 0 ? roundingNumber(i) : num
                  }
                } else {
                  if (i !== null && i !== undefined) num = { ...i, value: roundingNumber(i.value !== undefined ? i.value : i) }
                  return i ? { ...i, value: roundingNumber(i.value !== undefined ? i.value : i) } : num
                }
              })
            })

            this.setState({ energyUnitActivePowerData: powerData })
          },
          electric: (message: any) => { // 能量单元电量报表
            const { energyUnitCDData, energyUnit, energyUnitDateType } = this.state
            const keys = Object.keys(message.results).filter(key => energyUnitElectricMap[`${energyUnit?.type}_${key}_count`])
            energyUnitCDData.series = keys.map(key => ({ name: energyUnitElectricMap[`${energyUnit?.type}_${key}`], unit: "kWh" }))
            const newEnergyUnitCDData = sortChartData(formatChartData(energyUnitCDData, message.results, keys))

            // 补点
            const date = newEnergyUnitCDData.xData[0]
            const { startTime, endTime } = this.getTimeXDataRange(moment(date, 'YYYY-MM-DD HH:mm:ss'), energyUnitDateType)

            const dataMap = []
            newEnergyUnitCDData.yData.forEach((item, index) => {
              const m = {}
              item.forEach((is, i) => {
                m[newEnergyUnitCDData.xData[i]] = is
              })
              dataMap[index] = m
            })

            const xData = fillLabelAxisByRange({
              startTime,
              endTime,
              stepType: energyUnitDateType === 'day' ? 'minutes' : energyUnitDateType === 'month' ? 'day' : 'month',
              step: energyUnitDateType === 'day' ? 15 : 1,
              formater: 'YYYY-MM-DD HH:mm:ss'
            })

            let energyUnitElectricCount = {};

            newEnergyUnitCDData.yData = newEnergyUnitCDData.yData.map((yd, i) => {
              return xData.map(x => {
                // energyUnitElectricCount[`${energyUnit?.type}_${keys[i]}_count`] = 
                // (energyUnitElectricCount[`${energyUnit?.type}_${keys[i]}_count`] || 0) + (dataMap[i]?.[x].value ?? 0);
                return dataMap[i]?.[x] ? { ...dataMap[i]?.[x], value: roundingNumber(dataMap[i]?.[x].value), v: dataMap[i]?.[x].value } : null
              })


            })

            newEnergyUnitCDData.xData = xData

            // Object.keys(energyUnitElectricCount).forEach(k => { energyUnitElectricCount[k] = roundingNumber(energyUnitElectricCount[k]) })
            keys.forEach((key, index) => {
              energyUnitElectricCount[`${energyUnit?.type}_${key}_count`] = roundingNumber((newEnergyUnitCDData.yData?.[index] || []).reduce((pre, num) => {
                if (Array.isArray(num)) {
                  return pre + num.reduce((p, n) => n && n.v ? p + (Number(n.v) ?? 0) : 0, 0)
                }
                return num && num.v ? pre + num.v : pre
              }, 0))
            })

            this.setState({ energyUnitCDData: newEnergyUnitCDData, energyUnitElectricCount })
          },
          energy_units_profit: (message: any) => { // 能量单元收支曲线
            const { energyUnitIncomeDateType } = this.state
            const energyUnitIncomeData = energyUnitIncomeDateType === 'day' ? sortChartData(formatChartDataCumulative(this.energyUnitIncomeData, message.results, ["profit"]))
              :
              sortChartData(formatChartData(this.energyUnitIncomeData, message.results, ["profit"]))
            const dayIncomeYData = []
            // console.log('energyUnitIncomeData', energyUnitIncomeData)
            this.energyUnitIncomeData = _.cloneDeep(energyUnitIncomeData);
            // console.log('energyUnitIncomeData.yData', energyUnitIncomeData.yData)
            const energyUnitIncomeCount = roundingNumber((energyUnitIncomeData.yData || []).reduce((pre, num) => {
              if (Array.isArray(num)) {
                return pre + num.reduce((p, n) => {
                  // dayIncomeYData.push(roundingNumber(p + (Number(n) ?? 0)))
                  dayIncomeYData.push(n && (n?.value || n?.value === 0) ? roundingNumber(p + (Number(n.value) ?? 0)) : roundingNumber(p + (Number(n) ?? 0)))
                  return p + (n?.value ?? n ?? 0)
                }, 0)
              }
              // console.log('num.value', num.value)
              return pre + (Number(num.value ?? num) ?? 0)
            }, 0))

            // energyUnitIncomeDateType 月维度和年维度为柱状图需要补点
            if (energyUnitIncomeDateType !== 'day') {
              const date = energyUnitIncomeData.xData[0]
              const { startTime, endTime } = this.getTimeXDataRange(moment(date, 'YYYY-MM-DD HH:mm:ss'), energyUnitIncomeDateType)
              const xData = fillLabelAxisByRange({
                startTime,
                endTime,
                stepType: energyUnitIncomeDateType === 'month' ? 'day' : 'month',
                step: 1,
                formater: 'YYYY-MM-DD HH:mm:ss'
              })

              const dataMap = []
              energyUnitIncomeData.yData.forEach((item, index) => {
                const m = {}
                item.forEach((is, i) => {
                  m[energyUnitIncomeData.xData[i]] = is
                })
                dataMap[index] = m
              })

              energyUnitIncomeData.yData = energyUnitIncomeData.yData.map((yd, i) => {
                return xData.map(x => {
                  // console.log('1', dataMap[i])
                  return dataMap[i]?.[x] && (dataMap[i]?.[x].value || dataMap[i]?.[x].value === 0) ? roundingNumber(dataMap[i]?.[x].value) : dataMap[i]?.[x] ? roundingNumber(dataMap[i]?.[x] ?? 0) : null
                })
              })
              energyUnitIncomeData.xData = xData
            } else {
              energyUnitIncomeData.yData = [dayIncomeYData]
            }

            this.setState({ energyUnitIncomeData, energyUnitIncomeCount })
          },
          'socketLoadingChange': (socketLoading) => {
            dispatch({ type: `${modelNamespace}/updateToView`, payload: { socketLoading } });
          },
        }
      );
    }
  }



  getTimeXDataRange = (date, dateType) => {
    const results = {
      startTime: null,
      endTime: null,
    }
    if (dateType === 'day') {
      results.startTime = `${date.format('YYYY-MM-DD')} 00:00:00`
      results.endTime = `${date.format('YYYY-MM-DD')} 23:59:59`
    } else if (dateType === 'month') {
      results.startTime = date.startOf(dateType).format('YYYY-MM-DD 00:00:00')
      results.endTime = date.endOf(dateType).format('YYYY-MM-DD 00:00:00')
    } else {
      results.startTime = date.startOf(dateType).format('YYYY-MM-01 00:00:00')
      results.endTime = date.endOf(dateType).format('YYYY-MM-01 00:00:00')
    }

    return results

  }


  mergeTableList = (message) => {
    const { tableList } = this.props
    const { tableWsList } = this.state
    if (tableWsList?.length > 0) {
      return tableWsList.map(item => {
        const { id } = item
        return {
          ...item,
          ..._.pickBy(message.find(i => i.id === id) || {}, (val, key) => val !== undefined),
          // type: tableList?.find(item => item.id === id)?.type,
        }
      })
    }

    return message

  }

  // 获取天气
  getWeather = () => {
    const { selectedStationId, dispatch } = this.props
    this.setState({ weather: {} })
    if (this.state.realSocketWeatherIsConnect) {
      socket_weather.emit("summary", { stationId: selectedStationId }) // websocket 获取热力图的温度详情(电池工况)
      socket_weather.emit("weather", { stationId: selectedStationId }) // websocket 获取热力图的温度详情(电池工况)
    } else {
      socket_weather.start(
        dispatch,
        {},
        {
          connect: () => {
            this.setState({ realSocketWeatherIsConnect: true })
            socket_weather.emit("summary", { stationId: selectedStationId })
            socket_weather.emit("weather", { stationId: selectedStationId })
          },
          summary: (message: any) => {
            // 获取当前策略状态
            this.setState({ weather: { ...this.state.weather, ...(message?.results || {}) } });
          },
          weather: (message: any) => {
            const { weather } = message?.results || {}
            // 获取当前策略状态
            this.setState({ weather: { ...this.state.weather, weather } });
          },
        }
      );
    }
  }

  initEcharts = () => {
    const { theme, tableList = [] } = this.props
    const { cdType } = this.state
    let { xData, yData, series } = this.state.cdData

    const yDataIndex = []
    series = series.filter((i, ind) => {
      if (cdType.indexOf(`${i.id}`) > -1) {
        yDataIndex.push(ind)
      }
      return cdType.indexOf(`${i.id}`) > -1
    })
    this.clearDom()
    $(this.myChartsDom).append("<div style='width: 100%; height: 100%'></div>")
    // var xAxisData = new Array(10).fill(0).map((item, index) => `class ${index}`);
    const legendData = tableList.filter(i => cdType.indexOf(`${i.id}`) > -1).map(item => utils.intl(item.title))
    const nameColorMap = {}
    for (let i = 0; i < legendData.length; i++) {
      nameColorMap[legendData[i]] = colorList[i]
    }

    const seriesYData = series.map((se, i) => ({ ...se, yData: yData[yDataIndex[i]] }))

    const seriesData = []

    tableList.forEach((item, index) => {
      const { title, energyUnitType } = item
      if (energyUnitType?.name === 'Storage' || !energyUnitType) { // 储能单元或者电网
        const ses = seriesYData.filter(se => utils.intl(se.name) === utils.intl(title))
        if (ses.length === 2) { //
          for (let ii = 0; ii < ses.length; ii++) {
            seriesData.push(
              {
                name: utils.intl(title),
                type: 'bar',
                stack: 'one',
                emphasis: emphasisStyle,
                data: ses[ii].yData,
                itemStyle: {
                  color: nameColorMap[utils.intl(title)]
                },
                ...commonStyle
              }
            )
          }
        } else if (ses.length === 1) { // 
          seriesData.push({
            name: utils.intl(title),
            type: 'bar',
            stack: 'one',
            emphasis: emphasisStyle,
            data: ses[0].yData,
            itemStyle: {
              color: nameColorMap[title]
            },
            ...commonStyle
          })
          const isTrue = ses[0].yData.find(ii => Object.is(0, ii) || ii > 0) // 是否是正的
          seriesData.push({
            name: utils.intl(title),
            type: 'bar',
            stack: 'one',
            isTrue,
            emphasis: emphasisStyle,
            data: new Array(yData[0]?.length).fill(null),
            itemStyle: {
              color: nameColorMap[title]
            },
            ...commonStyle
          })
        } else {
          seriesData.push({
            name: utils.intl(title),
            type: 'bar',
            stack: 'one',
            isTrue: true,
            emphasis: emphasisStyle,
            data: new Array(yData[0]?.length).fill(null),
            itemStyle: {
              color: nameColorMap[title]
            },
            ...commonStyle
          })
          seriesData.push({
            name: utils.intl(title),
            type: 'bar',
            stack: 'one',
            isTrue: false,
            emphasis: emphasisStyle,
            data: new Array(yData[0]?.length).fill(null),
            itemStyle: {
              color: nameColorMap[title]
            },
            ...commonStyle
          })
        }
      } else {
        const ii = seriesYData.findIndex(se => se.name === title)
        if (ii > -1) {
          seriesData.push({
            name: utils.intl(title),
            type: 'bar',
            stack: 'one',
            isTrue: false,
            emphasis: emphasisStyle,
            data: seriesYData[ii]?.yData || [],
            itemStyle: {
              color: nameColorMap[title]
            },
            ...commonStyle
          })
        } else {
          seriesData.push({
            name: utils.intl(title),
            type: 'bar',
            stack: 'one',
            isTrue: energyUnitType?.name === 'Load',
            emphasis: emphasisStyle,
            data: seriesYData[ii]?.yData || [],
            itemStyle: {
              color: nameColorMap[title]
            },
            ...commonStyle
          })
        }
      }
    })

    if (this.myChartsDom) {
      this.myCharts = echarts.init(this.myChartsDom.firstChild as HTMLDivElement);

      this.myCharts.setOption({
        legend: {
          data: legendData,
          right: '5%',
          ...(options[theme || 'light-theme']?.legend || {})
        },
        grid: {
          left: 60,
          right: 60,
          top: 40,
          bottom: 30,
        },
        tooltip: {
          trigger: "axis",
          borderWidth: 0,
          axisPointer: {
            type: "shadow",
            shadowStyle: {
              color: "rgba(61,126,255,0.05)"
            }
          },
          formatter: (params) => {
            // console.log('params', params)
            return `
                  ${params[0].axisValue}<br/>
                  ${utils.intl('发/放电量')}<br/>
                  ${params.filter(item => Object.is(0, item.data) || item.data > 0).map((item) => {
              return `${item.marker}${item.seriesName}:${item.data}kWh`
            }).join('<br/>')}
                  <br/>${utils.intl('充/用电量')}<br/>
                  ${params.filter(item => Object.is(-0, item.data) || item.data < 0).map((item) => {
              return `${item.marker}${item.seriesName}:${Math.abs(item.data)}kWh`
            }).join('<br/>')}
                  `
          }
        },
        xAxis: {
          ...(options[theme || 'light-theme']?.xAxis || {}),
          data: xData.map(item => item.substring(11)),
        },
        yAxis: {
          ...(options[theme || 'light-theme']?.yAxis || {}),
          name: 'kWh',
        },
        series: seriesData
      })

      window.onresize = this.myCharts.resize
    }
  }

  clearDom = () => {
    if (this.myCharts) this.myCharts.dispose();
    $(this.myChartsDom).empty();
  }

  formatChartDataByList = (curData, attrList, fields) => {
    let data = curData;
    for (let i = 0; i < attrList?.length; i++) {
      const { val } = attrList[i]
      if (val && val.length) data = formatChartData(data, val, fields)
    }
    return data
  }

  formatEChartDataByList = (curData, attrData, fields) => {
    let data = curData;
    const { ChargeDetail = [], DischargeDetail = [] } = attrData
    const mergeDetail = [...ChargeDetail, ...DischargeDetail]
    for (let i = 0; i < mergeDetail.length; i++) {
      const { val } = mergeDetail[i]
      for (let j = 0; j < val.length; j++) {
        val[j] = { ...val[j], val: i < ChargeDetail.length ? -Math.abs(val[j].val) : Math.abs(val[j].val) }
      }
      data = formatChartData(data, val, fields)
    }

    return data
  }

  // 切换到能量单元详情页面
  openEnergyUnitPage = (record) => {
    const { tableList, selectedStationId, stations, dispatch } = this.props
    const { originCrumbs } = this.state
    const energyUnit = tableList.find(item => item.id === record.id)
    const station = stations.find(item => item.id === selectedStationId)
    // console.log('record', originCrumbs)
    const newCrumbs = [
      ...(originCrumbs || []),
      { pageId: originCrumbs.length + 1, pageTitle: station.title, url: "" },
      { pageId: originCrumbs.length + 2, pageTitle: energyUnitTypeMap[energyUnit?.type], url: "" },
      // { pageId: 3, pageTitle: energyUnitTypeMap[energyUnit?.type], url: "" }
    ];

    dispatch({ type: `${crumbsNS}/_updateCrumbs`, newCrumbs })
    const energyUnitDateType = energyUnit?.type === 'Storage' ? 'month' : 'day'
    this.setState({ energyUnit, energyUnitDateType })

    // 能量单元功率曲线、电量报表、收支websocket查询
    this.energyUnitIncomeData = {
      xData: [],
      yData: [],
      series: [{ name: utils.intl('收支'), unit: utils.intl('元') }]
    };
    this.setState({ energyUnitIncomeDateType: 'day' }, () => {
      socket.emit("power_and_irradiance", { stationId: selectedStationId, energyUnitTypeName: energyUnit?.type, date: moment().format('YYYY-MM-DD') })
      socket.emit("electric", { stationId: selectedStationId, energyUnitTypeName: energyUnit?.type, mod: dateTypeToServer[energyUnitDateType], date: moment().format(energyUnitDateType === 'day' ? 'YYYY-MM-DD' : 'YYYY-MM') })
      socket.emit("energy_units_profit", { stationId: selectedStationId, energyUnitTypeName: energyUnit?.type, selfUse: true, mod: dateTypeToServer["day"], date: moment().format('YYYY-MM-DD') })
    })
  }

  // 重置能量单元所有数据
  resetEnergyUnitData = () => {
    this.setState({
      energyUnitActivePowerData: {
        xData: [],
        yData: [],
        series: []
      },
      energyUnitElectricCount: {},
      energyUnitCDData: {
        xData: [],
        yData: [],
        series: []
      },
      energyUnitIncomeData: {
        xData: [],
        yData: [],
        series: [{ name: utils.intl('收支'), unit: utils.intl('元') }]
      },
      energyUnitIncomeCount: 0,
    })
  }

  // 页面返回到电站
  callBackPage = () => {
    const { dispatch, selectedStationId } = this.props
    const { originCrumbs, chargeDate } = this.state
    dispatch({ type: `${crumbsNS}/_updateCrumbs`, newCrumbs: originCrumbs.filter((_, i) => i < 2) })
    this.setState({
      energyUnit: null,
      cdData: {
        xData: [],
        yData: [],
        series: [],
      }
    })

    this.resetEnergyUnitData();

    // 重新获取电站电量图表数据
    socket.emit("getChargeOrDischarge", { stationId: selectedStationId, date: chargeDate.format('YYYY-MM-DD') })
  }

  // 能量单元选择功率曲线
  energyUnitChangeActivePower = date => {
    const { selectedStationId } = this.props
    const { energyUnit } = this.state
    // this.setState({ energyUnitActivePowerData: { series: [], xData: [], yData: [] } })
    socket.emit("power_and_irradiance", { stationId: selectedStationId, energyUnitTypeName: energyUnit?.type, date: date.format('YYYY-MM-DD') })
  }

  energyUnitChangeElectric = (dateType, date) => {
    const { selectedStationId } = this.props
    const { energyUnit } = this.state
    this.setState({ energyUnitDateType: dateType })
    socket.emit("electric", { stationId: selectedStationId, energyUnitTypeName: energyUnit?.type, mod: dateTypeToServer[dateType], date: date.format(dateType === 'day' ? 'YYYY-MM-DD' : dateType === 'month' ? 'YYYY-MM' : 'YYYY') })
  }

  energyUnitChangeIncome = (selfUse, dateType, date) => {
    const { selectedStationId } = this.props
    const { energyUnit } = this.state
    this.setState({ energyUnitIncomeDateType: dateType, energyUnitIncomeCount: 0, energyUnitIncomeData: { series: [{ name: "收支", unit: "元" }], xData: [], yData: [] } })
    this.energyUnitIncomeData = {
      xData: [],
      yData: [],
      series: [{ name: utils.intl('收支'), unit: utils.intl('元') }]
    };
    // this.setState({ energyUnitIncomeCount: 0, energyUnitIncomeData: { series: [{ name: "收支", unit: "元" }], xData: [], yData: [] } })
    socket.emit("energy_units_profit", { stationId: selectedStationId, energyUnitTypeName: energyUnit?.type, selfUse, mod: dateTypeToServer[dateType], date: date.format(dateType === 'day' ? 'YYYY-MM-DD' : dateType === 'month' ? 'YYYY-MM' : 'YYYY') })
  }

  // 风向转换
  transformWeather = (wd) => {

    if (wd) {
      const windDirection = Number(wd.substr(0, wd.length - 1));
      if (windDirection > 6 && windDirection < 84) return utils.intl('东北风')
      else if (windDirection >= 84 && windDirection <= 96) return utils.intl('东风')
      else if (windDirection > 96 && windDirection < 174) return utils.intl('东南风')
      else if (windDirection >= 174 && windDirection <= 186) return utils.intl('南风')
      else if (windDirection > 186 && windDirection < 264) return utils.intl('西南风')
      else if (windDirection >= 264 && windDirection <= 276) return utils.intl('西风')
      else if (windDirection > 276 && windDirection < 354) return utils.intl('西北风')
      else return utils.intl('北风')
    }
    return '--'
  }

  render() {
    const { pageId, theme, tableList, loading, stations, selectedStationId } = this.props
    const { strategyInfo, isScreen1, isScreen2, activePowerData, activeDate, chargeDate, cdData, runningTime, weather, tableWsList, cdType, dateType, isScreen3, energyUnit, incomeDate, incomeData, incomeCount, energyUnitIncomeCount, energyUnitIncomeData, incomeDateType } = this.state
    // console.log('tableWsList', tableWsList)
    const columns = [
      // {
      //   title: utils.intl('序号'), dataIndex: 'num', width: 65
      // },
      {
        title: utils.intl('设备对象'), dataIndex: 'title', width: 180, render: (text, record) => record.title !== "电网" ? <div style={{ cursor: "pointer", color: "#177ddc" }} onClick={() => this.openEnergyUnitPage(record)}>{text}</div> : utils.intl(text),
      }, {
        title: utils.intl('健康状态'), dataIndex: 'HealthStatus', width: 120, render: (text, record) => record.title !== '电网' ? AlarmLevel[text] ?? utils.intl('正常') : utils.intl('正常')
      }, {
        title: utils.intl('运行状态'), dataIndex: 'WorkStatus', width: 120, render: (text, record) => record.title !== '电网' ? WorkStatus[text] ?? '--' : record.ActivePower > 0 ? utils.intl('用电中') : record.ActivePower < 0 ? utils.intl('倒送中') : utils.intl('发用平衡')
      }, {
        title: `${utils.intl('实时功率')}(kW)`, dataIndex: 'ActivePower', width: 160, render: text => numberToFixed(text) ?? '--',
      }, {
        title: utils.intl('当日告警(条)'), dataIndex: 'alarmCount', width: 160, render: (text, record) => record.title !== '电网' ? numberToFixed(text) ?? (record.energyUnitType ? 0 : 0) : 0,
      }, {
        title: utils.intl('当日用/充电量(kWh)'), dataIndex: 'ChargeDay', width: 180, render: (text, record) => {
          const energyUnit = tableList?.find(item => item.id === record.id) || {}
          return <div>{record.title === "电网" ? (numberToFixed(record.EnergyConsumptionDay) ?? '--') : 'WindPower,Solar,Generation'.indexOf(energyUnit.type) > -1 ? <span style={{ fontSize: 10 }}>{utils.intl('不适用')}</span> : numberToFixed(text) ?? '--'}{record.title === '电网' ? <Tooltip title={utils.intl("从电网用电量")}><QuestionCircleOutlined style={{ color: "#888", marginLeft: 8 }} /></Tooltip> : null}</div>
        },
      }, {
        title: utils.intl('当日发/放电量(kWh)'), dataIndex: 'DischargeDay', width: 180, render: (text, record) => {
          const energyUnit = tableList?.find(item => item.id === record.id) || {}
          return <div>{record.title === '电网' ? (numberToFixed(record.OngridEnergyDay) ?? '--') : energyUnit?.type === 'Load' ? <span style={{ fontSize: 10 }}>{utils.intl('不适用')}</span> : numberToFixed(text) ?? '--'}{record.title === '电网' ? <Tooltip title={utils.intl("上网电量")}><QuestionCircleOutlined style={{ color: "#888", marginLeft: 8 }} /></Tooltip> : null}</div>
        },
      }
    ]

    const nowStation = stations?.find(station => station.id === this.props.selectedStationId)
    const selectData = tableList?.map(item => ({ name: utils.intl(item.title), value: `${item.id}` })) || [];

    const inStartDate = moment(incomeDate.startOf(this.state.incomeDateType).format(this.state.incomeDateType === 'month' ? 'YYYY-MM-DD 00:00:00' : 'YYYY-MM-01 00:00:00'), 'YYYY-MM-DD HH:mm:ss').valueOf();
    const inEndDate = moment(incomeDate.endOf(this.state.incomeDateType).format(this.state.incomeDateType === 'month' ? 'YYYY-MM-DD 00:00:00' : 'YYYY-MM-01 00:00:00'), 'YYYY-MM-DD HH:mm:ss').valueOf();
    const tickValues = new Array(moment(inEndDate).diff(inStartDate, this.state.incomeDateType === 'month' ? 'days' : 'months')).fill(0).map((i, index) => inStartDate + index * (this.state.incomeDateType === 'month' ? 1000 * 60 * 60 * 24 : 30 * 1000 * 60 * 60 * 24));
    // console.log(moment(incomeDate.startOf(this.state.incomeDateType).format(this.state.incomeDateType === 'month' ? 'YYYY-MM-DD 00:00:00' : 'YYYY-MM-01 00:00:00'), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD'), 
    // moment(incomeDate.endOf(this.state.incomeDateType).format(this.state.incomeDateType === 'month' ? 'YYYY-MM-DD 00:00:00' : 'YYYY-MM-01 00:00:00'), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD'))

    return (
      <Page pageId={pageId} showStation={!energyUnit} style={{ background: "transparent", boxShadow: "none", display: "flex", flexDirection: "column", overflow: "             " }}>
        <CrumbsPortal>
          <span style={{ position: "relative", height: 50, width: 0, display: "inline-block" }}>
            <div className="microgrid_crumbs_page" style={{ position: "absolute", right: 0, display: "flex", width: 1000, alignItems: "center", justifyContent: "flex-end", top: 11 }}>
              <span style={{ height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: "center" }}>
                <AnimationNumber
                  style={{ display: "inline-block" }}
                  value={weatherMap[weather?.weather]?.index ?? Object.keys(weatherMap).length}
                  numList={img_weather}
                  isWhole
                  time={0.8} />
                <span style={{ fontSize: 24, fontWeight: "bold", marginLeft: 8 }}>{weather?.temperature ? Number(Number(`${weather?.temperature}`.replace('℃', '')).toFixed(2)) : '--'}</span>
                <span className="weather_label">℃</span>
                <span className="weather_label" style={{ marginLeft: 16 }}>{utils.intl('天气')}:</span>
                <span className="weather_value" style={{ marginLeft: 8, fontSize: 14, fontWeight: 400, }}>{weather?.weather ? utils.intl(`weather.${weather?.weather}`) : '--'}</span>
                <span className="weather_label" style={{ marginLeft: 16 }}>{utils.intl('风速')}:</span>
                <span className="weather_value" style={{ marginLeft: 8, fontSize: 14, fontWeight: 400, }}>{weather?.windSpeed ? weather?.windSpeed : '--'}</span>
                <span className="weather_label" style={{ marginLeft: 16 }}>{utils.intl('风向')}:</span>
                <span className="weather_value" style={{ marginLeft: 8, fontSize: 14, fontWeight: 400, }}>{weather?.windDirection ? this.transformWeather(weather?.windDirection) : '--'}</span>
              </span>
              <div className="weather_running" style={{ height: 34, display: "inline-flex", marginLeft: 16, fontSize: 16, alignItems: 'center', justifyContent: "center" }}>{utils.intl('安全运行')}:<span style={{ marginLeft: 10, color: "#3D7EFF", marginRight: 8 }}>{runningTime}</span><span className="weather_label">{utils.intl('天')}</span></div>
              {energyUnit ? <Button style={{ marginLeft: 16 }} onClick={this.callBackPage}>{utils.intl('返回')}</Button> : null}
            </div>
          </span>
        </CrumbsPortal>
        {
          energyUnit ?
            <EnergyUnitPage
              nowStation={nowStation}
              energyUnit={energyUnit}
              socketLoading={this.props.socketLoading}
              activePowerData={this.state.energyUnitActivePowerData}
              electricData={this.state.energyUnitCDData}
              incomeData={this.state.energyUnitIncomeData}
              incomeCount={this.state.energyUnitIncomeCount}
              resetActivePowerData={() => this.setState({ energyUnitActivePowerData: { xData: [], yData: [], series: [] } })}
              resetElectricData={() => this.setState({ energyUnitCDData: { xData: [], yData: [], series: [] }, energyUnitElectricCount: {} })}
              resetIncomeData={(func) => {
                this.energyUnitIncomeData = {
                  xData: [],
                  yData: [],
                  series: [{ name: utils.intl('收支'), unit: utils.intl('元') }]
                };
                this.setState({ energyUnitIncomeData: { xData: [], yData: [], series: [{ name: utils.intl('收支'), unit: utils.intl('元') }] }, energyUnitIncomeCount: 0 }, () => func && func())
              }}
              onChangeActivePower={this.energyUnitChangeActivePower}
              onChangeElectric={this.energyUnitChangeElectric}
              onChangeIncome={this.energyUnitChangeIncome}
              energyUnitElectricCount={this.state.energyUnitElectricCount}
            />
            :
            (
              <div className="page-box" style={{ overflowY: "hidden" }}>
                <div className="page-first-item">
                  {/* <div className="table-box">
                    <Table1
                      // loading={loading}
                      dataSource={tableWsList}
                      columns={columns}
                    />
                  </div> */}
                  <div className="card-box">
                    <>
                      {
                        strategyInfo && strategyInfo.title ? (<><label className="card-title">{strategyInfo.title}</label>
                          <div className="card-display">
                            <div className="card-display-item">
                              <label className="card-display-item-label">{utils.intl('开始执行')}</label>
                              <div className="card-display-item-value">{strategyInfo.startTime}</div>
                            </div>
                            <div className="card-display-item">
                              <label className="card-display-item-label">{utils.intl('已持续')}</label>
                              <div className="card-display-item-value">{strategyInfo.continueTime}</div>
                            </div>
                          </div></>) : <div className="card-empty">{utils.intl('暂无正在执行的策略')}</div>
                      }
                      <footer className="card-footer">
                        <img src={require("../../static/img/gridPower.svg")} width={64} height={58} style={{ marginLeft: 24, marginRight: 24, filter: theme === 'dark-theme' ? "invert(1)" : "none" }} />
                        <div className="card-context">
                          <div className="card-context-title">{utils.intl(strategyInfo?.workStatus === 0 ? utils.intl('并网点功率') : strategyInfo?.workStatus === 1 ? utils.intl('发电总功率') : '--')}</div>
                          <div className="card-context-value">
                            {
                              tableWsList?.length && tableWsList[tableWsList.length - 1].ActivePower !== undefined && tableWsList[tableWsList.length - 1].ActivePower !== null ? Number(tableWsList[tableWsList.length - 1].ActivePower.toFixed(2)) : '--'
                            }
                            {/* {strategyInfo?.activePower || strategyInfo?.activePower ? Number(strategyInfo?.activePower.toFixed(2)) : '--'} */}
                            <span>kW</span>
                          </div>
                        </div>
                        <div className="card-type"><span className="card-icon"></span>{GridConnectStatus[strategyInfo?.workStatus] ?? '--'}</div>
                      </footer>
                    </>
                  </div>
                  <div className="page-card-list">
                    <div className="page-card-list-title">{utils.intl('今日数据')}</div>
                    <div className="page-card-list-body">
                      {
                        tableWsList.map(item => {
                          const type = tableList?.find(titem => titem.id === item.id)?.type;
                          return (
                            <div className="page-card-list-item">
                              <div className="page-card-list-item-title">{item.title}{cardListFieldMap[type] ? <WankeCircleRightOutlined style={{ marginLeft: 8, color: "#3D7EFF", cursor: "pointer" }} onClick={() => this.openEnergyUnitPage(item)} /> : null}</div>
                              <div className="page-card-list-item-body">
                                {
                                  cardListFieldMap[type] ?
                                    cardListFieldMap[type].map(fieldItem => {
                                      const fieldItemList = fieldItem.split('|');
                                      // console.log('type', type)；
                                      return (
                                        <div className="field-item">
                                          <div className="field-item-title">{fieldItemList[1]}</div>
                                          <div className="field-item-value">{numberToFixed(item[fieldItemList[0]]) ?? '--'}<span>{fieldItemList[2]}</span></div>
                                        </div>
                                      )
                                    })
                                    : [`ActivePower|${utils.intl('实时功率')}|kW`, `EnergyConsumptionDay|${utils.intl('用电量')}|kWh`, `OngridEnergyDay|${utils.intl('上网电量')}|kWh`].map(fieldItem => {
                                      const fieldItemList = fieldItem.split('|');
                                      return (
                                        <div className="field-item">
                                          <div className="field-item-title">{fieldItemList[1]}</div>
                                          <div className="field-item-value">{numberToFixed(item[fieldItemList[0]]) ?? '--'}<span>{fieldItemList[2]}</span></div>
                                        </div>
                                      )
                                    })
                                }
                                <div className="page-right-top">
                                  {// 
                                    cardListFieldMap[type] ? (
                                      <>
                                        <CardText
                                          color={WorkColorMap[item.WorkStatus]?.split('|')[0]}
                                          backgroundColor={WorkColorMap[item.WorkStatus]?.split('|')[1]}
                                          text={WorkStatus[item.WorkStatus] ?? ''}
                                          style={{ marginRight: 8 }}
                                        />
                                        <Tooltip title={`${utils.intl('当前告警')}: ${item.alarmCount || 0}${utils.intl('条')}`}>
                                          <CardText
                                            color={item.HealthStatus && item.HealthStatus !== '0' ? "#F5222D" : "#52C41A"}
                                            backgroundColor={item.HealthStatus && item.HealthStatus !== '0' ? "rgba(245,34,45,0.10)" : "rgba(82,196,26,0.10)"}
                                            text={item.HealthStatus && item.HealthStatus !== '0' ? utils.intl('告警') : utils.intl('正常')}
                                            showIcon={false}
                                          />
                                        </Tooltip>
                                      </>
                                    ) :
                                      <CardText
                                        color={item.ActivePower && item.ActivePower !== 0 ? "#FAAD14" : "#3D7EFF"}
                                        backgroundColor={item.ActivePower && item.ActivePower !== 0 ? "rgba(250,173,20,0.10)" : "rgba(61,126,255,0.10)"}
                                        text={item.ActivePower > 0 ? utils.intl('用电中') : item.ActivePower < 0 ? utils.intl('倒送中') : utils.intl('发用平衡')}
                                      />
                                  }
                                </div>
                              </div>
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
                </div>
                <div className="page-item">
                  <div className={classNames("page-second-item", { 'page-screen': isScreen1 })}>
                    <div className="page-title">
                      {utils.intl('功率曲线')}
                      <DatePicker
                        style={{ marginLeft: 15, width: 260 }}
                        disabledDate={current => moment().add(1, 'days').isBefore(current) || moment(nowStation.productionTime, 'YYYY-MM-DD 00:00:00').isAfter(current)}
                        value={activeDate}
                        allowClear={false}
                        onChange={date => {
                          this.setState({ activePowerData: { series: [], xData: [], yData: [] }, activeDate: date })
                        }} />
                      <div className="right-icon" onClick={() => this.setState({ isScreen1: !isScreen1 }, () => { triggerEvent('resize', window) })}>
                        {isScreen1 ? <WankeFullscreenOut2Outlined /> : <WankeFullscreen2Outlined />}
                      </div>
                    </div>
                    <div className="page-body" style={{ position: 'relative' }}>
                      {this.props.socketLoading['getActivePower'] && <FullLoading />}
                      <LineChart
                        series={activePowerData.series.length ? activePowerData.series : tableList?.map(item => ({ name: utils.intl(item.title), unit: 'kW' })) || []}
                        xData={activePowerData.xData}
                        yData={activePowerData.yData}
                        options={{
                          yAxisScale: true,
                          startDate: activeDate.startOf('day').valueOf(),
                          endDate: activeDate.endOf('day').valueOf(),
                          dateFormat: (d) => { return moment(d).format('HH:mm:ss') },
                          backOpacity: [0, 0],
                          margin: {
                            left: 55,
                            right: 55,
                            bottom: 30,
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className={classNames("page-second-item", { 'page-screen': isScreen2 })}>
                    <div className="page-title">
                      {utils.intl('电量图表')}
                      <DatePicker
                        style={{ marginLeft: 15, width: 260 }}
                        disabledDate={current => moment().isBefore(current) || moment(nowStation.productionTime, 'YYYY-MM-DD 00:00:00').isAfter(current)}
                        value={chargeDate}
                        allowClear={false}
                        onChange={date => this.setState({ cdData: { series: [], xData: [], yData: [] }, chargeDate: date })}
                      />
                      <Select
                        value={cdType}
                        dataSource={selectData}
                        mode="multiple"
                        style={{ width: '260px', marginLeft: 8 }}
                        onChange={value => {
                          this.setState({ cdType: value })
                        }}
                        maxTagCount="responsive"
                        showAllSelect
                        selectText={val => <span className="select-text">({utils.intl(`已选 {0} 个`, val?.length ?? 0)})</span>}
                        checkAllText={utils.intl('全选')}
                      />
                      <div className="right-icon" onClick={() => {
                        this.setState({ isScreen2: !isScreen2 }, () => { this.myCharts.resize() })
                      }}>
                        {isScreen2 ? <WankeFullscreenOut2Outlined /> : <WankeFullscreen2Outlined />}
                      </div>
                    </div>
                    <div className="page-body" style={{ position: "relative" }}>
                      {this.props.socketLoading['getChargeOrDischarge'] && <FullLoading />}
                      <div
                        style={{ width: '100%', height: '100%', position: 'relative' }}
                        ref={myChartsDom => this.myChartsDom = myChartsDom}
                      ></div>
                    </div>
                    {
                      cdData.series?.length ? (
                        <>
                          {/* <span style={{ position: "absolute", left: 15, top: 56 }}>发/放电量</span>
                <span style={{ position: "absolute", left: 15, bottom: 10 }}>充/用电量</span> */}
                        </>
                      ) : (
                        <div className={"common-echart-empty"}>
                          <img src={theme === 'light-theme' ? require('../../static/img/no-data-chart-light.svg') : require('../../static/img/no-data-chart-dark.svg')} />
                          <span>{utils.intl('暂无数据')}</span>
                        </div>
                      )
                    }
                  </div>
                  <div className={classNames("page-last-item", { 'page-screen': isScreen3 })}>
                    <div className="page-title">
                      {utils.intl('收支曲线')}
                      <Select
                        value={this.state.incomeDateType}
                        dataSource={dateMap}
                        style={{ width: 100, marginLeft: 8 }}
                        onChange={value => {
                          const date = moment().format(value === 'month' ? 'YYYY-MM' : value === 'year' ? 'YYYY' : 'YYYY-MM-DD')
                          this.incomeData = {
                            xData: [],
                            yData: [],
                            series: [{ name: utils.intl('收支'), unit: utils.intl('元') }]
                          };
                          this.setState({ incomeDateType: value, incomeDate: moment(date), incomeData: { series: [{ name: utils.intl('收支'), unit: utils.intl('元') }], xData: [], yData: [] }, incomeCount: 0 })
                          socket.emit("profit", { stationId: selectedStationId, mod: dateTypeToServer[value], date: moment(date).format(value === 'day' ? 'YYYY-MM-DD' : value === 'month' ? 'YYYY-MM' : 'YYYY') })
                        }}
                      />
                      <DatePicker
                        style={{ marginLeft: 15, width: 260 }}
                        disabledDate={current => moment().add(1, 'days').isBefore(current) || moment(nowStation.productionTime, 'YYYY-MM-DD 00:00:00').isAfter(current)}
                        value={incomeDate}
                        allowClear={false}
                        picker={this.state.incomeDateType === 'day' ? "date" : this.state.incomeDateType}
                        onChange={date => {
                          this.incomeData = {
                            xData: [],
                            yData: [],
                            series: [{ name: utils.intl('收支'), unit: utils.intl('元') }]
                          };
                          this.setState({ incomeData: { series: [{ name: utils.intl('收支'), unit: utils.intl('元') }], xData: [], yData: [] }, incomeDate: date, incomeCount: 0 })
                          socket.emit("profit", { stationId: selectedStationId, mod: dateTypeToServer[this.state.incomeDateType], date: date.format(this.state.incomeDateType === 'day' ? 'YYYY-MM-DD' : this.state.incomeDateType === 'month' ? 'YYYY-MM' : 'YYYY') })
                        }} />
                      <div className="right-icon" onClick={() => this.setState({ isScreen3: !isScreen3 }, () => { triggerEvent('resize', window) })}>
                        {isScreen3 ? <WankeFullscreenOut2Outlined /> : <WankeFullscreen2Outlined />}
                      </div>
                    </div>
                    <div className="page-body" style={{ position: 'relative' }}>
                      {this.props.socketLoading['profit'] && <FullLoading />}
                      {
                        this.state.incomeDateType === "day" ? (
                          <LineChart
                            series={incomeData.series}
                            xData={incomeData.xData}
                            yData={incomeData.yData}
                            options={{
                              startDate: incomeDate.startOf('day').valueOf(),
                              endDate: incomeDate.endOf('day').valueOf(),
                              dateFormat: (d) => { return moment(d).format('HH:mm:ss') },
                              margin: {
                                left: 55,
                                right: 55,
                                bottom: 30,
                              }
                            }}
                          />
                        ) : (
                          <BarChart
                            series={incomeData.series}
                            xData={incomeData.xData}
                            yData={incomeData.yData}
                            options={{
                              startDate: inStartDate, // moment(incomeDate.startOf(this.state.incomeDateType).format(this.state.incomeDateType === 'month' ? 'YYYY-MM-DD 00:00:00' : 'YYYY-MM-01 00:00:00'), 'YYYY-MM-DD HH:mm:ss').valueOf(),
                              endDate: inEndDate, // moment(incomeDate.endOf(this.state.incomeDateType).format(this.state.incomeDateType === 'month' ? 'YYYY-MM-DD 00:00:00' : 'YYYY-MM-01 00:00:00'), 'YYYY-MM-DD HH:mm:ss').valueOf(),
                              tooltipDateFormat: this.state.incomeDateType === 'month' ? 'MM-DD' : 'YYYY-MM',
                              dateFormat: (d) => { return moment(d).format(this.state.incomeDateType === 'month' ? 'MM-DD' : 'YYYY-MM') },
                              tickValues,
                              margin: {
                                left: 55,
                                right: 55,
                                bottom: 30,
                              }
                            }}
                          />
                        )
                      }
                    </div>
                    <div style={{ position: "absolute", top: 60, left: 80 }}>{utils.intl('总收支')}：<span style={{ color: "#177ddc", marginLeft: 4, fontSize: 20, fontWeight: 500, marginRight: 3 }}>{incomeCount}</span>{utils.intl('元')}</div>
                  </div>

                </div>
              </div>
            )
        }
      </Page>
    )
  }
}

export default Index
