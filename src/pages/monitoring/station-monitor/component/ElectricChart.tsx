import React from "react";
import classnames from "classnames";
import CommonEcharts from "../../../../components/charts/common-echarts/CommonEcharts";
import FullLoading from "../../../../components/FullLoading";
import { useEchartsOption, CustomChartOption } from "../../../../components/charts/common-echarts/useEchartsOption";
import styles from './styles/electricChart.less'
import { makeConnect } from '../../../umi.helper'
import moment from 'moment';

const colorList = [
  '#0062ff', '#3dd598', '#ffb076', '#fc5a5a', '#a461d8', '#50b5ff', '#ff9ad5', '#ffc542', '#61a0a8', '#d48265',
  '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'
];

interface Props {
  className?: string;
  data: any;
  loading?: boolean;
  options?: any;
  theme?: any;
}

const ElectricChart: React.FC<Props> = props => {
  const { className = "", loading, data, options, theme } = props;
  let unitArr = []
  data.series.map((o, i) => {
    if (unitArr.indexOf(o.unit) <= -1) {
      unitArr.push(o.unit)
    }
  })
  // console.log('1', options, data)
  let option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {            // 坐标轴指示器，坐标轴触发有效
        type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
      },
    },
    legend: {
      data: data.series.map((o) => o.name),
      textStyle: {
        color: theme === 'dark' ? '#ccc' : '#333'
      },
      inactiveColor: theme === 'dark' ? '#555' : '#ccc',
      right: unitArr.length > 1 ? undefined : 20
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: data?.xData && data?.xData.map((o) => moment(o).format(options.tooltipDateFormat)) || [],
        axisLine: {
          lineStyle: {
            color: '#92929d'
          }
        },
        splitLine: {
          lineStyle: {
            color: ['#f1f1f5']
          }
        },
      }
    ],
    yAxis: unitArr.map((o, i) => {
      return {
        type: 'value', name: o, axisLine: {
          lineStyle: {
            color: '#92929d'
          }
        },
        splitLine: {
          lineStyle: {
            color: [theme === 'dark' ? '#2a2b2d' : '#f1f1f5']
          }
        }
      }
    }),
    series:
      data.series.map((o, i) => {
        return {
          name: o.name, type: options?.types[i], data: data?.yData?.[i] || [], itemStyle: {
            color: colorList[i]
          }, yAxisIndex: unitArr.indexOf(o?.unit) > -1 ? unitArr.indexOf(o?.unit) : '',
          stack: o.stack ? '电量' : '',
          barWidth: options?.types[i] === 'bar' ? options.barWidth : ''
        }
      })
  };

  const { option: electric } = useEchartsOption<CustomChartOption.LineChart>({
    type: 'line',
    colorList,
    showLegend: true,
    showUnit: true,
    data: {
      xData: data?.xData && data?.xData.map((o) => moment(o).format(options.tooltipDateFormat)) || [],
      yData: data.yData,
      series: data.series.map((o, i) => {
        return {
          ...o,
          customOption: {
            type: options?.types[i],
            yAxisIndex: unitArr.indexOf(o?.unit) > -1 ? unitArr.indexOf(o?.unit) : '',
            stack: o.stack ? '电量' : '',
            barWidth: options?.types[i] === 'bar' ? options.barWidth : '',
            symbol: "none",
          }
        }
      })
    },
    customOption: {
      grid: {
        left: "70",
        right: "70",
        top: "40",
        bottom: "30"
      },
      legend: {
        data: data.series.map((o) => o.name),
        textStyle: {
          color: theme === 'dark' ? '#ccc' : '#333'
        },
        inactiveColor: theme === 'dark' ? '#555' : '#ccc',
        right: unitArr.length > 1 ? undefined : 20
      },
    }
  })

  // console.log(option)
  return (
    <div className={classnames(className, styles["chart-container"])}>
      {loading && <FullLoading />}
      <CommonEcharts option={electric} />
    </div>
  );
};

//绑定layout model ，获取title
function mapStateToProps(model, getLoading, state) {
  return {
    theme: state.global.theme,
  };
}

export default makeConnect('stationMonitor', mapStateToProps)(ElectricChart)