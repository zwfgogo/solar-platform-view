import { EChartOption } from "echarts";
import calcLineOption, { getColor, LineChartProps } from "./lineType";

// 用指定字符填充数组
function padArrayWithString(list, padStr, listLength, isPadPrev = false) {
  const len = listLength - list.length;
  if (len <= 0) return list;
  const padArr = [];
  for (let i = 0; i < len; i++) {
    padArr.push(padStr);
  }
  return isPadPrev ? padArr.concat(list) : list.concat(padArr);
}

export function getLineStyle(color, type, isBar?) {
  if (isBar) {
    if (type === 'solid') return {}
    return {
      itemStyle: {
        color: color + '5c',
        borderColor: color,
        borderWidth: 1,
        borderType: 'dashed'
      }
    }
  }

  return {
    lineStyle: {
      type, //'dotted'虚线 'solid'实线
      color
    },
    itemStyle: {
      color
    }
  };
}

interface ChartData {
  xData?: any[];
  yData?: any[][];
  series?: any[];
  dividing?: string[];
}

export interface SplitLineChartProps extends LineChartProps {
  data?: ChartData;
}

function getDividingIndex(xData, dividingItem) {
  let index = -1
  xData.some((item, i) => {
    if (item >= dividingItem) {
      index = i
      return true
    }
    return false
  })
  return index
}

export default function calcSplitLineOption(
  props: SplitLineChartProps
): EChartOption {
  const { data = {}, colorList } = props;
  let { xData = [], yData = [], series = [], dividing = [] } = data;
  let newYData = [],
    newSeries = [];
  const barSeriesStyleMap: any = {}
  series.forEach((seriesItem, seriesIndex) => {
    const isBar = seriesItem.type === 'bar'
    const dividingItem = dividing[seriesIndex];
    const index = getDividingIndex(xData, dividingItem);
    const lineData = yData[seriesIndex] || [];
    if (isBar) {
      barSeriesStyleMap[seriesIndex] = {
        index,
        style: getLineStyle(getColor(colorList, seriesIndex), "dotted", true)
      }
    }
    // 无分割点或者隔离点在末尾
    if (isBar || index < 0 || index === xData.length - 1) {
      newYData.push(lineData);
      newSeries.push(seriesItem);
      return;
    }
    const len = lineData.length;
    // 用两条同名折线实现，分割部分用'-'填充
    newYData.push(padArrayWithString(lineData.slice(0, index + 1), "-", len));
    newYData.push(padArrayWithString(lineData.slice(index), "-", len, true));
    newSeries.push({
      ...seriesItem,
      customOption: getLineStyle(getColor(colorList, seriesIndex), "solid")
    });
    newSeries.push({
      ...seriesItem,
      customOption: getLineStyle(getColor(colorList, seriesIndex), "dotted")
    });
  });
  const option = calcLineOption({
    ...props,
    data: { xData, yData: newYData, series: newSeries }
  }, { barSeriesStyleMap });
  option.tooltip.formatter = splitLineFormat;

  return option;
}

// 不显示'-'数据, 并过滤重叠值
function splitLineFormat(params, ticket, callback) {
  let htmlStr = "";
  let valMap = {};
  let isFirstLine = true;
  for (let i = 0; i < params.length; i++) {
    let param = params[i];
    let xName = param.name; //x轴的名称
    let seriesName = param.seriesName; //图例名称
    let value = param.value; //y轴值
    if (Array.isArray(value)) value = value[1]
    let color = param.color; //图例颜色

    //过滤无效值
    if (value == "-") {
      continue;
    }

    //过滤重叠值
    if (valMap[seriesName] == value) {
      continue;
    }

    if (isFirstLine) {
      htmlStr += xName + "<br/>"; //x轴的名称
      isFirstLine = false;
    }
    htmlStr += "<div>";
    //为了保证和原来的效果一样，这里自己实现了一个点的效果
    htmlStr +=
      '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
      color +
      ';"></span>';

      let valueLabel = `${value}${param.data.unit || ""}`;

    //圆点后面显示的文本
    htmlStr += seriesName + "：" + valueLabel;

    htmlStr += "</div>";
    valMap[seriesName] = value;
  }
  return htmlStr;
}
