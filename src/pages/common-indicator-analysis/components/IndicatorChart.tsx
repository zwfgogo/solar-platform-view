import moment from 'moment';
import { Moment } from 'moment';
import React, { useMemo } from 'react';
import { FullLoading } from 'wanke-gui';
import { fillLabelAxisByRange } from '../../../components/charts/common-echarts/calcOption/chartsTool';
import CommonEcharts from '../../../components/charts/common-echarts/CommonEcharts';
import { CustomChartOption, useEchartsOption } from '../../../components/charts/common-echarts/useEchartsOption';
import { getFillOption, TableTimeFormaterMap } from '../model';

const colorList = ["#3d7eff"];

interface Props {
  chartLoading: boolean
  data: any
  timeRange: any
  timeMode: string
}

const IndicatorChart: React.FC<Props> = ({ chartLoading, data, timeRange, timeMode }) => {
  const { option } = useEchartsOption<CustomChartOption.LineChart>({
    type: 'line',
    showLegend: true,
    colorList,
    showUnit: true,
    data,
    fillLabelAxis: timeMode !== 'total' ? getFillOption(timeRange, timeMode) : undefined,
    customOption: {
      grid: {
        left: "70",
        right: "16",
        top: "70",
        bottom: "36"
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
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {chartLoading && <FullLoading />}
      <CommonEcharts option={option} />
    </div>
  );
};

export default IndicatorChart;
