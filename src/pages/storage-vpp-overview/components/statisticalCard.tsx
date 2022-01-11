import React from "react";
import classnames from "classnames";
import CommonTitle from "../../../components/CommonTitle";
import FullLoading from "../../../components/FullLoading";
import CommonEcharts from "../../../components/charts/common-echarts/CommonEcharts";
import utils from "../../../util/utils";
import styles from "./styles/statisticalCard.less";
import { getWindowSize } from "../../../components/useWindowResize";
import { useEchartsOption, CustomChartOption } from "../../../components/charts/common-echarts/useEchartsOption";

const windowSize = getWindowSize();
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
  left: "60",
  right: "30",
  top: "40",
  bottom: "30"
};

function formatNumber(num: number) {
  return ("0" + num).slice(-2);
}

interface Info {
  value?: number | string;
  desc?: string;
}

interface Props {
  className?: string;
  title?: string;
  infoList?: Info[];
  data: any;
  loading?: boolean;
  isUnitPrev?: boolean;
}

const StatisticalCard: React.FC<Props> = props => {
  const { className = "", title = "", infoList = [], loading, data, isUnitPrev } = props;
  const { option } = useEchartsOption<CustomChartOption.BarChart>({
    type: 'bar',
    colorList,
    showUnit: true,
    isUnitPrev,
    data,
    customOption: {
      grid,
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
      yAxis: windowSize.pageHeight < 700 ? {
        splitNumber: 2
      } : {}
    }
  });

  return (
    <div className={classnames(className, styles["statistical-card"])}>
      <CommonTitle
        title={title}
        style={{ margin: "10px 0 0 10px", flexShrink: 0 }}
      />
      <div className={styles["info"]}>
        {infoList.map((info, index) => (
          <div key={index} className={styles["info-item"]}>
            <p className={styles["label"]}>
              <span className={styles["number"]}>
                {utils.addMicrometerOperator((info.value || "").toString())}
              </span>
            </p>
            <p className={styles["desc"]}>{info.desc}</p>
          </div>
        ))}
      </div>
      <div className={styles["chart-container"]}>
        {loading && <FullLoading />}
        <CommonEcharts option={option} />
      </div>
    </div>
  );
};

export default StatisticalCard;
