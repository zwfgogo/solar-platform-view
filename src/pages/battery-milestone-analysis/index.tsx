import React, { useEffect, useState } from 'react'
import Page from '../../components/Page'
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import PageProps from '../../interfaces/PageProps'
import utils from '../../public/js/utils'
import { battery_milestone_analysis, DEVICE_TYPE, globalNS } from '../constants'
import { makeConnect } from '../umi.helper'
import { BatteryMilestoneAnalysisModel } from './model'
import './index.less'
import moment, { Moment } from 'moment'
import CommonTitle from '../../components/CommonTitle'
import { RangePicker, Select } from 'wanke-gui'
import { useEnergyUnit } from '../../hooks/useEnergyUnitSelect'
import { disabledDateAfterYesterday } from '../../util/dateUtil'
import EchartsLineChart from '../../components/charts/EchartsLineChart'
import EchartsBarChart from '../../components/charts/EchartsBarChart'

const DeviceTypeDataSource = [
  { name: utils.intl('按电池单元'), value: DEVICE_TYPE.batteryUnit },
  { name: utils.intl('按电池簇'), value: DEVICE_TYPE.batteryGroup }
]

interface Props extends PageProps, MakeConnectProps<BatteryMilestoneAnalysisModel>, BatteryMilestoneAnalysisModel {
  fetchSummaryChartLoading: boolean
  fetchTendencyChartLoading: boolean
}

const BatteryMilestoneAnalysis: React.FC<Props> = (props) => {
  const { summaryChart, tendencyChart } = props
  const { selectedEnergyUnitId, selectEnergyUnit } = useEnergyUnit()
  const [timeRange, setTimeRange] = useState<Moment[]>([])

  const filterEnergyUnit = (item) => {
    const pTime = moment(item.productionTime)
    return pTime.isBefore(moment(), 'days')
  }

  const handleDisabledDate = (current) => {
    const productionTime = moment(selectEnergyUnit?.productionTime)
    const lastTime = moment().subtract(1, 'days')
    let prevTime = moment(lastTime).subtract(365, 'days')
    if (productionTime.isAfter(prevTime)) {
      prevTime = productionTime
    }

    return disabledDateAfterYesterday(current) || prevTime.isAfter(current)
  }

  const fetchSummaryChart = () => {
    props.action('fetchSummaryChart', {
      energyUnitId: selectedEnergyUnitId
    })
  }

  const fetchTendencyChart = (startDate: string, endDate: string) => {
    props.action('fetchTendencyChart', {
      startDate,
      endDate,
      energyUnitId: selectedEnergyUnitId
    })
  }

  useEffect(() => {
    if (selectedEnergyUnitId) {
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
      fetchSummaryChart()
    }
  }, [selectedEnergyUnitId])

  useEffect(() => {
    if (timeRange.length) {
      fetchTendencyChart(timeRange[0].format('YYYY-MM-DD'), timeRange[1].format('YYYY-MM-DD'))
    }
  }, [timeRange])

  return (
    <Page
      pageId={props.pageId}
      pageTitle={utils.intl('里程分析')}
      showStation
      showEnergyUnit={filterEnergyUnit}
      style={{ backgroundColor: "unset" }}
    >
      <section className="battery-milestone-analysis">
        <header>
          <CommonTitle
            title={utils.intl('电池里程汇总')}
            iconHeight={18}
          />
          <div className='battery-milestone-summary'>
            <span>{utils.intl('总里程')}:</span>
            <span style={{ margin: '0 16px 0 4px' }}>{props.summaryTotal}</span>
            <span>{utils.intl('里程极差')}:</span>
            <span style={{ margin: '0 16px 0 4px' }}>{props.summaryRange}</span>
          </div>
          <div className='battery-milestone-chart-box'>
            <EchartsBarChart
              loading={props.fetchSummaryChartLoading}
              grid={{ left: 50 }}
              xData={summaryChart.xData}
              yData={summaryChart.yData}
              series={summaryChart.series}
            />
          </div>
        </header>
        <footer>
          <CommonTitle
            title={utils.intl('电池里程趋势')}
            iconHeight={18}
            labelAside={(
              <>
                <RangePicker
                  disabledDate={handleDisabledDate}
                  allowClear={false}
                  style={{ width: 260, marginLeft: 16 }}
                  value={timeRange as any}
                  onChange={values => setTimeRange(values)}
                />
              </>
            )}
          />
          <div className='battery-milestone-chart-box'>
            <EchartsLineChart
              loading={props.fetchTendencyChartLoading}
              grid={{ left: 50 }}
              xData={tendencyChart.xData}
              yData={tendencyChart.yData}
              series={tendencyChart.series}
            />
          </div>
        </footer>
      </section>
    </Page>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    stationId: state[globalNS].selectedStationId,
    fetchSummaryChartLoading: getLoading('fetchSummaryChart'),
    fetchTendencyChartLoading: getLoading('fetchTendencyChart'),
  }
}

export default makeConnect(battery_milestone_analysis, mapStateToProps)(BatteryMilestoneAnalysis)
