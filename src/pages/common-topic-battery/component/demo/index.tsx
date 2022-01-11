import React from "react";
import Data from "./data";
import CommonEcharts from "../../../../components/charts/common-echarts/CommonEcharts";
import FullLoading from "../../../../components/FullLoading";
import { useEchartsOption, CustomChartOption } from "../../../../components/charts/common-echarts/useEchartsOption";

const colorList = ["#0500dd", "#ff4c65", "#42c6e0"];

function formatChartData(data: any) {
  const { results = [], legend = [], unit = [] } = data;
  let result = results[0];
  const yData = results.map(row =>
    row.map(item => {
      if (row.length > result.length) result = row;
      if (item.val === "") return item.val;
      const value = Number(item.val);
      return isNaN(value) ? 0 : value;
    })
  );
  const yDataTitle = results.map(row =>
    row.map(item => {
      if (row.length > result.length) result = row;
      if (item.deviceTitle === "") return item.deviceTitle;
      return item.deviceTitle;
    })
  );
  const xData = (result || []).map(item => item.dtime);
  const series = legend.map((item, index) => ({
    name: item,
    unit: unit[index] || ""
  }));
  return {
    xData,
    yData,
    yDataTitle,
    series
  };
}

const grid = {
  left: "50",
  right: "30",
  top: "40",
  bottom: "30"
};

const Demo = ({ echartData, formatXLabel, loading }) => {
  const { ...data } = formatChartData(echartData);
  const { option } = useEchartsOption<CustomChartOption.LineChart>({
    type: 'line',
    showLegend: true,
    colorList,
    showUnit: true,
    data,
    customOption: { legend: { right: "60px" }, grid },
    formatXData: xData => {
      if (!formatXLabel) return xData;
      return xData.map(item => {
        if (item) {
          return item.replace(/(\d+):(\d+):(\d+)/, "$1:$2");
        }
        return item;
      });
    }
  });

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {loading && <FullLoading />}
      <CommonEcharts option={option} />
    </div>
  );
};

export default Demo;
