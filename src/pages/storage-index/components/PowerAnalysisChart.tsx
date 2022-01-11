import React, { Component, useEffect, useState } from "react";
import { connect } from "dva";
import FullLoading from "../../../components/FullLoading";
import MyCard from "./MyCard";
import CommonTitle from "./CommonTitle";
import TabSelect from "../../../components/TabSelect";
import CommonEcharts from "../../../components/charts/common-echarts/CommonEcharts";
import styles from "./styles/powerAnalysisChart.less";
import { useEchartsOption, CustomChartOption } from "../../../components/charts/common-echarts/useEchartsOption";
import { makeConnect } from "../../umi.helper";
import { storage_index } from "../../constants";
import MakeConnectProps from "../../../interfaces/MakeConnectProps";
import { powerChartSeries } from "../model";
import moment from "moment";
import utils from "../../../public/js/utils";

export function getTimeRange(type): any {
  let startTime
  let endTime: any = moment()
  if(type === 'day') {
    startTime = moment().subtract(29, 'days').format('YYYY-MM-DD')
    endTime = endTime.format('YYYY-MM-DD')
  } else {
    startTime = moment().subtract(11, 'months').format('YYYY-MM')
    endTime = endTime.format('YYYY-MM')
  }
  return {
    startTime,
    endTime,
    type
  }
}

const colorList = ["#009297", "#3d7eff"];

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
  powerChart?: any;
  chartLoading?: boolean;
  stationList?: any[];
  powerMode?: string;
  loading?: boolean
}

const PowerAnalysisChart: React.FC<Props> = props => {
  const { powerChart, stationList, powerMode, viewTime } = props;
  const { option } = useEchartsOption<CustomChartOption.BarChart>({
    type: 'bar',
    colorList,
    disableZoom: true,
    showLegend: true,
    showUnit: true,
    data: powerChart,
    fillLabelAxis: getTimeRange(powerMode),
    customOption: { grid }
  });

  const changeTime = item => {
    props.action("updateToView", { powerMode: item.value, powerChart: { series: powerChartSeries } });
    props.action("emitSocket", { eventName: 'electric', params: { mod: item.key, viewTime } });
    // fetchData(item.value);
  };

  useEffect(() => {
    if (viewTime) {
      return () => {
        props.action("updateToView", { powerMode, powerChart: { series: powerChartSeries } });
        props.action("emitSocket", { eventName: 'electric', params: { mod: powerMode, viewTime } });
        props.action("resetSocketDate")
      }
    }
  }, [viewTime])

  // const fetchData = (mod?: string) => {
  //   props.action("getPowerAnalysisChart", { mod: mod || powerMode });
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
        <CommonTitle title={utils.intl('电量趋势')} />
        <TabSelect list={tabList} onClick={changeTime} value={powerMode} />
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
  chartLoading: getLoading("getPowerAnalysisChart")
});
export default makeConnect(storage_index, mapStateToProps)(PowerAnalysisChart);
