import { Moment } from 'moment'
import React, { useEffect, useState } from 'react'
import { FullLoading, Modal, MultiLineChart, RangePicker, Tree } from 'wanke-gui'
import AbsoluteFullDiv from '../../../components/AbsoluteFullDiv'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import utils from '../../../public/js/utils'
import { makeConnect } from '../../umi.helper'
import { AbnormalQueryModal } from '../model'
import './device-modal.less'
import DeviceTree from './DeviceTree'

interface Props extends MakeConnectProps<AbnormalQueryModal>, AbnormalQueryModal {
  visible: boolean
  title: string
  defaultRangeTime: any
  onCancel: () => void
  getDeviceModalTreeLoading?: boolean
  fetchPointDataLoading?: boolean
}

const DeviceModal: React.FC<Props> = (props) => {
  const { chartData, defaultRangeTime = [], pointTypeMap } = props
  const [rangeTime, setRangeTime] = useState<Moment[]>(defaultRangeTime)
  const [selectKeys, setSelectKeys] = useState([])

  useEffect(() => {
    if (rangeTime.length) {
      if (selectKeys.length) {
        props.action('fetchPointDataChart', {
          checkDevice: selectKeys.map(key => pointTypeMap[key]),
          startTime: rangeTime[0].format('YYYY-MM-DD HH:mm:00'),
          endTime: rangeTime[1].format('YYYY-MM-DD HH:mm:59')
        })
      } else {
        props.updateState({
          chartData: {
            xData: [],
            yData: [],
            series: []
          }
        })
      }
    }
  }, [rangeTime, selectKeys])

  useEffect(() => {
    return () => {
      props.updateState({
        deviceTreeList: [],
        relatedDeviceTreeList: [],
      })
    }
  }, [])

  const handleTreeChange = (baseKeys, extraKeys) => {
    setSelectKeys(baseKeys.concat(extraKeys))
  }

  return (
    <Modal
      centered
      maskClosable={false}
      width={1000}
      visible={props.visible}
      title={utils.intl('告警历史数据')}
      footer={null}
      onCancel={props.onCancel}
      wrapClassName='abnormal-device-modal'
    >
      <section className="abnormal-device-modal-body">
        <div className="abnormal-device-modal-left">
          {props.getDeviceModalTreeLoading ? <FullLoading /> : null}
          <DeviceTree
            baseData={props.deviceTreeList}
            extraData={props.relatedDeviceTreeList}
            onChange={handleTreeChange}
          />
        </div>
        <div className="abnormal-device-modal-right">
          <div className="abnormal-device-modal-filter">
            {utils.intl('时间1')}：
            <RangePicker
              value={rangeTime as [Moment, Moment]}
              format="YYYY-MM-DD HH:mm"
              maxLength={2}
              maxLengthType="day"
              showTime
              onChange={setRangeTime}
            />
          </div>
          <div className="abnormal-device-modal-chart">
            {props.fetchPointDataLoading ? <FullLoading /> : null}
            <AbsoluteFullDiv>
              <MultiLineChart
                {...chartData}
                options={{
                  margin: { left: 60, right: 60, bottom: 25, top: 55 },
                }}
              />
            </AbsoluteFullDiv>
          </div>
        </div>
      </section>
    </Modal>
  )
}

function mapStateToProps(model, getLoading, state) {
  return {
    ...model,
    getDeviceModalTreeLoading: getLoading('getDeviceModalTree'),
    fetchPointDataLoading: getLoading('fetchPointDataChart'),
  }
}

export default makeConnect('abnormalQuery', mapStateToProps)(DeviceModal)
