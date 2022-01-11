import React from "react";
import Data from "./data";
import CommonEcharts from "../../components/charts/common-echarts/CommonEcharts";
import { useEchartsOption, CustomChartOption } from "../../components/charts/common-echarts/useEchartsOption";

const colorList = ["#3d7eff"];

const Demo = () => {
  const { ...data } = Data;
  const { option } = useEchartsOption<CustomChartOption.LineChart>({
    type: 'line',
    showLegend: true,
    colorList,
    showUnit: true,
    data,
    customOption: { legend: { right: '60px' } }
  });

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <CommonEcharts option={option} />
    </div>
  );
};

export default Demo;
