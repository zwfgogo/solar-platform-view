import React, { useState, useEffect } from "react";
import { EChartOption } from "echarts";
import { ChartsType, getOption } from "./calcOption/chartsTool";
import { LineChartProps } from "./calcOption/lineType";
import { BarChartProps } from "./calcOption/barType";
import { SplitLineChartProps } from "./calcOption/splitLine";
import { PieChartProps } from "./calcOption/pieType";
import { ScatterChartProps } from "./calcOption/scatterType";

export function useEchartsOption<T = any>(props: T) {
  const [option, setOption] = useState({});

  useEffect(() => {
    const newOption = getOption(props);
    setOption(newOption);
  }, [JSON.stringify(props)]);

  return {
    option
  };
}

export namespace CustomChartOption {
  export interface LineChart extends LineChartProps { }
  export interface BarChart extends BarChartProps { }
  export interface SplitLineChart extends SplitLineChartProps { }
  export interface PieChart extends PieChartProps {
    theme?: 'light' | 'dark'
  }
  export interface ScatterChart extends ScatterChartProps { }
}
