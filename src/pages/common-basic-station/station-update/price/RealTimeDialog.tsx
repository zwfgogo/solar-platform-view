import React from 'react'
import { Modal, Row, LineChart } from 'wanke-gui'
import utils from '../../../../public/js/utils'
import moment from 'moment';
import WKConfigProvider from 'wanke-gui/es/config-provider'
import CommonEcharts from "../../../../components/charts/common-echarts/CommonEcharts";
import { useEchartsOption, CustomChartOption } from "../../../../components/charts/common-echarts/useEchartsOption";
import { stationUpdateNS } from '../../../constants'
import { makeConnect } from '../../../umi.helper'

const colorArray = [
  '#0bfffc'
]

export function getTimeRange(type, isHourMod?: boolean): any {
  let startTime: any = moment().startOf('days').format('YYYY-MM-DD HH:mm:00')
  // let endTime: any = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
  let endTime: any = moment().endOf('days').subtract(1, 'hours').format('YYYY-MM-DD HH:mm:00')
  return {
    startTime,
    endTime,
    step: 30,
    stepType: 'minute',
    formater: 'YYYY-MM-DD HH:mm:ss'
  }
}

export function getTimeNearly(time) {
  let now = moment(time).format('YYYY-MM-DD')
  let minute = parseInt(moment(time).format('mm'), 10);
  let hour = parseInt(moment(time).format('HH'), 10);
  let resultMinute = '';
  if (minute > 0 && minute < 30) {
    resultMinute = '30';
  } else {
    if (hour !== 24) {
      hour += 1;
    }
    resultMinute = '00'
  }
  return moment(now + ' ' + hour + ':' + resultMinute + ':00').format('YYYY-MM-DD HH:mm:ss')
}

interface Props {
  detail: any;
  visible: boolean
  spotCurve: any;
  theme?: 'light' | 'dark'
  onExited: () => void
  realTime: string
}

const RealTimeDialog: React.FC<Props> = function (this: null, props) {
  let powerDateFormat;
  powerDateFormat = {
    dateFormat: (d) => { return moment(d).format('YYYY-MM-DD') },
    tooltipDateFormat: 'YYYY-MM-DD',
    endDate: moment(),
    startDate: moment().subtract(6, 'day'),
    getColor: (count, index) => {
      return colorArray[index]
    }
  }
  let incomeChart = { ...props.spotCurve, series: [{ name: utils.intl("实时电价"), unit: utils.intl(props.detail.currency) }], };
  const colorList = ["#0062ff"];
  const { option } = useEchartsOption<CustomChartOption.SplitLineChart>({
    type: 'splitLine',
    colorList,
    showUnit: true,
    showLegend: true,
    disableZoom: true,
    data: { ...incomeChart, dividing: [getTimeNearly(props.realTime)] },
    formatLabel: value => {
      return value.split(' ').slice(-1)[0]
    },
    fillLabelAxis: getTimeRange('detail'),
    customOption: {
      legend: {
        textStyle: {
          color: props.theme === 'dark' ? '#ccc' : '#333'
        },
        inactiveColor: props.theme === 'dark' ? '#555' : '#ccc',
      },
    }
  });
  return (
    <Modal
      width={1200}
      title={utils.intl("实时电价详情")}
      visible={props.visible}
      onCancel={props.onExited}
      footer={null}
      className="price-detail-dialog"
    >
      <div className="" style={{ height: '380px', display: 'flex', flexDirection: 'column' }}>
        <Row>
          <span>{utils.intl("电价名称") + '：' + props?.detail?.title}</span><span style={{ marginLeft: '30px' }}>{utils.intl("适用地区") + '：' + props?.detail?.area}</span>
        </Row>
        <div className="flex1 e-pt10 f-pr">
          <CommonEcharts option={option} />
          {/* <LineChart series={profitChart.series} xData={profitChart.xData} yData={profitChart.yData} options={powerDateFormat} /> */}
        </div>
      </div>
    </Modal>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    theme: state.global.theme,
    realTime: model.realTime
  }
}

export default makeConnect(stationUpdateNS, mapStateToProps)(RealTimeDialog)