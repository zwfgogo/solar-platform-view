import React, { Component, useEffect, useState } from "react";
import { connect } from "dva";
import FullLoading from "../../../components/FullLoading";
import MyCard from "./MyCard";
import CommonTitle from "./CommonTitle";
import TabSelect from "../../../components/TabSelect";
import CommonEcharts from "../../../components/charts/common-echarts/CommonEcharts";
import styles from "./styles/reportAnalysisChart.less";
import { useEchartsOption, CustomChartOption } from "../../../components/charts/common-echarts/useEchartsOption";
import { makeConnect } from "../../umi.helper";
import { storage_index } from "../../constants";
import { getTimeRange } from "./PowerAnalysisChart";
import MakeConnectProps from "../../../interfaces/MakeConnectProps";
import { abnormalChartSeries } from "../model";
import utils from "../../../public/js/utils";

const colorList = ["#e73d3d"];

const tabList = [
  {
    key: "day",
    name: utils.intl('common.近30天'),
    value: "day"
  },
  {
    key: "month",
    name: utils.intl('common.近12月'),
    value: "month"
  }
];

const grid = {
  left: "80",
  right: "16",
  top: "40",
  bottom: "36"
};

interface Props extends MakeConnectProps<any> {
  viewTime: string;
  className?: string;
  reportChart?: any;
  chartLoading?: boolean;
  stationList?: any[];
  abnormalMode?: string;
  loading?: boolean
}

const ReportAnalysisChart: React.FC<Props> = props => {
  const { reportChart, stationList, abnormalMode, viewTime } = props;
  const { option } = useEchartsOption<CustomChartOption.BarChart>({
    type: 'bar',
    colorList,
    showUnit: true,
    disableZoom: true,
    data: reportChart,
    fillLabelAxis: getTimeRange(abnormalMode),
    customOption: { grid, yAxis: { minInterval: 1 } }
  });

  const changeTime = item => {
    props.action("updateToView", { abnormalMode: item.value, reportChart: { series: abnormalChartSeries } });
    props.action("emitSocket", { eventName: 'abnormalChart', params: { mod: item.key, viewTime } });
    // setMod(item.value);
    // fetchData(item.value);
  };

  useEffect(() => {
    if (viewTime) {
      return () => {
        props.action("updateToView", { abnormalMode, powerChart: { series: abnormalChartSeries } });
        props.action("emitSocket", { eventName: 'abnormalChart', params: { mod: abnormalMode, viewTime } });
        props.action("resetSocketDate")
      }
    }
  }, [viewTime])

  // const fetchData = (mod: string = "day") => {
  //   props.action("getReportAnalysisChart", { mod });
  // };

  // useEffect(() => {
  //   if(stationList && stationList.length) {
  //     fetchData();
  //   }
  // }, [JSON.stringify(stationList)]);

  const { className = "" } = props;

  return (
    <MyCard className={`${styles["chart-container"]} ${className}`}>
      <div className={styles["header"]}>
        <CommonTitle title={utils.intl('index.告警趋势')} />
        <TabSelect list={tabList} onClick={changeTime} value={abnormalMode} />
      </div>
      <div className={styles["content"]}>
        {props.loading && <FullLoading />}
        <CommonEcharts option={option} />
      </div>
    </MyCard>
  );
};

const mapStateToProps = (model, { getLoading }, state) => ({
  ...model,
  chartLoading: getLoading("getReportAnalysisChart")
});
export default makeConnect(storage_index, mapStateToProps)(ReportAnalysisChart);
