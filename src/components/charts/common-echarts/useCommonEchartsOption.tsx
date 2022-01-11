import React, { useState, useEffect } from "react";
import { EChartOption } from "echarts/lib/echarts";

// 用于tooltip中的图标显示，目的是为了兼容渐进色
function getMarker(data: any) {
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

export enum CHARTS_TYPE {
  BAR = "bar",
  LINE = "line"
}

const grid = {
  left: "30",
  right: "30",
  top: "40",
  bottom: "30"
};

const defaultOption = {};
defaultOption[CHARTS_TYPE.BAR] = {
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow"
    },
    formatter: (params, index) => {
      return (
        `${params[0].name}<br />` +
        params
          .map(
            data =>
              `${getMarker(data)}${data.seriesName}: ${data.value || 0}${data
                .data.unit || ""}`
          )
          .join("<br />")
      );
    }
  },
  grid
};
defaultOption[CHARTS_TYPE.LINE] = {
  ...defaultOption[CHARTS_TYPE.BAR],
  tooltip: {
    ...defaultOption[CHARTS_TYPE.BAR].tooltip,
    trigger: "axis",
    axisPointer: {
      type: "line"
    }
  }
};

interface ChartData {
  xData?: any[];
  yData?: any[][];
  series?: any[];
}

interface Props {
  data?: ChartData;
  type?: string;
  showUnit?: boolean;
  showLegend?: boolean;
  colorList?: any[];
  reverseAxis?: boolean;
  customOption?: echarts.EChartOption<EChartOption.Series> & {
    yAxisMargin?: number;
  };
  unitPos?: string;
  formatXData?: (xData: any[]) => any[];
}

export function useCommonEchartsOption(props: Props) {
  const {
    data = {}, // 数据
    type = CHARTS_TYPE.BAR, // 图表类型：目前只支持折线图和柱状图
    colorList = [], // 颜色列表
    showUnit, // 是否显示单位
    unitPos = "y", // 单位显示位置
    showLegend, // 显示图例
    reverseAxis, // 翻转地图
    customOption = {}, // 其他配置,
    formatXData = xData => xData // 格式化xData的数据
  } = props;
  let { xData = [], yData = [], series = [] } = data;
  xData = formatXData(xData);
  const { yAxisMargin = 50 } = customOption;
  const [option, setOption] = useState({});

  // 获取横坐标配置
  const getXAxis = () => {
    let { xAxis = [] } = customOption;
    if (!Array.isArray(xAxis)) {
      xAxis = [xAxis];
    }
    if (xAxis.length === 0) {
      xAxis.push({});
    }

    const unitName = showUnit
      ? `${(series[0] && series[0].unit) || ""}`
      : undefined;

    return xAxis.map((item, index) => ({
      name: unitPos === "x" ? unitName : undefined,
      type: reverseAxis ? "value" : "category",
      data: reverseAxis ? undefined : xData,
      ...item
    }));
  };

  // 获取纵坐标配置
  const getYAxis = formatYAxis => {
    let { yAxis = [] } = customOption;
    if (!Array.isArray(yAxis)) {
      yAxis = [yAxis];
    }
    if (formatYAxis.length === 0) {
      formatYAxis.push({});
    }

    const unitName = showUnit
      ? `${(series[0] && series[0].unit) || ""}`
      : undefined;

    return formatYAxis.map((item, index) => {
      const customOption: any = {};
      if (index > 1) {
        customOption.position = "left";
        customOption.offset = yAxisMargin * (index - 1);
      }
      const yOption = {
        name: unitName,
        type: reverseAxis ? "category" : "value",
        data: reverseAxis ? xData : undefined,
        ...customOption,
        ...item,
        ...(yAxis[index] || {})
      };
      if (unitPos === "x" && !(yAxis[index] || {}).name) delete yOption.name;
      return yOption;
    });
  };

  const getSeries = (seriesOptionList = []) => {
    return series.map((item, index) => ({
      name: item.name,
      type: item.type || type,
      data:
        yData[index].map(data => ({
          value: data,
          unit: item.unit
        })) || [],
      itemStyle: {
        color: colorList[index]
      },
      ...(seriesOptionList[index] || {}),
      ...(item.customOption || {})
    }));
  };

  // 获取图例
  const getLegend = () => {
    const { legend = {} } = customOption;
    const formatedSeries = getSeries();
    return {
      data: formatedSeries.map(item => item.name),
      right: "10px",
      top: "10px",
      ...legend
    };
  };

  useEffect(() => {
    console.log("updata option");
    const {
      xAxis = {},
      yAxis = {},
      legend,
      grid: customGrid,
      ...restCustomOption
    } = customOption;
    const {
      seriesOptionList,
      yAxis: formatYAxis,
      grid: formatGrid
    } = formatData({ yData, series, grid: customGrid || grid, yAxisMargin, reverseAxis });
    const newOption = {
      ...defaultOption[type],
      dataZoom: [
        {
          type: "inside",
          orient: reverseAxis ? "vertical" : "horizontal"
        }
      ],
      grid: formatGrid,
      xAxis: getXAxis(),
      yAxis: getYAxis(formatYAxis),
      series: getSeries(seriesOptionList),
      legend: showLegend ? getLegend() : undefined,
      ...restCustomOption
    };
    setOption(newOption);
  }, [JSON.stringify(props)]);

  return {
    option
  };
}

// 计算坐标轴最大值和最小值
function calcRangeList(yData) {
  const rangeList = [];
  yData.forEach(row => {
    if (row.length === 0) {
      rangeList.push({});
      return;
    }
    let max = Math.ceil(row[0]),
      min = Math.floor(row[0]);
    row.forEach(item => {
      if (max < item) max = Math.ceil(item);
      if (min > item) min = Math.floor(item);
    });
    rangeList.push({
      max: max || 1,
      min: min > 0 ? 0 : min
    });
  });
  return rangeList;
}

function formatData({
  series = [],
  yData = [],
  grid,
  yAxisMargin,
  reverseAxis = false
}) {
  const newGrid = { ...grid };
  const seriesOptionList = []; // 记录当前数据在哪个坐标轴上
  const uniqueUnitList = []; // 记录有几种单位
  const uniqueRnageList = []; // 记录每个单位坐标的最大值和最小值
  const rangeList = calcRangeList(yData);
  series.forEach((item, index) => {
    let unitIndex = uniqueUnitList.indexOf(item.unit);
    if (uniqueUnitList.indexOf(item.unit) < 0) {
      uniqueUnitList.push(item.unit);
      uniqueRnageList.push({ ...rangeList[index] });
      unitIndex = uniqueRnageList.length - 1;
    } else {
      uniqueRnageList[unitIndex].max = Math.max(
        uniqueRnageList[unitIndex].max,
        rangeList[index].max || 0
      );
      uniqueRnageList[unitIndex].min = Math.min(
        uniqueRnageList[unitIndex].min,
        rangeList[index].min || 0
      );
    }
    seriesOptionList[index] = {
      yAxisIndex: unitIndex
    };
  });
  const yAxis: any[] = uniqueUnitList.map((unit, index) => ({
    name: unit
    // 先注释，不手动设置y轴最大值和最小值（别删）
    // ...(reverseAxis ? {} : uniqueRnageList[index])
  }));

  // 第三个纵坐标开始添加左边边距
  const yAxisMarginLen =
    uniqueUnitList.length - 2 > 0 ? uniqueUnitList.length - 2 : 0;
  newGrid.left = (
    Number(newGrid.left) +
    yAxisMargin * yAxisMarginLen
  ).toString();

  return {
    seriesOptionList,
    yAxis,
    grid: newGrid
  };
}
