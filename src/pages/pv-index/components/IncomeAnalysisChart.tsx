import React, { Component, useEffect } from "react";
import { connect } from "dva";
import moment from "moment";
import { FullLoading } from "wanke-gui";
import MyCard from "./MyCard";
import CommonTitle from "./CommonTitle";
import TabSelect from "../../../components/TabSelect";
import CommonEcharts from "../../../components/charts/common-echarts/CommonEcharts";
import styles from "./styles/income-analysis-chart.less";
import { useEchartsOption, CustomChartOption } from "../../../components/charts/common-echarts/useEchartsOption";
import { tabList, incomeChartSeries } from "../model";

import utils from "../../../public/js/utils";

export function getTimeRange(type, isHourMod?: boolean): any {
  if(type !== 'detail') {
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
  } else {
    let startTime: any = moment().startOf('days').format('YYYY-MM-DD HH:mm:00')
    // let endTime: any = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
    let endTime: any = moment().endOf('days').subtract(1, 'hours').format('YYYY-MM-DD HH:mm:00')
    return {
      startTime,
      endTime,
      step: 1,
      stepType: 'hours',
      formater: 'YYYY-MM-DD HH:mm:ss'
    }
  }
}

const colorList = ["#0062ff"];

const grid = {
  left: "80",
  right: "16",
  top: "40",
  bottom: "36"
};

interface Props {
  className?: string;
  dispatch?: any;
  incomeChart?: any;
  incomeMode?: string;
  theme?: 'light' | 'dark'
  viewTime: string;
  loading: boolean
}

const IncomeAnalysisChart: React.FC<Props> = props => {
  const { incomeChart, incomeMode, dispatch, theme, viewTime } = props;
  const { option } = useEchartsOption<CustomChartOption.LineChart>({
    type: 'line',
    colorList,
    showUnit: true,
    showLegend: true,
    disableZoom: true,
    data: incomeChart,
    formatLabel: value => {
      if(incomeMode === 'detail') return value.split(' ').slice(-1)[0]
      return value.replace(' ', '\n')
    },
    fillLabelAxis: getTimeRange(incomeMode),
    seriesOption: {
      areaStyle: {
        // @ts-ignore
        color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
                offset: 0, color: '#0062ff80' // 0% 处的颜色
            }, {
                offset: 1, color: 'transparent' // 100% 处的颜色
            }],
            global: false // 缺省为 false
        }
      }
    },
    customOption: {
      theme,
      grid,
      yAxis: { minInterval: 1 },
      legend: {
        textStyle: {
          color: theme === 'dark' ? '#ccc' : '#333'
        },
        inactiveColor: theme === 'dark' ? '#555' : '#ccc',
      }, 
    }
  });

  const changeTime = item => {
    dispatch({ type: 'indexPage/updateToView', payload: { incomeMode: item.key, incomeChart: { series: incomeChartSeries }, incomeChartPointMap: {} } });
    dispatch({ type: 'indexPage/emitSocket', payload: { eventName: 'profit', params: { mod: item.key, viewTime } } });
  };

  const { className = "" } = props;

  return (
    <MyCard className={`${styles["chart-container"]} ${className}`}>
      <div className={styles["header"]}>
        <CommonTitle title={utils.intl("index.收益趋势")} />
        <div className={styles["menu"]}>
          <TabSelect list={tabList} onClick={changeTime} value={incomeMode} />
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
  ...state.indexPage,
});
export default connect(mapStateToProps)(IncomeAnalysisChart);
