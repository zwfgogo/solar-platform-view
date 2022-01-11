import React from 'react'
import moment from 'moment'
import styles from './styles/real-time-chart.less'
import CommonEcharts from '../../../../components/charts/common-echarts/CommonEcharts';
import { useEchartsOption, CustomChartOption } from '../../../../components/charts/common-echarts/useEchartsOption';
import AbsoluteFullDiv from '../../../../components/AbsoluteFullDiv';
import { LineChart } from 'wanke-gui';

const colorList = ["#0062ff", "#3dd598"];

const grid = {
  left: "10",
  right: "10",
  top: "30",
  bottom: "6"
};

interface Props {
  chartData: any
}

const RealTimeChart: React.FC<Props> = (props) => {
  const { chartData = {}, theme } = props

  return (
    <section className={styles["chart-container"]}>
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
        <LineChart
          series={chartData.series}
          xData={chartData.xData}
          yData={chartData.yData}
          options={{
            yAxisScale: true,
            dateFormat: (d) => { return moment(d).format('HH:mm:ss') },
            tooltipDateFormat: "HH:mm:ss",
            startDate: moment().startOf("days").valueOf(),
            endDate: moment().endOf('days').valueOf(),
            tickWidth: 80,
            margin: { bottom: 22 }
          }}
        />
      </div>
    </section>
  )
}

export default RealTimeChart
