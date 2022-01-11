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

enum CHARTS_TYPE {
  BAR = "bar"
}

const grid = {
  left: "30",
  right: "30",
  top: "70",
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
              `${getMarker(data)}${data.seriesName}: ${data.value[1] || 0}${data
                .data.unit || ""}`
          )
          .join("<br />")
      );
    }
  },
  grid
};

interface ChartData {
  xData?: any[];
  yData?: any[][];
  series?: any[];
}

interface Props {
  data?: ChartData[];
  type?: string;
  showUnit?: boolean;
  showLegend?: boolean;
  colorList?: any[];
  customOption?: echarts.EChartOption<EChartOption.Series> & {
    yAxisMargin?: number;
    xAxisMargin?: number;
  };
}

export function usePowerQualityChart(props: Props) {
  const {
    data = [], // 数据
    type = CHARTS_TYPE.BAR, // 图表类型：目前只支持折线图和柱状图
    colorList = [], // 颜色列表
    showLegend, // 显示图例
    customOption = {} // 其他配置,
  } = props;

  const { yAxisMargin = 50, xAxisMargin = 10 } = customOption;
  const [option, setOption] = useState({});

  let chartList = data.slice(0);
  if (chartList.length === 0) {
    chartList.push({});
  }

  // 获取横坐标配置
  const getXAxis = () => {
    const xData = data.reduce(
      (prev, next) => prev.concat(next.xData || []),
      []
    );
    return chartList.map((item, index) => ({
      type: "category",
      show: index === 0,
      position: "bottom",
      axisLine: {
        lineStyle: {
          color: '#92929d'
        }
      },
      splitLine: {},
      data: xData
    }));
  };

  // 获取纵坐标配置
  const getYAxis = () => {
    return chartList.map((item, index) => {
      const customOption: any = {};
      if (index > 1) {
        customOption.position = "left";
        customOption.offset = yAxisMargin * (index - 1);
      }
      const yOption = {
        name: ((item.series || [])[0] || {}).unit || "",
        type: "value",
        minInterval: 1,
        axisLine: {
          lineStyle: {
            color: '#92929d'
          }
        },
        splitLine: {},
        ...customOption
      };
      return yOption;
    });
  };

  const getSeries = (seriesOptionList = []) => {
    let series = [];
    let lastLen = 0;
    data.forEach((chart, chart_i) => {
      const { yData = [] } = chart;
      series = series.concat(
        (chart.series || []).map((item, index) => {
          return {
            name: item.name,
            type,
            barMaxWidth: 100,
            data:
              yData[index].map((data, data_i) => ({
                value: [lastLen + data_i, data],
                unit: item.unit
              })) || [],
            itemStyle: {
              color: colorList[index]
            },
            ...(seriesOptionList[chart_i] || {})
          };
        })
      );
      lastLen += (yData[0] || []).length;
    });

    return series;
  };

  // 获取图例
  const getLegend = () => {
    const { legend = {} } = customOption;
    const series = (data[0] || {}).series || [];
    return {
      type: "scroll",
      data: series.map(item => item.name),
      top: "10px",
      right: "10px",
      ...legend
    };
  };

  useEffect(() => {
    console.log("updata option");
    const {
      xAxis = {},
      yAxis = {},
      legend,
      ...restCustomOption
    } = customOption;
    const { seriesOptionList, grid: formatGrid } = formatData(data, {
      yAxisMargin,
      grid,
      xAxisMargin
    });
    const newOption = {
      ...defaultOption[type],
      dataZoom: [],
      grid: formatGrid,
      xAxis: getXAxis(),
      yAxis: getYAxis(),
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

function formatData(data: ChartData[], { yAxisMargin, grid, xAxisMargin }) {
  const newGrid = { ...grid };
  const seriesOptionList = []; // 记录当前数据在哪个坐标轴上
  data.forEach((item, index) => {
    seriesOptionList[index] = {
      xAxisIndex: index,
      yAxisIndex: index
    };
  });

  // 第三个纵坐标开始添加左边边距
  const yAxisMarginLen = data.length - 2 > 0 ? data.length - 2 : 0;
  newGrid.left = (
    Number(newGrid.left) +
    yAxisMargin * yAxisMarginLen
  ).toString();
  newGrid.bottom = (
    Number(newGrid.bottom) -
    xAxisMargin * yAxisMarginLen
  ).toString();

  return {
    seriesOptionList,
    grid: newGrid
  };
}
