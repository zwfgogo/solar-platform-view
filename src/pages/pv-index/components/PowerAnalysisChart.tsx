import React, { Component, useEffect } from "react";
import { connect } from "dva";
import { FullLoading } from "wanke-gui";
import MyCard from "./MyCard";
import CommonTitle from "./CommonTitle";
import TabSelect from "../../../components/TabSelect";
import CommonEcharts from "../../../components/charts/common-echarts/CommonEcharts";
import styles from "./styles/power-analysis-chart.less";
import { useEchartsOption, CustomChartOption } from "../../../components/charts/common-echarts/useEchartsOption";
import { tabList, powerChartSeries } from "../model";
import { getTimeRange } from "./IncomeAnalysisChart";

import utils from "../../../public/js/utils";

const colorList = ["#0062ff", "#3dd598"];

const grid = {
  left: "80",
  right: "16",
  top: "40",
  bottom: "36"
};

interface Props {
  className?: string;
  dispatch?: any;
  powerChart?: any;
  stationList?: any[];
  powerMode?: string;
  theme?: 'light' | 'dark';
  viewTime: string;
  loading: boolean
}

const PowerAnalysisChart: React.FC<Props> = props => {
  const { powerChart, stationList, dispatch, powerMode, theme, viewTime } = props;
  const { option } = useEchartsOption<CustomChartOption.BarChart>({
    type: 'bar',
    colorList,
    disableZoom: true,
    showLegend: true,
    showUnit: true,
    data: powerChart,
    theme,
    fillLabelAxis: getTimeRange(powerMode, true),
    formatLabel: value => {
      if(powerMode === 'detail') return value.split(' ').slice(-1)[0]
      return value.replace(' ', '\n')
    },
    customOption: {
      grid,
      theme
    }
  });

  const changeTime = item => {
    dispatch({ type: 'indexPage/updateToView', payload: { powerMode: item.key, powerChart: { series: powerChartSeries } } });
    dispatch({ type: 'indexPage/emitSocket', payload: { eventName: 'electric', params: { mod: item.key, viewTime } } });
  };

  const { className = "" } = props;

  return (
    <MyCard className={`${styles["chart-container"]} ${className}`} style={{ marginBottom: 10 }}>
      <div className={styles["header"]}>
        <CommonTitle title={utils.intl("index.发电量趋势")} />
        <div className={styles["menu"]}>
          <TabSelect list={tabList} onClick={changeTime} value={powerMode} />
        </div>
      </div>
      <div className={styles["content"]}>
        {props.loading && <FullLoading />}
        <CommonEcharts option={option} />
      </div>
    </MyCard>
  );
};

const mapStateToProps = state => ({
  ...state.indexPage
});
export default connect(mapStateToProps)(PowerAnalysisChart);
