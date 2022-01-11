import React from "react";
import FullLoading from "../../../components/FullLoading";
import CommonEcharts from "../../../components/charts/common-echarts/CommonEcharts";
import styles from "./styles/benefitDetailChart.less";
import { useEchartsOption, CustomChartOption } from "../../../components/charts/common-echarts/useEchartsOption";
import moment from "moment";

const colorList = ["#3d7eff"];

interface Props {
  chartLoading?: boolean;
  data: any;
}

const BenefitDetailChart: React.FC<Props> = ({ chartLoading, data = {} }) => {
  const { option } = useEchartsOption<CustomChartOption.LineChart>({
    type: 'line',
    showLegend: true,
    tooltipTimeFormater: val => moment(val).format('YYYY-MM-DD'),
    formatLabel: val => moment(val).format('YYYY-MM-DD'),
    showUnit: true,
    data,
    customOption: {
      grid: {
        left: "50",
        right: "30",
        top: "70",
        bottom: "30"
      },
      legend: {
        type: 'scroll',
        right: 'auto'
      },
      tooltip: {
        appendToBody: true,
        confine: true
      }
    },
    formatXData: xData => {
      return xData.map(item => {
        if (item) {
          return item.replace(/(\d+):(\d+):(\d+)/, "$1:$2");
        }
        return item;
      });
    }
  });

  return (
    <div className={styles["benefit-detail-chart"]}>
      {chartLoading && <FullLoading />}
      <CommonEcharts option={option} />
    </div>
  );
};

export default BenefitDetailChart;
