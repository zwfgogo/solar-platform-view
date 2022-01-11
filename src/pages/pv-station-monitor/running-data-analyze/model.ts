import moment, { Moment } from 'moment'
import { makeModel } from "../../umi.helper"
import { running_data_anaylze, globalNS, Socket_Port } from "../../constants"
import Service from "./service"
import { GlobalState } from '../../../models/global'
import SocketHelper from '../../socket.helper'
import { formatStationList } from '../../pv-statistical-form/station-form/model'
import { formatChartData, sortChartData } from '../../page.helper'
import { TimeFormatMap } from '../../pv-statistical-form/station-form/StationForm'
import { fillLabelAxisByRange } from '../../../components/charts/common-echarts/calcOption/chartsTool'
import utils from '../../../public/js/utils';

const socket = new SocketHelper(running_data_anaylze, Socket_Port, '/operational-data-analysis')

export const TimeFormaterMap = {
  'day': 'YYYY-MM-DD',
  'month': 'YYYY-MM',
  'year': 'YYYY',
  'total': 'YYYY',
}

function formatChartDataToTableData(chartData: any = {}) {
  const tableData = []
  const { xData = [], yData = [], series = [] } = chartData
  xData.forEach((time, index) => {
    const row = {
      date: time
    };
    series.forEach((item, series_i) => {
      const value = yData[series_i]?.[index]
      row[item.attr] = value ? value + item.unit : value
    })
    tableData.push(row)
  })
  return tableData
}

function fillTableData(tableList, fillOption): any[] {
  const list = fillLabelAxisByRange(fillOption)
  const tableDataKeyList = tableList.map(item => item.date)
  return list.map(key => {
    const index = tableDataKeyList.indexOf(key)
    if(index > -1) return tableList[index]
    return { date: key }
  })
}

function getTypeIdFromKey(key = '') {
  const list = key.split('-');
  return list[list.length - 1];
}

function getIdFromKey(key = '') {
  const list = key.split('-');
  return list[1];
}

function formatDeviceList(treeList, deep = 'deep', parentKeys = []) {
  let list = []
  treeList.forEach((node, index) => {
    if(node.children) {
      list.push({
        productionTime: node.productionTime,
        typeName: node.typeName,
        title: node.title,
        key: `${deep}-${index}`,
        checkable: !!node.checkable,
        selectable: false,
        children: formatDeviceList(node.children, `${deep}-${index}`, parentKeys.concat(`${deep}-${index}`)),
        parentKeys
      })
    } else {
      list.push({
        typeName: node.typeName,
        title: node.title,
        checkable: !!node.checkable,
        selectable: false,
        key: `device-${node.id}-${node.typeId}`,
        parentKeys
      })
    }
  })
  return list
}

/**
 * 获取勾选列表 二维数组 每个数组表示当前选中的节点到父节点的list数组
 * @param treeList 
 * @param checkedKeys 
 * @param parentsTitle 
 * @returns [[parentNode, node], [parentNode, node]]
 */
export function getConnectNodeTitle(treeList, checkedKeys, parentsTitle = []) {
  let titleList = []
  treeList.forEach(node => {
    const item = {...node}
    delete item.children
    if(node.children) {
      titleList = titleList.concat(
        getConnectNodeTitle(node.children, checkedKeys, parentsTitle.concat(item))
      )
    } else if(checkedKeys.indexOf(node.key) > -1) {
      titleList.push(parentsTitle.concat(item))
    }
  })
  return titleList
}

export function getNodeList(treeList, checkedKeys) {
  let nodeList = []
  treeList.forEach(node => {
    if(node.children) {
      nodeList = nodeList.concat(getNodeList(node.children, checkedKeys))
    } else if(checkedKeys.indexOf(node.key) > -1) {
      nodeList.push(node)
    }
  })
  return nodeList
}

export const ObjectType = {
  Station: '1',
  Device: '2'
};

export const DataType = {
  Indicator: '1',
  Measurement: '2'
}

export enum EIndicators {
  // 发电量
  PRODUCTION = 1,
  // 辐照强度
  IRRADIANCE,
  // 系统效率
  PR,
  // 满发时长
  YIELD,
  // 收益
  REVENUE,
  // CO2减排
  CO2REDUCTION,
  // 离散率
  DIVERGENCERATE,
  // 转化效率
  CONVERSIONRATE
}

const EIndicatorsUnitMap = {
  [EIndicators.PRODUCTION]: 'kWh',
  [EIndicators.IRRADIANCE]: 'Wh/㎡',
  [EIndicators.PR]: '%',
  [EIndicators.YIELD]: 'h',
  [EIndicators.REVENUE]: '元',
  [EIndicators.CO2REDUCTION]: 'kg',
  [EIndicators.DIVERGENCERATE]: '%',
  [EIndicators.CONVERSIONRATE]: '%',
}

export const TimeModeEmitName = {
  'day': 'Day',
  'month': 'Month',
  'year': 'Year',
  'total': 'Amount',
}

export function EIndicatorsStationList(){
  return ([
    { title: utils.intl('发电量'), key: EIndicators.PRODUCTION.toString() },
    { title: utils.intl('累计辐照量'), key: EIndicators.IRRADIANCE.toString() },
    { title: utils.intl('PR'), key: EIndicators.PR.toString() },
    { title: utils.intl('满发时长'), key: EIndicators.YIELD.toString() },
    { title: utils.intl('收益'), key: EIndicators.REVENUE.toString() },
    { title: utils.intl('CO2减排'), key: EIndicators.CO2REDUCTION.toString() },
  ])
};

export function EIndicatorsDeviceListMap(){
  return({
    'DoubleWindingTransformer': [
      { title: utils.intl('效率'), key: EIndicators.CONVERSIONRATE.toString() },
      { title: utils.intl('发电量'), key: EIndicators.PRODUCTION.toString() },
    ],
    'ThreeWindingTransformer': [
      { title: utils.intl('效率'), key: EIndicators.CONVERSIONRATE.toString() },
      { title: utils.intl('发电量'), key: EIndicators.PRODUCTION.toString() },
    ],
    'SolarTransformer': [
      { title: utils.intl('效率'), key: EIndicators.CONVERSIONRATE.toString() },
      { title: utils.intl('发电量'), key: EIndicators.PRODUCTION.toString() },
    ],
    'Combiner': [
      { title: utils.intl('离散率'), key: EIndicators.DIVERGENCERATE.toString() },
      { title: utils.intl('发电量'), key: EIndicators.PRODUCTION.toString() },
    ],
    'Inverter': [
      { title: utils.intl('离散率'), key: EIndicators.DIVERGENCERATE.toString() },
      { title: utils.intl('满发时长'), key: EIndicators.YIELD.toString() },
      { title: utils.intl('发电量'), key: EIndicators.PRODUCTION.toString() },
      { title: utils.intl('效率'), key: EIndicators.CONVERSIONRATE.toString() },
    ],
  })
};

export function EIndicatorsList(){
  return([
    { title: utils.intl('发电量'), key: EIndicators.PRODUCTION.toString() },
    { title: utils.intl('辐照强度'), key: EIndicators.IRRADIANCE.toString() },
    { title: utils.intl('系统效率'), key: EIndicators.PR.toString() },
    { title: utils.intl('满发时长'), key: EIndicators.YIELD.toString() },
    { title: utils.intl('收益'), key: EIndicators.REVENUE.toString() },
    { title: utils.intl('CO2减排'), key: EIndicators.CO2REDUCTION.toString() },
    { title: utils.intl('离散率'), key: EIndicators.DIVERGENCERATE.toString() },
    { title: utils.intl('转化效率'), key: EIndicators.CONVERSIONRATE.toString() },
  ])
}; 

let currentEventName = ''

interface Query {
  objectType: string
  dataType: string
  timeMode: string
  timeRange: [Moment, Moment]
  checkedKeysList: string[][]
}

export class RunningDataAnalyzeModal {
  query: Query = {
    objectType: ObjectType.Station,
    dataType: DataType.Indicator,
    timeMode: 'day',
    timeRange: [moment().subtract(6, 'days'), moment()],
    checkedKeysList: [[], []]
  }
  measurementList = []
  chartData = {}
  tableList = []
  treeList = [[], []]
  tableColumns = []
  checkedKeysTableData = []
  chartSeries = []
}

export default makeModel(
  running_data_anaylze,
  new RunningDataAnalyzeModal(),
  (updateState, updateQuery, getState) => {
    return {
      *init(action, { put, call, select }) {
        const {} = yield select(state => state.indexPage)
        const { dispatch } = action.payload
        socket.start(dispatch, {
          'stationDay': 'getCharts',
          'stationMonth': 'getCharts',
          'stationYear': 'getCharts',
          'stationAmount': 'getCharts',
          'deviceDay': 'getCharts',
          'deviceMonth': 'getCharts',
          'deviceYear': 'getCharts',
          'deviceAmount': 'getCharts',
        }, {
          'connect': () => {
          }
        })
      },
      *closeSocket() {
        socket.close()
      },
      *emitSocket(action, { put, call }) {
        const { eventName, params = {} } = action.payload
        socket.emit(eventName, params)
      },
      *getTableColumns(action, { put, call, select }) {
        const { query, treeList } = yield getState(select)
        const { dataType, checkedKeysList, objectType } = query;
        const deviceNodeList = getConnectNodeTitle(treeList[0], checkedKeysList[0]) // 电站或设备
        const dataNodeList = getConnectNodeTitle(treeList[1], checkedKeysList[1]) // 数据项
        let checkedKeysTableData = []
        let columns = [{
          title: utils.intl('日期'),
          ellipsis: true,
          dataIndex: 'date',
          align: 'center',
          width: 170,
        }]
        let chartSeries = []
        if(dataType === DataType.Measurement) {
          // 量测点
          let deviceId = checkedKeysList[0].map(item => getIdFromKey(item)).join(',');
          const params = { measurementTypeId: checkedKeysList[1][0], deviceId }
          const list = yield call(
            Service.getAnalogType,
            params
          )
          const itemTitle = `${deviceNodeList[0][0].title}-${deviceNodeList[0][deviceNodeList[0].length - 1].title}`
          list.forEach(item => {
            columns.push({
              title: `${itemTitle} ${item.title}`,
              ellipsis: true,
              dataIndex: item.name,
              align: 'right',
              width: 200
            })
          })
          chartSeries = list.map(item => ({
            name: item.title,
            unit: item.unit || '',
            attr: item.name
          }))
        } else {
          // 指标
          dataNodeList.forEach(dataList => {
            const dataItem = dataList[0] // 数据项
            deviceNodeList.forEach(nodeList => {
              const lastNode = nodeList[nodeList.length - 1] // 勾选的节点
              const topNode = nodeList[0] // 所勾选顶层父节点
              let unit = EIndicatorsUnitMap[dataItem.key];
              checkedKeysTableData.push({
                targetKey: lastNode.key,
                stationTitle: topNode.title,
                deviceTitle: lastNode.title,
                dataTitle: dataItem.title
              })
              let itemTitle, dataIndex, chartTitle
  
              if(objectType === ObjectType.Station) {
                if(EIndicators.REVENUE.toString() === dataItem.key) {
                  unit = topNode.currency ? utils.intl(topNode.currency) : utils.intl('元')
                }
                itemTitle = `${topNode.title}`
                chartTitle = `${topNode.title} ${dataItem.title}`
                dataIndex = `${topNode.key}_${dataItem.key}`
              } else {
                itemTitle = `${topNode.title}-${lastNode.title}`
                chartTitle = `${lastNode.title} ${dataItem.title}`
                dataIndex = `${getIdFromKey(lastNode.key)}_${dataItem.key}`
              }
              columns.push({
                title: `${itemTitle} ${dataItem.title}`,
                ellipsis: true,
                dataIndex,
                align: 'right',
                width: 200
              })
  
              chartSeries.push({
                name: chartTitle,
                attr: dataIndex, // id_数据项
                unit
              })
            })
          })
        }
        yield updateState(put, {
          checkedKeysTableData,
          tableColumns: columns,
          chartSeries
        })
        yield put({ type: 'getData' })
      },
      *getData(action, { put, call, select }) {
        const { query, treeList, chartSeries } = yield getState(select)
        const { dataType, checkedKeysList, objectType, timeMode, timeRange } = query;
        const startTime = timeMode !== 'total' ? timeRange[0].format(TimeFormatMap[timeMode]) : ''
        const endTime = timeMode !== 'total' ? timeRange[1].format(TimeFormatMap[timeMode]) : ''
        const params: any = { startTime, endTime }

        let eventName = TimeModeEmitName[timeMode]
        if(objectType === ObjectType.Station) {
          eventName = 'station' + eventName
          params.stationIds = checkedKeysList[0].join(',')
        } else {
          eventName = 'device' + eventName
          params.deviceIds = checkedKeysList[0].map(item => getIdFromKey(item)).join(',')
        }
        if(dataType === DataType.Indicator) {
          params.indicators = checkedKeysList[1].join(",")
        } else {
          // params._test = checkedKeysList[1][0]
          params.dataTypeNames = chartSeries.map(item => item.attr).join(",")
        }
        console.log('getData', params)
        yield updateState(put, {
          chartData: {},
          tableList: []
        })
        currentEventName = eventName
        yield put({ type: 'emitSocket', payload: { eventName, params } })
      },
      *getCharts(action, { put, call, select }) {
        let { query, treeList, chartSeries, chartData } = yield getState(select)
        const { checkedKeysList, timeRange, timeMode, dataType } = query;
        
        if(!checkedKeysList[0].length || !checkedKeysList[1].length) {
          return
        }

        const { result, eventName } = action.payload
        if(currentEventName !== eventName) {
          return
        }
        const { results = {} } = result
        chartData = sortChartData(formatChartData(chartData, results, chartSeries.map(item => item.attr)))
        chartData.xDataFormat = chartData.xData.map(timeStr => moment(timeStr).format('YYYY-MM-DD HH:mm:ss'))
        chartData.series = chartSeries
        let tableList = formatChartDataToTableData(chartData)

        if(dataType !== DataType.Measurement && timeMode !== 'total') {
          const fillOption = {
            startTime: timeRange[0].format(TimeFormaterMap[timeMode]),
            endTime: timeRange[1].format(TimeFormaterMap[timeMode]),
            type: timeMode
          }
          tableList = fillTableData(tableList, fillOption)
        }
        
        yield updateState(put, {
          chartData,
          tableList
        })
      },
      *getTreeList(action, { put, call, select }) {
        const { query } = yield getState(select)
        const { dataType, objectType } = query;
        yield updateState(put, {
          treeList: [[], []]
        })
        let treeList
        if(objectType === ObjectType.Station) {
          const {userId}: GlobalState = yield select(state => state[globalNS])
          let { results: data = [] } = yield call(Service.getStationList, {
            userId: sessionStorage.getItem("user-id"),
          })
          treeList = [formatStationList(data || []), EIndicatorsStationList()]
        } else {
          const params = {
            selectItem: dataType
          };
          const list = yield call(
            Service.getTreeList,
            params
          )
          treeList= [formatDeviceList(list ||[]), []]
          if(dataType === DataType.Indicator) {
          }
        }
        
        const { query: currentQuery } = yield getState(select)
        const { dataType: curDataType, objectType: curObjectType } = currentQuery;
        if(dataType === curDataType && objectType === curObjectType) {
          yield updateState(put, {
            treeList
          })
        }
      },
      *getMeasurement(action, { put, call, select }) {
        const { targetId } = action.payload
        const { query, treeList } = yield getState(select)
        yield updateState(put, {
          treeList: [treeList[0], []]
        })
        const { dataType } = query;
        const params = { deviceId: getIdFromKey(targetId) };
        const list = yield call(
          Service.getMeasurement,
          params
        )
        const formatList = (list || []).map(item => ({
          title: item.name,
          key: item.value.toString()
        }))
        const newTreeList= [treeList[0], formatList]
        yield updateState(put, {
          treeList: newTreeList
        })
      },
    }
  }
)
