import React from "react";
import classnames from "classnames";
import CommonEcharts from "../../../components/charts/common-echarts/CommonEcharts";
import FullLoading from "../../../components/FullLoading";
import styles from "./styles/benefitChart.less";
import { useEchartsOption, CustomChartOption } from "../../../components/charts/common-echarts/useEchartsOption";
import utils from "../../../public/js/utils";

const colorList = ["#3d7eff", "#000"];

interface Props {
  className?: string;
  data: any;
  loading?: boolean;
}

const BenefitChart: React.FC<Props> = props => {
  let { className = "", loading, data = {} } = props;
  const { option } = useEchartsOption<CustomChartOption.BarChart>({
    type: 'bar',
    colorList,
    showUnit: true,
    showLegend: false,
    data,
    seriesOption: {
      barMaxWidth: 50,
      itemStyle: {
        normal: {
          // 随机显示
          //color:function(d){return "#"+Math.floor(Math.random()*(256*256*256-1)).toString(16);}

          // 定制显示（按顺序）
          color: function (params) {
            var colorList = ['#62D56E', '#B0E869', '#F8D835', '#FFAD38', '#E0252F', '#AE0E48'];
            return colorList[params.dataIndex]
          }
        },
      },
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
    <div className={classnames(className, styles["chart-container-benefit"])}>
      {loading && <FullLoading />}
      <CommonEcharts option={option} />
    </div>
  );
};

export default BenefitChart;
