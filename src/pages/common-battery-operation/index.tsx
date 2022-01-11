import React, { useEffect, useState } from 'react'
import Page from '../../components/Page'
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import PageProps from '../../interfaces/PageProps'
import { battery_operation, globalNS } from '../constants'
import { makeConnect } from '../umi.helper'
import { BatteryOperationModel } from './models'
import './index.less'
import utils from '../../public/js/utils'
import CommonTitle from '../../components/CommonTitle'
import { Button, Input, InputNumber, message, RangePicker, Select } from 'wanke-gui'
import EchartsLineChart from '../../components/charts/EchartsLineChart'
import useModalView from '../../hooks/useModalView'
import OperationRecordModal from './components/OperationRecordModal'
import { Moment } from 'moment'
import { useEnergyUnit } from '../../hooks/useEnergyUnitSelect'
import moment from 'moment'
import { disabledDateAfterYesterday } from '../../util/dateUtil'
import OperationPlanModal from './components/OperationPlanModal'
import OperationConfirm from './components/OperationConfirm'

const RecordModalKey = 'record'
const PlanModalKey = 'plan'
const OperationConfirmModalKey = 'OperationConfirm'

interface Props extends PageProps, MakeConnectProps<BatteryOperationModel>, BatteryOperationModel {
  stationId: number
  fetchElectricChartLoading: boolean
  fetchCapacityOperationCalculateLoading: boolean
  fetchBatteryOperationCalculateLoading: boolean
  stationDetail: any
}

const BatteryOperation: React.FC<Props> = (props) => {
  const { electricChart, capacityChart, batteryChart, stationId } = props
  const [timeRange, setTimeRange] = useState<Moment[]>([])
  const { selectedEnergyUnitId, selectEnergyUnit } = useEnergyUnit()
  const { getModalViewState, changeModalState } = useModalView()
  const [capacityNum, setCapacityNum] = useState(100)
  const [batteryNum, seBatteryNum] = useState(20)

  const recordModalViewState = getModalViewState(RecordModalKey)
  const planModalViewState = getModalViewState(PlanModalKey)
  const confirmModalViewState = getModalViewState(OperationConfirmModalKey)

  const handleViewOperation = (time) => {
    changeModalState(RecordModalKey, true, { time })
  }

  const handlePlanModal = () => {
    changeModalState(OperationConfirmModalKey, true)
  }

  const fetchElectricChart = (startDate: string, endDate: string) => {
    props.action('fetchElectricChart', {
      startDate,
      endDate,
      energyUnitId: selectedEnergyUnitId
    })
  }

  const clearData = () => {
    props.action('reset')
  }

  useEffect(() => {
    if (selectedEnergyUnitId) {
      clearData()
      const productionTime = moment(selectEnergyUnit.productionTime)
      let lastTime = moment().subtract(1, 'days')
      let prevTime = moment(lastTime).subtract(365, 'days')
      if (productionTime.isAfter(prevTime)) {
        prevTime = productionTime
      }
      if (prevTime.isAfter(lastTime)) {
        prevTime = moment(lastTime)
      }
      setTimeRange([prevTime, lastTime])
    }
  }, [selectedEnergyUnitId])

  useEffect(() => {
    if (timeRange.length) {
      fetchElectricChart(timeRange[0].format('YYYY-MM-DD'), timeRange[1].format('YYYY-MM-DD'))
    }
  }, [timeRange])

  const handleDisabledDate = (current) => {
    const productionTime = moment(selectEnergyUnit?.productionTime)
    const lastTime = moment().subtract(1, 'days')
    let prevTime = moment(lastTime).subtract(365, 'days')
    if (productionTime.isAfter(prevTime)) {
      prevTime = productionTime
    }

    return disabledDateAfterYesterday(current) || prevTime.isAfter(current)
  }

  const filterEnergyUnit = (item) => {
    const pTime = moment(item.productionTime)
    return pTime.isBefore(moment(), 'days')
  }

  const handleCalc = (type) => {
    let replacePackNum = 20
    let capacitySortNum = 100
    if (type === 1) {
      if (!capacityNum && capacityNum !== 0) {
        message.error(utils.intl('请输入分容次数'))
        return
      }
      capacitySortNum = capacityNum
      props.action('fetchCapacityOperationCalculate', {
        energyUnitId: selectedEnergyUnitId,
        stationId,
        capacitySortNum,
        replacePackNum,
        type,
      })
    } else {
      if (!batteryNum && batteryNum !== 0) {
        message.error(utils.intl('请输入更换电池包数'))
        return
      }
      replacePackNum = batteryNum
      props.action('fetchBatteryOperationCalculate', {
        energyUnitId: selectedEnergyUnitId,
        stationId,
        capacitySortNum,
        replacePackNum,
        type,
      })
    }
  }

  const handleViewPlan = () => {
    changeModalState([PlanModalKey, OperationConfirmModalKey], [true, false])
  }

  const handleClickOperation = (params) => {
    let timeStr = ''
    if (params.componentType === "markLine") {
      timeStr = electricChart.xData[params.data.xAxis]
    }
    if (params.componentType === "series") {
      timeStr = electricChart.xData[electricChart.records[params.dataIndex]]
    }
    if (timeStr) {
      handleViewOperation([moment(timeStr)])
    }
  }

  return (
    <Page
      pageId={props.pageId}
      showStation
      showEnergyUnit={filterEnergyUnit}
      className="pageBox"
      style={{ background: 'transparent' }}
    >
      <section className='battery-operation-page'>
        <header>
          <CommonTitle
            title={utils.intl('满充满放电量曲线')}
            iconHeight={18}
            labelAside={(
              <RangePicker
                disabledDate={handleDisabledDate}
                allowClear={false}
                style={{ width: 260, marginLeft: 16 }}
                value={timeRange as any}
                onChange={values => setTimeRange(values)}
              />
            )}
            rightAside={(
              <a onClick={() => handleViewOperation(timeRange)}>{utils.intl('查看运维记录')}</a>
            )}
          />
          <div className='battery-operation-chart-box'>
            <EchartsLineChart
              grid={{ top: '60' }}
              loading={props.fetchElectricChartLoading}
              xData={electricChart.xData}
              yData={electricChart.yData}
              series={electricChart.series}
              markLineList={electricChart.records}
              markLineFormatter={() => utils.intl('battery.运维')}
              onClick={handleClickOperation}
            />
          </div>
        </header>
        <footer>
          <CommonTitle
            title={utils.intl('电池运维测算参考')}
            iconHeight={18}
            rightAside={(
              <Button type="primary" onClick={handlePlanModal}>{utils.intl('测算运维方案')}</Button>
            )}
          />
          <div style={{ flexGrow: 1, display: 'flex' }}>
            <BatteryOperationCard
              loading={props.fetchBatteryOperationCalculateLoading}
              title={utils.intl('(1) 用户指定更换电池包数时，不同分容次数的提升和收益对比')}
              type="battery"
              value={batteryNum}
              onChange={seBatteryNum}
              onCalc={() => handleCalc(2)}
              chartInfo={batteryChart}
            />
            <BatteryOperationCard
              loading={props.fetchCapacityOperationCalculateLoading}
              title={utils.intl('(2) 用户指定分容次数时，不同更换电池包数的提升和收益对比')}
              type="capacity"
              value={capacityNum}
              onChange={setCapacityNum}
              onCalc={() => handleCalc(1)}
              chartInfo={capacityChart}
            />
          </div>
        </footer>
        {recordModalViewState.visible && (
          <OperationRecordModal
            time={recordModalViewState.data.time}
            selectedEnergyUnitId={selectedEnergyUnitId}
            closeModal={() => changeModalState(RecordModalKey, false)}
          />
        )}
        {planModalViewState.visible && (
          <OperationPlanModal
            stationName={props.stationDetail?.title}
            detail={props.operationPlan}
            closeModal={() => changeModalState(PlanModalKey, false)}
          />
        )}
        {confirmModalViewState.visible && (
          <OperationConfirm
            selectedEnergyUnitId={selectedEnergyUnitId}
            stationId={stationId}
            energyUnitId={selectedEnergyUnitId}
            capacityNum={capacityNum}
            batteryNum={batteryNum}
            closeModal={() => changeModalState(OperationConfirmModalKey, false)}
            onViewPlan={handleViewPlan}
          />
        )}
      </section>
    </Page>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    stationId: state[globalNS].selectedStationId,
    stationDetail: state[globalNS].stationDetail,
    fetchElectricChartLoading: getLoading('fetchElectricChart'),
    fetchCapacityOperationCalculateLoading: getLoading('fetchCapacityOperationCalculate'),
    fetchBatteryOperationCalculateLoading: getLoading('fetchBatteryOperationCalculate'),
  }
}

export default makeConnect(battery_operation, mapStateToProps)(BatteryOperation)

interface BatteryOperationCardProps {
  loading: boolean
  title: string
  type: 'capacity' | 'battery'
  value: number
  chartInfo: any
  onChange: (val) => void
  onCalc: () => void
}

const BatteryOperationCard: React.FC<BatteryOperationCardProps> = (props) => {
  const { title, type, chartInfo, loading } = props
  const isCapacity = type === 'capacity'

  const handleCalc = () => {
    props.onCalc()
  }

  return (
    <section className="battery-operation-footer-card">
      <div style={{ marginBottom: 16, marginTop: 16 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: 16 }}>{utils.intl('更换电池包数')}</span>
        {isCapacity ? (
          <Input style={{ width: 120, marginRight: 20 }} disabled value={utils.intl('battery.最大') + '20'} />
        ) : (
          <InputNumber
            style={{ width: 120, marginRight: 20 }}
            max={20}
            min={1}
            precision={0}
            value={props.value}
            onChange={props.onChange}
          />
        )}
        <span style={{ marginRight: 16 }}>{utils.intl('分容次数')}</span>
        {isCapacity ? (
          // <InputNumber
          //   style={{ width: 120, marginRight: 20 }}
          //   max={100}
          //   min={1}
          //   precision={0}
          //   value={props.value}
          //   onChange={props.onChange}
          // />
          <div style={{ width: 120, marginRight: 20, display: 'inline-block' }}>
            <Select
              style={{ width: '100%' }}
              dataSource={[
                { name: '100', value: 100 },
                { name: '80', value: 80 },
                { name: '60', value: 60 },
                { name: '40', value: 40 }
              ]}
              value={props.value}
              onChange={props.onChange}
            />
          </div>
        ) : (
          <Input style={{ width: 120, marginRight: 20 }} disabled value={utils.intl('battery.最大') + '100'} />
        )}
        <Button onClick={handleCalc} loading={loading}>{utils.intl('battery.重测')}</Button>
      </div>
      <div className='battery-operation-chart-box'>
        <EchartsLineChart
          xData={chartInfo.xData}
          yData={chartInfo.yData}
          series={chartInfo.series}
        />
      </div>
    </section>
  )
}
