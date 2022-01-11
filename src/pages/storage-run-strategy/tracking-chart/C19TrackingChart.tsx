import moment from 'moment'
import React from 'react'
import { LineChart } from 'wanke-gui'

interface Props {
  chartInfo: {
    xData: any[]
    yData: any[]
    series: any[]
    runDateMap: any
  }
  runDateList: any[]
  time: string
}

const C19TrackingChart: React.FC<Props> = (props) => {
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
        standardList: formatStandardList(chartInfo.runDateMap, runDateList)
      }}
    />
  )
}

export default C19TrackingChart

function formatStandardList(runDateMap = {}, runDateList = []) {
  const runList = runDateList.map(item => {
    return [moment(item[0]).valueOf(), moment(item[1]).valueOf()]
  }).sort((a, b) => a[0] - b[0])
  let res = {}
  Object.keys(runDateMap).forEach(key => {
    const list = runDateMap[key]
    let row = []
    list.forEach(item => {
      row = row.concat(getTimeRange(item, runList))
    })
    res[key] = row
  })
  return res
}

function getTimeRange(targetItem, runList): number[][] {
  let [startTime, endTime] = targetItem
  let list: number[][] = []

  for (let i = 0, len = runList.length;i < len;i++) {
    const item = runList[i]
    // 如果起始时间在范围之外，更新起始时间
    if (startTime < item[0]) {
      startTime = item[0]
    }

    if (endTime <= item[1]) {
      list.push([startTime, endTime])
      break
    } else {
      list.push([startTime, item[1]])
      startTime = item[1]
    }
  }

  return list
}
