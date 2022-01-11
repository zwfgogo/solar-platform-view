import { EChartOption } from "echarts";
import utils, { getTextWidth } from "../../../../util/utils";
import { getToolTipFormatter, ChartsType, getCustomOption, fillLabelAxisByRange, getMinMaxValue } from "./chartsTool";
import { getLineStyle } from "./splitLine";

const MIN_GRID = 16
const GRIND_MARGIN = 16
const Axis_NUM_MARGIN = 8

const UnitInAxis = ['%']

const defaultColorArray = [
  '#0062ff', '#3dd598', '#ffb076', '#fc5a5a', '#a461d8', '#50b5ff', '#ff9ad5', '#ffc542', '#61a0a8', '#d48265',
  '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'
]

export const getColor = (colorList, index) => {
  return colorList ? colorList[index] : defaultColorArray[index]
}

const defaultGrid = {
  left: "40",
  right: "16",
  top: "40",
  bottom: "36"
};

interface ChartData {
  xData?: any[];
  yData?: any[][];
  series?: any[];
}

export interface LineChartProps {
  disableZoom?: boolean;
  data?: ChartData;
  type?: ChartsType;
  showUnit?: boolean; // 是否显示值坐标轴上的单位
  isUnitPrev?: boolean; // tooltip单位先于值显示
  showLegend?: boolean; // 是否显示图例
  timeLine?: boolean; // 是否为时间横坐标
  tooltipTimeFormater?: (val: any) => string;
  colorList?: any[];
  reverseAxis?: boolean; // x轴作为值坐标轴
  seriesOption?: EChartOption.Series;
  formatLabel?: (value: any) => any;
  simpleChart?: boolean;
  getExtraParams?: (index: number, xName: string) => { label: string, value: any }[]
  fillLabelAxis?: {
    startTime: string;
    endTime: string;
    type?: 'day' | 'month' | 'year';
    step?: number;
    stepType?: 'year' | 'month' | 'day' | 'hours' | 'minutes' | 'seconds' | 'milliseconds';
    formater?: string;
  };
  customOption?: echarts.EChartOption<EChartOption.Series> & {
    yAxisMargin?: number;
    tooltip?: {
      appendToBody?: boolean
    };
    theme?: string
  }; // 自定义配置
  formatXData?: (xData: any[]) => any[]; // 格式化xData
}

function getLine(len) {
  let arr = []
  arr.length = len ?? 0
  arr.fill('-')
  return arr
}

function getItem(item) {
  if (typeof item === 'object' && item !== null) return { ...item, val: item.value, flag: item.flag ? 1 : 0 }
  return {
    val: item,
    flag: 0, 
  }
}

function formatDataFlag(props) {
  const { colorList } = props;
  let data = props.data
  const isArrayValue = Array.isArray(props.data.yData?.[0]?.[0])
  if (!isArrayValue) {
    let yData: any = []
    let series: any = []
    let curIndex = 0
    let nameMap = {}
    // props.data.yData = [[{ "val": 0, "flag": null }, { "val": 0, "flag": 1 }, null, { "val": 0, "flag": null }, { "val": 0, "flag": null }, { "val": 0, "flag": null }, { "val": 0, "flag": null }, { "val": 0, "flag": null }, { "val": 0, "flag": null }, { "val": 0, "flag": null }, { "val": 0, "flag": null }, { "val": 0, "flag": null }, { "val": 0, "flag": null }, { "val": 0, "flag": null }, { "val": 0, "flag": null }, { "val": 0, "flag": null }, { "val": 0, "flag": null }, { "val": 0, "flag": null }, { "val": 0, "flag": null }, { "val": 0, "flag": null }, { "val": 0, "flag": null }, { "val": 0, "flag": null }, { "val": 0, "flag": null }, { "val": 0.13, "flag": null }, { "val": 1.42, "flag": null }, { "val": 5.76, "flag": null }, { "val": 15.09, "flag": null }, { "val": 25.19, "flag": null }, { "val": 45.93, "flag": 1 }, { "val": 107.27, "flag": 1 }, { "val": 189.14, "flag": 1 }, { "val": 181.69, "flag": null }, { "val": 207.05, "flag": null }, { "val": 291.02, "flag": null }, { "val": 324.46, "flag": null }, { "val": 363.98, "flag": null }, { "val": 400.52, "flag": null }, { "val": 439.27, "flag": null }, { "val": 464.66, "flag": null }, { "val": 488.18, "flag": null }, { "val": 541.08, "flag": null }, { "val": 569.17, "flag": null }, { "val": 596.43, "flag": null }, null, { "val": 642.22, "flag": null }, { "val": 660.8, "flag": null }, { "val": 678.78, "flag": null }, { "val": 692.88, "flag": null }, { "val": 706.95, "flag": null }, { "val": 716.41, "flag": null }, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]]
    props.data.yData && props.data.yData.map((yLine: any, index) => {
      let curLine = getLine(yLine.length);
      let curFlag = 0
      let needPushFlag = true

      const seriesItem = props.data.series[index] || {}

      // 针对预测图表，修复颜色问题
      let colorIndex
      if (!nameMap[seriesItem.name] && nameMap[seriesItem.name] !== 0) {
        nameMap[seriesItem.name] = curIndex++
        colorIndex = nameMap[seriesItem.name]
      } else {
        colorIndex = nameMap[seriesItem.name]
      }

      const customOption = getLineStyle(getColor(colorList, colorIndex), "solid")
      if (seriesItem.customOption?.lineStyle) {
        customOption.lineStyle = seriesItem.customOption?.lineStyle
      }
      const newSeriesItem = {
        ...seriesItem,
        customOption: {
          ...seriesItem?.customOption,
          ...customOption
        }
      }

      const needSplit = newSeriesItem.customOption.type !== 'bar'
      yLine.forEach((data, yLine_index) => {

        const item = getItem(data)
        curLine[yLine_index] = item.val;
        if (needSplit) {
          if (item.flag === 0 || curFlag === 1) {
            if (item.flag === 1) {
              curLine[yLine_index] = null;
            }
            curFlag = item.flag
            needPushFlag = true
          } else {
            curFlag = 1
            yData.push(curLine)
            curLine = getLine(yLine.length);
            needPushFlag = false
            series.push(newSeriesItem);
          }
        }
      })

      if (needPushFlag) {
        yData.push(curLine)
        series.push(newSeriesItem);
      }
    })
    data = { ...props.data, series, yData }
  }
  return data
}

function mergeConfig(cur = {}, target = {}) {
  let item = { ...cur }
  Object.keys(target).forEach(key => {
    if (item[key] && typeof item[key] === 'object') {
      item[key] = { ...item[key], ...target[key] }
    } else {
      item[key] = target[key]
    }
  })
  return item
}

export default function calcLineOption(props: LineChartProps, config: any = {}): EChartOption {
  const { simpleChart, colorList, type } = props;
  const option = getBasicConfig(props, "line", config);
  // // 断点才显示圆圈 其余不显示圆圈
  const symbolMap: any = {}
  option.series.forEach((item: any, index) => {
    calcShowSymbolPoint(item.data, symbolMap, index)
    // @ts-ignore
    item.symbol = (value, params) => {
      if (!symbolMap[`${params.componentIndex},${params.dataIndex}`]) {
        return 'none'
      }
      return simpleChart ? 'circle' : 'emptyCircle'
    }
  })
  return option;
}

export function   getBasicConfig(props, type, config: any = {}) {
  const yData = _.cloneDeep(props.data.yData)
  props.data = formatDataFlag(props)
  const { reverseAxis, customOption = {}, showLegend, isUnitPrev, disableZoom, tooltipTimeFormater, timeLine, simpleChart, data, getExtraParams } = props;
  let {
    xAxis = [],
    yAxis = [],
    legend,
    yAxisMargin,
    grid,
    tooltip = {},
    ...restCustomOption
  } = customOption;
  let { series, valueAxis, labelAxis, grid: formatGrid, uniqueUnitList } = formatData(
    props,
    type,
    config,
    yData
  );
  const option: EChartOption = {
    tooltip: simpleChart ? undefined : {
      trigger: "axis",
      axisPointer: {
        type: "line",
        lineStyle: {
          type: "dashed"
        },
      },
      borderWidth: 0,
      appendToBody: true,
      formatter: getToolTipFormatter(
        isUnitPrev,
        tooltipTimeFormater,
        reverseAxis,
        data.yDataTitle,
        yData,
        getExtraParams
      ),
      ...tooltip
    },
    dataZoom: disableZoom || simpleChart ? undefined : [
      {
        type: "inside",
        orient: reverseAxis ? "vertical" : "horizontal",
        throttle: timeLine ? 400 : 100,
        minValueSpan: 1
      }
    ],
    grid: formatGrid,
    xAxis: reverseAxis ? valueAxis : labelAxis,
    yAxis: reverseAxis ? labelAxis : valueAxis,
    series,
    legend: showLegend ? getLegend(series, customOption, uniqueUnitList) : undefined,
    ...restCustomOption
  };

  option.xAxis = (option.xAxis as EChartOption.XAxis[]).map((item, index) => (
    mergeConfig(item, getCustomOption(xAxis, index))
  ));

  option.yAxis = (option.yAxis as EChartOption.YAxis[]).map((item, index) => (
    mergeConfig(item, getCustomOption(yAxis, index))
  ));

  return option;
}

// 获取图例
export function getLegend(series, customOption, uniqueUnitList?) {
  const { legend = {} } = customOption;

  let hasMultiUnit = uniqueUnitList && uniqueUnitList.length > 1

  return {
    data: series.map(item => item.name),
    right: hasMultiUnit ? '60px' : "10px",
    top: "8px",
    icon: 'circle',
    itemWidth: 8,
    ...legend
  };
}

function isEmpty(val) {
  return val === undefined || val === null || val === ''
}

function getValue(item) {
  const value = item?.value
  return Array.isArray(value) ? value[1] : value
}

export function calcShowSymbolPoint(list, map, curIndex) {
  if (!list) return
  const len = list.length
  list.forEach((item, index) => {
    const value = getValue(item)
    const prevValue = getValue(list[index - 1])
    const nextValue = getValue(list[index + 1])
    if (isEmpty(value)) return
    if (index === 0) {
      if (isEmpty(nextValue)) {
        map[`${curIndex},${index}`] = true
      }
    } else if (index === len - 1) {
      if (isEmpty(prevValue)) {
        map[`${curIndex},${index}`] = true
      }
    } else {
      if (isEmpty(prevValue) && isEmpty(nextValue)) {
        map[`${curIndex},${index}`] = true
      }
    }
  })
  return map
}

function getSeries(options, props, y) {
  let { series, xData, yData, type, labelList, simpleChart, reverseAxis, barSeriesStyleMap = {} } = options
  const { colorList = [], seriesOption = {}, timeLine } = props;
  const uniqueUnitList = []; // 记录有几种单位
  const unitMinMaxList = [] // 记录轴最大最小值
  let curIndex = 0
  let nameMap = {}
  const formatSeries = series.map((item, index) => {
    const seriesStyle = barSeriesStyleMap[index] || {}
    const seriesStyleIndex = seriesStyle.index ?? -1
    const style = seriesStyle.style || {}

    let colorIndex
    const isNewName = !nameMap[item.name] && nameMap[item.name] !== 0
    if (isNewName) {
      nameMap[item.name] = curIndex++
      colorIndex = nameMap[item.name]
    } else {
      colorIndex = nameMap[item.name]
    }

    const isArrayValue = Array.isArray(yData[index]?.[0])
    let unitIndex = item.isUnique ? (isNewName ? -1 : nameMap[item.name]) : uniqueUnitList.indexOf(item.unit);
    if (unitIndex < 0) {
      uniqueUnitList.push(item.unit);
      unitIndex = uniqueUnitList.length - 1;
      unitMinMaxList[unitIndex] = getMinMaxValue(yData[index], isArrayValue, [0, 0])
    } else {
      unitMinMaxList[unitIndex] = getMinMaxValue(yData[index], isArrayValue, unitMinMaxList[unitIndex])
    }

    const xDataIndexMap: any = {}
    xData.forEach((x, index) => {
      xDataIndexMap[x] = index
    })

    const addStyle = (target, i) => {
      if (seriesStyleIndex > -1 && i >= seriesStyleIndex) {
        return { ...target, ...style }
      }
      return target
    } 

    const { itemStyle: seriesOptionItemStyle, lineStyle: seriesOptionLineStyle, ...seriesOptionOther } = seriesOption
    const { itemStyle: customItemStyle, lineStyle: customLineStyle, ...customOptionOther } = item.customOption || {}
    
    return {
      name: item.name,
      type: item.type || type,
      yAxisIndex: unitIndex,
      symbol: simpleChart ? 'circle' : 'emptyCircle',
      symbolSize: simpleChart ? 1 : 4,
      data: isArrayValue ?
        yData[index].map((data, i) => {
          let target = {
            value: data,
            unit: item.unit
          };
          return addStyle(target, i)
        }) :
        labelList.map((key, label_index) => {
          const xIndex = xDataIndexMap[key] ?? -1
          const value = xIndex > -1 ? yData[index]?.[xIndex] : null
          let data = [key, value]
          if (reverseAxis) {
            data = [value, key]
          }
          if (Array.isArray(value)) {
            data = value
          }
          return addStyle({
            value: data,
            unit: item.unit
          }, label_index);
        }),
      itemStyle: {
        color: getColor(colorList, colorIndex),
        ...seriesOptionItemStyle,
        ...customItemStyle,
      },
      ...seriesOptionOther,
      ...customOptionOther,
      lineStyle: {
        color: y[index]?.every(i => i?.show === false) ? 'rgba(0,0,0,0)' : undefined,
        ...seriesOptionLineStyle,
        ...customLineStyle,
      },
    };
  });

  return {
    series: formatSeries,
    uniqueUnitList,
    unitMinMaxList,
  };
}

function getValueAxis(uniqueUnitList, xData, option) {
  const { offsetList, reverseAxis, simpleChart, theme, series } = option;
  const list = uniqueUnitList.length > 0 ? uniqueUnitList : [undefined];
  return list.map((unit, index) => {
    const seriesItem = series[index]
    const labelWithUnit = (unit && UnitInAxis.indexOf(unit) > -1) || seriesItem?.labelWithUnit
    const customOption: any = {};
    if (index > 1) {
      // 多坐标轴位置设置
      customOption.position = reverseAxis ? "top" : "left";
      customOption.offset = offsetList[index];
    }
    return {
      name: simpleChart || labelWithUnit ? undefined : unit,
      type: "value",
      data: xData,
      axisLabel: {
        show: simpleChart ? false : true,
        formatter: labelWithUnit ? `{value}${unit}` : undefined
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#92929d'
        }
      },
      splitLine: simpleChart ? undefined : {
        lineStyle: {
          color: [theme === 'dark' ? '#2a2b2d' : '#f1f1f5'],
          type: 'dotted'
        }
      },
      ...customOption
    };
  });
}

function getLabelAxis(xData, option) {
  const { timeLine, formatLabel, fillLabelAxis, simpleChart } = option;

  let data = timeLine ? undefined : (fillLabelAxis && xData.length ? fillLabelAxisByRange(fillLabelAxis) : xData)

  return [
    {
      type: timeLine ? "time" : "category",
      data: timeLine ? undefined : data,
      axisLine: {
        lineStyle: {
          color: '#92929d'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: simpleChart ? false : true,
        formatter: formatLabel
      },
      splitLine: simpleChart ? undefined : {
        show: true,
        lineStyle: {
          show: true,
          color: ['#f1f1f5'],
          type: 'dotted'
        }
      },
      // boundaryGap: !option.isLineOnly
    }
  ];
}

export function formatData(props: any, type: string, config, y) {
  const {
    data = {},
    customOption = {},
    reverseAxis,
    timeLine,
    formatXData = xData => xData, // 格式化xData的数据
    formatLabel,
    fillLabelAxis,
    simpleChart
  } = props;
  let { yAxisMargin = 50, grid = defaultGrid, theme, xAxis } = customOption;

  let { xData = [], yData = [], series = [] } = data;
  xData = formatXData(xData);

  const labelAxis: any[] = getLabelAxis(xData, {
    timeLine,
    formatLabel,
    fillLabelAxis,
    simpleChart
  });

  const { series: formatSeries, uniqueUnitList, unitMinMaxList } = getSeries(
    {
      series,
      xData,
      yData,
      type,
      labelList: labelAxis[0].data || xData,
      simpleChart,
      reverseAxis,
      barSeriesStyleMap: config.barSeriesStyleMap
    },
    props,
    y ?? yData
  );

  const isLineOnly = formatSeries.every(item => item.type === 'line');
  labelAxis[0].boundaryGap = !isLineOnly

  const newGrid = { ...grid };

  let timeStrLength = 0
  if (xData.length) {
    timeStrLength = getChartTextWidth(xData[0]) / 2
  }
  let toRightMarginMin = 0
  if (xAxis) {
    const target: any = getCustomOption(xAxis, 0)
    if (target.name) {
      toRightMarginMin = getChartTextWidth(target.name) + 16 + GRIND_MARGIN
    }
  }

  let { left, right, offsetList } = getOffsetList(unitMinMaxList)
  if (!offsetList.length) {
    left = GRIND_MARGIN + Axis_NUM_MARGIN
  } else if (offsetList.length < 3 && xData.length) {
    left = Math.max(left, getChartTextWidth(xData[0]) / 2)
  }

  // 添加值坐标轴侧边距，给多坐标轴预留空位
  if (reverseAxis) {
    // newGrid.bottom = left.toString();
    // if (offsetList.length > 1) {
    //   newGrid.top = right
    // } else {
    //   newGrid.top = GRIND_MARGIN
    // }
  } else {
    newGrid.left = left.toString();
    if (offsetList.length > 1) {
      newGrid.right = Math.max(right, toRightMarginMin, timeStrLength)
    } else {
      newGrid.right = Math.max(GRIND_MARGIN, toRightMarginMin, timeStrLength)
    }
  }

  const valueAxis = getValueAxis(uniqueUnitList, xData, {
    offsetList,
    reverseAxis,
    simpleChart,
    theme,
    series,
  });

  return {
    series: formatSeries,
    valueAxis,
    labelAxis,
    grid: newGrid,
    uniqueUnitList
  };
}

function getMaxLengthStr(target) {
  const [min, max] = target
  let minStr = utils.addMicrometerOperator(min.toString())
  let maxStr = utils.addMicrometerOperator(max.toString())
  return minStr.length > maxStr.length ? minStr : maxStr
}

function getChartTextWidth(str) {
  return Math.ceil(getTextWidth(str, '12px sans-serif'))
}

function getOffsetList(unitMinMaxList) {
  let widthList = []
  let offsetList = []
  let left = 0, right = 0
  unitMinMaxList.forEach((item, index) => {
    const str = getMaxLengthStr(item)
    const strWidth = getChartTextWidth(str)
    let width = Math.max(MIN_GRID, strWidth) + GRIND_MARGIN + Axis_NUM_MARGIN
    widthList.push(width)
  })

  const len = widthList.length
  widthList.forEach((width, index) => {
    let offset = 0
    if (index > 1) {
      offset += widthList[0]
      for (let i = 2;i < len - 1;i++) {
        offset += widthList[i]
      }
    }
    offsetList.push(offset)
    if (index !== 1) {
      left += width
    }
  })
  right = widthList[1]

  return {
    offsetList,
    left,
    right
  }
}
