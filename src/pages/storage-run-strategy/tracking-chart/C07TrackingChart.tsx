import moment from 'moment'
import React from 'react'
import { LineChart } from 'wanke-gui'

interface Props {
  chartInfo: {
    xData: any[]
    yData: any[]
    series: any[]
  }
  runDateList: any[]
  time: string
}

const C07TrackingChart: React.FC<Props> = (props) => {
  const { chartInfo, runDateList, time } = props
  const date = moment(time)

  return (
    <LineChart
      loading={false}
      xData={chartInfo.xData}
      yData={chartInfo.yData}
      series={chartInfo.series}
      options={{
        startDate: date.startOf('day').valueOf(),
        endDate: date.endOf('day').valueOf(),
        dateFormat: (value) => {
          return moment(value).format('HH:mm')
        },
        tickWidth: 120,
        standardList: runDateList.map(item => {
          return [moment(item[0]).valueOf(), moment(item[1]).valueOf()]
        })
      }}
    />
  )
}

export default C07TrackingChart
