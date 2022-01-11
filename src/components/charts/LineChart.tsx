import React from 'react'
import { LineChart as LineChart1 } from 'wanke-gui'

interface Props {
  loading?: boolean
  xData?: string[]
  yData?: number[][]
  series?: { name: string, unit: string }[]
  options?: {
    tooltipDateFormat?: string
    dateFormat?: any
  }
}

export default class LineChart extends React.Component<Props> {
  // static defaultProps = {
  //   xData: ['2019-10-10 01:20:00', '2019-10-13 03:20:00', '2019-10-25 05:20:00'],
  //   yData: [[1, 5, 3], [2, 6, 9]],
  //   series: [{name: 'kk'}, {name: 'oo'}]
  // }

  render() {
    return (
      <LineChart1 {...this.props}/>
    )
  }
}
