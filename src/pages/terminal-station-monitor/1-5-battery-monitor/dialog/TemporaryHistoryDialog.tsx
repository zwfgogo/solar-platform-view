import React, { useEffect, useState } from 'react'
import Dialog2, { Dialog2Props } from '../../../../components/Dialog2'
import FullContainer from '../../../../components/layout/FullContainer'
import Label from '../../../../components/Label'
import RangePicker from '../../../../components/rangepicker'
import { getDate, getDateStr, isBigThanToday, disabledDateByRange } from '../../../../util/dateUtil'
import { LineChart } from 'wanke-gui'
import { ActionProp, UpdateStateAction } from '../../../../interfaces/MakeConnectProps'
import { BatteryMonitorState } from '../model'

interface Props extends Omit<Dialog2Props, 'title'>, UpdateStateAction<BatteryMonitorState>, ActionProp {
  pointNumber: number
  loading: boolean
  historyStartDate: string
  historyEndDate: string
  chartInfo: {
    xData: any
    yData: any
    series: any
  }
}

export const TemporaryHistoryDialog: React.FC<Props> = function (this: null, props) {
  const [selectedFirstDate, setSelectedFirstDate] = useState(null);
  useEffect(()=> {
    props.action('fetchHistoryChart', {pointNumber: props.pointNumber})
  }, [props.historyStartDate, props.historyEndDate])

  return (
    <Dialog2
      resizeAble
      visible={props.visible}
      title="历史温度"
      width={900}
      defaultHeight={500}
      onExited={props.onExited}
      onConfirm={props.onConfirm}
      footer={null}
    >
      <FullContainer>
        <section>
          <div className="v-center">
            <Label>选择日期</Label>
            <RangePicker
              maxLength={5}
              allowClear={false}
              value={[getDate(props.historyStartDate), getDate(props.historyEndDate)]}
              disabledDate={current => isBigThanToday(current)}
              onChange={([start, end]) => props.updateState({historyStartDate: getDateStr(start), historyEndDate: getDateStr(end)})}
            />
          </div>
        </section>
        <section className="flex1" style={{marginTop: 10}}>
          <LineChart
            xData={props.chartInfo.xData}
            yData={props.chartInfo.yData}
            series={props.chartInfo.series}
            loading={props.loading}
          />
        </section>
      </FullContainer>
    </Dialog2>
  )
}
