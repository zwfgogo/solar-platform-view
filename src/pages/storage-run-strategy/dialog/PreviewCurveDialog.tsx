import React, { useMemo } from 'react'
import {Modal, MultiLineChart} from 'wanke-gui'
import moment from 'moment'
import {getCurveData, getSocData} from '../run-strategy.helper'

import utils from '../../../public/js/utils'

interface Props {
  priceInfo: any
  currentCommandList: any[]
  applicableDate: any
  scale: number
  visible: boolean
  onCancel: () => void
}

const PreviewCurveDialog: React.FC<Props> = function (this: null, props) {
  let chartData = useMemo(() => {
    return getCurveData(
      props.priceInfo?.costPrice?.[0],
      props.priceInfo?.generatePrice?.[0],
      props.currentCommandList,
      props.applicableDate)
  }, [
    JSON.stringify(props.priceInfo?.costPrice?.[0]),
    JSON.stringify(props.priceInfo?.generatePrice?.[0]),
    JSON.stringify(props.currentCommandList),
    JSON.stringify(props.applicableDate)
  ])
  let socData = useMemo(() => {
    return socData = getSocData(props.currentCommandList, props.scale, 1)
  }, [
    JSON.stringify(props.currentCommandList),
    props.scale
  ])

  return (
    <Modal
      centered
      width={'800px'}
      title={utils.intl('策略曲线预览')}
      visible={props.visible}
      footer={null}
      className="copy-energy-dialog modal-max-height-70"
      onCancel={props.onCancel}
    >
      <div>
        {
          props.applicableDate.length == 0 && (
            <div style={{height: 200}} className="vh-center">{utils.intl('暂无数据')}</div>
          )
        }
        {
          chartData.map((item, index) => {
            return (
              <div>
                <div className="curve-date-range">
                  {moment('2000-' + item.date[0]).format(utils.intl('MM月DD日'))}
                  <span style={{margin: 5}}>-</span>
                  {moment('2000-' + item.date[1]).format(utils.intl('MM月DD日'))}
                </div>
                <div style={{ height: 300 }}>
                  <MultiLineChart
                    key={index}
                    xData={[item.xData, socData.xData]}
                    yData={[item.yData, socData.yData]}
                    series={[{name: utils.intl('电价'), unit: utils.intl('元/kWh')}, {name: 'SOC', unit: '%'}]}
                    options={{
                      tooltipDateFormat: 'HH:mm'
                    }}
                  />
                </div>
              </div>
            )
          })
        }
      </div>
    </Modal>
  )
}

export default PreviewCurveDialog
