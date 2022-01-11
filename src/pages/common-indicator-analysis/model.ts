import moment, { Moment } from "moment";
import { fillLabelAxisByRange } from "../../components/charts/common-echarts/calcOption/chartsTool";
import utils from "../../public/js/utils";
import { getSystemTime } from "../../util/dateUtil";
import { globalNS, IndicatorTypeName, indicator_analysis, Indicator_Type, Socket_Port, Tree_Type } from "../constants";
import { formatChartData, sortChartData, traverseTree } from "../page.helper";
import SocketHelper from "../socket.helper";
import { makeModel } from "../umi.helper";
import { fetchIndicatorList, fetchTreeList } from "./service";

const socket = new SocketHelper(indicator_analysis, Socket_Port, '/indicator-analysis')

const filterIndicatorName = ['Profit']

export class IndicatorAnalysisModal {
  treeList = []
  checkList = []
  checkedIndicatorList = []
  checkListMap = {}
  timeRange: [Moment, Moment] = [moment().startOf('day'), moment().endOf('day')]
  timeMode = 'day'
  chartSeries = []
  columns = []
  chartData = {}
  tableList = []
  socketLoading = {}
}

export default makeModel(
  indicator_analysis,
  new IndicatorAnalysisModal(),
  (updateState, updateQuery, getState) => {
    return {
      *closeSocket() {
        socket.close()
      },
      *getChartSocket(action, { put, call, select }) {
        let { chartSeries, chartData, timeRange, timeMode } = yield getState(select)
        const { result, eventName } = action.payload
        const { results = {} } = result
        chartData = sortChartData(formatChartData(chartData, results, chartSeries.map(item => item.attr)))
        // chartData.xDataFormat = chartData.xData.map(timeStr => moment(timeStr).format(TableTimeFormaterMap[timeMode]))
        chartData.series = chartSeries
        let tableList = formatChartDataToTableData(chartData)

        if(timeMode !== 'total') {
          // 填充表格
          tableList = fillTableData(tableList, getFillOption(timeRange, timeMode))
        }
        
        yield updateState(put, {
          chartData,
          tableList
        })
      },
      *fetchTreeList(action, { put, call, select }) {
        const { id } = action.payload
        const data = yield call(fetchTreeList, { stationId: id })
        console.log('data', data)
        yield put({ type: 'updateToView', payload: { treeList: formatTreeList(data) } })
      },
      *fetchIndicatorList(action, { put, call, select }) {
        const { typeName, deviceId } = action.payload
        const { selectedStationId } = yield select(state => state[globalNS])
        const data = yield call(fetchIndicatorList, { stationId: selectedStationId, deviceId })
        const { checkListMap } = yield getState(select)
        const checkList = formatCheckList(data, deviceId, typeName)
        checkListMap[deviceId] = checkList
        yield put({ type: 'updateToView', payload: { checkList, checkListMap } })
      },
      *fetchChartData(action, { put, call, select }) {
        const { dispatch, selectedStationId } = action.payload
        const { checkedIndicatorList, timeRange, timeMode, treeList } = yield getState(select)
        // 处理图表图例和表格columns
        const checkList = filterCheckedList(checkedIndicatorList, timeMode)
        const chartSeries = []
        const columns = [{
          title: utils.intl('日期'),
          ellipsis: true,
          dataIndex: 'date',
          align: 'center',
          width: 170,
        }]
        checkList.forEach(indicator => {
          const [deviceId] = getCheckItemValue(indicator.value)
          const selectedItem = traverseTree(treeList, (item) => {
            if (deviceId == item.id) {
              return item
            }
            return null
          })
          if (selectedItem) {
            const title = `${selectedItem.title} ${indicator.name}`
            columns.push({
              title,
              ellipsis: true,
              dataIndex: indicator.value,
              align: 'right',
              width: 200
            })
            chartSeries.push({
              name: title,
              attr: indicator.value,
              unit: indicator.unit
            })
          }
        })
        yield put({ type: 'updateToView', payload: { chartSeries, columns, chartData: {}, tableList: [] } })
        // todo: 处理图例表格数据
        // 获取数据
        const params = {
          startTime: timeRange[0].format(timeModeFormatterMap[timeMode]),
          endTime: timeRange[1].format(timeModeFormatterMap[timeMode]),
          timeMode,
          checkedIndicatorList: checkList.map(indicator => indicator.value).join(','),
          stationId: selectedStationId
        }
        if (timeMode === 'total') {
          delete params.startTime
          delete params.endTime
        }
        // 没有需要获取的指标数据时，不请求
        if (!checkList.length) {
          return
        }
        if (socket.ws?.connected) {
          socket.emit('getChart', params)
        } else {
          socket.close()
          socket.start(dispatch, {
            'getChart': 'getChartSocket',
          }, {
            'connect': () => {
              socket.emit('getChart', params)
            },
            'socketLoadingChange': (socketLoading) => {
              dispatch({ type: `${indicator_analysis}/updateToView`, payload: { socketLoading } });
            }
          })
        }
      },
    };
  }
);

// 请求时间格式化
const timeModeFormatterMap = {
  'day': 'YYYY-MM-DD',
  'month': 'YYYY-MM',
  'year': 'YYYY',
  'total': 'YYYY',
}

// 展示用格式化
export const TableTimeFormaterMap = {
  'day': 'YYYY-MM-DD HH:mm',
  'month': 'YYYY-MM-DD',
  'year': 'YYYY-MM',
  'total': 'YYYY',
}

// 树格式化 key值格式化成 0-0-1
const formatTreeList = (treeList, parentKey = '0') => {
  if (!treeList || !treeList.length) {
    return []
  }

  return treeList.map((node, index) => {
    const { children, ...rest } = node
    const key = `${parentKey}-${index}`

    return {
      ...rest,
      key,
      disabled: node.type === Tree_Type.virtualNode || node.type === Tree_Type.energyUnit,
      children: formatTreeList(children, key)
    }
  })
}


// 格式化勾选列表 
const formatCheckList = (checkList = [], deviceId, typeName) => {
  if (typeName === Tree_Type.gatewayBreaker) {
    // 关口开关只显示上网电量
    const indicatorList = [Indicator_Type.ongridEnergy, Indicator_Type.generation]
    checkList = checkList.filter(item => indicatorList.indexOf(item.value) > -1)
  }

  // 过滤指标
  checkList = checkList.filter(item => filterIndicatorName.indexOf(item.value) < 0)

  const list = checkList.map(item => ({
    ...item,
    label: item.name,
    value: formatCheckItemValue(item.value, deviceId, item.id)
  }))

  return list
}

// 格式化checklist 的 value字段    设备id_指标name_指标id
export function formatCheckItemValue(value, deviceId, id) {
  return `${deviceId}_${value}_${id}`
}

/**
 * 
 * @param {String} value
 * @returns {String[]} [deviceId, type, indicatorId]
 */
export function getCheckItemValue(value): [string, string, string] {
  return value.split('_')
}

/**
 * 过滤指标
 * 1. 离散率只有月维度显示
 * 2. 效率、累计辐照、co2减排、满发时常不在日维度显示
 */
function filterCheckedList(list, timeMode) {
  let dataList = list
  if(timeMode !== 'month') {
    dataList = dataList.filter(item => !isSameIndicator(item.value, IndicatorTypeName.Divergence))
  }
  if (timeMode === 'day') {
    dataList = dataList.filter(item => !isSameIndicator(
      item.value,
      [
        IndicatorTypeName.CO2Reduction,
        IndicatorTypeName.PerformanceRatio,
        IndicatorTypeName.Yield,
        IndicatorTypeName.Irradiance,
        IndicatorTypeName.DeviceEfficiency
      ]
    ))
  }
  return dataList
}

// 判断是否为指定指标
function isSameIndicator(value, type: string | string[]) {
  const typeList = Array.isArray(type) ? type : [type]
  const [,typeName] = getCheckItemValue(value)
  return typeList.indexOf(typeName) > -1
}

// 将图表数据格式化为表格数据
function formatChartDataToTableData(chartData: any = {}) {
  const tableData = []
  const { xData = [], yData = [], series = [] } = chartData
  xData.forEach((time, index) => {
    const row = {
      date: time
    };
    series.forEach((item, series_i) => {
      let value = yData[series_i]?.[index]?.value
      row[item.attr] = value ? (value + (item.unit || '')) : value
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

// 获取填充时间配置
export function getFillOption(timeRange, timeMode) {
  let step
  let stepType
  const curTime = getSystemTime().format(TableTimeFormaterMap[timeMode])
  let endTime = timeRange[1].endOf(timeMode).format(TableTimeFormaterMap[timeMode])
  switch (timeMode) {
    case 'day':
      step = 15
      stepType = 'minutes'
      break
    case 'month':
      step = 1
      stepType = 'day'
      if (endTime > curTime) endTime = curTime
      break
    case 'year':
      step = 1
      stepType = 'month'
      if (endTime > curTime) endTime = curTime
      break
  }


  return {
    startTime: timeRange[0].startOf(timeMode).format(TableTimeFormaterMap[timeMode]),
    endTime,
    step,
    stepType,
    formater: TableTimeFormaterMap[timeMode]
  }
}
