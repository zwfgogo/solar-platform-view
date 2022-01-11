import React from "react";
import FullLoading from "../../../components/FullLoading";
import CommonEcharts from "../../../components/charts/common-echarts/CommonEcharts";
import styles from "./styles/incomeChart.less";
import { useEchartsOption } from "../../../components/charts/common-echarts/useEchartsOption";

const colorList = ["#3d7eff"];

interface Props {
  chartLoading?: boolean;
  data: any;
}

const IncomeChart: React.FC<Props> = ({ chartLoading, data = {} }) => {
  const { option } = useEchartsOption({
    type: "line",
    showLegend: true,
    colorList,
    showUnit: true,
    data: _.cloneDeep(data),
    customOption: {}
  });

  return (
    <div className={styles["income-chart"]}>
      {chartLoading && <FullLoading tip="" />}
      <CommonEcharts option={option} />
    </div>
  );
};

export default IncomeChart;
