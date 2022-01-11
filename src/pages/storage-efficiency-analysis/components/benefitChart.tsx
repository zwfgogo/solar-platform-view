import React from "react";
import classnames from "classnames";
import CommonEcharts from "../../../components/charts/common-echarts/CommonEcharts";
import styles from "./styles/benefitChart.less";
import { useEchartsOption, CustomChartOption } from "../../../components/charts/common-echarts/useEchartsOption";
import { FullLoading } from 'wanke-gui'

const colorList = ["#3d7eff"];

interface Props {
  className?: string;
  data: any;
  loading?: boolean;
}

const BenefitChart: React.FC<Props> = props => {
  const { className = "", loading, data = {} } = props;
  const { option } = useEchartsOption<CustomChartOption.BarChart>({
    type: 'bar',
    colorList,
    showUnit: true,
    showLegend: true,
    data,
    seriesOption: {
      barMaxWidth: 100,
    },
    customOption: {
      grid: {
        left: "50",
        right: "30",
        top: "70",
        bottom: "30"
      },
      legend: {
        type: 'scroll'
      },
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
