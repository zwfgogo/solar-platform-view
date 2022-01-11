import calcLineOption from "./lineType";
import calcBarOption from "./barType";
import calcSplitLineOption from "./splitLine";
import { calcPieOption } from "./pieType";
import calcScatterOption from "./scatterType";
import splitBarOption from "./splitBarType";
import moment, { Moment } from 'moment';
import utils from "../../../../public/js/utils";
import Utils from "../../../../util/utils"

export type ChartsType = "line" | "bar" | "splitLine" | "pie" | "scatter" | "splitBar";

const calcFn = {
  line: calcLineOption,
  bar: calcBarOption,
  splitLine: calcSplitLineOption,
  pie: calcPieOption,
  scatter: calcScatterOption,
  splitBar: splitBarOption,
};

interface Props {
  type?: ChartsType;
  theme?: 'light' | 'dark'
}

export function getOption(props: Props) {
  const { type = "bar", ...rest } = props;
  if (!calcFn[type]) return {};
  return calcFn[type](rest);
}

// 用于tooltip中的图标显示，目的是为了兼容渐进色
export function getMarker(data: any) {
  const { color } = data;
  let colorStr = "";
  if (typeof color === "string") {
    colorStr = color;
  } else if (typeof color === "object") {
    const { colorStops = [] } = color;
    colorStr = (colorStops[0] && colorStops[0].color) || "";
  }
  return `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color: ${colorStr};"></span>`;
}

// 柱形图和折线图通用tooltip格式化方法
export function getToolTipFormatter(
  isUnitPrev = false,
  tooltipTimeFormater?: (val: any) => string,
  reverseAxis?: boolean,
  extraTitleArr = [],
  y?,
  getExtraParams?: (dataIndex: number, xName: string) => { value: any, label: string }[]
) {
  // console.log('y', y)
  return (params, ticket, callback) => {
    let htmlStr = "";
    let valMap = {};
    let isFirstLine = true;
    let dIndex
    let xName
    for (let i = 0; i < params.length; i++) {
      let param = params[i];
      let dataIndex = param.dataIndex;
      dIndex = dataIndex
      let extraTitle = extraTitleArr?.[i]?.[dataIndex] || ''
      xName = param.name; //x轴的名称
      let seriesName = param.seriesName; //图例名称
      let value = param.value; //y轴值
      if (Array.isArray(value)) value = value[reverseAxis ? 0 : 1]
      let color = param.color; //图例颜色

      //过滤无效值
      if (value == "-") {
        continue;
      }

      value = Array.isArray(value) ? value[1] : value;
      let valueLabel = isUnitPrev
        ? `${param.data.unit || ""}${value}`
        : `${ y?.[param.seriesIndex]?.every(i => i?.show === false) ? '--' : value}${param.data.unit || ""}`;
      if (value === null || value === undefined) valueLabel = utils.intl('暂无数据');
      //过滤重叠值
      if (value && valMap[seriesName] == value) {
        continue;
      }

      if (isFirstLine) {
        const title = tooltipTimeFormater ? `${tooltipTimeFormater(params[0].axisValue)}<br />` : `${params[0].axisValue}<br />`
        htmlStr += title; //x轴的名称
        isFirstLine = false;
      }
      htmlStr += "<div>";
      //为了保证和原来的效果一样，这里自己实现了一个点的效果
      htmlStr +=
        '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
        color +
        ';"></span>';

      //圆点后面显示的文本
      htmlStr += seriesName + "：" + valueLabel + (extraTitle ? `${'，' + extraTitle}` : '');

      htmlStr += "</div>";
      valMap[seriesName] = value;
    }

    if (getExtraParams && (dIndex || dIndex === 0)) {
      getExtraParams(dIndex, xName).forEach(item => {
        htmlStr += "<div>";
        htmlStr +=
          '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color: transparent;"></span>';
  
        //圆点后面显示的文本
        htmlStr += item.label + "：" + item.value;
  
        htmlStr += "</div>";
      })
    }

    return htmlStr;
  }
}

export function getCustomOption(target: object | object[], index: number) {
  if (!Array.isArray(target)) return target || {};
  return target[index] || {};
}

const FormaterMap = {
  'day': 'YYYY-MM-DD',
  'month': 'YYYY-MM',
  'year': 'YYYY',
}

const AddTimeMap = {
  'day': 'days',
  'month': 'months',
  'year': 'years',
}

export interface FillLabelAxisByRange {
  startTime: string | Moment
  endTime: string | Moment
  type?: 'day' | 'month' | 'year'
  step?: number
  stepType?: 'year' | 'month' | 'day' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'
  formater?: string
}

export function fillLabelAxisByRange(fillLabelAxis: FillLabelAxisByRange) {
  const { type, step = 1, stepType, formater } = fillLabelAxis
  const formaterStr = formater || FormaterMap[type]
  const list = []
  let startTime = moment(fillLabelAxis.startTime)
  let endTime = moment(fillLabelAxis.endTime)
  if (startTime.isAfter(endTime)) {
    [startTime, endTime] = [endTime, startTime]
  }
  let timeTime = moment(startTime)

  while (endTime.isAfter(timeTime)) {
    list.push(timeTime.format(formaterStr))
    const _stepType: any = stepType || AddTimeMap[type];
    timeTime.add(step, _stepType)
  }
  if (endTime.isSame(timeTime)) {
    list.push(timeTime.format(formaterStr))
  }

  return list
}

export function getMarkLine(markLineList: number[], option: any = {}) {
  if (!markLineList || !Array.isArray(markLineList)) return undefined
  const { markLineFormatter } = option

  return {
    symbol: ['none', 'none'],
    label: {
      show: true,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      shadowColor: '#000',
      shadowBlur: 4,
      borderRadius: 4,
      padding: [6, 10, 3],
      formatter: markLineFormatter,
      color: 'rgba(61, 126, 255, 1)',
    },
    lineStyle: {
      color: 'rgba(255, 255, 255, 0.45)'
    },
    data: markLineList.map(num => ({ xAxis: num })) as any
  }
}

export const getMinMaxValue = (list, isArrayValue: boolean, prevVal: number[]) => {
  list = list || []
  let max = 0, min = 0
  list.forEach(item => {
    let value = (isArrayValue ? item[1] : item)

    // undefined null NaN 都做0处理
    value = Math.ceil(Number(value))
    if (isNaN(value)) value = 0

    if (max < value) {
      max = value
    }
    if (min > value) {
      min = value
    }
  })
  return [Math.min(min, prevVal[0]), Math.max(max, prevVal[1])]
}
