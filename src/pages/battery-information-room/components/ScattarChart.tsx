import React from "react";
import classnames from "classnames";
import CommonEcharts from "../../../components/charts/common-echarts/CommonEcharts";
import FullLoading from "../../../components/FullLoading";
import styles from "./styles/scatterChart.less";
import { useEchartsOption, CustomChartOption } from "../../../components/charts/common-echarts/useEchartsOption";

const colorList = ["#ff4d4d", "#0062ff", "#ffa200"];

interface Props {
  className?: string;
  data: any;
  loading?: boolean;
}

const BenefitChart: React.FC<Props> = props => {
  const { className = "", loading, data = {} } = props;
  const { option } = useEchartsOption<CustomChartOption.BarChart>({
    type: 'scatter',
    colorList,
    showUnit: true,
    showLegend: true,
    data,
    seriesOption: {
      symbol: 'circle',
      symbolSize: 8,
    },
    customOption: {
      grid: {
        left: "50",
        right: "50",
        top: "70",
        bottom: "30"
      },
      legend: {
        type: 'scroll'
      },
      xAxis: [
        {
          name: 'SOC',// 给X轴加单位
        }
      ],
      tooltip: {
        appendToBody: true,
        confine: true
      }
    }
  });

  return (
    <div className={classnames(className, styles["chart-container"])}>
      {loading && <FullLoading />}
      <CommonEcharts option={option} />
    </div>
  );
};

export default BenefitChart;
