import React from "react";
import classnames from "classnames";
import CommonTitle from "../../../components/CommonTitle";
import FullLoading from "../../../components/FullLoading";
import CommonEcharts from "../../../components/charts/common-echarts/CommonEcharts";
import styles from "./styles/energyStoredCharts.less";
import { useEchartsOption, CustomChartOption } from "../../../components/charts/common-echarts/useEchartsOption";

const colorList = [
  {
    type: "linear",
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      {
        offset: 0,
        color: "#3d7eff" // 0% 处的颜色
      },
      {
        offset: 1,
        color: "#1752c8" // 100% 处的颜色
      }
    ],
    global: false // 缺省为 false
  }
];

const grid = {
  left: "50",
  right: "30",
  top: "40",
  bottom: "30"
};

function formatNumber(num: number) {
  return ("0" + num).slice(-2);
}

interface Props {
  className?: string;
  data: any;
  loading?: boolean;
}

const EnergyStoredCharts: React.FC<Props> = props => {
  const { className = "", loading, data = {} } = props;
  const { option } = useEchartsOption<CustomChartOption.LineChart>({
    type: 'line',
    colorList,
    showUnit: true,
    data,
    customOption: {
      xAxis: {
        axisLabel: {
          formatter: function(value) {
            const date = new Date(value);
            return `${formatNumber(date.getHours())}:${formatNumber(
              date.getMinutes()
            )}`;
          }
        }
      },
      grid
    }
  });

  return (
    <div className={classnames(className, styles["energy-stored-card"])}>
      <CommonTitle title="电池储能" style={{ margin: "10px 0 0 10px" }} />
      <div className={styles["chart-container"]}>
        {loading && <FullLoading />}
        <CommonEcharts option={option} />
      </div>
    </div>
  );
};

export default EnergyStoredCharts;
